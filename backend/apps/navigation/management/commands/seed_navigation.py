"""Seed default navigation menus and items for the SidrahSoft CMS."""
from django.core.management.base import BaseCommand

from apps.navigation.models import NavigationMenu, NavigationItem


class Command(BaseCommand):
    help = 'Create default navigation menus and items if they do not exist.'

    def handle(self, *args, **options):
        created_menus = 0
        created_items = 0

        menu_defs = [
            {
                'slug': 'main-header',
                'defaults': {
                    'name': 'Main Header',
                    'location': NavigationMenu.LOCATION_HEADER,
                    'order': 1,
                    'is_active': True,
                },
                'items': [
                    {
                        'label_en': 'Services',
                        'label_ar': 'الخدمات',
                        'link_type': NavigationItem.LINK_ANCHOR,
                        'anchor': 'services',
                        'order': 1,
                        'is_visible': True,
                    },
                    {
                        'label_en': 'Solutions',
                        'label_ar': 'الحلول',
                        'link_type': NavigationItem.LINK_ANCHOR,
                        'anchor': 'services',
                        'order': 2,
                        'is_visible': True,
                    },
                    {
                        'label_en': 'Case Studies',
                        'label_ar': 'دراسات الحالة',
                        'link_type': NavigationItem.LINK_ANCHOR,
                        'anchor': 'case-studies',
                        'order': 3,
                        'is_visible': True,
                    },
                    {
                        'label_en': 'Training Courses',
                        'label_ar': 'دورات تدريبية',
                        'link_type': NavigationItem.LINK_INTERNAL,
                        'url': '/training',
                        'order': 4,
                        'is_visible': True,
                    },
                    {
                        'label_en': 'Insights',
                        'label_ar': 'الرؤى',
                        'link_type': NavigationItem.LINK_ANCHOR,
                        'anchor': 'insights',
                        'order': 5,
                        'is_visible': True,
                    },
                    {
                        'label_en': 'About',
                        'label_ar': 'من نحن',
                        'link_type': NavigationItem.LINK_ANCHOR,
                        'anchor': 'foundation',
                        'order': 6,
                        'is_visible': True,
                    },
                    {
                        'label_en': 'Contact',
                        'label_ar': 'تواصل',
                        'link_type': NavigationItem.LINK_ANCHOR,
                        'anchor': 'contact',
                        'order': 7,
                        'is_visible': True,
                    },
                ],
            },
            {
                'slug': 'mobile-menu',
                'defaults': {
                    'name': 'Mobile Menu',
                    'location': NavigationMenu.LOCATION_MOBILE,
                    'order': 1,
                    'is_active': True,
                },
                'items': [
                    {
                        'label_en': 'Home',
                        'label_ar': 'الرئيسية',
                        'link_type': NavigationItem.LINK_INTERNAL,
                        'url': '/',
                        'order': 1,
                    },
                    {
                        'label_en': 'Training',
                        'label_ar': 'التدريب',
                        'link_type': NavigationItem.LINK_INTERNAL,
                        'url': '/training',
                        'order': 2,
                    },
                    {
                        'label_en': 'Case Studies',
                        'label_ar': 'دراسات الحالة',
                        'link_type': NavigationItem.LINK_INTERNAL,
                        'url': '/case-studies',
                        'order': 3,
                    },
                    {
                        'label_en': 'Contact',
                        'label_ar': 'تواصل معنا',
                        'link_type': NavigationItem.LINK_ANCHOR,
                        'anchor': 'contact',
                        'order': 4,
                    },
                ],
            },
            {
                'slug': 'main-footer',
                'defaults': {
                    'name': 'Main Footer',
                    'location': NavigationMenu.LOCATION_FOOTER,
                    'order': 1,
                    'is_active': True,
                },
                'items': [
                    {
                        'label_en': 'Services',
                        'label_ar': 'الخدمات',
                        'link_type': NavigationItem.LINK_ANCHOR,
                        'anchor': 'services',
                        'order': 1,
                    },
                    {
                        'label_en': 'Industries',
                        'label_ar': 'الصناعات',
                        'link_type': NavigationItem.LINK_ANCHOR,
                        'anchor': 'industries',
                        'order': 2,
                    },
                    {
                        'label_en': 'Partners',
                        'label_ar': 'الشركاء',
                        'link_type': NavigationItem.LINK_ANCHOR,
                        'anchor': 'partners',
                        'order': 3,
                    },
                    {
                        'label_en': 'Insights',
                        'label_ar': 'الرؤى',
                        'link_type': NavigationItem.LINK_ANCHOR,
                        'anchor': 'insights',
                        'order': 4,
                    },
                    {
                        'label_en': 'Careers',
                        'label_ar': 'الوظائف',
                        'link_type': NavigationItem.LINK_ANCHOR,
                        'anchor': 'careers',
                        'order': 5,
                    },
                    {
                        'label_en': 'Contact',
                        'label_ar': 'تواصل معنا',
                        'link_type': NavigationItem.LINK_ANCHOR,
                        'anchor': 'contact',
                        'order': 6,
                    },
                ],
            },
            {
                'slug': 'legal-links',
                'defaults': {
                    'name': 'Legal Links',
                    'location': NavigationMenu.LOCATION_LEGAL,
                    'order': 1,
                    'is_active': True,
                },
                'items': [
                    {
                        'label_en': 'Privacy Policy',
                        'label_ar': 'سياسة الخصوصية',
                        'link_type': NavigationItem.LINK_INTERNAL,
                        'url': '/privacy',
                        'order': 1,
                    },
                    {
                        'label_en': 'Terms of Service',
                        'label_ar': 'شروط الخدمة',
                        'link_type': NavigationItem.LINK_INTERNAL,
                        'url': '/terms',
                        'order': 2,
                    },
                ],
            },
        ]

        for menu_def in menu_defs:
            menu, menu_created = NavigationMenu.objects.update_or_create(
                slug=menu_def['slug'],
                defaults=menu_def['defaults'],
            )
            if menu_created:
                created_menus += 1

            keep_item_ids = set()

            for item_def in menu_def['items']:
                children = item_def.pop('children', [])
                item_defaults = {**item_def, 'is_visible': item_def.get('is_visible', True)}
                item, item_created = NavigationItem.objects.update_or_create(
                    menu=menu,
                    label_en=item_def['label_en'],
                    parent=None,
                    defaults=item_defaults,
                )
                if item_created:
                    created_items += 1
                keep_item_ids.add(item.id)

                for child_def in children:
                    child_defaults = {
                        **child_def,
                        'parent': item,
                        'is_visible': child_def.get('is_visible', True),
                    }
                    child, child_created = NavigationItem.objects.update_or_create(
                        menu=menu,
                        label_en=child_def['label_en'],
                        parent=item,
                        defaults=child_defaults,
                    )
                    if child_created:
                        created_items += 1
                    keep_item_ids.add(child.id)

            # Remove obsolete items so the seed remains a true sync.
            deleted, _ = NavigationItem.objects.filter(
                menu=menu
            ).exclude(id__in=keep_item_ids).delete()

        self.stdout.write(
            self.style.SUCCESS(
                f'Navigation synced: {created_menus} menus created, '
                f'{created_items} items created, obsolete items removed.'
            )
        )
