/**
 * Transform API program response to the shape expected by courseLanding components.
 *
 * The API returns snake_case fields (title_en, title_ar, etc.) and nested objects.
 * The existing components expect camelCase fields (titleEn, titleAr) and {ar, en} objects.
 * This transformer bridges the gap without rewriting every component.
 */

function bilingual(en, ar) {
  return { en: en || '', ar: ar || '' };
}

/**
 * Product-line labels used for the category chip on course detail pages.
 * Keeps the product classification visible (e.g. a Starter course is clearly
 * labelled "Sidrah Starter", not presented as a discounted professional course).
 */
const BRANCH_LABELS = {
  professional: { en: 'Professional Course', ar: 'كورس احترافي' },
  secondary: { en: 'Secondary Program', ar: 'برنامج ثانوي' },
  starter: { en: 'Sidrah Starter Course', ar: 'كورس Sidrah للمبتدئين' },
  summer: { en: 'Summer Training', ar: 'التدريب الصيفي' },
};

/**
 * Normalize a list item to a plain string.
 *
 * The API may return list fields (skills, learning outcomes, topics) as
 * either plain strings or objects such as { title: "..." } or
 * { title_en: "...", title_ar: "..." } depending on how they were seeded.
 * Rendering an object directly in JSX crashes React (error #31), so every
 * item must be reduced to a string here before reaching components.
 */
function toPlainText(item, lang) {
  if (item == null) return '';
  if (typeof item === 'string') return item;
  if (typeof item === 'object') {
    if (typeof item[`title_${lang}`] === 'string') return item[`title_${lang}`];
    if (typeof item.title === 'string') return item.title;
    if (typeof item.title_en === 'string') return item.title_en;
    if (typeof item.text === 'string') return item.text;
  }
  return '';
}

function bilingualList(enList, arList) {
  return {
    en: Array.isArray(enList) ? enList.map((i) => toPlainText(i, 'en')).filter(Boolean) : [],
    ar: Array.isArray(arList) ? arList.map((i) => toPlainText(i, 'ar')).filter(Boolean) : [],
  };
}

/**
 * Transform a program API response into the course + landing shapes
 * expected by CourseDetailPage and its child components.
 */
export function transformProgramData(apiData) {
  if (!apiData) return null;

  const landing = apiData.landing || {};
  const branch = apiData.branch || 'professional';
  const branchLabel = BRANCH_LABELS[branch] || BRANCH_LABELS.professional;

  // Transform course (base program fields)
  const course = {
    slug: apiData.slug,
    branch,
    image: apiData.image_url || undefined,
    categoryEn: branchLabel.en,
    categoryAr: branchLabel.ar,
    titleEn: apiData.title_en || '',
    titleAr: apiData.title_ar || '',
    shortDescriptionEn: apiData.short_description_en || '',
    shortDescriptionAr: apiData.short_description_ar || '',
    subtitleEn: landing.headline_en || '',
    subtitleAr: landing.headline_ar || '',
    overviewEn: apiData.overview_en || '',
    overviewAr: apiData.overview_ar || '',
    audienceEn: (landing.target_audience && landing.target_audience.en) || [],
    audienceAr: (landing.target_audience && landing.target_audience.ar) || [],
    modulesEn: (apiData.modules_en || []).map((m) => toPlainText(m, 'en')).filter(Boolean),
    modulesAr: (apiData.modules_ar || []).map((m) => toPlainText(m, 'ar')).filter(Boolean),
    skillsEn: (apiData.skills_en || []).map((s) => toPlainText(s, 'en')).filter(Boolean),
    skillsAr: (apiData.skills_ar || []).map((s) => toPlainText(s, 'ar')).filter(Boolean),
    durationEn: apiData.duration_en || '',
    durationAr: apiData.duration_ar || '',
    formatEn: apiData.format_en || '',
    formatAr: apiData.format_ar || '',
    scheduleEn: apiData.schedule_en || '',
    scheduleAr: apiData.schedule_ar || '',
    ctaTextEn: apiData.cta_text_en || '',
    ctaTextAr: apiData.cta_text_ar || '',
    learningOutcomesEn: (apiData.learning_outcomes_en || []).map((o) => toPlainText(o, 'en')).filter(Boolean),
    learningOutcomesAr: (apiData.learning_outcomes_ar || []).map((o) => toPlainText(o, 'ar')).filter(Boolean),
    practicalProjectEn: apiData.practical_project_en || '',
    practicalProjectAr: apiData.practical_project_ar || '',
    displayOrder: apiData.display_order || 0,
  };

  // Transform landing data
  const transformedLanding = {
    headline: bilingual(landing.headline_en, landing.headline_ar),
    introVideoUrl: landing.intro_video_url || null,
    introVideoType: landing.intro_video_type === 'none' ? null : landing.intro_video_type,
    introVideoFileUrl: landing.intro_video_file_url || null,
    videoPoster: landing.video_poster_url || null,
    videoTitle: bilingual(landing.video_title_en, landing.video_title_ar),
    quickFacts: landing.quick_facts || {},
    learningOutcomes: bilingualList(
      apiData.learning_outcomes_en,
      apiData.learning_outcomes_ar,
    ),
    curriculum: (apiData.curriculum_modules || []).map((m) => ({
      id: String(m.id),
      title: bilingual(m.title_en, m.title_ar),
      description: bilingual(m.description_en, m.description_ar),
      topics: bilingualList(
        (m.topics || []).map((t) => t.title_en),
        (m.topics || []).map((t) => t.title_ar),
      ),
    })),
    targetAudience: bilingualList(
      (landing.target_audience && landing.target_audience.en) || [],
      (landing.target_audience && landing.target_audience.ar) || [],
    ),
    prerequisites: bilingualList(
      (landing.prerequisites && landing.prerequisites.en) || [],
      (landing.prerequisites && landing.prerequisites.ar) || [],
    ),
    tools: bilingualList(
      (landing.tools && landing.tools.en) || [],
      (landing.tools && landing.tools.ar) || [],
    ),
    practicalTraining: bilingual(
      landing.practical_training_en,
      landing.practical_training_ar,
    ),
    finalProject: bilingual(
      landing.final_project_en,
      landing.final_project_ar,
    ),
    trainingExperience: bilingual(
      landing.training_experience_en,
      landing.training_experience_ar,
    ),
    mentorInfo: bilingual(
      landing.mentor_info_en,
      landing.mentor_info_ar,
    ),
    installmentsAvailable: landing.installments_available === true,
    installmentsInfo: bilingual(
      landing.installments_info_en,
      landing.installments_info_ar,
    ),
    instructors: (apiData.instructors || []).map((inst) => ({
      id: String(inst.id),
      name: bilingual(inst.name_en, inst.name_ar),
      title: bilingual(inst.title_en, inst.title_ar),
      bio: bilingual(inst.bio_en, inst.bio_ar),
      image: inst.image_url || undefined,
      linkedin: inst.linkedin_url || undefined,
    })),
    testimonials: (apiData.testimonials || []).map((t) => ({
      id: String(t.id),
      name: bilingual(t.student_name_en, t.student_name_ar),
      content: bilingual(t.content_en, t.content_ar),
      rating: t.rating || 5,
      image: t.image_url || undefined,
    })),
    pricing: {
      currentPrice: landing.current_price ? parseFloat(landing.current_price) : null,
      originalPrice: landing.original_price ? parseFloat(landing.original_price) : null,
      currency: landing.currency || 'EGP',
      discountPercentage: landing.discount_percentage || null,
      includedItems: bilingualList(
        (landing.included_items && landing.included_items.en) || [],
        (landing.included_items && landing.included_items.ar) || [],
      ),
    },
    faq: (apiData.faqs || []).map((f) => ({
      id: String(f.id),
      question: bilingual(f.question_en, f.question_ar),
      answer: bilingual(f.answer_en, f.answer_ar),
    })),
    seoTitle: bilingual(landing.seo_title_en, landing.seo_title_ar),
    seoDescription: bilingual(landing.seo_meta_description_en, landing.seo_meta_description_ar),
    showPricing: landing.show_pricing !== false,
    seoNoindex: landing.seo_noindex === true,
    canonicalSlug: landing.canonical_slug || '',
    // Registration form settings (passed through for CourseRegistrationForm)
    showRegistrationForm: landing.show_registration_form !== false,
    registrationFormTitle: bilingual(landing.registration_form_title_en, landing.registration_form_title_ar),
    registrationFormDescription: bilingual(landing.registration_form_description_en, landing.registration_form_description_ar),
    registrationFormButton: bilingual(landing.registration_form_button_en, landing.registration_form_button_ar),
    registrationSuccessMessage: bilingual(landing.registration_success_message_en, landing.registration_success_message_ar),
    registrationClosedMessage: bilingual(landing.registration_closed_message_en, landing.registration_closed_message_ar),
    fallbackGoogleFormUrl: landing.fallback_google_form_url || '',
  };

  // Registration info from the program
  course.registrationOpen = apiData.registration_open;
  course.registrationUrl = apiData.registration_url;
  course.registrationAvailable = apiData.registration_available;

  return { course, landing: transformedLanding };
}
