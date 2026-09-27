"""
Approved content for Sidrah Starter Courses and the Summer Training program.

This data is the authoritative source for the seed_starter_courses command.
All content is CMS-editable after seeding — this file only provides the
initial approved content.

Product model (Starter Courses):
- Price: 499 EGP for the entire course (not per session).
- Duration: 6 weeks / 12 live sessions / 2 sessions per week.
- Level: Beginner / From Zero.
- Scope: foundations only — no Professional-track topics
  (no advanced state management, production architecture, deep framework
  specialization, advanced auth/DB/DevOps, or enterprise integration).

Product model (Summer Training):
- A real summer intake program (branch='summer'), not a fake catalog entry.
- Content is intentionally general (tracks are announced per cohort) so the
  page is honest while still providing a real registration path.

Content policy: no invented partnerships/accreditation/employment claims, no
job or salary guarantees. Arabic tone: professional, clear, modern.
"""

SHARED_TRAINING_EXPERIENCE_EN = (
    "Training is delivered through live interactive sessions online. "
    "You will learn alongside instructors in real time, ask questions, "
    "and work through practical exercises during each session."
)

SHARED_TRAINING_EXPERIENCE_AR = (
    "يُقدّم التدريب عبر جلسات تفاعلية مباشرة عبر الإنترنت. "
    "ستتعلّم مع المدربين في الوقت الفعلي، وتطرح أسئلتك، "
    "وتعمل على تمارين عملية خلال كل جلسة."
)

SHARED_MENTOR_INFO_EN = (
    "Sidrah Soft provides mentor support and follow-up throughout the program. "
    "Our mentors help answer your questions, review your work, and guide you "
    "through practical assignments."
)

SHARED_MENTOR_INFO_AR = (
    "توفر Sidrah Soft إشرافًا ومتابعة طوال فترة البرنامج. "
    "يساعدك المرشدون في الإجابة على أسئلتك ومراجعة أعمالك وتوجيهك "
    "في المهام العملية."
)

CERTIFICATE_EN = (
    "Completion certificate subject to attendance and program "
    "completion requirements"
)
CERTIFICATE_AR = "شهادة إتمام وفق متطلبات الحضور وإكمال البرنامج"

# Shared quick-facts block for every Starter course.
def _starter_quick_facts():
    return {
        'level': {'en': 'Beginner / From Zero', 'ar': 'مبتدئ / من الصفر'},
        'trainingMode': {'en': 'Live Online Training', 'ar': 'تدريب مباشر عبر الإنترنت'},
        'language': {'en': 'English & Arabic', 'ar': 'الإنجليزية والعربية'},
        'duration': {'en': '6 Weeks', 'ar': '6 أسابيع'},
        'sessions': {'en': '12 Live Sessions', 'ar': '12 جلسة مباشرة'},
        'frequency': {'en': '2 Sessions per Week', 'ar': 'جلستان أسبوعيًا'},
        'certificate': {'en': CERTIFICATE_EN, 'ar': CERTIFICATE_AR},
        'support': {'en': 'Mentor Support', 'ar': 'إشراف ومتابعة'},
    }


def _starter_faq_beginners():
    return {
        'question_en': 'Is this course suitable for complete beginners?',
        'question_ar': 'هل هذا الكورس مناسب للمبتدئين تمامًا؟',
        'answer_en': 'Yes. Starter courses are designed for people starting from zero. No prior experience is required — we begin with the fundamentals and build up step by step.',
        'answer_ar': 'نعم. كورسات Starter مصممة لمن يبدأ من الصفر. لا تحتاج إلى خبرة سابقة — نبدأ من الأساسيات ونبني المعرفة خطوة بخطوة.',
        'display_order': 0,
    }


def _starter_faq_sessions():
    return {
        'question_en': 'How is the course delivered?',
        'question_ar': 'كيف يُقدَّم الكورس؟',
        'answer_en': 'The course runs for 6 weeks with 12 live online sessions (2 sessions per week). Each session combines explanation, hands-on practice, and exercises.',
        'answer_ar': 'يمتد الكورس 6 أسابيع بواقع 12 جلسة مباشرة عبر الإنترنت (جلستان أسبوعيًا). تجمع كل جلسة بين الشرح والتطبيق العملي والتمارين.',
        'display_order': 1,
    }


def _starter_faq_certificate():
    return {
        'question_en': 'Do I get a certificate?',
        'question_ar': 'هل أحصل على شهادة؟',
        'answer_en': 'You receive a Sidrah Soft completion certificate subject to attendance and program completion requirements.',
        'answer_ar': 'تحصل على شهادة إتمام من Sidrah Soft وفق متطلبات الحضور وإكمال البرنامج.',
        'display_order': 2,
    }


def _starter_faq_price():
    return {
        'question_en': 'What is the course price?',
        'question_ar': 'ما سعر الكورس؟',
        'answer_en': 'The full course costs 499 EGP — a one-time fee that covers all 12 sessions, materials, and the final project.',
        'answer_ar': 'سعر الكورس كاملًا 499 جنيهًا مصريًا — رسوم لمرة واحدة تغطي الجلسات الـ12 والمواد والمشروع النهائي.',
        'display_order': 3,
    }


def _starter_included_items():
    return {
        'en': [
            '12 live interactive sessions',
            'Hands-on exercises in every session',
            'A practical final project',
            'Mentor support',
            'Completion certificate (per requirements)',
        ],
        'ar': [
            '12 جلسة مباشرة تفاعلية',
            'تمارين عملية في كل جلسة',
            'مشروع نهائي عملي',
            'إشراف ومتابعة',
            'شهادة إتمام (وفق المتطلبات)',
        ],
    }


STARTER_PROGRAM_CONTENT = [
    # ===================================================================
    # 1. PYTHON PROGRAMMING (Starter)
    # ===================================================================
    {
        'slug': 'starter-python-programming',
        'title_en': 'Python Programming',
        'title_ar': 'برمجة بايثون',
        'short_description_en': 'Learn programming from zero with Python. Variables, data types, conditions, loops, data structures, functions, and files in a 6-week starter course.',
        'short_description_ar': 'تعلّم البرمجة من الصفر بلغة بايثون. المتغيرات وأنواع البيانات والشروط والحلقات وهياكل البيانات والدوال والملفات في كورس تأسيسي لمدة 6 أسابيع.',
        'overview_en': (
            "Python Programming is a Sidrah Starter course that teaches you to program from absolute zero. "
            "Over 6 weeks and 12 live sessions, you will learn the core building blocks of programming "
            "using Python — the world's most beginner-friendly language.\n\n"
            "You will work through variables, data types, operators, input/output, conditions, loops, "
            "core data structures (lists, tuples, dictionaries, sets), functions, file handling, "
            "basic error handling, and debugging — with hands-on practice in every session.\n\n"
            "This is a foundations course. It does not cover advanced libraries or professional "
            "specialization — it gives you a solid base you can build on."
        ),
        'overview_ar': (
            "برمجة بايثون هو كورس من كورسات Sidrah Starter يعلمك البرمجة من الصفر تمامًا. "
            "على مدار 6 أسابيع و12 جلسة مباشرة، ستتعلم اللبنات الأساسية للبرمجة "
            "باستخدام بايثون — أسهل لغات العالم للمبتدئين.\n\n"
            "ستتدرّب على المتغيرات وأنواع البيانات والعوامل والإدخال والإخراج والشروط والحلقات "
            "وهياكل البيانات الأساسية (القوائم والصفوف والقواميس والمجموعات) والدوال "
            "ومعالجة الملفات وأساسيات معالجة الأخطاء وتصحيحها — مع تطبيق عملي في كل جلسة.\n\n"
            "هذا كورس تأسيسي. لا يغطي مكتبات متقدمة أو تخصصًا احترافيًا — "
            "بل يمنحك قاعدة متينة يمكنك البناء عليها."
        ),
        'branch': 'starter',
        'duration_en': '6 Weeks',
        'duration_ar': '6 أسابيع',
        'format_en': '12 Live Sessions',
        'format_ar': '12 جلسة مباشرة',
        'status': 'active',
        'display_order': 10,
        'registration_open': True,
        'maximum_capacity': None,
        'registration_url': 'https://forms.gle/tjHRqBZrkNYtrWNL7',
        'image_file': 'basic-python.webp',
        'landing': {
            'headline_en': 'Start programming from zero — 6 weeks, 12 live sessions, one practical project',
            'headline_ar': 'ابدأ البرمجة من الصفر — 6 أسابيع، 12 جلسة مباشرة، ومشروع عملي',
            'quick_facts': _starter_quick_facts(),
            'current_price': 499,
            'currency': 'EGP',
            'show_pricing': True,
            'target_audience': {
                'en': [
                    'Complete beginners with no programming experience',
                    'Students who want a solid programming foundation',
                    'Anyone curious about coding who wants an affordable start',
                ],
                'ar': [
                    'المبتدئون تمامًا بدون خبرة في البرمجة',
                    'الطلاب الذين يريدون أساسًا برمجيًا متينًا',
                    'أي شخص مهتم بالبرمجة ويريد بداية بسعر بسيط',
                ],
            },
            'prerequisites': {
                'en': [
                    'No previous programming experience required',
                    'Basic computer literacy',
                    'A computer with internet access',
                ],
                'ar': [
                    'لا تشترط خبرة سابقة في البرمجة',
                    'معرفة أساسية باستخدام الحاسوب',
                    'جهاز كمبيوتر مع اتصال بالإنترنت',
                ],
            },
            'tools': {
                'en': ['Python 3', 'Code Editor'],
                'ar': ['Python 3', 'محرر أكواد'],
            },
            'practical_training_en': 'Hands-on coding exercises in every session plus a simple final project that brings everything together.',
            'practical_training_ar': 'تمارين برمجية عملية في كل جلسة بالإضافة إلى مشروع نهائي بسيط يجمع كل ما تعلمته.',
            'final_project_en': 'A small console application such as a Task Manager, Expense Tracker, or Student Management System that applies everything you learned.',
            'final_project_ar': 'تطبيق بسيط عبر سطر الأوامر مثل مدير مهام أو متتبع مصروفات أو نظام إدارة طلاب يطبق كل ما تعلمته.',
            'training_experience_en': SHARED_TRAINING_EXPERIENCE_EN,
            'training_experience_ar': SHARED_TRAINING_EXPERIENCE_AR,
            'mentor_info_en': SHARED_MENTOR_INFO_EN,
            'mentor_info_ar': SHARED_MENTOR_INFO_AR,
            'installments_available': False,
            'included_items': _starter_included_items(),
            'seo_title_en': 'Python Programming for Beginners | Sidrah Starter Courses',
            'seo_title_ar': 'كورس برمجة بايثون للمبتدئين | كورسات Sidrah Starter',
            'seo_meta_description_en': 'Learn Python programming from zero in 6 weeks and 12 live sessions. Beginner-friendly starter course with a practical final project — 499 EGP for the full course.',
            'seo_meta_description_ar': 'تعلّم برمجة بايثون من الصفر في 6 أسابيع و12 جلسة مباشرة. كورس تأسيسي للمبتدئين مع مشروع نهائي عملي — 499 جنيهًا للكورس كاملًا.',
            'seo_noindex': False,
            'show_registration_form': True,
        },
        'modules': [
            {
                'title_en': 'Week 1 — Getting Started with Python',
                'title_ar': 'الأسبوع 1 — البدء مع بايثون',
                'display_order': 0,
                'topics': [
                    {'title_en': 'Introduction to programming & Python setup', 'title_ar': 'مقدمة في البرمجة وإعداد بيئة بايثون', 'display_order': 0},
                    {'title_en': 'Variables & data types', 'title_ar': 'المتغيرات وأنواع البيانات', 'display_order': 1},
                    {'title_en': 'Operators', 'title_ar': 'العوامل', 'display_order': 2},
                    {'title_en': 'Input & output', 'title_ar': 'الإدخال والإخراج', 'display_order': 3},
                ],
            },
            {
                'title_en': 'Week 2 — Conditions & Loops',
                'title_ar': 'الأسبوع 2 — الشروط والحلقات',
                'display_order': 1,
                'topics': [
                    {'title_en': 'If / else conditions', 'title_ar': 'الشروط if / else', 'display_order': 0},
                    {'title_en': 'Comparison & logic', 'title_ar': 'المقارنات والمنطق', 'display_order': 1},
                    {'title_en': 'While loops', 'title_ar': 'حلقات while', 'display_order': 2},
                    {'title_en': 'For loops & practice', 'title_ar': 'حلقات for وتمارين', 'display_order': 3},
                ],
            },
            {
                'title_en': 'Week 3 — Core Data Structures (Lists & Tuples)',
                'title_ar': 'الأسبوع 3 — هياكل البيانات (القوائم والصفوف)',
                'display_order': 2,
                'topics': [
                    {'title_en': 'Lists & list operations', 'title_ar': 'القوائم وعملياتها', 'display_order': 0},
                    {'title_en': 'Tuples', 'title_ar': 'الصفوف (Tuples)', 'display_order': 1},
                    {'title_en': 'Looping over collections', 'title_ar': 'المرور على المجموعات', 'display_order': 2},
                    {'title_en': 'Practice exercises', 'title_ar': 'تمارين تطبيقية', 'display_order': 3},
                ],
            },
            {
                'title_en': 'Week 4 — Dictionaries, Sets & Functions',
                'title_ar': 'الأسبوع 4 — القواميس والمجموعات والدوال',
                'display_order': 3,
                'topics': [
                    {'title_en': 'Dictionaries', 'title_ar': 'القواميس', 'display_order': 0},
                    {'title_en': 'Sets', 'title_ar': 'المجموعات', 'display_order': 1},
                    {'title_en': 'Defining & calling functions', 'title_ar': 'تعريف الدوال واستدعاؤها', 'display_order': 2},
                    {'title_en': 'Function arguments & return', 'title_ar': 'معاملات الدوال والقيمة المرجعة', 'display_order': 3},
                ],
            },
            {
                'title_en': 'Week 5 — Files, Errors & Debugging',
                'title_ar': 'الأسبوع 5 — الملفات والأخطاء والتصحيح',
                'display_order': 4,
                'topics': [
                    {'title_en': 'Reading & writing files', 'title_ar': 'قراءة الملفات وكتابتها', 'display_order': 0},
                    {'title_en': 'Basic error handling', 'title_ar': 'أساسيات معالجة الأخطاء', 'display_order': 1},
                    {'title_en': 'Debugging techniques', 'title_ar': 'تقنيات تصحيح الأخطاء', 'display_order': 2},
                    {'title_en': 'Practice & mini challenges', 'title_ar': 'تمارين وتحديات صغيرة', 'display_order': 3},
                ],
            },
            {
                'title_en': 'Week 6 — Review & Final Project',
                'title_ar': 'الأسبوع 6 — المراجعة والمشروع النهائي',
                'display_order': 5,
                'topics': [
                    {'title_en': 'Full-course review', 'title_ar': 'مراجعة شاملة للكورس', 'display_order': 0},
                    {'title_en': 'Final project build', 'title_ar': 'بناء المشروع النهائي', 'display_order': 1},
                    {'title_en': 'Project presentation & feedback', 'title_ar': 'عرض المشروع والتقييم', 'display_order': 2},
                ],
            },
        ],
        'faqs': [
            _starter_faq_beginners(),
            _starter_faq_sessions(),
            _starter_faq_certificate(),
            _starter_faq_price(),
        ],
    },

    # ===================================================================
    # 2. FRONTEND DEVELOPMENT (Starter)
    # ===================================================================
    {
        'slug': 'starter-frontend-development',
        'title_en': 'Frontend Development',
        'title_ar': 'تطوير الواجهات الأمامية',
        'short_description_en': 'Build your first websites from zero. HTML, CSS, responsive layouts, and JavaScript fundamentals in a 6-week starter course.',
        'short_description_ar': 'ابنِ أولى مواقعك من الصفر. HTML و CSS والتصميم المتجاوب وأساسيات JavaScript في كورس تأسيسي لمدة 6 أسابيع.',
        'overview_en': (
            "Frontend Development is a Sidrah Starter course that teaches you to build real web pages "
            "from scratch. Over 6 weeks and 12 live sessions, you will learn how the web works and "
            "how to build responsive, interactive pages.\n\n"
            "You will work through web fundamentals, HTML and semantic structure, forms, CSS and the "
            "box model, Flexbox, responsive layouts, and JavaScript fundamentals — variables, types, "
            "conditions, loops, functions, the DOM, events, and form interaction.\n\n"
            "This is a foundations course. It does not cover React or advanced professional frameworks "
            "— it gives you the core skills to build real pages and a base to grow from."
        ),
        'overview_ar': (
            "تطوير الواجهات الأمامية هو كورس من كورسات Sidrah Starter يعلمك بناء صفحات ويب حقيقية "
            "من الصفر. على مدار 6 أسابيع و12 جلسة مباشرة، ستتعلم كيف يعمل الويب "
            "وكيف تبني صفحات متجاوبة وتفاعلية.\n\n"
            "ستتدرّب على أساسيات الويب و HTML والبنية الدلالية والنماذج و CSS ونموذج الصندوق "
            "و Flexbox والتصميم المتجاوب وأساسيات JavaScript — المتغيرات والأنواع "
            "والشروط والحلقات والدوال و DOM والأحداث والتفاعل مع النماذج.\n\n"
            "هذا كورس تأسيسي. لا يغطي React أو أطر العمل الاحترافية المتقدمة — "
            "بل يمنحك المهارات الأساسية لبناء صفحات حقيقية وقاعدة تنطلق منها."
        ),
        'branch': 'starter',
        'duration_en': '6 Weeks',
        'duration_ar': '6 أسابيع',
        'format_en': '12 Live Sessions',
        'format_ar': '12 جلسة مباشرة',
        'status': 'active',
        'display_order': 20,
        'registration_open': True,
        'maximum_capacity': None,
        'registration_url': 'https://forms.gle/tjHRqBZrkNYtrWNL7',
        'image_file': 'frontend-development.webp',
        'landing': {
            'headline_en': 'Build your first website from zero — 6 weeks, 12 live sessions, real page',
            'headline_ar': 'ابنِ أول موقع لك من الصفر — 6 أسابيع، 12 جلسة مباشرة، وصفحة حقيقية',
            'quick_facts': _starter_quick_facts(),
            'current_price': 499,
            'currency': 'EGP',
            'show_pricing': True,
            'target_audience': {
                'en': [
                    'Complete beginners with no web development experience',
                    'Students who want to build their first real websites',
                    'Anyone who wants an affordable entry into web development',
                ],
                'ar': [
                    'المبتدئون تمامًا بدون خبرة في تطوير الويب',
                    'الطلاب الذين يريدون بناء أولى مواقعهم الحقيقية',
                    'أي شخص يريد دخول تطوير الويب بسعر بسيط',
                ],
            },
            'prerequisites': {
                'en': [
                    'No previous experience required',
                    'Basic computer literacy',
                    'A computer with internet access',
                ],
                'ar': [
                    'لا تشترط خبرة سابقة',
                    'معرفة أساسية باستخدام الحاسوب',
                    'جهاز كمبيوتر مع اتصال بالإنترنت',
                ],
            },
            'tools': {
                'en': ['HTML', 'CSS', 'JavaScript', 'Code Editor'],
                'ar': ['HTML', 'CSS', 'JavaScript', 'محرر أكواد'],
            },
            'practical_training_en': 'Hands-on page building in every session plus a responsive final project you build yourself.',
            'practical_training_ar': 'بناء صفحات عملي في كل جلسة بالإضافة إلى مشروع نهائي متجاوب تبنيه بنفسك.',
            'final_project_en': 'A responsive interactive website or business landing page built with HTML, CSS, and JavaScript.',
            'final_project_ar': 'موقع تفاعلي متجاوب أو صفحة هبوط لنشاط تجاري مبنية بـ HTML و CSS و JavaScript.',
            'training_experience_en': SHARED_TRAINING_EXPERIENCE_EN,
            'training_experience_ar': SHARED_TRAINING_EXPERIENCE_AR,
            'mentor_info_en': SHARED_MENTOR_INFO_EN,
            'mentor_info_ar': SHARED_MENTOR_INFO_AR,
            'installments_available': False,
            'included_items': _starter_included_items(),
            'seo_title_en': 'Frontend Development for Beginners | Sidrah Starter Courses',
            'seo_title_ar': 'كورس تطوير الواجهات الأمامية للمبتدئين | كورسات Sidrah Starter',
            'seo_meta_description_en': 'Learn frontend development from zero in 6 weeks and 12 live sessions. HTML, CSS, responsive design, and JavaScript — 499 EGP for the full course.',
            'seo_meta_description_ar': 'تعلّم تطوير الواجهات الأمامية من الصفر في 6 أسابيع و12 جلسة مباشرة. HTML و CSS والتصميم المتجاوب و JavaScript — 499 جنيهًا للكورس كاملًا.',
            'seo_noindex': False,
            'show_registration_form': True,
        },
        'modules': [
            {
                'title_en': 'Week 1 — Web Fundamentals & HTML',
                'title_ar': 'الأسبوع 1 — أساسيات الويب و HTML',
                'display_order': 0,
                'topics': [
                    {'title_en': 'How the web works', 'title_ar': 'كيف يعمل الويب', 'display_order': 0},
                    {'title_en': 'HTML elements & semantic structure', 'title_ar': 'عناصر HTML والبنية الدلالية', 'display_order': 1},
                    {'title_en': 'Text, links & media', 'title_ar': 'النصوص والروابط والوسائط', 'display_order': 2},
                    {'title_en': 'HTML forms', 'title_ar': 'نماذج HTML', 'display_order': 3},
                ],
            },
            {
                'title_en': 'Week 2 — CSS Basics & the Box Model',
                'title_ar': 'الأسبوع 2 — أساسيات CSS ونموذج الصندوق',
                'display_order': 1,
                'topics': [
                    {'title_en': 'CSS selectors & properties', 'title_ar': 'محددات CSS وخصائصها', 'display_order': 0},
                    {'title_en': 'Colors, fonts & text styling', 'title_ar': 'الألوان والخطوط وتنسيق النصوص', 'display_order': 1},
                    {'title_en': 'The box model', 'title_ar': 'نموذج الصندوق', 'display_order': 2},
                    {'title_en': 'Spacing, borders & practice', 'title_ar': 'المسافات والحدود وتمارين', 'display_order': 3},
                ],
            },
            {
                'title_en': 'Week 3 — Flexbox & Responsive Layouts',
                'title_ar': 'الأسبوع 3 — Flexbox والتصميم المتجاوب',
                'display_order': 2,
                'topics': [
                    {'title_en': 'Flexbox fundamentals', 'title_ar': 'أساسيات Flexbox', 'display_order': 0},
                    {'title_en': 'Building layouts with Flexbox', 'title_ar': 'بناء التخطيطات بـ Flexbox', 'display_order': 1},
                    {'title_en': 'Responsive design & media queries', 'title_ar': 'التصميم المتجاوب واستعلامات الوسائط', 'display_order': 2},
                    {'title_en': 'Practice: responsive page', 'title_ar': 'تطبيق: صفحة متجاوبة', 'display_order': 3},
                ],
            },
            {
                'title_en': 'Week 4 — JavaScript Fundamentals',
                'title_ar': 'الأسبوع 4 — أساسيات JavaScript',
                'display_order': 3,
                'topics': [
                    {'title_en': 'Variables & types', 'title_ar': 'المتغيرات والأنواع', 'display_order': 0},
                    {'title_en': 'Conditions & loops', 'title_ar': 'الشروط والحلقات', 'display_order': 1},
                    {'title_en': 'Functions', 'title_ar': 'الدوال', 'display_order': 2},
                    {'title_en': 'Practice exercises', 'title_ar': 'تمارين تطبيقية', 'display_order': 3},
                ],
            },
            {
                'title_en': 'Week 5 — DOM, Events & Form Interaction',
                'title_ar': 'الأسبوع 5 — DOM والأحداث والتفاعل مع النماذج',
                'display_order': 4,
                'topics': [
                    {'title_en': 'Selecting & changing page elements (DOM)', 'title_ar': 'تحديد عناصر الصفحة وتعديلها (DOM)', 'display_order': 0},
                    {'title_en': 'Handling events', 'title_ar': 'التعامل مع الأحداث', 'display_order': 1},
                    {'title_en': 'Form interaction & validation', 'title_ar': 'التفاعل مع النماذج والتحقق منها', 'display_order': 2},
                    {'title_en': 'Practice: interactive components', 'title_ar': 'تطبيق: مكونات تفاعلية', 'display_order': 3},
                ],
            },
            {
                'title_en': 'Week 6 — Final Project',
                'title_ar': 'الأسبوع 6 — المشروع النهائي',
                'display_order': 5,
                'topics': [
                    {'title_en': 'Project planning & structure', 'title_ar': 'تخطيط المشروع وبنيته', 'display_order': 0},
                    {'title_en': 'Final project build', 'title_ar': 'بناء المشروع النهائي', 'display_order': 1},
                    {'title_en': 'Project presentation & feedback', 'title_ar': 'عرض المشروع والتقييم', 'display_order': 2},
                ],
            },
        ],
        'faqs': [
            _starter_faq_beginners(),
            _starter_faq_sessions(),
            _starter_faq_certificate(),
            _starter_faq_price(),
        ],
    },

    # ===================================================================
    # 3. DATA ANALYSIS (Starter) — Excel + SQL + Power BI only
    # ===================================================================
    {
        'slug': 'starter-data-analysis',
        'title_en': 'Data Analysis',
        'title_ar': 'تحليل البيانات',
        'short_description_en': 'Learn data analysis from zero with Excel, SQL, and Power BI. A focused 6-week starter course with a real dashboard project.',
        'short_description_ar': 'تعلّم تحليل البيانات من الصفر باستخدام Excel و SQL و Power BI. كورس تأسيسي مركّز لمدة 6 أسابيع مع مشروع لوحة بيانات حقيقي.',
        'overview_en': (
            "Data Analysis is a Sidrah Starter course that teaches you to work with data from zero. "
            "Over 6 weeks and 12 live sessions, you will learn the three core tools every analyst "
            "starts with: Excel, SQL, and Power BI.\n\n"
            "You will organize and clean data in Excel, write formulas and pivot tables, query "
            "databases with SQL, and build interactive dashboards in Power BI — with hands-on "
            "practice in every session.\n\n"
            "This is a focused foundations course built around Excel, SQL, and Power BI only — "
            "designed to be learnable in 6 weeks."
        ),
        'overview_ar': (
            "تحليل البيانات هو كورس من كورسات Sidrah Starter يعلمك التعامل مع البيانات من الصفر. "
            "على مدار 6 أسابيع و12 جلسة مباشرة، ستتعلم الأدوات الثلاث الأساسية التي يبدأ بها "
            "كل محلل بيانات: Excel و SQL و Power BI.\n\n"
            "ستنظّم البيانات وتنظّفها في Excel، وتكتب الصيغ والجداول المحورية، وتستعلم عن "
            "قواعد البيانات بـ SQL، وتبني لوحات معلومات تفاعلية في Power BI — مع تطبيق "
            "عملي في كل جلسة.\n\n"
            "هذا كورس تأسيسي مركّز مبني حول Excel و SQL و Power BI فقط — "
            "مصمم ليكون قابلًا للتعلم خلال 6 أسابيع."
        ),
        'branch': 'starter',
        'duration_en': '6 Weeks',
        'duration_ar': '6 أسابيع',
        'format_en': '12 Live Sessions',
        'format_ar': '12 جلسة مباشرة',
        'status': 'active',
        'display_order': 30,
        'registration_open': True,
        'maximum_capacity': None,
        'registration_url': 'https://forms.gle/tjHRqBZrkNYtrWNL7',
        'image_file': 'data-analysis.webp',
        'landing': {
            'headline_en': 'Analyze data from zero — Excel, SQL & Power BI in 6 weeks',
            'headline_ar': 'حلّل البيانات من الصفر — Excel و SQL و Power BI في 6 أسابيع',
            'quick_facts': _starter_quick_facts(),
            'current_price': 499,
            'currency': 'EGP',
            'show_pricing': True,
            'target_audience': {
                'en': [
                    'Complete beginners with no data experience',
                    'Students and professionals who want practical data skills',
                    'Anyone who wants an affordable entry into data analysis',
                ],
                'ar': [
                    'المبتدئون تمامًا بدون خبرة في البيانات',
                    'الطلاب والموظفون الذين يريدون مهارات بيانات عملية',
                    'أي شخص يريد دخول تحليل البيانات بسعر بسيط',
                ],
            },
            'prerequisites': {
                'en': [
                    'No previous experience required',
                    'Basic computer literacy',
                    'A computer with internet access',
                ],
                'ar': [
                    'لا تشترط خبرة سابقة',
                    'معرفة أساسية باستخدام الحاسوب',
                    'جهاز كمبيوتر مع اتصال بالإنترنت',
                ],
            },
            'tools': {
                'en': ['Excel', 'SQL', 'Power BI'],
                'ar': ['Excel', 'SQL', 'Power BI'],
            },
            'practical_training_en': 'Hands-on data exercises in every session plus an end-to-end final project with an interactive dashboard.',
            'practical_training_ar': 'تمارين بيانات عملية في كل جلسة بالإضافة إلى مشروع نهائي متكامل مع لوحة معلومات تفاعلية.',
            'final_project_en': 'An end-to-end data analysis project: clean and analyze a real dataset, then present the results in an interactive Power BI dashboard.',
            'final_project_ar': 'مشروع تحليل بيانات متكامل: تنظيف مجموعة بيانات حقيقية وتحليلها، ثم عرض النتائج في لوحة معلومات Power BI تفاعلية.',
            'training_experience_en': SHARED_TRAINING_EXPERIENCE_EN,
            'training_experience_ar': SHARED_TRAINING_EXPERIENCE_AR,
            'mentor_info_en': SHARED_MENTOR_INFO_EN,
            'mentor_info_ar': SHARED_MENTOR_INFO_AR,
            'installments_available': False,
            'included_items': _starter_included_items(),
            'seo_title_en': 'Data Analysis for Beginners (Excel, SQL, Power BI) | Sidrah Starter',
            'seo_title_ar': 'كورس تحليل البيانات للمبتدئين (Excel و SQL و Power BI) | Sidrah Starter',
            'seo_meta_description_en': 'Learn data analysis from zero with Excel, SQL, and Power BI in 6 weeks and 12 live sessions. Build an interactive dashboard — 499 EGP for the full course.',
            'seo_meta_description_ar': 'تعلّم تحليل البيانات من الصفر بـ Excel و SQL و Power BI في 6 أسابيع و12 جلسة مباشرة. ابنِ لوحة معلومات تفاعلية — 499 جنيهًا للكورس كاملًا.',
            'seo_noindex': False,
            'show_registration_form': True,
        },
        'modules': [
            {
                'title_en': 'Week 1 — Excel: Organize & Clean Data',
                'title_ar': 'الأسبوع 1 — Excel: تنظيم البيانات وتنظيفها',
                'display_order': 0,
                'topics': [
                    {'title_en': 'Data organization in Excel', 'title_ar': 'تنظيم البيانات في Excel', 'display_order': 0},
                    {'title_en': 'Cleaning basics', 'title_ar': 'أساسيات تنظيف البيانات', 'display_order': 1},
                    {'title_en': 'Formulas & functions', 'title_ar': 'الصيغ والدوال', 'display_order': 2},
                    {'title_en': 'Practice exercises', 'title_ar': 'تمارين تطبيقية', 'display_order': 3},
                ],
            },
            {
                'title_en': 'Week 2 — Excel: Analyze Data',
                'title_ar': 'الأسبوع 2 — Excel: تحليل البيانات',
                'display_order': 1,
                'topics': [
                    {'title_en': 'Sorting & filtering', 'title_ar': 'الفرز والتصفية', 'display_order': 0},
                    {'title_en': 'Basic analysis techniques', 'title_ar': 'تقنيات التحليل الأساسية', 'display_order': 1},
                    {'title_en': 'Pivot tables', 'title_ar': 'الجداول المحورية', 'display_order': 2},
                    {'title_en': 'Practice: analyze a dataset', 'title_ar': 'تطبيق: تحليل مجموعة بيانات', 'display_order': 3},
                ],
            },
            {
                'title_en': 'Week 3 — SQL: Query a Database',
                'title_ar': 'الأسبوع 3 — SQL: الاستعلام عن قواعد البيانات',
                'display_order': 2,
                'topics': [
                    {'title_en': 'Database & table concepts', 'title_ar': 'مفاهيم قواعد البيانات والجداول', 'display_order': 0},
                    {'title_en': 'SELECT statements', 'title_ar': 'جمل SELECT', 'display_order': 1},
                    {'title_en': 'WHERE filtering', 'title_ar': 'التصفية بـ WHERE', 'display_order': 2},
                    {'title_en': 'ORDER BY sorting', 'title_ar': 'الترتيب بـ ORDER BY', 'display_order': 3},
                ],
            },
            {
                'title_en': 'Week 4 — SQL: Aggregate & Join',
                'title_ar': 'الأسبوع 4 — SQL: التجميع والربط',
                'display_order': 3,
                'topics': [
                    {'title_en': 'GROUP BY', 'title_ar': 'GROUP BY', 'display_order': 0},
                    {'title_en': 'Aggregate functions', 'title_ar': 'الدوال التجميعية', 'display_order': 1},
                    {'title_en': 'Basic JOIN concepts', 'title_ar': 'مفاهيم الربط الأساسية JOIN', 'display_order': 2},
                    {'title_en': 'Practice queries', 'title_ar': 'تمارين استعلام', 'display_order': 3},
                ],
            },
            {
                'title_en': 'Week 5 — Power BI: Model & Transform',
                'title_ar': 'الأسبوع 5 — Power BI: النمذجة والتحويل',
                'display_order': 4,
                'topics': [
                    {'title_en': 'Importing data', 'title_ar': 'استيراد البيانات', 'display_order': 0},
                    {'title_en': 'Basic transformation', 'title_ar': 'التحويل الأساسي للبيانات', 'display_order': 1},
                    {'title_en': 'Relationships & basic modeling', 'title_ar': 'العلاقات والنمذجة الأساسية', 'display_order': 2},
                    {'title_en': 'Practice', 'title_ar': 'تطبيق عملي', 'display_order': 3},
                ],
            },
            {
                'title_en': 'Week 6 — Power BI: Dashboards & Final Project',
                'title_ar': 'الأسبوع 6 — Power BI: لوحات المعلومات والمشروع النهائي',
                'display_order': 5,
                'topics': [
                    {'title_en': 'Building visualizations', 'title_ar': 'بناء الرسوم البيانية', 'display_order': 0},
                    {'title_en': 'Dashboard building & insights', 'title_ar': 'بناء لوحة المعلومات واستخراج الرؤى', 'display_order': 1},
                    {'title_en': 'Final project: end-to-end analysis + dashboard', 'title_ar': 'المشروع النهائي: تحليل متكامل + لوحة معلومات', 'display_order': 2},
                ],
            },
        ],
        'faqs': [
            _starter_faq_beginners(),
            _starter_faq_sessions(),
            _starter_faq_certificate(),
            _starter_faq_price(),
        ],
    },

    # ===================================================================
    # 4. FLUTTER DEVELOPMENT (Starter)
    # ===================================================================
    {
        'slug': 'starter-flutter-development',
        'title_en': 'Flutter Development',
        'title_ar': 'تطوير تطبيقات Flutter',
        'short_description_en': 'Build your first mobile app from zero. Dart basics, Flutter widgets, layouts, navigation, and a simple API intro in a 6-week starter course.',
        'short_description_ar': 'ابنِ أول تطبيق موبايل لك من الصفر. أساسيات Dart وعناصر Flutter والتخطيطات والتنقل ومقدمة عن الـ APIs في كورس تأسيسي لمدة 6 أسابيع.',
        'overview_en': (
            "Flutter Development is a Sidrah Starter course that teaches you to build mobile apps "
            "from zero. Over 6 weeks and 12 live sessions, you will learn Dart fundamentals and "
            "the core of Flutter.\n\n"
            "You will work through Dart variables, types, conditions, loops, functions, collections, "
            "and basic OOP — then Flutter project structure, widgets, stateless/stateful fundamentals, "
            "layouts, rows/columns/containers, lists, basic state, forms, navigation, simple local "
            "data, reusable widgets, and an introduction to APIs.\n\n"
            "This is a foundations course. It does not cover advanced Firebase, advanced state "
            "management, or production architecture — those belong to the Professional track."
        ),
        'overview_ar': (
            "تطوير تطبيقات Flutter هو كورس من كورسات Sidrah Starter يعلمك بناء تطبيقات الموبايل "
            "من الصفر. على مدار 6 أسابيع و12 جلسة مباشرة، ستتعلم أساسيات Dart وجوهر Flutter.\n\n"
            "ستتدرّب على متغيرات Dart وأنواعها والشروط والحلقات والدوال والمجموعات وأساسيات "
            "البرمجة الكائنية — ثم بنية مشروع Flutter والعناصر (Widgets) وأساسيات "
            "Stateless/Stateful والتخطيطات والصفوف والأعمدة والحاويات والقوائم والحالة الأساسية "
            "والنماذج والتنقل والبيانات المحلية البسيطة والعناصر القابلة لإعادة الاستخدام "
            "ومقدمة عن الـ APIs.\n\n"
            "هذا كورس تأسيسي. لا يغطي Firebase المتقدم أو إدارة الحالة المتقدمة أو "
            "البنية الإنتاجية — هذه تنتمي إلى المسار الاحترافي."
        ),
        'branch': 'starter',
        'duration_en': '6 Weeks',
        'duration_ar': '6 أسابيع',
        'format_en': '12 Live Sessions',
        'format_ar': '12 جلسة مباشرة',
        'status': 'active',
        'display_order': 40,
        'registration_open': True,
        'maximum_capacity': None,
        'registration_url': 'https://forms.gle/tjHRqBZrkNYtrWNL7',
        'image_file': 'flutter-development.webp',
        'landing': {
            'headline_en': 'Build your first mobile app from zero — 6 weeks, 12 live sessions',
            'headline_ar': 'ابنِ أول تطبيق موبايل لك من الصفر — 6 أسابيع، 12 جلسة مباشرة',
            'quick_facts': _starter_quick_facts(),
            'current_price': 499,
            'currency': 'EGP',
            'show_pricing': True,
            'target_audience': {
                'en': [
                    'Complete beginners with no mobile development experience',
                    'Students who want to build their first real app',
                    'Anyone who wants an affordable entry into app development',
                ],
                'ar': [
                    'المبتدئون تمامًا بدون خبرة في تطوير التطبيقات',
                    'الطلاب الذين يريدون بناء أول تطبيق حقيقي لهم',
                    'أي شخص يريد دخول تطوير التطبيقات بسعر بسيط',
                ],
            },
            'prerequisites': {
                'en': [
                    'No previous experience required',
                    'Basic computer literacy',
                    'A computer with internet access',
                ],
                'ar': [
                    'لا تشترط خبرة سابقة',
                    'معرفة أساسية باستخدام الحاسوب',
                    'جهاز كمبيوتر مع اتصال بالإنترنت',
                ],
            },
            'tools': {
                'en': ['Dart', 'Flutter', 'Code Editor'],
                'ar': ['Dart', 'Flutter', 'محرر أكواد'],
            },
            'practical_training_en': 'Hands-on app building in every session plus a simple final app project you build yourself.',
            'practical_training_ar': 'بناء تطبيقات عملي في كل جلسة بالإضافة إلى مشروع تطبيق نهائي بسيط تبنيه بنفسك.',
            'final_project_en': 'A simple working app such as a Task App, Notes App, or Simple Product App built with Flutter.',
            'final_project_ar': 'تطبيق بسيط يعمل مثل تطبيق مهام أو تطبيق ملاحظات أو تطبيق منتجات بسيط مبني بـ Flutter.',
            'training_experience_en': SHARED_TRAINING_EXPERIENCE_EN,
            'training_experience_ar': SHARED_TRAINING_EXPERIENCE_AR,
            'mentor_info_en': SHARED_MENTOR_INFO_EN,
            'mentor_info_ar': SHARED_MENTOR_INFO_AR,
            'installments_available': False,
            'included_items': _starter_included_items(),
            'seo_title_en': 'Flutter Development for Beginners | Sidrah Starter Courses',
            'seo_title_ar': 'كورس تطوير تطبيقات Flutter للمبتدئين | كورسات Sidrah Starter',
            'seo_meta_description_en': 'Learn Flutter from zero in 6 weeks and 12 live sessions. Dart basics, widgets, layouts, navigation, and an intro to APIs — 499 EGP for the full course.',
            'seo_meta_description_ar': 'تعلّم Flutter من الصفر في 6 أسابيع و12 جلسة مباشرة. أساسيات Dart والعناصر والتخطيطات والتنقل ومقدمة عن الـ APIs — 499 جنيهًا للكورس كاملًا.',
            'seo_noindex': False,
            'show_registration_form': True,
        },
        'modules': [
            {
                'title_en': 'Week 1 — Dart Foundations I',
                'title_ar': 'الأسبوع 1 — أساسيات Dart (1)',
                'display_order': 0,
                'topics': [
                    {'title_en': 'Variables & types', 'title_ar': 'المتغيرات والأنواع', 'display_order': 0},
                    {'title_en': 'Conditions', 'title_ar': 'الشروط', 'display_order': 1},
                    {'title_en': 'Loops', 'title_ar': 'الحلقات', 'display_order': 2},
                    {'title_en': 'Practice exercises', 'title_ar': 'تمارين تطبيقية', 'display_order': 3},
                ],
            },
            {
                'title_en': 'Week 2 — Dart Foundations II',
                'title_ar': 'الأسبوع 2 — أساسيات Dart (2)',
                'display_order': 1,
                'topics': [
                    {'title_en': 'Functions', 'title_ar': 'الدوال', 'display_order': 0},
                    {'title_en': 'Collections (lists, maps)', 'title_ar': 'المجموعات (القوائم والخرائط)', 'display_order': 1},
                    {'title_en': 'Basic OOP', 'title_ar': 'أساسيات البرمجة الكائنية', 'display_order': 2},
                    {'title_en': 'Practice exercises', 'title_ar': 'تمارين تطبيقية', 'display_order': 3},
                ],
            },
            {
                'title_en': 'Week 3 — Flutter Setup & Widgets',
                'title_ar': 'الأسبوع 3 — إعداد Flutter والعناصر',
                'display_order': 2,
                'topics': [
                    {'title_en': 'Flutter & project structure', 'title_ar': 'Flutter وبنية المشروع', 'display_order': 0},
                    {'title_en': 'Widgets fundamentals', 'title_ar': 'أساسيات العناصر (Widgets)', 'display_order': 1},
                    {'title_en': 'Stateless & Stateful basics', 'title_ar': 'أساسيات Stateless و Stateful', 'display_order': 2},
                    {'title_en': 'Practice: first screens', 'title_ar': 'تطبيق: أولى الشاشات', 'display_order': 3},
                ],
            },
            {
                'title_en': 'Week 4 — Layouts & Lists',
                'title_ar': 'الأسبوع 4 — التخطيطات والقوائم',
                'display_order': 3,
                'topics': [
                    {'title_en': 'Rows, Columns & Containers', 'title_ar': 'الصفوف والأعمدة والحاويات', 'display_order': 0},
                    {'title_en': 'Building UI layouts', 'title_ar': 'بناء تخطيطات الواجهة', 'display_order': 1},
                    {'title_en': 'Lists & scrolling', 'title_ar': 'القوائم والتمرير', 'display_order': 2},
                    {'title_en': 'Practice: app screen', 'title_ar': 'تطبيق: شاشة تطبيق', 'display_order': 3},
                ],
            },
            {
                'title_en': 'Week 5 — State, Forms & Navigation',
                'title_ar': 'الأسبوع 5 — الحالة والنماذج والتنقل',
                'display_order': 4,
                'topics': [
                    {'title_en': 'Basic state', 'title_ar': 'الحالة الأساسية', 'display_order': 0},
                    {'title_en': 'Forms & input', 'title_ar': 'النماذج والإدخال', 'display_order': 1},
                    {'title_en': 'Navigation between screens', 'title_ar': 'التنقل بين الشاشات', 'display_order': 2},
                    {'title_en': 'Simple local/app data', 'title_ar': 'البيانات المحلية البسيطة', 'display_order': 3},
                ],
            },
            {
                'title_en': 'Week 6 — Reusable Widgets, API Intro & Final Project',
                'title_ar': 'الأسبوع 6 — العناصر القابلة لإعادة الاستخدام ومقدمة الـ API والمشروع',
                'display_order': 5,
                'topics': [
                    {'title_en': 'Reusable widgets', 'title_ar': 'العناصر القابلة لإعادة الاستخدام', 'display_order': 0},
                    {'title_en': 'Introduction to APIs', 'title_ar': 'مقدمة عن الـ APIs', 'display_order': 1},
                    {'title_en': 'Final project build', 'title_ar': 'بناء المشروع النهائي', 'display_order': 2},
                ],
            },
        ],
        'faqs': [
            _starter_faq_beginners(),
            _starter_faq_sessions(),
            _starter_faq_certificate(),
            _starter_faq_price(),
        ],
    },

    # ===================================================================
    # 5. ICDL / DIGITAL SKILLS (Starter)
    # ===================================================================
    {
        'slug': 'starter-icdl-digital-skills',
        'title_en': 'ICDL / Digital Skills',
        'title_ar': 'ICDL / المهارات الرقمية',
        'short_description_en': 'Master essential computer and workplace digital skills. Windows, Word, Excel, PowerPoint, internet, email, and Google tools in a 6-week starter course.',
        'short_description_ar': 'أتقن مهارات الحاسوب والمهارات الرقمية الأساسية للعمل. Windows و Word و Excel و PowerPoint والإنترنت والبريد وأدوات Google في كورس تأسيسي لمدة 6 أسابيع.',
        'overview_en': (
            "ICDL / Digital Skills is a Sidrah Starter course that gives you the essential computer "
            "and digital workplace skills used every day. Over 6 weeks and 12 live sessions, you will "
            "learn by doing — not just by memorizing program names.\n\n"
            "You will work through computer fundamentals, Windows, file/folder management, Microsoft "
            "Word, Excel, and PowerPoint, internet fundamentals, email, basic online safety, and "
            "Google Drive, Docs, and Sheets with collaboration basics — all within a practical "
            "workplace digital workflow.\n\n"
            "The goal is to use these tools in a real workflow, finishing with a complete digital "
            "business package."
        ),
        'overview_ar': (
            "ICDL / المهارات الرقمية هو كورس من كورسات Sidrah Starter يمنحك مهارات الحاسوب "
            "والمهارات الرقمية الأساسية المستخدمة يوميًا في العمل. على مدار 6 أسابيع و12 جلسة "
            "مباشرة، ستتعلم بالتطبيق — لا بمجرد حفظ أسماء البرامج.\n\n"
            "ستتدرّب على أساسيات الحاسوب و Windows وإدارة الملفات والمجلدات و Microsoft Word "
            "و Excel و PowerPoint وأساسيات الإنترنت والبريد الإلكتروني والأمان الأساسي على "
            "الإنترنت و Google Drive و Docs و Sheets مع أساسيات التعاون — كل ذلك ضمن سير "
            "عمل رقمي عملي.\n\n"
            "الهدف هو استخدام هذه الأدوات في سير عمل حقيقي، والانتهاء بحزمة أعمال رقمية متكاملة."
        ),
        'branch': 'starter',
        'duration_en': '6 Weeks',
        'duration_ar': '6 أسابيع',
        'format_en': '12 Live Sessions',
        'format_ar': '12 جلسة مباشرة',
        'status': 'active',
        'display_order': 50,
        'registration_open': True,
        'maximum_capacity': None,
        'registration_url': 'https://forms.gle/tjHRqBZrkNYtrWNL7',
        'image_file': 'icdl.webp',
        'landing': {
            'headline_en': 'Master essential digital skills — 6 weeks, 12 live sessions, real workflow',
            'headline_ar': 'أتقن المهارات الرقمية الأساسية — 6 أسابيع، 12 جلسة مباشرة، وسير عمل حقيقي',
            'quick_facts': _starter_quick_facts(),
            'current_price': 499,
            'currency': 'EGP',
            'show_pricing': True,
            'target_audience': {
                'en': [
                    'Beginners who want essential computer skills',
                    'Job seekers who need workplace digital skills',
                    'Anyone who wants to use digital tools confidently',
                ],
                'ar': [
                    'المبتدئون الذين يريدون مهارات الحاسوب الأساسية',
                    'الباحثون عن عمل الذين يحتاجون المهارات الرقمية',
                    'أي شخص يريد استخدام الأدوات الرقمية بثقة',
                ],
            },
            'prerequisites': {
                'en': [
                    'No previous experience required',
                    'A computer with internet access',
                ],
                'ar': [
                    'لا تشترط خبرة سابقة',
                    'جهاز كمبيوتر مع اتصال بالإنترنت',
                ],
            },
            'tools': {
                'en': ['Windows', 'Word', 'Excel', 'PowerPoint', 'Google Workspace'],
                'ar': ['Windows', 'Word', 'Excel', 'PowerPoint', 'Google Workspace'],
            },
            'practical_training_en': 'Hands-on practice in every session plus a final digital business package you produce yourself.',
            'practical_training_ar': 'تطبيق عملي في كل جلسة بالإضافة إلى حزمة أعمال رقمية نهائية تنتجها بنفسك.',
            'final_project_en': 'A digital workplace/business package: a professional Word document, an Excel spreadsheet, a PowerPoint presentation, and organized digital files/folders.',
            'final_project_ar': 'حزمة أعمال/سير عمل رقمية: مستند Word احترافي وجدول Excel وعرض PowerPoint وملفات ومجلدات رقمية منظمة.',
            'training_experience_en': SHARED_TRAINING_EXPERIENCE_EN,
            'training_experience_ar': SHARED_TRAINING_EXPERIENCE_AR,
            'mentor_info_en': SHARED_MENTOR_INFO_EN,
            'mentor_info_ar': SHARED_MENTOR_INFO_AR,
            'installments_available': False,
            'included_items': _starter_included_items(),
            'seo_title_en': 'ICDL / Digital Skills Course | Sidrah Starter Courses',
            'seo_title_ar': 'كورس ICDL / المهارات الرقمية | كورسات Sidrah Starter',
            'seo_meta_description_en': 'Learn essential computer and digital workplace skills in 6 weeks and 12 live sessions. Word, Excel, PowerPoint, internet & Google tools — 499 EGP for the full course.',
            'seo_meta_description_ar': 'تعلّم مهارات الحاسوب والمهارات الرقمية الأساسية في 6 أسابيع و12 جلسة مباشرة. Word و Excel و PowerPoint والإنترنت وأدوات Google — 499 جنيهًا للكورس كاملًا.',
            'seo_noindex': False,
            'show_registration_form': True,
        },
        'modules': [
            {
                'title_en': 'Week 1 — Computer Fundamentals & Windows',
                'title_ar': 'الأسبوع 1 — أساسيات الحاسوب و Windows',
                'display_order': 0,
                'topics': [
                    {'title_en': 'Computer fundamentals', 'title_ar': 'أساسيات الحاسوب', 'display_order': 0},
                    {'title_en': 'Working with Windows', 'title_ar': 'العمل مع Windows', 'display_order': 1},
                    {'title_en': 'File & folder management', 'title_ar': 'إدارة الملفات والمجلدات', 'display_order': 2},
                    {'title_en': 'Practice', 'title_ar': 'تطبيق عملي', 'display_order': 3},
                ],
            },
            {
                'title_en': 'Week 2 — Microsoft Word',
                'title_ar': 'الأسبوع 2 — Microsoft Word',
                'display_order': 1,
                'topics': [
                    {'title_en': 'Creating & formatting documents', 'title_ar': 'إنشاء المستندات وتنسيقها', 'display_order': 0},
                    {'title_en': 'Styles, lists & tables', 'title_ar': 'الأنماط والقوائم والجداول', 'display_order': 1},
                    {'title_en': 'Page layout & printing', 'title_ar': 'تخطيط الصفحة والطباعة', 'display_order': 2},
                    {'title_en': 'Practice: professional document', 'title_ar': 'تطبيق: مستند احترافي', 'display_order': 3},
                ],
            },
            {
                'title_en': 'Week 3 — Microsoft Excel',
                'title_ar': 'الأسبوع 3 — Microsoft Excel',
                'display_order': 2,
                'topics': [
                    {'title_en': 'Spreadsheets & data entry', 'title_ar': 'جداول البيانات وإدخالها', 'display_order': 0},
                    {'title_en': 'Formulas & functions', 'title_ar': 'الصيغ والدوال', 'display_order': 1},
                    {'title_en': 'Sorting, filtering & charts', 'title_ar': 'الفرز والتصفية والرسوم البيانية', 'display_order': 2},
                    {'title_en': 'Practice: working spreadsheet', 'title_ar': 'تطبيق: جدول بيانات عملي', 'display_order': 3},
                ],
            },
            {
                'title_en': 'Week 4 — Microsoft PowerPoint',
                'title_ar': 'الأسبوع 4 — Microsoft PowerPoint',
                'display_order': 3,
                'topics': [
                    {'title_en': 'Building presentations', 'title_ar': 'بناء العروض التقديمية', 'display_order': 0},
                    {'title_en': 'Design, images & media', 'title_ar': 'التصميم والصور والوسائط', 'display_order': 1},
                    {'title_en': 'Transitions & presenting', 'title_ar': 'الانتقالات والعرض', 'display_order': 2},
                    {'title_en': 'Practice: presentation', 'title_ar': 'تطبيق: عرض تقديمي', 'display_order': 3},
                ],
            },
            {
                'title_en': 'Week 5 — Internet, Email & Online Safety',
                'title_ar': 'الأسبوع 5 — الإنترنت والبريد والأمان',
                'display_order': 4,
                'topics': [
                    {'title_en': 'Internet fundamentals', 'title_ar': 'أساسيات الإنترنت', 'display_order': 0},
                    {'title_en': 'Email essentials', 'title_ar': 'أساسيات البريد الإلكتروني', 'display_order': 1},
                    {'title_en': 'Basic online safety', 'title_ar': 'الأمان الأساسي على الإنترنت', 'display_order': 2},
                    {'title_en': 'Practice', 'title_ar': 'تطبيق عملي', 'display_order': 3},
                ],
            },
            {
                'title_en': 'Week 6 — Google Tools & Final Project',
                'title_ar': 'الأسبوع 6 — أدوات Google والمشروع النهائي',
                'display_order': 5,
                'topics': [
                    {'title_en': 'Google Drive, Docs & Sheets', 'title_ar': 'Google Drive و Docs و Sheets', 'display_order': 0},
                    {'title_en': 'Collaboration basics', 'title_ar': 'أساسيات التعاون', 'display_order': 1},
                    {'title_en': 'Final project: digital business package', 'title_ar': 'المشروع النهائي: حزمة أعمال رقمية', 'display_order': 2},
                ],
            },
        ],
        'faqs': [
            _starter_faq_beginners(),
            _starter_faq_sessions(),
            _starter_faq_certificate(),
            _starter_faq_price(),
        ],
    },
]


# =======================================================================
# SUMMER TRAINING — a real intake program (not a fake catalog entry)
# =======================================================================
SUMMER_PROGRAM_CONTENT = [
    {
        'slug': 'summer-training',
        'title_en': 'Summer Training',
        'title_ar': 'التدريب الصيفي',
        'short_description_en': 'A hands-on summer training program inside a real software company. Practical sessions, real projects, and mentorship for students.',
        'short_description_ar': 'برنامج تدريب صيفي عملي داخل شركة برمجيات حقيقية. جلسات تطبيقية ومشاريع حقيقية وإشراف للطلاب.',
        'overview_en': (
            "Sidrah Soft Summer Training is a hands-on program that places you inside a real "
            "software company environment. Instead of only watching lectures, you work on "
            "practical tasks and real projects under the guidance of our team.\n\n"
            "The program is designed for students who want real, practical experience during "
            "the summer. You will join live sessions, practice on real exercises, and receive "
            "mentor support throughout.\n\n"
            "Specific training tracks and schedules are announced for each intake. Register "
            "your interest and our team will share the available tracks, dates, and details."
        ),
        'overview_ar': (
            "التدريب الصيفي من Sidrah Soft هو برنامج عملي يضعك داخل بيئة شركة برمجيات "
            "حقيقية. بدلًا من مجرد مشاهدة المحاضرات، ستعمل على مهام تطبيقية ومشاريع "
            "حقيقية تحت إشراف فريقنا.\n\n"
            "البرنامج مصمم للطلاب الذين يريدون خبرة عملية حقيقية خلال الصيف. ستحضر "
            "جلسات مباشرة، وتتدرب على تمارين حقيقية، وتحصل على إشراف ومتابعة طوال البرنامج.\n\n"
            "يتم الإعلان عن المسارات والجداول المحددة لكل دفعة. سجّل اهتمامك وسيشاركك "
            "فريقنا المسارات المتاحة والمواعيد والتفاصيل."
        ),
        'branch': 'summer',
        'duration_en': 'Summer Program',
        'duration_ar': 'برنامج صيفي',
        'format_en': 'Live Practical Sessions',
        'format_ar': 'جلسات عملية مباشرة',
        'status': 'active',
        'display_order': 5,
        'registration_open': True,
        'maximum_capacity': None,
        'registration_url': 'https://forms.gle/tjHRqBZrkNYtrWNL7',
        'image_file': None,
        'landing': {
            'headline_en': 'Real, hands-on summer training inside a software company',
            'headline_ar': 'تدريب صيفي عملي حقيقي داخل شركة برمجيات',
            'quick_facts': {
                'level': {'en': 'Students / Beginners', 'ar': 'طلاب / مبتدئون'},
                'trainingMode': {'en': 'Live Practical Sessions', 'ar': 'جلسات عملية مباشرة'},
                'duration': {'en': 'Summer Program', 'ar': 'برنامج صيفي'},
                'certificate': {'en': CERTIFICATE_EN, 'ar': CERTIFICATE_AR},
                'support': {'en': 'Mentor Support', 'ar': 'إشراف ومتابعة'},
            },
            'current_price': None,
            'currency': 'EGP',
            'show_pricing': False,
            'target_audience': {
                'en': [
                    'University students looking for practical summer training',
                    'Students who want real company experience',
                    'Beginners who want guided, hands-on learning',
                ],
                'ar': [
                    'طلاب الجامعات الباحثون عن تدريب صيفي عملي',
                    'الطلاب الذين يريدون خبرة حقيقية داخل شركة',
                    'المبتدئون الذين يريدون تعلمًا عمليًا بإشراف',
                ],
            },
            'prerequisites': {
                'en': [
                    'Basic computer literacy',
                    'A computer with internet access',
                    'Commitment to attend the program',
                ],
                'ar': [
                    'معرفة أساسية باستخدام الحاسوب',
                    'جهاز كمبيوتر مع اتصال بالإنترنت',
                    'الالتزام بحضور البرنامج',
                ],
            },
            'tools': {'en': [], 'ar': []},
            'practical_training_en': 'Practical, hands-on work on real exercises and projects under mentor supervision.',
            'practical_training_ar': 'عمل تطبيقي على تمارين ومشاريع حقيقية تحت إشراف المرشدين.',
            'final_project_en': 'Practical project work is part of the program; details are shared per intake.',
            'final_project_ar': 'يتضمن البرنامج عملًا على مشروع عملي؛ وتُشارك التفاصيل لكل دفعة.',
            'training_experience_en': SHARED_TRAINING_EXPERIENCE_EN,
            'training_experience_ar': SHARED_TRAINING_EXPERIENCE_AR,
            'mentor_info_en': SHARED_MENTOR_INFO_EN,
            'mentor_info_ar': SHARED_MENTOR_INFO_AR,
            'installments_available': False,
            'included_items': {
                'en': ['Live practical sessions', 'Hands-on project work', 'Mentor support', 'Completion certificate (per requirements)'],
                'ar': ['جلسات عملية مباشرة', 'عمل على مشاريع تطبيقية', 'إشراف ومتابعة', 'شهادة إتمام (وفق المتطلبات)'],
            },
            'seo_title_en': 'Summer Training | Hands-On Program | Sidrah Soft',
            'seo_title_ar': 'التدريب الصيفي | برنامج عملي | Sidrah Soft',
            'seo_meta_description_en': 'Join Sidrah Soft Summer Training — a hands-on program inside a real software company with practical sessions, projects, and mentorship.',
            'seo_meta_description_ar': 'انضم إلى التدريب الصيفي من Sidrah Soft — برنامج عملي داخل شركة برمجيات حقيقية مع جلسات تطبيقية ومشاريع وإشراف.',
            'seo_noindex': False,
            'show_registration_form': True,
        },
        'modules': [],
        'faqs': [
            {
                'question_en': 'Who can join the Summer Training?',
                'question_ar': 'من يمكنه الانضمام إلى التدريب الصيفي؟',
                'answer_en': 'The program is designed for students who want practical, hands-on experience during the summer. Register your interest and our team will share the details for the current intake.',
                'answer_ar': 'البرنامج مصمم للطلاب الذين يريدون خبرة عملية تطبيقية خلال الصيف. سجّل اهتمامك وسيشاركك فريقنا تفاصيل الدفعة الحالية.',
                'display_order': 0,
            },
            {
                'question_en': 'What will I learn?',
                'question_ar': 'ماذا سأتعلم؟',
                'answer_en': 'You will work on practical tasks and real projects under mentor supervision. Specific training tracks and topics are announced for each intake.',
                'answer_ar': 'ستعمل على مهام تطبيقية ومشاريع حقيقية تحت إشراف المرشدين. يتم الإعلان عن المسارات والموضوعات المحددة لكل دفعة.',
                'display_order': 1,
            },
            {
                'question_en': 'How long is the program?',
                'question_ar': 'ما مدة البرنامج؟',
                'answer_en': 'The schedule and duration are announced for each summer intake. Register and our team will share the exact dates and details.',
                'answer_ar': 'يتم الإعلان عن الجدول والمدة لكل دفعة صيفية. سجّل وسيشاركك فريقنا المواعيد والتفاصيل الدقيقة.',
                'display_order': 2,
            },
            {
                'question_en': 'Do I get a certificate?',
                'question_ar': 'هل أحصل على شهادة؟',
                'answer_en': 'You receive a Sidrah Soft completion certificate subject to attendance and program completion requirements.',
                'answer_ar': 'تحصل على شهادة إتمام من Sidrah Soft وفق متطلبات الحضور وإكمال البرنامج.',
                'display_order': 3,
            },
        ],
    },
]
