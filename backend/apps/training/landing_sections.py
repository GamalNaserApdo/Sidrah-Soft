"""Structured section schema for the Starter Landing Page Builder.

The Landing Page stores sections as a validated JSON list
(``draft_sections`` / ``published_sections`` on ``StarterLandingPage``).
Every section is a dict::

    {
        "id": "hero",                  # stable unique slug-style id
        "type": "hero",                # registered section type
        "enabled": true,
        "props": { ...type-specific bilingual props... },
    }

Validation is server-side and strict:
- unknown section types are rejected
- unknown props are rejected
- no HTML/JS can be stored (``<`` is rejected in all string values)
- CTA targets are allowlisted to fragments and internal paths
- ``registration_form`` is a protected system section: exactly one
  instance required, it can be moved/disabled but never deleted or
  duplicated.

PRICING RULE: sections may reference a price *display mode* only. No
numeric price may ever be stored here — ``ProgramLanding.current_price``
is the single source of truth.
"""
import re

from django.core.exceptions import ValidationError

# ---------------------------------------------------------------------------
# Limits
# ---------------------------------------------------------------------------
MAX_SECTIONS = 30
MAX_FAQ_ITEMS = 20
MAX_ID_LENGTH = 64
MAX_SHORT_TEXT = 500      # badges, titles, headings, labels
MAX_LONG_TEXT = 5000      # bodies, answers, descriptions

SECTION_ID_RE = re.compile(r'^[a-zA-Z0-9_-]+$')
INTERNAL_PATH_RE = re.compile(r'^/[A-Za-z0-9\-._~/?&=#%]*$')
FRAGMENT_RE = re.compile(r'^#[a-zA-Z0-9_-]+$')
HTML_MARKER_RE = re.compile(r'[<>`]')

PRICE_DISPLAY_MODES = ('shared', 'per_course', 'none')

# ---------------------------------------------------------------------------
# Prop specs
# ---------------------------------------------------------------------------
# Each prop spec: {'kind': 'text'|'longtext'|'choice'|'media'|'faq_items',
#                  'required': bool, 'choices': (...)}
# 'media' validates a MediaAsset FK id so future image sections can reuse
# the existing media library without a new system.


def _text(required=False):
    return {'kind': 'text', 'required': required}


def _longtext(required=False):
    return {'kind': 'longtext', 'required': required}


def _choice(choices, required=False):
    return {'kind': 'choice', 'required': required, 'choices': tuple(choices)}


def _media():
    return {'kind': 'media', 'required': False}


def _faq_items():
    return {'kind': 'faq_items', 'required': False}


SECTION_TYPES = {
    'hero': {
        'label': 'Hero',
        'props': {
            'badge_en': _text(), 'badge_ar': _text(),
            'title_en': _text(), 'title_ar': _text(),
            'tagline_en': _text(), 'tagline_ar': _text(),
            'brand_en': _text(), 'brand_ar': _text(),
            'cta_en': _text(), 'cta_ar': _text(),
            'price_display': _choice(PRICE_DISPLAY_MODES),
        },
    },
    'rich_text': {
        'label': 'Rich Text',
        'props': {
            'heading_en': _text(), 'heading_ar': _text(),
            'body_en': _longtext(), 'body_ar': _longtext(),
        },
    },
    'faq': {
        'label': 'FAQ',
        'props': {
            'heading_en': _text(), 'heading_ar': _text(),
            'items': _faq_items(),
        },
    },
    'cta_banner': {
        'label': 'CTA Banner',
        'props': {
            'heading_en': _text(), 'heading_ar': _text(),
            'description_en': _text(), 'description_ar': _text(),
            'button_en': _text(), 'button_ar': _text(),
            'target': {'kind': 'cta_target', 'required': False},
        },
    },
    'registration_form': {
        'label': 'Registration Form',
        'protected': True,
        'max_instances': 1,
        'props': {},
    },
}

SECTION_KEYS = {'id', 'type', 'enabled', 'props'}
FAQ_ITEM_KEYS = {'question_en', 'question_ar', 'answer_en', 'answer_ar'}


def is_safe_cta_target(value):
    """Allow only in-page fragments and relative internal paths."""
    if not isinstance(value, str):
        return False
    value = value.strip()
    if not value:
        return True  # empty = button hidden / default
    if FRAGMENT_RE.match(value):
        return True
    if value.startswith('//'):  # protocol-relative — external
        return False
    return bool(INTERNAL_PATH_RE.match(value))


def _clean_str(value, max_len, errors, key):
    if not isinstance(value, str):
        errors[key] = 'Must be a string.'
        return ''
    if HTML_MARKER_RE.search(value):
        errors[key] = 'HTML markup is not allowed.'
        return ''
    if len(value) > max_len:
        errors[key] = f'Must be at most {max_len} characters.'
        return ''
    return value.strip()


def _validate_media(value, errors, key):
    from apps.media_library.models import MediaAsset
    if not isinstance(value, int) or isinstance(value, bool):
        errors[key] = 'Must be a media asset id.'
        return None
    if not MediaAsset.objects.filter(pk=value, is_active=True).exists():
        errors[key] = 'Media asset does not exist.'
        return None
    return value


def _validate_faq_items(value, errors, key):
    if not isinstance(value, list):
        errors[key] = 'Must be a list.'
        return []
    if len(value) > MAX_FAQ_ITEMS:
        errors[key] = f'At most {MAX_FAQ_ITEMS} items are allowed.'
        return []
    cleaned_items = []
    for idx, item in enumerate(value):
        item_errors = {}
        if not isinstance(item, dict) or set(item) - FAQ_ITEM_KEYS:
            item_errors['_'] = 'Invalid FAQ item shape.'
            cleaned_items.append({})
            continue
        cleaned_item = {}
        for field in FAQ_ITEM_KEYS:
            cleaned_item[field] = _clean_str(
                item.get(field, ''), MAX_LONG_TEXT, item_errors, field,
            )
        if not cleaned_item['question_en'] and not cleaned_item['question_ar']:
            item_errors['question_en'] = 'A question is required in at least one language.'
        if item_errors:
            errors[f'{key}.{idx}'] = item_errors
        cleaned_items.append(cleaned_item)
    return cleaned_items


def validate_sections(payload):
    """Validate a sections list. Returns cleaned sections or raises 400-style
    ValidationError with a per-section error mapping."""
    if not isinstance(payload, list):
        raise ValidationError({'sections': 'Must be a list of sections.'})
    if len(payload) > MAX_SECTIONS:
        raise ValidationError({'sections': f'At most {MAX_SECTIONS} sections are allowed.'})

    errors = {}
    cleaned = []
    seen_ids = set()
    counts = {}

    for idx, section in enumerate(payload):
        sec_errors = {}
        if not isinstance(section, dict):
            errors[str(idx)] = {'_': 'Section must be an object.'}
            continue

        unknown = set(section) - SECTION_KEYS
        if unknown:
            sec_errors['_keys'] = f'Unknown section keys: {sorted(unknown)}'

        sec_id = section.get('id')
        if not isinstance(sec_id, str) or not sec_id:
            sec_errors['id'] = 'Section id is required.'
        elif len(sec_id) > MAX_ID_LENGTH or not SECTION_ID_RE.match(sec_id):
            sec_errors['id'] = 'Id may contain letters, digits, "-" and "_" only.'
        elif sec_id in seen_ids:
            sec_errors['id'] = 'Duplicate section id.'
        else:
            seen_ids.add(sec_id)

        sec_type = section.get('type')
        spec = SECTION_TYPES.get(sec_type)
        if spec is None:
            sec_errors['type'] = f'Unknown section type: {sec_type!r}.'
        else:
            counts[sec_type] = counts.get(sec_type, 0) + 1

        enabled = section.get('enabled', True)
        if not isinstance(enabled, bool):
            sec_errors['enabled'] = 'Must be true or false.'
            enabled = bool(enabled)

        props = section.get('props', {})
        if not isinstance(props, dict):
            sec_errors['props'] = 'Props must be an object.'
            props = {}
        elif spec is not None:
            allowed = spec['props']
            extra = set(props) - set(allowed)
            if extra:
                sec_errors['props'] = f'Unknown props for {sec_type}: {sorted(extra)}'
            cleaned_props = {}
            for key, pspec in allowed.items():
                value = props.get(key)
                kind = pspec['kind']
                pkey = key
                if value is None or value == '':
                    if pspec.get('required'):
                        sec_errors[pkey] = 'This prop is required.'
                    cleaned_props[key] = '' if kind != 'faq_items' else []
                    continue
                if kind == 'text':
                    cleaned_props[key] = _clean_str(value, MAX_SHORT_TEXT, sec_errors, pkey)
                elif kind == 'longtext':
                    cleaned_props[key] = _clean_str(value, MAX_LONG_TEXT, sec_errors, pkey)
                elif kind == 'choice':
                    if value not in pspec['choices']:
                        sec_errors[pkey] = f'Must be one of: {", ".join(pspec["choices"])}.'
                        cleaned_props[key] = pspec['choices'][0]
                    else:
                        cleaned_props[key] = value
                elif kind == 'cta_target':
                    if not is_safe_cta_target(value):
                        sec_errors[pkey] = 'Target must be an in-page anchor or internal path.'
                        cleaned_props[key] = ''
                    else:
                        cleaned_props[key] = value.strip()
                elif kind == 'media':
                    cleaned_props[key] = _validate_media(value, sec_errors, pkey)
                elif kind == 'faq_items':
                    cleaned_props[key] = _validate_faq_items(value, sec_errors, pkey)
            props = cleaned_props

        if sec_errors:
            errors[str(idx)] = sec_errors

        cleaned.append({
            'id': sec_id if isinstance(sec_id, str) else '',
            'type': sec_type or '',
            'enabled': enabled,
            'props': props,
        })

    # Protected-section rules
    reg_count = counts.get('registration_form', 0)
    if reg_count != 1:
        errors['_protected'] = (
            'Exactly one registration_form section is required; '
            'it can be moved or disabled but never removed.'
        )

    if errors:
        raise ValidationError(_listify_errors(errors))
    return cleaned


def _listify_errors(errors):
    """Django ValidationError requires dict values to be lists of
    messages/ValidationError — normalize our str/dict error values."""
    out = {}
    for key, value in errors.items():
        if isinstance(value, str):
            out[key] = [value]
        elif isinstance(value, dict):
            out[key] = [ValidationError(_listify_errors(value))]
        elif isinstance(value, list):
            out[key] = value
        else:
            out[key] = [str(value)]
    return out


def default_sections():
    """Compiled default matching the current public Starter page."""
    return [
        {
            'id': 'hero',
            'type': 'hero',
            'enabled': True,
            'props': {
                'badge_en': 'Beginner Course — From Zero',
                'badge_ar': 'كورس للمبتدئين — من الصفر',
                'title_en': 'Start Your Field from Zero with Sidrah Soft',
                'title_ar': 'ابدأ مجالك من الصفر مع Sidrah Soft',
                'tagline_en': '6 weeks · 12 live sessions · 2 per week · from zero',
                'tagline_ar': '6 أسابيع · 12 جلسة مباشرة · جلستين أسبوعيًا · من الصفر',
                'brand_en': 'Sidrah Soft — Enter The Next Era.',
                'brand_ar': 'Sidrah Soft — ادخل الحقبة القادمة.',
                'cta_en': 'Register Now',
                'cta_ar': 'سجّل الآن',
                'price_display': 'shared',
            },
        },
        {
            'id': 'register',
            'type': 'registration_form',
            'enabled': True,
            'props': {},
        },
    ]
