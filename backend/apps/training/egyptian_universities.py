"""Egyptian Universities Dataset — backend source of truth for validation.

Audited against the official Supreme Council of Universities (SCU)
and Ministry of Higher Education 2025 accredited institutions list.
Source: https://scu.eg/en/universities-and-institutions/
         https://www.dostor.org/5165498 (Ministry official republish, Aug 2025)

Categories:
  - public        — government universities (28)
  - private       — private universities (34)
  - national      — national/Ahleya universities (32)
  - technological — government technological universities (12)
  - special       — universities with special laws (1: Zewail)
  - international — international agreement universities (6)

Total: 113 officially recognized universities + "Other"

This file MUST be kept in sync with src/data/egyptianUniversities.js.
A consistency test (test_university_dataset_consistency) verifies this.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class University:
    value: str
    name_en: str
    name_ar: str
    category: str


EGYPTIAN_UNIVERSITIES = [
    # === PUBLIC UNIVERSITIES (28) ===
    University('cairo', 'Cairo University', 'جامعة القاهرة', 'public'),
    University('alexandria', 'Alexandria University', 'جامعة الإسكندرية', 'public'),
    University('ain_shams', 'Ain Shams University', 'جامعة عين شمس', 'public'),
    University('assyut', 'Assiut University', 'جامعة أسيوط', 'public'),
    University('tanta', 'Tanta University', 'جامعة طنطا', 'public'),
    University('mansoura', 'Mansoura University', 'جامعة المنصورة', 'public'),
    University('zagazig', 'Zagazig University', 'جامعة الزقازيق', 'public'),
    University('helwan', 'Helwan University', 'جامعة حلوان', 'public'),
    University('minia', 'Minya University', 'جامعة المنيا', 'public'),
    University('menoufia', 'Menoufia University', 'جامعة المنوفية', 'public'),
    University('suez_canal', 'Suez Canal University', 'جامعة قناة السويس', 'public'),
    University('south_valley', 'South Valley University', 'جامعة جنوب الوادي', 'public'),
    University('beni_suef', 'Beni Suef University', 'جامعة بني سويف', 'public'),
    University('fayoum', 'Fayoum University', 'جامعة الفيوم', 'public'),
    University('benha', 'Benha University', 'جامعة بنها', 'public'),
    University('kafrelsheikh', 'Kafr El-Sheikh University', 'جامعة كفر الشيخ', 'public'),
    University('sohag', 'Sohag University', 'جامعة سوهاج', 'public'),
    University('port_said', 'Port Said University', 'جامعة بورسعيد', 'public'),
    University('damanhour', 'Damanhour University', 'جامعة دمنهور', 'public'),
    University('aswan', 'Aswan University', 'جامعة أسوان', 'public'),
    University('damietta', 'Damietta University', 'جامعة دمياط', 'public'),
    University('suez', 'Suez University', 'جامعة السويس', 'public'),
    University('sadat_city', 'Sadat City University', 'جامعة مدينة السادات', 'public'),
    University('arish', 'Arish University', 'جامعة العريش', 'public'),
    University('new_valley', 'New Valley University', 'جامعة الوادي الجديد', 'public'),
    University('matrouh', 'Matrouh University', 'جامعة مطروح', 'public'),
    University('luxor', 'Luxor University', 'جامعة الأقصر', 'public'),
    University('hurghada', 'Hurghada University', 'جامعة الغردقة', 'public'),

    # === PRIVATE UNIVERSITIES (34) ===
    University('october_6', 'October 6 University', 'جامعة 6 أكتوبر', 'private'),
    University('msa', 'October University for Modern Sciences and Arts (MSA)', 'جامعة أكتوبر للعلوم الحديثة والآداب (MSA)', 'private'),
    University('must', 'Misr University for Science and Technology', 'جامعة مصر للعلوم والتكنولوجيا', 'private'),
    University('miu', 'Misr International University (MIU)', 'جامعة مصر الدولية', 'private'),
    University('guc', 'German University in Cairo (GUC)', 'الجامعة الألمانية بالقاهرة', 'private'),
    University('ahram_canadian', 'Ahram Canadian University', 'جامعة الأهرام الكندية', 'private'),
    University('bue', 'British University in Egypt (BUE)', 'الجامعة البريطانية في مصر', 'private'),
    University('mti', 'Modern University for Technology and Information (MTI)', 'الجامعة الحديثة للتكنولوجيا والمعلومات', 'private'),
    University('sinai', 'Sinai University', 'جامعة سيناء', 'private'),
    University('pua', 'Pharos University in Alexandria', 'جامعة فاروس بالإسكندرية', 'private'),
    University('nahda', 'Nahda University in Beni Suef', 'جامعة النهضة ببني سويف', 'private'),
    University('future', 'Future University in Egypt (FUE)', 'جامعة المستقبل', 'private'),
    University('eru', 'Egyptian Russian University', 'الجامعة المصرية الروسية', 'private'),
    University('delta', 'Delta University for Science and Technology', 'جامعة الدلتا للعلوم والتكنولوجيا', 'private'),
    University('heliopolis', 'Heliopolis University', 'جامعة هليوبوليس', 'private'),
    University('new_giza', 'New Giza University (NGU)', 'جامعة الجيزة الجديدة', 'private'),
    University('deraya', 'Deraya University', 'جامعة دراية بالمنيا', 'private'),
    University('badr_cairo', 'Badr University in Cairo (BUC)', 'جامعة بدر بالقاهرة', 'private'),
    University('horus', 'Horus University', 'جامعة حورس', 'private'),
    University('egyptian_chinese', 'Egyptian Chinese University', 'جامعة المصرية الصينية', 'private'),
    University('merit', 'Merit University', 'جامعة ميريت', 'private'),
    University('sphinx', 'Sphinx University', 'جامعة سفنكس', 'private'),
    University('alsalam', 'Al Salam University', 'جامعة السلام', 'private'),
    University('badr_assiut', 'Badr University in Assiut', 'جامعة بدر بأسيوط', 'private'),
    University('salehiya', 'New Salehiya University', 'جامعة الصالحية الجديدة', 'private'),
    University('hayah', 'Hayah University', 'جامعة الحياة', 'private'),
    University('mayo', 'Mayo University', 'جامعة مايو', 'private'),
    University('riadah', 'Riadah University for Science and Technology', 'جامعة الريادة للعلوم والتكنولوجيا', 'private'),
    University('innovation', 'Innovation University', 'جامعة الابتكار', 'private'),
    University('city_cairo', 'City University of Cairo', 'جامعة المدينة بالقاهرة', 'private'),
    University('rashid', 'Rashid University', 'جامعة رشيد', 'private'),
    University('badia', 'Badia University', 'جامعة باديا', 'private'),
    University('wadi_nile', 'Wadi El Nile University', 'جامعة وادي النيل بالفيوم', 'private'),
    University('lotus', 'Lotus University in Minya', 'جامعة اللوتس بالمنيا', 'private'),

    # === NATIONAL / AHALEYA UNIVERSITIES (32) ===
    University('king_salman', 'King Salman International University', 'جامعة الملك سلمان الدولية', 'national'),
    University('el_alamein', 'El Alamein International University', 'جامعة العلمين الدولية', 'national'),
    University('el_galala', 'Galala University', 'جامعة الجلالة', 'national'),
    University('new_mansoura', 'New Mansoura University', 'جامعة المنصورة الجديدة', 'national'),
    University('e_learning', 'Egyptian E-Learning University', 'الجامعة المصرية للتعلم الإلكتروني الأهلية', 'national'),
    University('nile_national', 'Nile National University', 'جامعة النيل الأهلية', 'national'),
    University('french_national', 'French National University in Egypt', 'الجامعة الأهلية الفرنسية في مصر', 'national'),
    University('informatica', 'Egypt University of Informatics', 'جامعة مصر للمعلوماتية', 'national'),
    University('helwan_national', 'Helwan National University', 'جامعة حلوان الأهلية', 'national'),
    University('mansoura_national', 'Mansoura National University', 'جامعة المنصورة الأهلية', 'national'),
    University('benha_national', 'Benha National University', 'جامعة بنها الأهلية', 'national'),
    University('menoufia_national', 'Menoufia National University', 'جامعة المنوفية الأهلية', 'national'),
    University('beni_suef_national', 'Beni Suef National University', 'جامعة بني سويف الأهلية', 'national'),
    University('assiut_national', 'Assiut National University', 'جامعة أسيوط الأهلية', 'national'),
    University('south_valley_national', 'South Valley National University', 'جامعة جنوب الوادي الأهلية', 'national'),
    University('minya_national', 'Minya National University', 'جامعة المنيا الأهلية', 'national'),
    University('east_port_said_national', 'East Port Said National University', 'جامعة شرق بورسعيد الأهلية', 'national'),
    University('alexandria_national', 'Alexandria National University', 'جامعة الإسكندرية الأهلية', 'national'),
    University('zagazig_national', 'Zagazig National University', 'جامعة الزقازيق الأهلية', 'national'),
    University('ismailia_national', 'New Ismailia National University', 'جامعة الإسماعيلية الجديدة الأهلية', 'national'),
    University('suez_national', 'Suez National University', 'جامعة السويس الأهلية', 'national'),
    University('damanhour_national', 'Damanhour National University', 'جامعة دمنهور الأهلية', 'national'),
    University('cairo_national', 'Cairo National University', 'جامعة القاهرة الأهلية', 'national'),
    University('ain_shams_national', 'Ain Shams National University', 'جامعة عين شمس الأهلية', 'national'),
    University('sohag_national', 'Sohag National University', 'جامعة سوهاج الأهلية', 'national'),
    University('kafrelsheikh_national', 'Kafr El-Sheikh National University', 'جامعة كفر الشيخ الأهلية', 'national'),
    University('new_valley_national', 'New Valley National University', 'جامعة الوادي الجديد الأهلية', 'national'),
    University('fayoum_national', 'Fayoum National University', 'جامعة الفيوم الأهلية', 'national'),
    University('tanta_national', 'Tanta National University', 'جامعة طنطا الأهلية', 'national'),
    University('luxor_national', 'Luxor National University', 'جامعة الأقصر الأهلية', 'national'),
    University('damietta_national', 'Damietta National University', 'جامعة دمياط الأهلية', 'national'),
    University('sadat_city_national', 'Sadat City National University', 'جامعة مدينة السادات الأهلية', 'national'),

    # === TECHNOLOGICAL UNIVERSITIES — GOVERNMENT (12) ===
    University('tu_new_cairo', 'New Cairo Technological University', 'جامعة القاهرة الجديدة التكنولوجية', 'technological'),
    University('tu_delta', 'Delta Technological University', 'جامعة الدلتا التكنولوجية', 'technological'),
    University('tu_beni_suef', 'Beni Suef Technological University', 'جامعة بني سويف التكنولوجية', 'technological'),
    University('tu_new_assiut', 'New Assiut Technological University', 'جامعة أسيوط الجديدة التكنولوجية', 'technological'),
    University('tu_borg_arab', 'Borg El-Arab Technological University', 'جامعة برج العرب التكنولوجية', 'technological'),
    University('tu_new_theba', 'New Thebes Technological University', 'جامعة طيبة الجديدة التكنولوجية', 'technological'),
    University('tu_october_6', 'October 6 Technological University', 'جامعة السادس من أكتوبر التكنولوجية', 'technological'),
    University('tu_samannoud', 'Samannoud Technological University', 'جامعة سمنود التكنولوجية', 'technological'),
    University('tu_east_port_said', 'East Port Said Technological University', 'جامعة شرق بورسعيد التكنولوجية', 'technological'),
    University('tu_helwan', 'Helwan Technological University', 'جامعة حلوان التكنولوجية', 'technological'),
    University('tu_fayoum', 'Fayoum Technological University', 'جامعة الفيوم التكنولوجية', 'technological'),
    University('tu_assiut', 'Assiut Technological University', 'جامعة أسيوط التكنولوجية', 'technological'),

    # === SPECIAL NATURE UNIVERSITIES (1) ===
    University('zewail', 'Zewail City of Science and Technology', 'جامعة زويل للعلوم والتكنولوجيا', 'special'),

    # === INTERNATIONAL AGREEMENT UNIVERSITIES (6) ===
    University('auc', 'American University in Cairo (AUC)', 'الجامعة الأمريكية بالقاهرة', 'international'),
    University('ejust', 'Egypt-Japan University of Science and Technology (E-JUST)', 'الجامعة المصرية اليابانية للعلوم والتكنولوجيا', 'international'),
    University('giu', 'German International University (GIU)', 'الجامعة الألمانية الدولية بالعاصمة الإدارية', 'international'),
    University('eslsca', 'ESLSCA University', 'جامعة اسلسكا', 'international'),
    University('berlin_gouna', 'Berlin University of Technology in El Gouna', 'جامعة برلين الألمانية بالجونة', 'international'),
    University('senghor', 'Senghor University', 'جامعة سنجور', 'international'),
]

OTHER_UNIVERSITY_VALUE = 'other'

# Set of valid university values (including "other")
VALID_UNIVERSITY_VALUES = {u.value for u in EGYPTIAN_UNIVERSITIES} | {OTHER_UNIVERSITY_VALUE}

# University lookup by value
_UNIVERSITY_BY_VALUE = {u.value: u for u in EGYPTIAN_UNIVERSITIES}


def get_university_label(value, lang='en'):
    """Resolve a university value to a display label. Falls back to raw value."""
    if not value:
        return ''
    if value == OTHER_UNIVERSITY_VALUE:
        return 'Other' if lang == 'en' else 'أخرى'
    uni = _UNIVERSITY_BY_VALUE.get(value)
    if uni:
        return uni.name_ar if lang == 'ar' else uni.name_en
    return value  # legacy free-text fallback


# --- Education Status ---

EDUCATION_STATUS_CHOICES = [
    ('first_year', 'First Year', 'الفرقة الأولى'),
    ('second_year', 'Second Year', 'الفرقة الثانية'),
    ('third_year', 'Third Year', 'الفرقة الثالثة'),
    ('fourth_year', 'Fourth Year', 'الفرقة الرابعة'),
    ('fifth_year', 'Fifth Year', 'الفرقة الخامسة'),
    ('graduate', 'Graduate', 'خريج'),
    ('other', 'Other', 'أخرى'),
]

VALID_EDUCATION_STATUS_VALUES = {v for v, _, _ in EDUCATION_STATUS_CHOICES}

_STATUS_BY_VALUE = {v: (en, ar) for v, en, ar in EDUCATION_STATUS_CHOICES}


def get_education_status_label(value, lang='en'):
    """Resolve an education status value to a display label. Falls back to raw value."""
    if not value:
        return ''
    labels = _STATUS_BY_VALUE.get(value)
    if labels:
        return labels[1] if lang == 'ar' else labels[0]
    return value  # legacy free-text fallback
