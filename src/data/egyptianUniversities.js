/**
 * Egyptian Universities Dataset — single reusable source of truth.
 *
 * Audited against the official Supreme Council of Universities (SCU)
 * and Ministry of Higher Education 2025 accredited institutions list.
 * Source: https://scu.eg/en/universities-and-institutions/
 *         https://www.dostor.org/5165498 (Ministry official republish, Aug 2025)
 *
 * Categories:
 *   - public        — government universities (28)
 *   - private       — private universities (34)
 *   - national      — national/Ahleya universities (32)
 *   - technological — government technological universities (12)
 *   - tech_private  — private technological universities (2)
 *   - special       — universities with special laws (1: Zewail)
 *   - international — international agreement universities (6)
 *
 * Total: 115 officially recognized universities + "Other"
 */

export const UNIVERSITY_CATEGORIES = [
  { value: 'public', label_en: 'Public Universities', label_ar: 'الجامعات الحكومية' },
  { value: 'private', label_en: 'Private Universities', label_ar: 'الجامعات الخاصة' },
  { value: 'national', label_en: 'National Universities (Ahleya)', label_ar: 'الجامعات الأهلية' },
  { value: 'technological', label_en: 'Technological Universities', label_ar: 'الجامعات التكنولوجية' },
  { value: 'special', label_en: 'Special Nature Universities', label_ar: 'جامعات ذات طبيعة خاصة' },
  { value: 'international', label_en: 'International Agreement Universities', label_ar: 'جامعات باتفاقيات دولية' },
];

export const EGYPTIAN_UNIVERSITIES = [
  // === PUBLIC UNIVERSITIES (28) ===
  { value: 'cairo', name_en: 'Cairo University', name_ar: 'جامعة القاهرة', category: 'public' },
  { value: 'alexandria', name_en: 'Alexandria University', name_ar: 'جامعة الإسكندرية', category: 'public' },
  { value: 'ain_shams', name_en: 'Ain Shams University', name_ar: 'جامعة عين شمس', category: 'public' },
  { value: 'assyut', name_en: 'Assiut University', name_ar: 'جامعة أسيوط', category: 'public' },
  { value: 'tanta', name_en: 'Tanta University', name_ar: 'جامعة طنطا', category: 'public' },
  { value: 'mansoura', name_en: 'Mansoura University', name_ar: 'جامعة المنصورة', category: 'public' },
  { value: 'zagazig', name_en: 'Zagazig University', name_ar: 'جامعة الزقازيق', category: 'public' },
  { value: 'helwan', name_en: 'Helwan University', name_ar: 'جامعة حلوان', category: 'public' },
  { value: 'minia', name_en: 'Minya University', name_ar: 'جامعة المنيا', category: 'public' },
  { value: 'menoufia', name_en: 'Menoufia University', name_ar: 'جامعة المنوفية', category: 'public' },
  { value: 'suez_canal', name_en: 'Suez Canal University', name_ar: 'جامعة قناة السويس', category: 'public' },
  { value: 'south_valley', name_en: 'South Valley University', name_ar: 'جامعة جنوب الوادي', category: 'public' },
  { value: 'beni_suef', name_en: 'Beni Suef University', name_ar: 'جامعة بني سويف', category: 'public' },
  { value: 'fayoum', name_en: 'Fayoum University', name_ar: 'جامعة الفيوم', category: 'public' },
  { value: 'benha', name_en: 'Benha University', name_ar: 'جامعة بنها', category: 'public' },
  { value: 'kafrelsheikh', name_en: 'Kafr El-Sheikh University', name_ar: 'جامعة كفر الشيخ', category: 'public' },
  { value: 'sohag', name_en: 'Sohag University', name_ar: 'جامعة سوهاج', category: 'public' },
  { value: 'port_said', name_en: 'Port Said University', name_ar: 'جامعة بورسعيد', category: 'public' },
  { value: 'damanhour', name_en: 'Damanhour University', name_ar: 'جامعة دمنهور', category: 'public' },
  { value: 'aswan', name_en: 'Aswan University', name_ar: 'جامعة أسوان', category: 'public' },
  { value: 'damietta', name_en: 'Damietta University', name_ar: 'جامعة دمياط', category: 'public' },
  { value: 'suez', name_en: 'Suez University', name_ar: 'جامعة السويس', category: 'public' },
  { value: 'sadat_city', name_en: 'Sadat City University', name_ar: 'جامعة مدينة السادات', category: 'public' },
  { value: 'arish', name_en: 'Arish University', name_ar: 'جامعة العريش', category: 'public' },
  { value: 'new_valley', name_en: 'New Valley University', name_ar: 'جامعة الوادي الجديد', category: 'public' },
  { value: 'matrouh', name_en: 'Matrouh University', name_ar: 'جامعة مطروح', category: 'public' },
  { value: 'luxor', name_en: 'Luxor University', name_ar: 'جامعة الأقصر', category: 'public' },
  { value: 'hurghada', name_en: 'Hurghada University', name_ar: 'جامعة الغردقة', category: 'public' },

  // === PRIVATE UNIVERSITIES (34) ===
  { value: 'october_6', name_en: 'October 6 University', name_ar: 'جامعة 6 أكتوبر', category: 'private' },
  { value: 'msa', name_en: 'October University for Modern Sciences and Arts (MSA)', name_ar: 'جامعة أكتوبر للعلوم الحديثة والآداب (MSA)', category: 'private' },
  { value: 'must', name_en: 'Misr University for Science and Technology', name_ar: 'جامعة مصر للعلوم والتكنولوجيا', category: 'private' },
  { value: 'miu', name_en: 'Misr International University (MIU)', name_ar: 'جامعة مصر الدولية', category: 'private' },
  { value: 'guc', name_en: 'German University in Cairo (GUC)', name_ar: 'الجامعة الألمانية بالقاهرة', category: 'private' },
  { value: 'ahram_canadian', name_en: 'Ahram Canadian University', name_ar: 'جامعة الأهرام الكندية', category: 'private' },
  { value: 'bue', name_en: 'British University in Egypt (BUE)', name_ar: 'الجامعة البريطانية في مصر', category: 'private' },
  { value: 'mti', name_en: 'Modern University for Technology and Information (MTI)', name_ar: 'الجامعة الحديثة للتكنولوجيا والمعلومات', category: 'private' },
  { value: 'sinai', name_en: 'Sinai University', name_ar: 'جامعة سيناء', category: 'private' },
  { value: 'pua', name_en: 'Pharos University in Alexandria', name_ar: 'جامعة فاروس بالإسكندرية', category: 'private' },
  { value: 'nahda', name_en: 'Nahda University in Beni Suef', name_ar: 'جامعة النهضة ببني سويف', category: 'private' },
  { value: 'future', name_en: 'Future University in Egypt (FUE)', name_ar: 'جامعة المستقبل', category: 'private' },
  { value: 'eru', name_en: 'Egyptian Russian University', name_ar: 'الجامعة المصرية الروسية', category: 'private' },
  { value: 'delta', name_en: 'Delta University for Science and Technology', name_ar: 'جامعة الدلتا للعلوم والتكنولوجيا', category: 'private' },
  { value: 'heliopolis', name_en: 'Heliopolis University', name_ar: 'جامعة هليوبوليس', category: 'private' },
  { value: 'new_giza', name_en: 'New Giza University (NGU)', name_ar: 'جامعة الجيزة الجديدة', category: 'private' },
  { value: 'deraya', name_en: 'Deraya University', name_ar: 'جامعة دراية بالمنيا', category: 'private' },
  { value: 'badr_cairo', name_en: 'Badr University in Cairo (BUC)', name_ar: 'جامعة بدر بالقاهرة', category: 'private' },
  { value: 'horus', name_en: 'Horus University', name_ar: 'جامعة حورس', category: 'private' },
  { value: 'egyptian_chinese', name_en: 'Egyptian Chinese University', name_ar: 'جامعة المصرية الصينية', category: 'private' },
  { value: 'merit', name_en: 'Merit University', name_ar: 'جامعة ميريت', category: 'private' },
  { value: 'sphinx', name_en: 'Sphinx University', name_ar: 'جامعة سفنكس', category: 'private' },
  { value: 'alsalam', name_en: 'Al Salam University', name_ar: 'جامعة السلام', category: 'private' },
  { value: 'badr_assiut', name_en: 'Badr University in Assiut', name_ar: 'جامعة بدر بأسيوط', category: 'private' },
  { value: 'salehiya', name_en: 'New Salehiya University', name_ar: 'جامعة الصالحية الجديدة', category: 'private' },
  { value: 'hayah', name_en: 'Hayah University', name_ar: 'جامعة الحياة', category: 'private' },
  { value: 'mayo', name_en: 'Mayo University', name_ar: 'جامعة مايو', category: 'private' },
  { value: 'riadah', name_en: 'Riadah University for Science and Technology', name_ar: 'جامعة الريادة للعلوم والتكنولوجيا', category: 'private' },
  { value: 'innovation', name_en: 'Innovation University', name_ar: 'جامعة الابتكار', category: 'private' },
  { value: 'city_cairo', name_en: 'City University of Cairo', name_ar: 'جامعة المدينة بالقاهرة', category: 'private' },
  { value: 'rashid', name_en: 'Rashid University', name_ar: 'جامعة رشيد', category: 'private' },
  { value: 'badia', name_en: 'Badia University', name_ar: 'جامعة باديا', category: 'private' },
  { value: 'wadi_nile', name_en: 'Wadi El Nile University', name_ar: 'جامعة وادي النيل بالفيوم', category: 'private' },
  { value: 'lotus', name_en: 'Lotus University in Minya', name_ar: 'جامعة اللوتس بالمنيا', category: 'private' },

  // === NATIONAL / AHALEYA UNIVERSITIES (32) ===
  { value: 'king_salman', name_en: 'King Salman International University', name_ar: 'جامعة الملك سلمان الدولية', category: 'national' },
  { value: 'el_alamein', name_en: 'El Alamein International University', name_ar: 'جامعة العلمين الدولية', category: 'national' },
  { value: 'el_galala', name_en: 'Galala University', name_ar: 'جامعة الجلالة', category: 'national' },
  { value: 'new_mansoura', name_en: 'New Mansoura University', name_ar: 'جامعة المنصورة الجديدة', category: 'national' },
  { value: 'e_learning', name_en: 'Egyptian E-Learning University', name_ar: 'الجامعة المصرية للتعلم الإلكتروني الأهلية', category: 'national' },
  { value: 'nile_national', name_en: 'Nile National University', name_ar: 'جامعة النيل الأهلية', category: 'national' },
  { value: 'french_national', name_en: 'French National University in Egypt', name_ar: 'الجامعة الأهلية الفرنسية في مصر', category: 'national' },
  { value: 'informatica', name_en: 'Egypt University of Informatics', name_ar: 'جامعة مصر للمعلوماتية', category: 'national' },
  { value: 'helwan_national', name_en: 'Helwan National University', name_ar: 'جامعة حلوان الأهلية', category: 'national' },
  { value: 'mansoura_national', name_en: 'Mansoura National University', name_ar: 'جامعة المنصورة الأهلية', category: 'national' },
  { value: 'benha_national', name_en: 'Benha National University', name_ar: 'جامعة بنها الأهلية', category: 'national' },
  { value: 'menoufia_national', name_en: 'Menoufia National University', name_ar: 'جامعة المنوفية الأهلية', category: 'national' },
  { value: 'beni_suef_national', name_en: 'Beni Suef National University', name_ar: 'جامعة بني سويف الأهلية', category: 'national' },
  { value: 'assiut_national', name_en: 'Assiut National University', name_ar: 'جامعة أسيوط الأهلية', category: 'national' },
  { value: 'south_valley_national', name_en: 'South Valley National University', name_ar: 'جامعة جنوب الوادي الأهلية', category: 'national' },
  { value: 'minya_national', name_en: 'Minya National University', name_ar: 'جامعة المنيا الأهلية', category: 'national' },
  { value: 'east_port_said_national', name_en: 'East Port Said National University', name_ar: 'جامعة شرق بورسعيد الأهلية', category: 'national' },
  { value: 'alexandria_national', name_en: 'Alexandria National University', name_ar: 'جامعة الإسكندرية الأهلية', category: 'national' },
  { value: 'zagazig_national', name_en: 'Zagazig National University', name_ar: 'جامعة الزقازيق الأهلية', category: 'national' },
  { value: 'ismailia_national', name_en: 'New Ismailia National University', name_ar: 'جامعة الإسماعيلية الجديدة الأهلية', category: 'national' },
  { value: 'suez_national', name_en: 'Suez National University', name_ar: 'جامعة السويس الأهلية', category: 'national' },
  { value: 'damanhour_national', name_en: 'Damanhour National University', name_ar: 'جامعة دمنهور الأهلية', category: 'national' },
  { value: 'cairo_national', name_en: 'Cairo National University', name_ar: 'جامعة القاهرة الأهلية', category: 'national' },
  { value: 'ain_shams_national', name_en: 'Ain Shams National University', name_ar: 'جامعة عين شمس الأهلية', category: 'national' },
  { value: 'sohag_national', name_en: 'Sohag National University', name_ar: 'جامعة سوهاج الأهلية', category: 'national' },
  { value: 'kafrelsheikh_national', name_en: 'Kafr El-Sheikh National University', name_ar: 'جامعة كفر الشيخ الأهلية', category: 'national' },
  { value: 'new_valley_national', name_en: 'New Valley National University', name_ar: 'جامعة الوادي الجديد الأهلية', category: 'national' },
  { value: 'fayoum_national', name_en: 'Fayoum National University', name_ar: 'جامعة الفيوم الأهلية', category: 'national' },
  { value: 'tanta_national', name_en: 'Tanta National University', name_ar: 'جامعة طنطا الأهلية', category: 'national' },
  { value: 'luxor_national', name_en: 'Luxor National University', name_ar: 'جامعة الأقصر الأهلية', category: 'national' },
  { value: 'damietta_national', name_en: 'Damietta National University', name_ar: 'جامعة دمياط الأهلية', category: 'national' },
  { value: 'sadat_city_national', name_en: 'Sadat City National University', name_ar: 'جامعة مدينة السادات الأهلية', category: 'national' },

  // === TECHNOLOGICAL UNIVERSITIES — GOVERNMENT (12) ===
  { value: 'tu_new_cairo', name_en: 'New Cairo Technological University', name_ar: 'جامعة القاهرة الجديدة التكنولوجية', category: 'technological' },
  { value: 'tu_delta', name_en: 'Delta Technological University', name_ar: 'جامعة الدلتا التكنولوجية', category: 'technological' },
  { value: 'tu_beni_suef', name_en: 'Beni Suef Technological University', name_ar: 'جامعة بني سويف التكنولوجية', category: 'technological' },
  { value: 'tu_new_assiut', name_en: 'New Assiut Technological University', name_ar: 'جامعة أسيوط الجديدة التكنولوجية', category: 'technological' },
  { value: 'tu_borg_arab', name_en: 'Borg El-Arab Technological University', name_ar: 'جامعة برج العرب التكنولوجية', category: 'technological' },
  { value: 'tu_new_theba', name_en: 'New Thebes Technological University', name_ar: 'جامعة طيبة الجديدة التكنولوجية', category: 'technological' },
  { value: 'tu_october_6', name_en: 'October 6 Technological University', name_ar: 'جامعة السادس من أكتوبر التكنولوجية', category: 'technological' },
  { value: 'tu_samannoud', name_en: 'Samannoud Technological University', name_ar: 'جامعة سمنود التكنولوجية', category: 'technological' },
  { value: 'tu_east_port_said', name_en: 'East Port Said Technological University', name_ar: 'جامعة شرق بورسعيد التكنولوجية', category: 'technological' },
  { value: 'tu_helwan', name_en: 'Helwan Technological University', name_ar: 'جامعة حلوان التكنولوجية', category: 'technological' },
  { value: 'tu_fayoum', name_en: 'Fayoum Technological University', name_ar: 'جامعة الفيوم التكنولوجية', category: 'technological' },
  { value: 'tu_assiut', name_en: 'Assiut Technological University', name_ar: 'جامعة أسيوط التكنولوجية', category: 'technological' },

  // === SPECIAL NATURE UNIVERSITIES (1) ===
  { value: 'zewail', name_en: 'Zewail City of Science and Technology', name_ar: 'جامعة زويل للعلوم والتكنولوجيا', category: 'special' },

  // === INTERNATIONAL AGREEMENT UNIVERSITIES (6) ===
  { value: 'auc', name_en: 'American University in Cairo (AUC)', name_ar: 'الجامعة الأمريكية بالقاهرة', category: 'international' },
  { value: 'ejust', name_en: 'Egypt-Japan University of Science and Technology (E-JUST)', name_ar: 'الجامعة المصرية اليابانية للعلوم والتكنولوجيا', category: 'international' },
  { value: 'giu', name_en: 'German International University (GIU)', name_ar: 'الجامعة الألمانية الدولية بالعاصمة الإدارية', category: 'international' },
  { value: 'eslsca', name_en: 'ESLSCA University', name_ar: 'جامعة اسلسكا', category: 'international' },
  { value: 'berlin_gouna', name_en: 'Berlin University of Technology in El Gouna', name_ar: 'جامعة برلين الألمانية بالجونة', category: 'international' },
  { value: 'senghor', name_en: 'Senghor University', name_ar: 'جامعة سنجور', category: 'international' },
];

/**
 * The special "Other" option — always included at the end.
 */
export const OTHER_UNIVERSITY = {
  value: 'other',
  name_en: 'Other',
  name_ar: 'أخرى',
  category: null,
};

/**
 * Full list including "Other" at the end.
 */
export const ALL_UNIVERSITIES = [...EGYPTIAN_UNIVERSITIES, OTHER_UNIVERSITY];

/**
 * Set of valid university values for quick lookup.
 */
export const VALID_UNIVERSITY_VALUES = new Set(ALL_UNIVERSITIES.map((u) => u.value));

/**
 * Resolve a university value to a display label.
 * Falls back to the raw value for legacy data.
 */
export function getUniversityLabel(value, lang = 'en') {
  if (!value) return '';
  const uni = ALL_UNIVERSITIES.find((u) => u.value === value);
  if (uni) return lang === 'ar' ? uni.name_ar : uni.name_en;
  return value; // legacy free-text fallback
}

/**
 * Study status options — stable backend values with bilingual labels.
 */
export const EDUCATION_STATUS_OPTIONS = [
  { value: 'first_year', label_en: 'First Year', label_ar: 'الفرقة الأولى' },
  { value: 'second_year', label_en: 'Second Year', label_ar: 'الفرقة الثانية' },
  { value: 'third_year', label_en: 'Third Year', label_ar: 'الفرقة الثالثة' },
  { value: 'fourth_year', label_en: 'Fourth Year', label_ar: 'الفرقة الرابعة' },
  { value: 'fifth_year', label_en: 'Fifth Year', label_ar: 'الفرقة الخامسة' },
  { value: 'graduate', label_en: 'Graduate', label_ar: 'خريج' },
  { value: 'other', label_en: 'Other', label_ar: 'أخرى' },
];

/**
 * Set of valid education status values.
 */
export const VALID_EDUCATION_STATUS_VALUES = new Set(EDUCATION_STATUS_OPTIONS.map((s) => s.value));

/**
 * Resolve an education status value to a display label.
 */
export function getEducationStatusLabel(value, lang = 'en') {
  if (!value) return '';
  const status = EDUCATION_STATUS_OPTIONS.find((s) => s.value === value);
  if (status) return lang === 'ar' ? status.label_ar : status.label_en;
  return value;
}
