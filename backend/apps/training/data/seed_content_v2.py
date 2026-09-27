"""
Approved content for all 9 Sidrah Training programs.

This data is the authoritative source for the seed_training_content command.
All content is CMS-editable after seeding — this file only provides the
initial approved content.

Content policy:
- No invented partnerships, accreditation, or employment claims.
- No job guarantees or salary guarantees.
- Arabic tone: professional, clear, modern website copy (not Facebook ad style).
- English tone: natural, professional, career-oriented website copy.
- Duration, projects, and prerequisites vary per program.
- ICDL remains seo_noindex=True with temporary placeholder content.
- Data Analysis is a new complete program.
"""

# Shared training experience text used across professional programs
SHARED_TRAINING_EXPERIENCE_EN = (
    "Training is delivered through live interactive sessions online. "
    "You will learn alongside instructors in real time, ask questions, "
    "and work through practical exercises during each session. "
    "Recorded sessions may be made available to students according to "
    "Sidrah Soft's operational policy."
)

SHARED_TRAINING_EXPERIENCE_AR = (
    "يُقدّم التدريب عبر جلسات تفاعلية مباشرة عبر الإنترنت. "
    "ستتعلّم مع المدربين في الوقت الفعلي، وتطرح أسئلتك، "
    "وتعمل على تمارين عملية خلال كل جلسة. "
    "قد يتم توفير تسجيلات للجلسات للطلاب وفق سياسة Sidrah Soft التشغيلية."
)

SHARED_MENTOR_INFO_EN = (
    "Sidrah Soft provides mentor support and follow-up throughout the program. "
    "Our mentors help answer your questions, review your work, and guide you "
    "through practical assignments. You will receive guidance and support "
    "to help you stay on track and get the most out of your training."
)

SHARED_MENTOR_INFO_AR = (
    "توفر Sidrah Soft إشرافًا ومتابعة طوال فترة البرنامج. "
    "يساعدك المرشدون في الإجابة على أسئلتك ومراجعة أعمالك وتوجيهك "
    "في المهام العملية. ستحصل على الدعم والتوجيه لمساعدتك على "
    "الالتزام بمسار التعلّم والاستفادة القصوى من التدريب."
)

SHARED_INSTALLMENTS_INFO_EN = (
    "Installment plans are available. Payment can be made via InstaPay or "
    "bank transfer. Students upload proof of transfer and the admin team "
    "verifies the payment. Contact us for details on available installment plans."
)

SHARED_INSTALLMENTS_INFO_AR = (
    "يتوفر نظام تقسيط للدفع. يمكن الدفع عبر InstaPay أو التحويل البنكي. "
    "يقوم الطالب برفع إثبات التحويل ويقوم فريق الإدارة بالتحقق من الدفع. "
    "تواصل معنا لمعرفة تفاصيل خطط التقسيط المتاحة."
)

SHARED_CERTIFICATE_EN = "Digital Sidrah Soft Training Completion Certificate"
SHARED_CERTIFICATE_AR = "شهادة إتمام تدريب رقمية من Sidrah Soft"

# FAQ answers that are shared but customizable per program
def _faq_beginners_en(extra=""):
    base = "Yes, this course is designed for beginners. "
    if extra:
        return base + extra
    return base + "No prior experience is required — we start from the fundamentals and build up step by step."

def _faq_beginners_ar(extra=""):
    base = "نعم، هذا الكورس مصمم للمبتدئين. "
    if extra:
        return base + extra
    return base + "لا تحتاج إلى خبرة سابقة — نبدأ من الأساسيات ونبني المعرفة خطوة بخطوة."

FAQ_LIVE_EN = "Yes, all lectures are delivered live online. You can interact with the instructor and ask questions in real time."
FAQ_LIVE_AR = "نعم، جميع المحاضرات تُقدّم مباشرة عبر الإنترنت. يمكنك التفاعل مع المدرب وطرح الأسئلة في الوقت الفعلي."

FAQ_RECORDINGS_EN = "Session recordings may be made available to students according to Sidrah Soft's operational policy."
FAQ_RECORDINGS_AR = "قد يتم توفير تسجيلات للجلسات للطلاب وفق سياسة Sidrah Soft التشغيلية."

FAQ_MENTOR_EN = "Yes, mentor support and follow-up are provided throughout the program to help you with questions and practical work."
FAQ_MENTOR_AR = "نعم، يتم توفير إشراف ومتابعة طوال فترة البرنامج لمساعدتك في الأسئلة والمهام العملية."

FAQ_CERTIFICATE_EN = "Upon successful completion of the program requirements, you will receive a digital Sidrah Soft Training Completion Certificate."
FAQ_CERTIFICATE_AR = "عند إتمام متطلبات البرنامج بنجاح، ستحصل على شهادة إتمام تدريب رقمية من Sidrah Soft."

FAQ_INSTALLMENTS_EN = "Yes, installment plans are available. Contact us for details on available payment plans."
FAQ_INSTALLMENTS_AR = "نعم، تتوفر خطط تقسيط. تواصل معنا لمعرفة تفاصيل خطط الدفع المتاحة."

FAQ_PRACTICAL_EN = "Yes, the program includes hands-on practical work including exercises, projects, and real-world applications."
FAQ_PRACTICAL_AR = "نعم، يتضمن البرنامج تطبيقًا عمليًا يشمل تمارين ومشاريع وتطبيقات واقعية."


PROGRAM_CONTENT = [
    # ===================================================================
    # 1. FRONTEND DEVELOPMENT
    # ===================================================================
    {
        'slug': 'frontend-development',
        'title_en': 'Frontend Development',
        'title_ar': 'تطوير الواجهات الأمامية',
        'short_description_en': 'Build modern web applications from HTML and CSS to React, Angular, and Vue. A practical 5-month program with real projects.',
        'short_description_ar': 'ابنِ تطبيقات ويب حديثة من HTML و CSS إلى React و Angular و Vue. برنامج عملي لمدة 5 شهور بمشاريع حقيقية.',
        'overview_en': (
            "Frontend Development is the craft of building the interfaces that users see and interact with every day. "
            "This program takes you from web fundamentals — HTML, CSS, and JavaScript — through modern frameworks "
            "and professional development practices.\n\n"
            "You will learn to build responsive, accessible, and fast web applications using industry-standard tools. "
            "The program covers one framework path (React, Angular, or Vue) depending on the cohort, ensuring you "
            "go deep rather than spreading thin across multiple frameworks.\n\n"
            "By the end, you will have a portfolio of projects that demonstrate your ability to build real web "
            "applications from scratch."
        ),
        'overview_ar': (
            "تطوير الواجهات الأمامية هو فن بناء الواجهات التي يراها المستخدمون ويتفاعلون معها يوميًا. "
            "يأخذك هذا البرنامج من أساسيات الويب — HTML و CSS و JavaScript — إلى أطر العمل الحديثة "
            "والممارسات المهنية في التطوير.\n\n"
            "ستتعلم كيف تبني تطبيقات ويب متجاوبة وسريعة وقابلة للوصول باستخدام أدوات معتمدة في الصناعة. "
            "يغطي البرنامج مسار إطار عمل واحد (React أو Angular أو Vue) حسب الدفعة، مما يضمن "
            "أن تتعمق في إطار واحد بدل التشتت بين عدة أطر.\n\n"
            "في النهاية، سيكون لديك مجموعة مشاريع تثبت قدرتك على بناء تطبيقات ويب حقيقية من الصفر."
        ),
        'branch': 'professional',
        'status': 'active',
        'display_order': 100,
        'registration_open': True,
        'maximum_capacity': None,
        'registration_url': 'https://forms.gle/tjHRqBZrkNYtrWNL7',
        'image_file': 'frontend-development.webp',
        'landing': {
            'headline_en': 'Build the interfaces that millions of users touch every day',
            'headline_ar': 'ابنِ الواجهات التي يتفاعل معها ملايين المستخدمين كل يوم',
            'quick_facts': {
                'level': {'en': 'Beginner to Intermediate', 'ar': 'من مبتدئ إلى متوسط'},
                'trainingMode': {'en': 'Live Online Training', 'ar': 'تدريب مباشر عبر الإنترنت'},
                'language': {'en': 'English & Arabic', 'ar': 'الإنجليزية والعربية'},
                'practicalType': {'en': 'Projects & Exercises', 'ar': 'مشاريع وتمارين'},
                'certificate': {'en': SHARED_CERTIFICATE_EN, 'ar': SHARED_CERTIFICATE_AR},
                'support': {'en': 'Mentor Support', 'ar': 'إشراف ومتابعة'},
                'duration': {'en': '5 Months', 'ar': '5 شهور'},
                'hasRecordings': True,
            },
            'current_price': 6000,
            'currency': 'EGP',
            'show_pricing': True,
            'target_audience': {
                'en': [
                    'Complete beginners with no prior coding experience',
                    'University students studying computer science or design',
                    'Career switchers moving into tech',
                    'Junior developers who want to strengthen their fundamentals',
                    'Freelancers who want to offer web development services',
                ],
                'ar': [
                    'المبتدئون تماماً بدون خبرة برمجية سابقة',
                    'طلاب الجامعات في علوم الحاسب أو التصميم',
                    'المتحولون مهنياً إلى مجال التقنية',
                    'المطورون المبتدئون الذين يريدون تعزيز أساسياتهم',
                    'المستقلون الذين يريدون تقديم خدمات تطوير الويب',
                ],
            },
            'prerequisites': {
                'en': [
                    'No prior programming experience required',
                    'Basic computer and browser familiarity',
                    'Willingness to learn and commit to hands-on practice',
                ],
                'ar': [
                    'لا يشترط وجود خبرة برمجية سابقة',
                    'معرفة أساسية باستخدام الحاسوب والمتصفح',
                    'رغبة في التعلّم والالتزام بالتدريب العملي',
                ],
            },
            'tools': {
                'en': ['HTML5', 'CSS3', 'JavaScript (ES6+)', 'TypeScript', 'Git', 'Vite', 'React or Angular or Vue'],
                'ar': ['HTML5', 'CSS3', 'JavaScript (ES6+)', 'TypeScript', 'Git', 'Vite', 'React أو Angular أو Vue'],
            },
            'practical_training_en': (
                "Progressive hands-on training starting from small exercises on each concept and building up to "
                "complete projects. You will build 3 mini projects, 2 portfolio projects, and 1 final project. "
                "Additional tasks, exercises, and workshops reinforce each module."
            ),
            'practical_training_ar': (
                "تدريب عملي متدرج يبدأ من تمارين صغيرة على كل مفهوم وينتهي بمشاريع كاملة. "
                "ستبني 3 مشاريع مصغرة و 2 مشاريع للمعرض و 1 مشروع نهائي. "
                "كما تتضمن البرنامج مهام وتمارين وورش عمل تعزز كل وحدة."
            ),
            'final_project_en': (
                "Build a complete web application using your chosen framework path. "
                "The project includes a hero section, feature grid, pricing table, FAQ accordion, "
                "and a responsive layout that works across desktop and mobile."
            ),
            'final_project_ar': (
                "ابنِ تطبيق ويب كامل باستخدام مسار إطار العمل الذي اخترته. "
                "يتضمن المشروع قسم رئيسي وشبكة ميزات وجدول أسعار وأكورديون أسئلة شائعة "
                "وتخطيط متجاوب يعمل على الكمبيوتر والهاتف."
            ),
            'training_experience_en': SHARED_TRAINING_EXPERIENCE_EN,
            'training_experience_ar': SHARED_TRAINING_EXPERIENCE_AR,
            'mentor_info_en': SHARED_MENTOR_INFO_EN,
            'mentor_info_ar': SHARED_MENTOR_INFO_AR,
            'installments_available': True,
            'installments_info_en': SHARED_INSTALLMENTS_INFO_EN,
            'installments_info_ar': SHARED_INSTALLMENTS_INFO_AR,
            'included_items': {
                'en': ['Live interactive sessions', 'Hands-on projects', 'Mentor support', 'Session recordings (per policy)', 'Digital completion certificate'],
                'ar': ['جلسات مباشرة تفاعلية', 'مشاريع عملية', 'إشراف ومتابعة', 'تسجيلات الجلسات (حسب السياسة)', 'شهادة إتمام رقمية'],
            },
            'seo_title_en': 'Frontend Development Course | HTML, CSS, JavaScript, React | Sidrah Soft',
            'seo_title_ar': 'كورس تطوير الواجهات الأمامية | HTML, CSS, JavaScript, React | Sidrah Soft',
            'seo_meta_description_en': 'Learn HTML, CSS, JavaScript, and React from scratch and build professional responsive web applications in a 5-month live online program.',
            'seo_meta_description_ar': 'تعلّم HTML و CSS و JavaScript و React من الصفر وابنِ تطبيقات ويب متجاوبة احترافية في برنامج مباشر عبر الإنترنت لمدة 5 شهور.',
            'seo_noindex': False,
            'show_registration_form': True,
        },
        'modules': [
            {
                'title_en': 'Web Foundations',
                'title_ar': 'أساسيات الويب',
                'display_order': 0,
                'topics': [
                    {'title_en': 'HTML5', 'title_ar': 'HTML5', 'display_order': 0},
                    {'title_en': 'Semantic HTML', 'title_ar': 'HTML الدلالي', 'display_order': 1},
                    {'title_en': 'CSS3', 'title_ar': 'CSS3', 'display_order': 2},
                    {'title_en': 'Responsive Design', 'title_ar': 'التصميم المتجاوب', 'display_order': 3},
                    {'title_en': 'Flexbox', 'title_ar': 'Flexbox', 'display_order': 4},
                    {'title_en': 'CSS Grid', 'title_ar': 'CSS Grid', 'display_order': 5},
                    {'title_en': 'SASS', 'title_ar': 'SASS', 'display_order': 6},
                    {'title_en': 'Bootstrap', 'title_ar': 'Bootstrap', 'display_order': 7},
                    {'title_en': 'Tailwind CSS', 'title_ar': 'Tailwind CSS', 'display_order': 8},
                ],
            },
            {
                'title_en': 'JavaScript',
                'title_ar': 'JavaScript',
                'display_order': 1,
                'topics': [
                    {'title_en': 'JavaScript Fundamentals', 'title_ar': 'أساسيات JavaScript', 'display_order': 0},
                    {'title_en': 'Variables & Data Types', 'title_ar': 'المتغيرات وأنواع البيانات', 'display_order': 1},
                    {'title_en': 'Functions', 'title_ar': 'الدوال', 'display_order': 2},
                    {'title_en': 'Arrays & Objects', 'title_ar': 'المصفوفات والكائنات', 'display_order': 3},
                    {'title_en': 'DOM & BOM', 'title_ar': 'DOM و BOM', 'display_order': 4},
                    {'title_en': 'Events', 'title_ar': 'الأحداث', 'display_order': 5},
                    {'title_en': 'Regular Expressions', 'title_ar': 'التعبيرات النمطية', 'display_order': 6},
                    {'title_en': 'Modern JavaScript / ES6+', 'title_ar': 'JavaScript الحديثة / ES6+', 'display_order': 7},
                    {'title_en': 'Async Programming', 'title_ar': 'البرمجة غير المتزامنة', 'display_order': 8},
                    {'title_en': 'Promises', 'title_ar': 'Promises', 'display_order': 9},
                    {'title_en': 'Fetch / APIs', 'title_ar': 'Fetch / APIs', 'display_order': 10},
                    {'title_en': 'Error Handling', 'title_ar': 'معالجة الأخطاء', 'display_order': 11},
                ],
            },
            {
                'title_en': 'Development Tools & TypeScript',
                'title_ar': 'أدوات التطوير و TypeScript',
                'display_order': 2,
                'topics': [
                    {'title_en': 'Git', 'title_ar': 'Git', 'display_order': 0},
                    {'title_en': 'GitHub', 'title_ar': 'GitHub', 'display_order': 1},
                    {'title_en': 'npm / Package Management', 'title_ar': 'npm / إدارة الحزم', 'display_order': 2},
                    {'title_en': 'Browser Developer Tools', 'title_ar': 'أدوات مطور المتصفح', 'display_order': 3},
                    {'title_en': 'Hosting & Deployment Basics', 'title_ar': 'أساسيات النشر والاستضافة', 'display_order': 4},
                    {'title_en': 'TypeScript Type System', 'title_ar': 'نظام أنواع TypeScript', 'display_order': 5},
                    {'title_en': 'Interfaces & Types', 'title_ar': 'الواجهات والأنواع', 'display_order': 6},
                    {'title_en': 'Generics', 'title_ar': 'Generics', 'display_order': 7},
                    {'title_en': 'Type-safe Application Development', 'title_ar': 'تطوير تطبيقات آمنة نوعيًا', 'display_order': 8},
                ],
            },
            {
                'title_en': 'Framework Path (React, Angular, or Vue)',
                'title_ar': 'مسار إطار العمل (React أو Angular أو Vue)',
                'display_order': 3,
                'description_en': 'The cohort follows ONE framework path. Topics below cover the shared concepts and the specific path is determined per cohort.',
                'description_ar': 'تتبع الدفعة مسار إطار عمل واحد. الموضوعات أدناه تغطي المفاهيم المشتركة والمسار المحدد يُحدد حسب الدفعة.',
                'topics': [
                    {'title_en': 'Framework Fundamentals', 'title_ar': 'أساسيات إطار العمل', 'display_order': 0},
                    {'title_en': 'Components', 'title_ar': 'المكونات', 'display_order': 1},
                    {'title_en': 'Props & State', 'title_ar': 'الخصائص والحالة', 'display_order': 2},
                    {'title_en': 'Hooks / Composition API', 'title_ar': 'Hooks / Composition API', 'display_order': 3},
                    {'title_en': 'Routing', 'title_ar': 'التوجيه', 'display_order': 4},
                    {'title_en': 'Forms', 'title_ar': 'النماذج', 'display_order': 5},
                    {'title_en': 'API Integration', 'title_ar': 'ربط الـ API', 'display_order': 6},
                    {'title_en': 'State Management', 'title_ar': 'إدارة الحالة', 'display_order': 7},
                    {'title_en': 'Next.js / Angular Material / Vue ecosystem', 'title_ar': 'Next.js / Angular Material / منظومة Vue', 'display_order': 8},
                    {'title_en': 'Modern UI Component Systems', 'title_ar': 'أنظمة مكونات الواجهة الحديثة', 'display_order': 9},
                ],
            },
        ],
        'faqs': [
            {'question_en': 'Is this course suitable for complete beginners?', 'question_ar': 'هل هذا الكورس مناسب للمبتدئين تماماً؟', 'answer_en': _faq_beginners_en(), 'answer_ar': _faq_beginners_ar(), 'display_order': 0},
            {'question_en': 'Are the lectures live?', 'question_ar': 'هل المحاضرات مباشرة؟', 'answer_en': FAQ_LIVE_EN, 'answer_ar': FAQ_LIVE_AR, 'display_order': 1},
            {'question_en': 'Are session recordings available?', 'question_ar': 'هل تتوفر تسجيلات للجلسات؟', 'answer_en': FAQ_RECORDINGS_EN, 'answer_ar': FAQ_RECORDINGS_AR, 'display_order': 2},
            {'question_en': 'Is there practical work?', 'question_ar': 'هل يوجد تطبيق عملي؟', 'answer_en': FAQ_PRACTICAL_EN, 'answer_ar': FAQ_PRACTICAL_AR, 'display_order': 3},
            {'question_en': 'Is there mentor support?', 'question_ar': 'هل يوجد إشراف ومتابعة؟', 'answer_en': FAQ_MENTOR_EN, 'answer_ar': FAQ_MENTOR_AR, 'display_order': 4},
            {'question_en': 'What are the certificate requirements?', 'question_ar': 'ما متطلبات الحصول على الشهادة؟', 'answer_en': FAQ_CERTIFICATE_EN, 'answer_ar': FAQ_CERTIFICATE_AR, 'display_order': 5},
            {'question_en': 'Are installments available?', 'question_ar': 'هل يتوفر تقسيط؟', 'answer_en': FAQ_INSTALLMENTS_EN, 'answer_ar': FAQ_INSTALLMENTS_AR, 'display_order': 6},
        ],
    },

    # ===================================================================
    # 2. BACKEND DEVELOPMENT
    # ===================================================================
    {
        'slug': 'backend-development',
        'title_en': 'Backend Development',
        'title_ar': 'تطوير الواجهات الخلفية',
        'short_description_en': 'Master server-side development with Node.js, ASP.NET, or Laravel. Learn APIs, databases, authentication, and deployment in a 4-month program.',
        'short_description_ar': 'احترف تطوير الخادم باستخدام Node.js أو ASP.NET أو Laravel. تعلّم الـ APIs وقواعد البيانات والمصادقة والنشر في برنامج 4 شهور.',
        'overview_en': (
            "Backend developers build the systems that power every application — handling data, logic, "
            "authentication, and business rules. This program covers the full backend stack from "
            "server-side fundamentals to production deployment.\n\n"
            "Backend development is not a single technology. The program supports multiple technology paths: "
            "Node.js, ASP.NET Core, or PHP & Laravel. Each cohort follows one path, ensuring you develop "
            "deep practical skills in your chosen stack.\n\n"
            "You will learn to design and build REST APIs, work with databases, implement authentication "
            "and authorization, handle errors securely, and deploy your applications to production."
        ),
        'overview_ar': (
            "مطورو الواجهات الخلفية يبنون الأنظمة التي تشغّل كل تطبيق — معالجة البيانات والمنطق "
            "والمصادقة وقواعد العمل. يغطي هذا البرنامج مكدس الواجهة الخلفية بالكامل من "
            "أساسيات الخادم إلى النشر في الإنتاج.\n\n"
            "تطوير الواجهات الخلفية ليس تقنية واحدة. يدعم البرنامج مسارات تقنية متعددة: "
            "Node.js أو ASP.NET Core أو PHP و Laravel. تتبع كل دفعة مسارًا واحدًا، مما يضمن "
            "تطوير مهارات عملية عميقة في المكدس الذي اخترته.\n\n"
            "ستتعلم كيف تصمم وتبني REST APIs، وتعمل مع قواعد البيانات، وتطبق المصادقة "
            "والصلاحيات، وتعالج الأخطاء بأمان، وتنشر تطبيقاتك في الإنتاج."
        ),
        'branch': 'professional',
        'status': 'active',
        'display_order': 110,
        'registration_open': True,
        'maximum_capacity': None,
        'registration_url': 'https://forms.gle/tjHRqBZrkNYtrWNL7',
        'image_file': 'backend-development.webp',
        'landing': {
            'headline_en': 'Engineer the systems that handle data, logic, and security behind every application',
            'headline_ar': 'صمّم الأنظمة التي تدير البيانات والمنطق والأمان خلف كل تطبيق',
            'quick_facts': {
                'level': {'en': 'Beginner to Intermediate', 'ar': 'من مبتدئ إلى متوسط'},
                'trainingMode': {'en': 'Live Online Training', 'ar': 'تدريب مباشر عبر الإنترنت'},
                'language': {'en': 'English & Arabic', 'ar': 'الإنجليزية والعربية'},
                'practicalType': {'en': 'API Projects & Exercises', 'ar': 'مشاريع API وتمارين'},
                'certificate': {'en': SHARED_CERTIFICATE_EN, 'ar': SHARED_CERTIFICATE_AR},
                'support': {'en': 'Mentor Support', 'ar': 'إشراف ومتابعة'},
                'duration': {'en': '4 Months', 'ar': '4 شهور'},
                'hasRecordings': True,
            },
            'current_price': 6000,
            'currency': 'EGP',
            'show_pricing': True,
            'target_audience': {
                'en': [
                    'Developers who know basic programming and want to learn server-side development',
                    'Frontend developers looking to become full-stack',
                    'Computer science students wanting practical backend skills',
                    'Career switchers with some technical background',
                ],
                'ar': [
                    'المطورون الذين يعرفون أساسيات البرمجة ويريدون تعلم تطوير الخادم',
                    'مطورو الواجهات الأمامية الذين يريدون أن يصبحوا Full-stack',
                    'طلاب علوم الحاسب الذين يريدون مهارات عملية في الواجهة الخلفية',
                    'المتحولون مهنياً مع خلفية تقنية',
                ],
            },
            'prerequisites': {
                'en': [
                    'Basic programming knowledge (variables, functions, loops)',
                    'Understanding of how the web works (HTTP, browsers)',
                    'A computer with internet access',
                ],
                'ar': [
                    'معرفة أساسية بالبرمجة (المتغيرات، الدوال، الحلقات)',
                    'فهم كيف يعمل الويب (HTTP، المتصفحات)',
                    'جهاز كمبيوتر مع اتصال بالإنترنت',
                ],
            },
            'tools': {
                'en': ['Node.js or ASP.NET or PHP', 'PostgreSQL or MySQL or SQL Server', 'Git', 'Postman', 'Docker basics'],
                'ar': ['Node.js أو ASP.NET أو PHP', 'PostgreSQL أو MySQL أو SQL Server', 'Git', 'Postman', 'أساسيات Docker'],
            },
            'practical_training_en': (
                "Hands-on backend development training with 2 mini projects, 1 API project, "
                "and 1 final backend project. You will build real APIs, work with databases, "
                "implement authentication, and deploy your applications."
            ),
            'practical_training_ar': (
                "تدريب عملي في تطوير الواجهة الخلفية مع 2 مشاريع مصغرة و 1 مشروع API "
                "و 1 مشروع نهائي. ستبني APIs حقيقية، وتعمل مع قواعد البيانات، "
                "وتطبق المصادقة، وتنشر تطبيقاتك."
            ),
            'final_project_en': (
                "Build a complete backend application with REST APIs, database integration, "
                "authentication, authorization, input validation, and error handling. "
                "Deploy the application to a production environment."
            ),
            'final_project_ar': (
                "ابنِ تطبيق واجهة خلفية كامل مع REST APIs وربط قاعدة بيانات "
                "ومصادقة وصلاحيات والتحقق من المدخلات ومعالجة الأخطاء. "
                "انشر التطبيق في بيئة الإنتاج."
            ),
            'training_experience_en': SHARED_TRAINING_EXPERIENCE_EN,
            'training_experience_ar': SHARED_TRAINING_EXPERIENCE_AR,
            'mentor_info_en': SHARED_MENTOR_INFO_EN,
            'mentor_info_ar': SHARED_MENTOR_INFO_AR,
            'installments_available': True,
            'installments_info_en': SHARED_INSTALLMENTS_INFO_EN,
            'installments_info_ar': SHARED_INSTALLMENTS_INFO_AR,
            'included_items': {
                'en': ['Live interactive sessions', 'Hands-on API projects', 'Mentor support', 'Session recordings (per policy)', 'Digital completion certificate'],
                'ar': ['جلسات مباشرة تفاعلية', 'مشاريع API عملية', 'إشراف ومتابعة', 'تسجيلات الجلسات (حسب السياسة)', 'شهادة إتمام رقمية'],
            },
            'seo_title_en': 'Backend Development Course | Node.js, ASP.NET, Laravel | Sidrah Soft',
            'seo_title_ar': 'كورس تطوير الواجهات الخلفية | Node.js, ASP.NET, Laravel | Sidrah Soft',
            'seo_meta_description_en': 'Learn backend development with Node.js, ASP.NET Core, or Laravel. Build REST APIs, work with databases, and deploy production applications in a 4-month live program.',
            'seo_meta_description_ar': 'تعلّم تطوير الواجهات الخلفية بـ Node.js أو ASP.NET Core أو Laravel. ابنِ REST APIs واعمل مع قواعد البيانات وانشر تطبيقات الإنتاج في برنامج مباشر لمدة 4 شهور.',
            'seo_noindex': False,
            'show_registration_form': True,
        },
        'modules': [
            {
                'title_en': 'Programming Fundamentals (Path-dependent)',
                'title_ar': 'أساسيات البرمجة (حسب المسار)',
                'display_order': 0,
                'description_en': 'Language fundamentals depend on the technology path: JavaScript/TypeScript for Node.js, C# for ASP.NET, PHP for Laravel.',
                'description_ar': 'أساسيات اللغة تعتمد على المسار التقني: JavaScript/TypeScript لـ Node.js، C# لـ ASP.NET، PHP لـ Laravel.',
                'topics': [
                    {'title_en': 'Language Fundamentals', 'title_ar': 'أساسيات اللغة', 'display_order': 0},
                    {'title_en': 'OOP Concepts', 'title_ar': 'مفاهيم البرمجة الكائنية', 'display_order': 1},
                    {'title_en': 'Data Structures', 'title_ar': 'هياكل البيانات', 'display_order': 2},
                    {'title_en': 'Error Handling', 'title_ar': 'معالجة الأخطاء', 'display_order': 3},
                ],
            },
            {
                'title_en': 'Web Framework & REST APIs',
                'title_ar': 'إطار الويب و REST APIs',
                'display_order': 1,
                'topics': [
                    {'title_en': 'Framework Fundamentals (Express / ASP.NET Core / Laravel)', 'title_ar': 'أساسيات الإطار (Express / ASP.NET Core / Laravel)', 'display_order': 0},
                    {'title_en': 'Routing', 'title_ar': 'التوجيه', 'display_order': 1},
                    {'title_en': 'REST API Design', 'title_ar': 'تصميم REST API', 'display_order': 2},
                    {'title_en': 'Request/Response Handling', 'title_ar': 'معالجة الطلب والاستجابة', 'display_order': 3},
                    {'title_en': 'Middleware', 'title_ar': 'البرمجيات الوسيطة', 'display_order': 4},
                    {'title_en': 'Validation', 'title_ar': 'التحقق من المدخلات', 'display_order': 5},
                ],
            },
            {
                'title_en': 'Databases & ORM',
                'title_ar': 'قواعد البيانات و ORM',
                'display_order': 2,
                'topics': [
                    {'title_en': 'SQL Fundamentals', 'title_ar': 'أساسيات SQL', 'display_order': 0},
                    {'title_en': 'PostgreSQL / SQL Server / MySQL', 'title_ar': 'PostgreSQL / SQL Server / MySQL', 'display_order': 1},
                    {'title_en': 'ORM (Eloquent / Entity Framework / Prisma)', 'title_ar': 'ORM (Eloquent / Entity Framework / Prisma)', 'display_order': 2},
                    {'title_en': 'MongoDB Fundamentals (Node.js path)', 'title_ar': 'أساسيات MongoDB (مسار Node.js)', 'display_order': 3},
                    {'title_en': 'Database Design & Relationships', 'title_ar': 'تصميم قاعدة البيانات والعلاقات', 'display_order': 4},
                ],
            },
            {
                'title_en': 'Authentication, Security & Deployment',
                'title_ar': 'المصادقة والأمان والنشر',
                'display_order': 3,
                'topics': [
                    {'title_en': 'Authentication', 'title_ar': 'المصادقة', 'display_order': 0},
                    {'title_en': 'Authorization', 'title_ar': 'الصلاحيات', 'display_order': 1},
                    {'title_en': 'Security Fundamentals', 'title_ar': 'أساسيات الأمان', 'display_order': 2},
                    {'title_en': 'File Uploads', 'title_ar': 'رفع الملفات', 'display_order': 3},
                    {'title_en': 'Testing', 'title_ar': 'الاختبار', 'display_order': 4},
                    {'title_en': 'Git', 'title_ar': 'Git', 'display_order': 5},
                    {'title_en': 'Deployment', 'title_ar': 'النشر', 'display_order': 6},
                ],
            },
        ],
        'faqs': [
            {'question_en': 'Is this course suitable for complete beginners?', 'question_ar': 'هل هذا الكورس مناسب للمبتدئين تماماً؟', 'answer_en': _faq_beginners_en('Basic programming knowledge is recommended but we start from fundamentals.'), 'answer_ar': _faq_beginners_ar('يُوصى بمعرفة أساسية بالبرمجة لكن نبدأ من الأساسيات.'), 'display_order': 0},
            {'question_en': 'Which technology path will I study?', 'question_ar': 'أي مسار تقني سأدرس؟', 'answer_en': 'Each cohort follows one technology path: Node.js, ASP.NET Core, or PHP & Laravel. The specific path is determined per cohort.', 'answer_ar': 'تتبع كل دفعة مسارًا تقنيًا واحدًا: Node.js أو ASP.NET Core أو PHP و Laravel. المسار المحدد يُحدد حسب الدفعة.', 'display_order': 1},
            {'question_en': 'Are the lectures live?', 'question_ar': 'هل المحاضرات مباشرة؟', 'answer_en': FAQ_LIVE_EN, 'answer_ar': FAQ_LIVE_AR, 'display_order': 2},
            {'question_en': 'Is there practical work?', 'question_ar': 'هل يوجد تطبيق عملي؟', 'answer_en': FAQ_PRACTICAL_EN, 'answer_ar': FAQ_PRACTICAL_AR, 'display_order': 3},
            {'question_en': 'Is there mentor support?', 'question_ar': 'هل يوجد إشراف ومتابعة؟', 'answer_en': FAQ_MENTOR_EN, 'answer_ar': FAQ_MENTOR_AR, 'display_order': 4},
            {'question_en': 'What are the certificate requirements?', 'question_ar': 'ما متطلبات الحصول على الشهادة؟', 'answer_en': FAQ_CERTIFICATE_EN, 'answer_ar': FAQ_CERTIFICATE_AR, 'display_order': 5},
            {'question_en': 'Are installments available?', 'question_ar': 'هل يتوفر تقسيط؟', 'answer_en': FAQ_INSTALLMENTS_EN, 'answer_ar': FAQ_INSTALLMENTS_AR, 'display_order': 6},
        ],
    },

    # ===================================================================
    # 3. FLUTTER DEVELOPMENT
    # ===================================================================
    {
        'slug': 'flutter-development',
        'title_en': 'Flutter Development',
        'title_ar': 'تطوير تطبيقات Flutter',
        'short_description_en': 'Build cross-platform mobile apps with Flutter and Dart. From widgets to state management to deployment in a 4-month program.',
        'short_description_ar': 'ابنِ تطبيقات موبايل متعددة المنصات بـ Flutter و Dart. من الـ widgets إلى إدارة الحالة إلى النشر في برنامج 4 شهور.',
        'overview_en': (
            "Flutter is Google's UI toolkit for building beautiful, natively compiled applications "
            "for mobile, web, and desktop from a single codebase. This program takes you from "
            "Dart fundamentals to building production-quality mobile applications.\n\n"
            "You will learn to create responsive UIs, manage state, integrate with REST APIs and "
            "Firebase, implement animations, and follow clean architecture principles. "
            "The program includes 2 mini apps, 1 integrated application, and 1 final production-style app."
        ),
        'overview_ar': (
            "Flutter هو أدوات Google لبناء تطبيقات جميلة ومترجمة أصليًا "
            "للموبايل والويب وسطح المكتب من كود واحد. يأخذك هذا البرنامج من "
            "أساسيات Dart إلى بناء تطبيقات موبايل بجودة الإنتاج.\n\n"
            "ستتعلم كيف تنشئ واجهات متجاوبة، وتدير الحالة، وتربط مع REST APIs و "
            "Firebase، وتطبق الرسوم المتحركة، وتتبع مبادئ البنية النظيفة. "
            "يتضمن البرنامج 2 تطبيقات مصغرة و 1 تطبيق متكامل و 1 تطبيق نهائي بأسلوب الإنتاج."
        ),
        'branch': 'professional',
        'status': 'active',
        'display_order': 120,
        'registration_open': True,
        'maximum_capacity': None,
        'registration_url': 'https://forms.gle/tjHRqBZrkNYtrWNL7',
        'image_file': 'flutter-development.webp',
        'landing': {
            'headline_en': 'Build beautiful cross-platform mobile apps from a single codebase',
            'headline_ar': 'ابنِ تطبيقات موبايل جميلة متعددة المنصات من كود واحد',
            'quick_facts': {
                'level': {'en': 'Beginner to Intermediate', 'ar': 'من مبتدئ إلى متوسط'},
                'trainingMode': {'en': 'Live Online Training', 'ar': 'تدريب مباشر عبر الإنترنت'},
                'language': {'en': 'English & Arabic', 'ar': 'الإنجليزية والعربية'},
                'practicalType': {'en': 'Mobile App Projects', 'ar': 'مشاريع تطبيقات موبايل'},
                'certificate': {'en': SHARED_CERTIFICATE_EN, 'ar': SHARED_CERTIFICATE_AR},
                'support': {'en': 'Mentor Support', 'ar': 'إشراف ومتابعة'},
                'duration': {'en': '4 Months', 'ar': '4 شهور'},
                'hasRecordings': True,
            },
            'current_price': 6000,
            'currency': 'EGP',
            'show_pricing': True,
            'target_audience': {
                'en': [
                    'Developers who want to build mobile apps',
                    'Frontend developers expanding to mobile',
                    'Computer science students interested in mobile development',
                    'Career switchers with basic programming knowledge',
                ],
                'ar': [
                    'المطورون الذين يريدون بناء تطبيقات موبايل',
                    'مطورو الواجهات الأمامية المتوسعون إلى الموبايل',
                    'طلاب علوم الحاسب المهتمون بتطوير الموبايل',
                    'المتحولون مهنياً مع معرفة أساسية بالبرمجة',
                ],
            },
            'prerequisites': {
                'en': [
                    'Basic programming knowledge (any language)',
                    'Understanding of variables, functions, and loops',
                    'A computer that can run Flutter SDK',
                ],
                'ar': [
                    'معرفة أساسية بالبرمجة (أي لغة)',
                    'فهم المتغيرات والدوال والحلقات',
                    'جهاز كمبيوتر يمكنه تشغيل Flutter SDK',
                ],
            },
            'tools': {
                'en': ['Dart', 'Flutter', 'VS Code or Android Studio', 'Git', 'Firebase'],
                'ar': ['Dart', 'Flutter', 'VS Code أو Android Studio', 'Git', 'Firebase'],
            },
            'practical_training_en': (
                "Hands-on mobile development with 2 mini apps, 1 integrated application, "
                "and 1 final production-style application. You will build real apps with "
                "APIs, state management, and Firebase integration."
            ),
            'practical_training_ar': (
                "تدريب عملي في تطوير الموبايل مع 2 تطبيقات مصغرة و 1 تطبيق متكامل "
                "و 1 تطبيق نهائي بأسلوب الإنتاج. ستبني تطبيقات حقيقية مع "
                "APIs وإدارة الحالة وربط Firebase."
            ),
            'final_project_en': (
                "Build a complete production-style mobile application with navigation, "
                "state management, REST API integration, Firebase authentication, "
                "and clean architecture. The app should be ready for app store deployment."
            ),
            'final_project_ar': (
                "ابنِ تطبيق موبايل كامل بأسلوب الإنتاج مع التنقل وإدارة الحالة "
                "وربط REST API ومصادقة Firebase والبنية النظيفة. "
                "يجب أن يكون التطبيق جاهزًا للنشر على متجر التطبيقات."
            ),
            'training_experience_en': SHARED_TRAINING_EXPERIENCE_EN,
            'training_experience_ar': SHARED_TRAINING_EXPERIENCE_AR,
            'mentor_info_en': SHARED_MENTOR_INFO_EN,
            'mentor_info_ar': SHARED_MENTOR_INFO_AR,
            'installments_available': True,
            'installments_info_en': SHARED_INSTALLMENTS_INFO_EN,
            'installments_info_ar': SHARED_INSTALLMENTS_INFO_AR,
            'included_items': {
                'en': ['Live interactive sessions', 'Mobile app projects', 'Mentor support', 'Session recordings (per policy)', 'Digital completion certificate'],
                'ar': ['جلسات مباشرة تفاعلية', 'مشاريع تطبيقات موبايل', 'إشراف ومتابعة', 'تسجيلات الجلسات (حسب السياسة)', 'شهادة إتمام رقمية'],
            },
            'seo_title_en': 'Flutter Development Course | Dart, Mobile Apps, Firebase | Sidrah Soft',
            'seo_title_ar': 'كورس تطوير تطبيقات Flutter | Dart, الموبايل, Firebase | Sidrah Soft',
            'seo_meta_description_en': 'Learn Flutter and Dart to build cross-platform mobile apps. Master widgets, state management, APIs, and Firebase in a 4-month live online program.',
            'seo_meta_description_ar': 'تعلّم Flutter و Dart لبناء تطبيقات موبايل متعددة المنصات. احترف الـ widgets وإدارة الحالة و APIs و Firebase في برنامج مباشر لمدة 4 شهور.',
            'seo_noindex': False,
            'show_registration_form': True,
        },
        'modules': [
            {
                'title_en': 'Dart Foundations',
                'title_ar': 'أساسيات Dart',
                'display_order': 0,
                'topics': [
                    {'title_en': 'Dart Fundamentals', 'title_ar': 'أساسيات Dart', 'display_order': 0},
                    {'title_en': 'Variables & Types', 'title_ar': 'المتغيرات والأنواع', 'display_order': 1},
                    {'title_en': 'Functions', 'title_ar': 'الدوال', 'display_order': 2},
                    {'title_en': 'Collections', 'title_ar': 'المجموعات', 'display_order': 3},
                    {'title_en': 'OOP with Dart', 'title_ar': 'البرمجة الكائنية بـ Dart', 'display_order': 4},
                    {'title_en': 'Null Safety', 'title_ar': 'Null Safety', 'display_order': 5},
                    {'title_en': 'Async Programming', 'title_ar': 'البرمجة غير المتزامنة', 'display_order': 6},
                ],
            },
            {
                'title_en': 'Flutter Fundamentals',
                'title_ar': 'أساسيات Flutter',
                'display_order': 1,
                'topics': [
                    {'title_en': 'Widgets', 'title_ar': 'Widgets', 'display_order': 0},
                    {'title_en': 'Layouts', 'title_ar': 'التخطيطات', 'display_order': 1},
                    {'title_en': 'Assets & Fonts', 'title_ar': 'الأصول والخطوط', 'display_order': 2},
                    {'title_en': 'Navigation', 'title_ar': 'التنقل', 'display_order': 3},
                    {'title_en': 'Forms', 'title_ar': 'النماذج', 'display_order': 4},
                    {'title_en': 'Responsive UI', 'title_ar': 'واجهات متجاوبة', 'display_order': 5},
                    {'title_en': 'Adaptive UI', 'title_ar': 'واجهات متكيفة', 'display_order': 6},
                ],
            },
            {
                'title_en': 'Application Development',
                'title_ar': 'تطوير التطبيقات',
                'display_order': 2,
                'topics': [
                    {'title_en': 'Networking & HTTP Requests', 'title_ar': 'الشبكات وطلبات HTTP', 'display_order': 0},
                    {'title_en': 'REST APIs', 'title_ar': 'REST APIs', 'display_order': 1},
                    {'title_en': 'JSON', 'title_ar': 'JSON', 'display_order': 2},
                    {'title_en': 'Local Storage', 'title_ar': 'التخزين المحلي', 'display_order': 3},
                    {'title_en': 'State Management', 'title_ar': 'إدارة الحالة', 'display_order': 4},
                    {'title_en': 'Reactive Programming', 'title_ar': 'البرمجة التفاعلية', 'display_order': 5},
                    {'title_en': 'Animations', 'title_ar': 'الرسوم المتحركة', 'display_order': 6},
                ],
            },
            {
                'title_en': 'Engineering Practices',
                'title_ar': 'الممارسات الهندسية',
                'display_order': 3,
                'topics': [
                    {'title_en': 'SOLID Principles', 'title_ar': 'مبادئ SOLID', 'display_order': 0},
                    {'title_en': 'Dependency Injection', 'title_ar': 'حقن التبعيات', 'display_order': 1},
                    {'title_en': 'Clean Architecture', 'title_ar': 'البنية النظيفة', 'display_order': 2},
                    {'title_en': 'Error Handling', 'title_ar': 'معالجة الأخطاء', 'display_order': 3},
                    {'title_en': 'Testing', 'title_ar': 'الاختبار', 'display_order': 4},
                    {'title_en': 'Git & GitHub', 'title_ar': 'Git و GitHub', 'display_order': 5},
                ],
            },
            {
                'title_en': 'Backend Services & Advanced Integration',
                'title_ar': 'خدمات الخادم والتكامل المتقدم',
                'display_order': 4,
                'topics': [
                    {'title_en': 'Firebase Fundamentals', 'title_ar': 'أساسيات Firebase', 'display_order': 0},
                    {'title_en': 'Authentication', 'title_ar': 'المصادقة', 'display_order': 1},
                    {'title_en': 'Cloud Services', 'title_ar': 'الخدمات السحابية', 'display_order': 2},
                    {'title_en': 'Crash Reporting / Crashlytics', 'title_ar': 'تقارير الأعطال / Crashlytics', 'display_order': 3},
                    {'title_en': 'Notifications Fundamentals', 'title_ar': 'أساسيات الإشعارات', 'display_order': 4},
                    {'title_en': 'Native Integration', 'title_ar': 'التكامل الأصلي', 'display_order': 5},
                    {'title_en': 'App Deployment Fundamentals', 'title_ar': 'أساسيات نشر التطبيقات', 'display_order': 6},
                ],
            },
        ],
        'faqs': [
            {'question_en': 'Is this course suitable for complete beginners?', 'question_ar': 'هل هذا الكورس مناسب للمبتدئين تماماً؟', 'answer_en': _faq_beginners_en('Basic programming knowledge in any language is recommended.'), 'answer_ar': _faq_beginners_ar('يُوصى بمعرفة أساسية بالبرمجة بأي لغة.'), 'display_order': 0},
            {'question_en': 'Are the lectures live?', 'question_ar': 'هل المحاضرات مباشرة؟', 'answer_en': FAQ_LIVE_EN, 'answer_ar': FAQ_LIVE_AR, 'display_order': 1},
            {'question_en': 'Are session recordings available?', 'question_ar': 'هل تتوفر تسجيلات للجلسات؟', 'answer_en': FAQ_RECORDINGS_EN, 'answer_ar': FAQ_RECORDINGS_AR, 'display_order': 2},
            {'question_en': 'Is there practical work?', 'question_ar': 'هل يوجد تطبيق عملي؟', 'answer_en': FAQ_PRACTICAL_EN, 'answer_ar': FAQ_PRACTICAL_AR, 'display_order': 3},
            {'question_en': 'Is there mentor support?', 'question_ar': 'هل يوجد إشراف ومتابعة؟', 'answer_en': FAQ_MENTOR_EN, 'answer_ar': FAQ_MENTOR_AR, 'display_order': 4},
            {'question_en': 'What are the certificate requirements?', 'question_ar': 'ما متطلبات الحصول على الشهادة؟', 'answer_en': FAQ_CERTIFICATE_EN, 'answer_ar': FAQ_CERTIFICATE_AR, 'display_order': 5},
            {'question_en': 'Are installments available?', 'question_ar': 'هل يتوفر تقسيط؟', 'answer_en': FAQ_INSTALLMENTS_EN, 'answer_ar': FAQ_INSTALLMENTS_AR, 'display_order': 6},
        ],
    },

    # ===================================================================
    # 4. BASIC PYTHON
    # ===================================================================
    {
        'slug': 'basic-python',
        'title_en': 'Basic Python',
        'title_ar': 'أساسيات Python',
        'short_description_en': 'Learn Python from scratch. Variables, data types, functions, OOP, and problem solving in a focused 2-month program.',
        'short_description_ar': 'تعلّم Python من الصفر. المتغيرات وأنواع البيانات والدوال والبرمجة الكائنية وحل المشكلات في برنامج مركّز لمدة شهرين.',
        'overview_en': (
            "Python is one of the most popular and versatile programming languages in the world. "
            "This program teaches you Python from the ground up — no prior programming experience needed.\n\n"
            "You will learn the core building blocks of programming: variables, data types, conditions, "
            "loops, functions, data structures, error handling, modules, and OOP fundamentals. "
            "The program focuses on building a solid foundation that you can apply to any Python path "
            "— whether that's data analysis, automation, backend development, or AI.\n\n"
            "This is a foundational Python course. It does not cover data analysis libraries like "
            "Pandas or NumPy — those belong in the Data Analysis program."
        ),
        'overview_ar': (
            "Python واحدة من أشهر لغات البرمجة وأكثرها تنوعًا في العالم. "
            "هذا البرنامج يعلمك Python من الأساس — لا تحتاج إلى خبرة برمجية سابقة.\n\n"
            "ستتعلم اللبنات الأساسية للبرمجة: المتغيرات وأنواع البيانات والشروط "
            "والحلقات والدوال وهياكل البيانات ومعالجة الأخطاء والوحدات "
            "وأساسيات البرمجة الكائنية. يركّز البرنامج على بناء أساس متين يمكنك تطبيقه "
            "في أي مسار Python — سواء كان تحليل البيانات أو الأتمتة أو تطوير الواجهة الخلفية أو الذكاء الاصطناعي.\n\n"
            "هذا كورس أساسي في Python. لا يغطي مكتبات تحليل البيانات مثل "
            "Pandas أو NumPy — هذه تنتمي إلى برنامج تحليل البيانات."
        ),
        'branch': 'professional',
        'status': 'active',
        'display_order': 130,
        'registration_open': True,
        'maximum_capacity': None,
        'registration_url': 'https://forms.gle/tjHRqBZrkNYtrWNL7',
        'image_file': 'basic-python.webp',
        'landing': {
            'headline_en': 'Start your programming journey with the world\'s most versatile language',
            'headline_ar': 'ابدأ رحلتك في البرمجة مع أكثر لغات العالم تنوعًا',
            'quick_facts': {
                'level': {'en': 'Complete Beginner', 'ar': 'مبتدئ تماماً'},
                'trainingMode': {'en': 'Live Online Training', 'ar': 'تدريب مباشر عبر الإنترنت'},
                'language': {'en': 'English & Arabic', 'ar': 'الإنجليزية والعربية'},
                'practicalType': {'en': 'Exercises & Mini Projects', 'ar': 'تمارين ومشاريع مصغرة'},
                'certificate': {'en': SHARED_CERTIFICATE_EN, 'ar': SHARED_CERTIFICATE_AR},
                'support': {'en': 'Mentor Support', 'ar': 'إشراف ومتابعة'},
                'duration': {'en': '2 Months', 'ar': 'شهران'},
                'hasRecordings': True,
            },
            'current_price': 6000,
            'currency': 'EGP',
            'show_pricing': True,
            'target_audience': {
                'en': [
                    'Complete beginners with no programming experience',
                    'Students preparing for data analysis or AI programs',
                    'Professionals who need Python for automation or scripting',
                    'Anyone curious about programming',
                ],
                'ar': [
                    'المبتدئون تماماً بدون خبرة في البرمجة',
                    'الطلاب المستعدون لبرامج تحليل البيانات أو الذكاء الاصطناعي',
                    'المحترفون الذين يحتاجون Python للأتمتة أو السكريبت',
                    'أي شخص فضولي عن البرمجة',
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
                'en': ['Python 3', 'VS Code', 'Git'],
                'ar': ['Python 3', 'VS Code', 'Git'],
            },
            'practical_training_en': (
                "Programming exercises throughout the program plus 2 mini projects "
                "and 1 final Python project. You will solve problems, build small "
                "applications, and practice real coding skills."
            ),
            'practical_training_ar': (
                "تمارين برمجية طوال البرنامج بالإضافة إلى 2 مشاريع مصغرة "
                "و 1 مشروع نهائي بـ Python. ستحل المشكلات وتبني تطبيقات صغيرة "
                "وتتدرب على مهارات البرمجة الحقيقية."
            ),
            'final_project_en': (
                "Build a complete Python application that demonstrates your understanding "
                "of the core concepts: variables, data structures, functions, OOP, "
                "file handling, and error handling."
            ),
            'final_project_ar': (
                "ابنِ تطبيق Python كامل يوضح فهمك للمفاهيم الأساسية: "
                "المتغيرات وهياكل البيانات والدوال والبرمجة الكائنية "
                " ومعالجة الملفات والأخطاء."
            ),
            'training_experience_en': SHARED_TRAINING_EXPERIENCE_EN,
            'training_experience_ar': SHARED_TRAINING_EXPERIENCE_AR,
            'mentor_info_en': SHARED_MENTOR_INFO_EN,
            'mentor_info_ar': SHARED_MENTOR_INFO_AR,
            'installments_available': True,
            'installments_info_en': SHARED_INSTALLMENTS_INFO_EN,
            'installments_info_ar': SHARED_INSTALLMENTS_INFO_AR,
            'included_items': {
                'en': ['Live interactive sessions', 'Programming exercises', 'Mentor support', 'Session recordings (per policy)', 'Digital completion certificate'],
                'ar': ['جلسات مباشرة تفاعلية', 'تمارين برمجية', 'إشراف ومتابعة', 'تسجيلات الجلسات (حسب السياسة)', 'شهادة إتمام رقمية'],
            },
            'seo_title_en': 'Basic Python Course | Programming Fundamentals | Sidrah Soft',
            'seo_title_ar': 'كورس أساسيات Python | أساسيات البرمجة | Sidrah Soft',
            'seo_meta_description_en': 'Learn Python from scratch with no prior experience. Master variables, functions, OOP, and problem solving in a 2-month live online program.',
            'seo_meta_description_ar': 'تعلّم Python من الصفر بدون خبرة سابقة. احترف المتغيرات والدوال والبرمجة الكائنية وحل المشكلات في برنامج مباشر لمدة شهرين.',
            'seo_noindex': False,
            'show_registration_form': True,
        },
        'modules': [
            {
                'title_en': 'Python Fundamentals',
                'title_ar': 'أساسيات Python',
                'display_order': 0,
                'topics': [
                    {'title_en': 'Introduction to Programming', 'title_ar': 'مقدمة في البرمجة', 'display_order': 0},
                    {'title_en': 'Python Environment Setup', 'title_ar': 'إعداد بيئة Python', 'display_order': 1},
                    {'title_en': 'Variables', 'title_ar': 'المتغيرات', 'display_order': 2},
                    {'title_en': 'Data Types', 'title_ar': 'أنواع البيانات', 'display_order': 3},
                    {'title_en': 'Operators', 'title_ar': 'العوامل', 'display_order': 4},
                    {'title_en': 'Conditions', 'title_ar': 'الشروط', 'display_order': 5},
                    {'title_en': 'Loops', 'title_ar': 'الحلقات', 'display_order': 6},
                ],
            },
            {
                'title_en': 'Functions & Data Structures',
                'title_ar': 'الدوال وهياكل البيانات',
                'display_order': 1,
                'topics': [
                    {'title_en': 'Functions', 'title_ar': 'الدوال', 'display_order': 0},
                    {'title_en': 'Strings', 'title_ar': 'النصوص', 'display_order': 1},
                    {'title_en': 'Lists', 'title_ar': 'القوائم', 'display_order': 2},
                    {'title_en': 'Tuples', 'title_ar': 'Tuples', 'display_order': 3},
                    {'title_en': 'Sets', 'title_ar': 'المجموعات', 'display_order': 4},
                    {'title_en': 'Dictionaries', 'title_ar': 'القواميس', 'display_order': 5},
                ],
            },
            {
                'title_en': 'Error Handling, Modules & OOP',
                'title_ar': 'معالجة الأخطاء والوحدات والبرمجة الكائنية',
                'display_order': 2,
                'topics': [
                    {'title_en': 'Files', 'title_ar': 'الملفات', 'display_order': 0},
                    {'title_en': 'Error Handling', 'title_ar': 'معالجة الأخطاء', 'display_order': 1},
                    {'title_en': 'Exception Handling', 'title_ar': 'معالجة الاستثناءات', 'display_order': 2},
                    {'title_en': 'Modules', 'title_ar': 'الوحدات', 'display_order': 3},
                    {'title_en': 'Packages', 'title_ar': 'الحزم', 'display_order': 4},
                    {'title_en': 'OOP Fundamentals', 'title_ar': 'أساسيات البرمجة الكائنية', 'display_order': 5},
                ],
            },
            {
                'title_en': 'Problem Solving & Tools',
                'title_ar': 'حل المشكلات والأدوات',
                'display_order': 3,
                'topics': [
                    {'title_en': 'Problem Solving with Python', 'title_ar': 'حل المشكلات بـ Python', 'display_order': 0},
                    {'title_en': 'External Packages Fundamentals', 'title_ar': 'أساسيات الحزم الخارجية', 'display_order': 1},
                    {'title_en': 'Git Fundamentals', 'title_ar': 'أساسيات Git', 'display_order': 2},
                ],
            },
        ],
        'faqs': [
            {'question_en': 'Is this course suitable for complete beginners?', 'question_ar': 'هل هذا الكورس مناسب للمبتدئين تماماً؟', 'answer_en': _faq_beginners_en(), 'answer_ar': _faq_beginners_ar(), 'display_order': 0},
            {'question_en': 'Will I learn data analysis in this course?', 'question_ar': 'هل سأتعلّم تحليل البيانات في هذا الكورس؟', 'answer_en': 'No, this is a foundational Python course. Data analysis with Pandas, NumPy, and visualization tools is covered in our separate Data Analysis program.', 'answer_ar': 'لا، هذا كورس أساسي في Python. تحليل البيانات بـ Pandas و NumPy وأدوات التصور يُغطى في برنامج تحليل البيانات المنفصل.', 'display_order': 1},
            {'question_en': 'Are the lectures live?', 'question_ar': 'هل المحاضرات مباشرة؟', 'answer_en': FAQ_LIVE_EN, 'answer_ar': FAQ_LIVE_AR, 'display_order': 2},
            {'question_en': 'Is there practical work?', 'question_ar': 'هل يوجد تطبيق عملي؟', 'answer_en': FAQ_PRACTICAL_EN, 'answer_ar': FAQ_PRACTICAL_AR, 'display_order': 3},
            {'question_en': 'Is there mentor support?', 'question_ar': 'هل يوجد إشراف ومتابعة؟', 'answer_en': FAQ_MENTOR_EN, 'answer_ar': FAQ_MENTOR_AR, 'display_order': 4},
            {'question_en': 'Are installments available?', 'question_ar': 'هل يتوفر تقسيط؟', 'answer_en': FAQ_INSTALLMENTS_EN, 'answer_ar': FAQ_INSTALLMENTS_AR, 'display_order': 5},
        ],
    },

    # ===================================================================
    # 5. C++ PROGRAMMING FUNDAMENTALS
    # ===================================================================
    {
        'slug': 'cpp-programming',
        'title_en': 'C++ Programming Fundamentals',
        'title_ar': 'أساسيات برمجة C++',
        'short_description_en': 'Master C++ from syntax to OOP. Build a strong programming foundation in 10 weeks with problem sets and mini projects.',
        'short_description_ar': 'احترف C++ من القواعد إلى البرمجة الكائنية. ابنِ أساسًا برمجيًا قويًا في 10 أسابيع مع مسائل ومشاريع مصغرة.',
        'overview_en': (
            "C++ is the language that built operating systems, game engines, and high-performance "
            "applications. This program teaches you C++ from the fundamentals, giving you a "
            "strong programming foundation that transfers to any language.\n\n"
            "You will learn programming fundamentals, problem-solving techniques, object-oriented "
            "programming, and an introduction to data structures. The program is designed as a "
            "focused 10-week course with continuous problem sets and 2 mini projects.\n\n"
            "This is an introductory C++ course — it is not a duplicate of the Problem Solving & "
            "Data Structures program, which goes deeper into algorithms and advanced data structures."
        ),
        'overview_ar': (
            "C++ هي اللغة التي بُنيت بها أنظمة التشغيل ومحركات الألعاب والتطبيقات عالية الأداء. "
            "هذا البرنامج يعلمك C++ من الأساسيات، ويمنحك أساسًا برمجيًا قويًا "
            "ينتقل إلى أي لغة أخرى.\n\n"
            "ستتعلم أساسيات البرمجة وتقنيات حل المشكلات والبرمجة الكائنية "
            "ومقدمة في هياكل البيانات. صُمم البرنامج ككورس مركّز لمدة 10 أسابيع "
            "مع مسائل مستمرة و 2 مشاريع مصغرة.\n\n"
            "هذا كورس تمهيدي في C++ — وهو ليس نسخة مكررة من برنامج حل المشكلات "
            "وهياكل البيانات، الذي يتعمق في الخوارزميات وهياكل البيانات المتقدمة."
        ),
        'branch': 'professional',
        'status': 'active',
        'display_order': 140,
        'registration_open': True,
        'maximum_capacity': None,
        'registration_url': 'https://forms.gle/tjHRqBZrkNYtrWNL7',
        'image_file': 'cpp-programming.webp',
        'landing': {
            'headline_en': 'Master the language that built operating systems and game engines',
            'headline_ar': 'احترف اللغة التي بُنيت بها أنظمة التشغيل ومحركات الألعاب',
            'quick_facts': {
                'level': {'en': 'Beginner', 'ar': 'مبتدئ'},
                'trainingMode': {'en': 'Live Online Training', 'ar': 'تدريب مباشر عبر الإنترنت'},
                'language': {'en': 'English & Arabic', 'ar': 'الإنجليزية والعربية'},
                'practicalType': {'en': 'Problem Sets & Mini Projects', 'ar': 'مسائل ومشاريع مصغرة'},
                'certificate': {'en': SHARED_CERTIFICATE_EN, 'ar': SHARED_CERTIFICATE_AR},
                'support': {'en': 'Mentor Support', 'ar': 'إشراف ومتابعة'},
                'duration': {'en': '10 Weeks (~2.5 Months)', 'ar': '10 أسابيع (~2.5 شهور)'},
                'hasRecordings': True,
            },
            'current_price': 6000,
            'currency': 'EGP',
            'show_pricing': True,
            'target_audience': {
                'en': [
                    'Complete beginners who want a strong programming foundation',
                    'University students studying C++ in their curriculum',
                    'Students preparing for Problem Solving & Data Structures',
                    'Anyone interested in systems programming or game development',
                ],
                'ar': [
                    'المبتدئون تماماً الذين يريدون أساسًا برمجيًا قويًا',
                    'طلاب الجامعات الذين يدرسون C++ في مناهجهم',
                    'الطلاب المستعدون لبرنامج حل المشكلات وهياكل البيانات',
                    'كل من يهتم ببرمجة الأنظمة أو تطوير الألعاب',
                ],
            },
            'prerequisites': {
                'en': [
                    'No prior programming experience required',
                    'Basic computer literacy',
                    'A computer with internet access',
                ],
                'ar': [
                    'لا تشترط خبرة برمجية سابقة',
                    'معرفة أساسية باستخدام الحاسوب',
                    'جهاز كمبيوتر مع اتصال بالإنترنت',
                ],
            },
            'tools': {
                'en': ['C++', 'GCC or Clang or MSVC', 'VS Code or Visual Studio', 'Git'],
                'ar': ['C++', 'GCC أو Clang أو MSVC', 'VS Code أو Visual Studio', 'Git'],
            },
            'practical_training_en': (
                "Continuous problem sets throughout the program plus 2 mini projects. "
                "You will practice writing clean C++ code, debugging, and applying "
                "OOP principles to real problems."
            ),
            'practical_training_ar': (
                "مسائل مستمرة طوال البرنامج بالإضافة إلى 2 مشاريع مصغرة. "
                "ستتدرب على كتابة كود C++ نظيف وتصحيح الأخطاء وتطبيق "
                "مبادئ البرمجة الكائنية على مشكلات حقيقية."
            ),
            'final_project_en': (
                "Build a C++ application that demonstrates your understanding of programming "
                "fundamentals, OOP concepts, and basic data structures. The project should "
                "showcase clean code and proper error handling."
            ),
            'final_project_ar': (
                "ابنِ تطبيق C++ يوضح فهمك لأساسيات البرمجة ومفاهيم البرمجة الكائنية "
                "وهياكل البيانات الأساسية. يجب أن يُظهر المشروع كودًا نظيفًا "
                "ومعالجة صحيحة للأخطاء."
            ),
            'training_experience_en': SHARED_TRAINING_EXPERIENCE_EN,
            'training_experience_ar': SHARED_TRAINING_EXPERIENCE_AR,
            'mentor_info_en': SHARED_MENTOR_INFO_EN,
            'mentor_info_ar': SHARED_MENTOR_INFO_AR,
            'installments_available': True,
            'installments_info_en': SHARED_INSTALLMENTS_INFO_EN,
            'installments_info_ar': SHARED_INSTALLMENTS_INFO_AR,
            'included_items': {
                'en': ['Live interactive sessions', 'Problem sets', 'Mentor support', 'Session recordings (per policy)', 'Digital completion certificate'],
                'ar': ['جلسات مباشرة تفاعلية', 'مسائل', 'إشراف ومتابعة', 'تسجيلات الجلسات (حسب السياسة)', 'شهادة إتمام رقمية'],
            },
            'seo_title_en': 'C++ Programming Course | Fundamentals, OOP, STL | Sidrah Soft',
            'seo_title_ar': 'كورس برمجة C++ | الأساسيات، البرمجة الكائنية | Sidrah Soft',
            'seo_meta_description_en': 'Learn C++ from scratch. Master programming fundamentals, OOP, and data structures introduction in a 10-week live online program with problem sets and mini projects.',
            'seo_meta_description_ar': 'تعلّم C++ من الصفر. احترف أساسيات البرمجة والبرمجة الكائنية ومقدمة هياكل البيانات في برنامج مباشر لمدة 10 أسابيع مع مسائل ومشاريع مصغرة.',
            'seo_noindex': False,
            'show_registration_form': True,
        },
        'modules': [
            {
                'title_en': 'Programming Fundamentals',
                'title_ar': 'أساسيات البرمجة',
                'display_order': 0,
                'topics': [
                    {'title_en': 'How Programs Work', 'title_ar': 'كيف تعمل البرامج', 'display_order': 0},
                    {'title_en': 'Variables', 'title_ar': 'المتغيرات', 'display_order': 1},
                    {'title_en': 'Data Types', 'title_ar': 'أنواع البيانات', 'display_order': 2},
                    {'title_en': 'Operators', 'title_ar': 'العوامل', 'display_order': 3},
                    {'title_en': 'Conditions', 'title_ar': 'الشروط', 'display_order': 4},
                    {'title_en': 'Loops', 'title_ar': 'الحلقات', 'display_order': 5},
                    {'title_en': 'Functions', 'title_ar': 'الدوال', 'display_order': 6},
                    {'title_en': 'Arrays', 'title_ar': 'المصفوفات', 'display_order': 7},
                    {'title_en': 'Strings', 'title_ar': 'النصوص', 'display_order': 8},
                    {'title_en': 'References', 'title_ar': 'المراجع', 'display_order': 9},
                    {'title_en': 'Pointers Fundamentals', 'title_ar': 'أساسيات المؤشرات', 'display_order': 10},
                ],
            },
            {
                'title_en': 'Problem Solving Fundamentals',
                'title_ar': 'أساسيات حل المشكلات',
                'display_order': 1,
                'topics': [
                    {'title_en': 'Breaking Problems into Steps', 'title_ar': 'تقسيم المشكلات إلى خطوات', 'display_order': 0},
                    {'title_en': 'Algorithmic Thinking', 'title_ar': 'التفكير الخوارزمي', 'display_order': 1},
                    {'title_en': 'Writing Clean Solutions', 'title_ar': 'كتابة حلول نظيفة', 'display_order': 2},
                    {'title_en': 'Debugging', 'title_ar': 'تصحيح الأخطاء', 'display_order': 3},
                ],
            },
            {
                'title_en': 'Object-Oriented Programming',
                'title_ar': 'البرمجة الكائنية',
                'display_order': 2,
                'topics': [
                    {'title_en': 'Classes', 'title_ar': 'الفئات', 'display_order': 0},
                    {'title_en': 'Objects', 'title_ar': 'الكائنات', 'display_order': 1},
                    {'title_en': 'Encapsulation', 'title_ar': 'التغليف', 'display_order': 2},
                    {'title_en': 'Inheritance', 'title_ar': 'الوراثة', 'display_order': 3},
                    {'title_en': 'Polymorphism', 'title_ar': 'تعدد الأشكال', 'display_order': 4},
                    {'title_en': 'Abstraction', 'title_ar': 'التجريد', 'display_order': 5},
                ],
            },
            {
                'title_en': 'Data Structures Introduction',
                'title_ar': 'مقدمة في هياكل البيانات',
                'display_order': 3,
                'description_en': 'An introduction only — not a replacement for the Problem Solving & Data Structures program.',
                'description_ar': 'مقدمة فقط — ليست بديلاً عن برنامج حل المشكلات وهياكل البيانات.',
                'topics': [
                    {'title_en': 'Arrays', 'title_ar': 'المصفوفات', 'display_order': 0},
                    {'title_en': 'Linked Lists', 'title_ar': 'القوائم المترابطة', 'display_order': 1},
                    {'title_en': 'Stacks', 'title_ar': 'المكدسات', 'display_order': 2},
                    {'title_en': 'Queues', 'title_ar': 'الطوابير', 'display_order': 3},
                ],
            },
        ],
        'faqs': [
            {'question_en': 'Is this course suitable for complete beginners?', 'question_ar': 'هل هذا الكورس مناسب للمبتدئين تماماً؟', 'answer_en': _faq_beginners_en(), 'answer_ar': _faq_beginners_ar(), 'display_order': 0},
            {'question_en': 'How is this different from Problem Solving & Data Structures?', 'question_ar': 'كيف يختلف هذا عن حل المشكلات وهياكل البيانات؟', 'answer_en': 'This course teaches C++ fundamentals and OOP. Problem Solving & Data Structures goes deeper into algorithms, complexity analysis, and advanced data structures like trees, heaps, and graphs.', 'answer_ar': 'هذا الكورس يعلم أساسيات C++ والبرمجة الكائنية. برنامج حل المشكلات وهياكل البيانات يتعمق في الخوارزميات وتحليل التعقيد وهياكل البيانات المتقدمة مثل الأشجار والأكوام والرسوم.', 'display_order': 1},
            {'question_en': 'Are the lectures live?', 'question_ar': 'هل المحاضرات مباشرة؟', 'answer_en': FAQ_LIVE_EN, 'answer_ar': FAQ_LIVE_AR, 'display_order': 2},
            {'question_en': 'Is there practical work?', 'question_ar': 'هل يوجد تطبيق عملي؟', 'answer_en': FAQ_PRACTICAL_EN, 'answer_ar': FAQ_PRACTICAL_AR, 'display_order': 3},
            {'question_en': 'Is there mentor support?', 'question_ar': 'هل يوجد إشراف ومتابعة؟', 'answer_en': FAQ_MENTOR_EN, 'answer_ar': FAQ_MENTOR_AR, 'display_order': 4},
            {'question_en': 'Are installments available?', 'question_ar': 'هل يتوفر تقسيط؟', 'answer_en': FAQ_INSTALLMENTS_EN, 'answer_ar': FAQ_INSTALLMENTS_AR, 'display_order': 5},
        ],
    },

    # ===================================================================
    # 6. PROBLEM SOLVING & DATA STRUCTURES
    # ===================================================================
    {
        'slug': 'problem-solving-data-structures',
        'title_en': 'Problem Solving & Data Structures using C++',
        'title_ar': 'حل المشكلات وهياكل البيانات باستخدام C++',
        'short_description_en': 'Master data structures, algorithms, and problem-solving patterns. Arrays, trees, graphs, sorting, recursion, and more in a 3-month program.',
        'short_description_ar': 'احترف هياكل البيانات والخوارزميات وأنماط حل المشكلات. المصفوفات والأشجار والرسوم والترتيب والاستدعاء الذاتي والمزيد في برنامج 3 شهور.',
        'overview_en': (
            "Problem solving is the core skill that separates good programmers from great ones. "
            "This program focuses on data structures, algorithms, and the problem-solving patterns "
            "that are essential for technical interviews and competitive programming.\n\n"
            "You will learn complexity analysis, work with a wide range of data structures from "
            "arrays to graphs, and master problem-solving patterns like two pointers, sliding window, "
            "binary search, and recursion. The program is practice-heavy — you will solve structured "
            "problem sets, coding challenges, and implement data structures from scratch.\n\n"
            "This is not a traditional project-based course. It relies on coding problems and "
            "implementations rather than building applications."
        ),
        'overview_ar': (
            "حل المشكلات هو المهارة الأساسية التي تميز المبرمجين الجيدين عن العظماء. "
            "يركز هذا البرنامج على هياكل البيانات والخوارزميات وأنماط حل المشكلات "
            "الضرورية للمقابلات التقنية والبرمجة التنافسية.\n\n"
            "ستتعلم تحليل التعقيد، وتعمل مع مجموعة واسعة من هياكل البيانات من "
            "المصفوفات إلى الرسوم، وتحترف أنماط حل المشكلات مثل المؤشرين والنافذة المنزلقة "
            "والبحث الثنائي والاستدعاء الذاتي. البرنامج عملي بكثافة — ستحل مسائل منظمة "
            "وتحديات برمجية وتطبق هياكل البيانات من الصفر.\n\n"
            "هذا ليس كورسًا تقليديًا قائمًا على المشاريع. يعتمد على مسائل البرمجة "
            "والتطبيقات بدل بناء التطبيقات."
        ),
        'branch': 'professional',
        'status': 'active',
        'display_order': 150,
        'registration_open': True,
        'maximum_capacity': None,
        'registration_url': 'https://forms.gle/tjHRqBZrkNYtrWNL7',
        'image_file': 'problem-solving-data-structures.webp',
        'landing': {
            'headline_en': 'Train your mind to solve any coding problem with confidence',
            'headline_ar': 'درّب عقلك على حل أي مشكلة برمجية بثقة',
            'quick_facts': {
                'level': {'en': 'Intermediate', 'ar': 'متوسط'},
                'trainingMode': {'en': 'Live Online Training', 'ar': 'تدريب مباشر عبر الإنترنت'},
                'language': {'en': 'English & Arabic', 'ar': 'الإنجليزية والعربية'},
                'practicalType': {'en': 'Coding Problems & Challenges', 'ar': 'مسائل وتحديات برمجية'},
                'certificate': {'en': SHARED_CERTIFICATE_EN, 'ar': SHARED_CERTIFICATE_AR},
                'support': {'en': 'Mentor Support', 'ar': 'إشراف ومتابعة'},
                'duration': {'en': '3 Months', 'ar': '3 شهور'},
                'hasRecordings': True,
            },
            'current_price': 6000,
            'currency': 'EGP',
            'show_pricing': True,
            'target_audience': {
                'en': [
                    'Programmers with basic C++ or programming knowledge',
                    'Students preparing for technical interviews',
                    'Developers who want to strengthen their algorithmic thinking',
                    'Competitive programming enthusiasts',
                ],
                'ar': [
                    'المبرمجون بمعرفة أساسية بـ C++ أو البرمجة',
                    'الطلاب المستعدون للمقابلات التقنية',
                    'المطورون الذين يريدون تعزيز تفكيرهم الخوارزمي',
                    'هواة البرمجة التنافسية',
                ],
            },
            'prerequisites': {
                'en': [
                    'Basic programming fundamentals preferred (variables, loops, functions)',
                    'Familiarity with C++ syntax is helpful but not strictly required',
                    'Willingness to solve many coding problems',
                ],
                'ar': [
                    'يُفضل معرفة أساسيات البرمجة (المتغيرات، الحلقات، الدوال)',
                    'الإلمام بقواعد C++ مفيد لكن ليس إلزاميًا',
                    'الاستعداد لحل الكثير من المسائل البرمجية',
                ],
            },
            'tools': {
                'en': ['C++', 'GCC or Clang', 'VS Code', 'Online Judges'],
                'ar': ['C++', 'GCC أو Clang', 'VS Code', 'منصات المسائل البرمجية'],
            },
            'practical_training_en': (
                "Structured problem sets, coding challenges, and data structure implementations "
                "throughout the program. You will solve hundreds of problems, implement data "
                "structures from scratch, and complete a final problem-solving challenge. "
                "This program does not follow a traditional project-based model."
            ),
            'practical_training_ar': (
                "مسائل منظمة وتحديات برمجية وتطبيقات هياكل البيانات "
                "طوال البرنامج. ستحل مئات المسائل، وتطبق هياكل البيانات من الصفر، "
                "وتكمل تحديًا نهائيًا لحل المشكلات. "
                "هذا البرنامج لا يتبع نموذج المشاريع التقليدي."
            ),
            'final_project_en': (
                "Complete a final problem-solving challenge that demonstrates your ability "
                "to analyze complexity, choose appropriate data structures, and implement "
                "efficient algorithms under time constraints."
            ),
            'final_project_ar': (
                "أكمل تحديًا نهائيًا لحل المشكلات يوضح قدرتك على "
                "تحليل التعقيد واختيار هياكل البيانات المناسبة وتطبيق "
                "خوارزميات كفؤة ضمن قيود الوقت."
            ),
            'training_experience_en': SHARED_TRAINING_EXPERIENCE_EN,
            'training_experience_ar': SHARED_TRAINING_EXPERIENCE_AR,
            'mentor_info_en': SHARED_MENTOR_INFO_EN,
            'mentor_info_ar': SHARED_MENTOR_INFO_AR,
            'installments_available': True,
            'installments_info_en': SHARED_INSTALLMENTS_INFO_EN,
            'installments_info_ar': SHARED_INSTALLMENTS_INFO_AR,
            'included_items': {
                'en': ['Live interactive sessions', 'Structured problem sets', 'Mentor support', 'Session recordings (per policy)', 'Digital completion certificate'],
                'ar': ['جلسات مباشرة تفاعلية', 'مسائل منظمة', 'إشراف ومتابعة', 'تسجيلات الجلسات (حسب السياسة)', 'شهادة إتمام رقمية'],
            },
            'seo_title_en': 'Problem Solving & Data Structures with C++ | Interview Prep | Sidrah Soft',
            'seo_title_ar': 'حل المشكلات وهياكل البيانات بـ C++ | تجهيز المقابلات | Sidrah Soft',
            'seo_meta_description_en': 'Master data structures, algorithms, and problem-solving patterns with C++. Arrays, trees, graphs, sorting, recursion, and interview preparation in a 3-month program.',
            'seo_meta_description_ar': 'احترف هياكل البيانات والخوارزميات وأنماط حل المشكلات بـ C++. المصفوفات والأشجار والرسوم والترتيب والاستدعاء الذاتي وتجهيز المقابلات في برنامج 3 شهور.',
            'seo_noindex': False,
            'show_registration_form': True,
        },
        'modules': [
            {
                'title_en': 'Complexity Analysis',
                'title_ar': 'تحليل التعقيد',
                'display_order': 0,
                'topics': [
                    {'title_en': 'Time Complexity', 'title_ar': 'تعقيد الوقت', 'display_order': 0},
                    {'title_en': 'Space Complexity', 'title_ar': 'تعقيد المساحة', 'display_order': 1},
                    {'title_en': 'Big O Fundamentals', 'title_ar': 'أساسيات Big O', 'display_order': 2},
                ],
            },
            {
                'title_en': 'Data Structures',
                'title_ar': 'هياكل البيانات',
                'display_order': 1,
                'topics': [
                    {'title_en': 'Arrays', 'title_ar': 'المصفوفات', 'display_order': 0},
                    {'title_en': 'Strings', 'title_ar': 'النصوص', 'display_order': 1},
                    {'title_en': 'Linked Lists', 'title_ar': 'القوائم المترابطة', 'display_order': 2},
                    {'title_en': 'Stacks', 'title_ar': 'المكدسات', 'display_order': 3},
                    {'title_en': 'Queues', 'title_ar': 'الطوابير', 'display_order': 4},
                    {'title_en': 'Hash Tables / Maps', 'title_ar': 'جداول التجزئة / الخرائط', 'display_order': 5},
                    {'title_en': 'Sets', 'title_ar': 'المجموعات', 'display_order': 6},
                    {'title_en': 'Trees', 'title_ar': 'الأشجار', 'display_order': 7},
                    {'title_en': 'Heaps', 'title_ar': 'الأكوام', 'display_order': 8},
                    {'title_en': 'Graph Fundamentals', 'title_ar': 'أساسيات الرسوم', 'display_order': 9},
                ],
            },
            {
                'title_en': 'Algorithms & Problem Solving Patterns',
                'title_ar': 'الخوارزميات وأنماط حل المشكلات',
                'display_order': 2,
                'topics': [
                    {'title_en': 'Searching', 'title_ar': 'البحث', 'display_order': 0},
                    {'title_en': 'Sorting', 'title_ar': 'الترتيب', 'display_order': 1},
                    {'title_en': 'Recursion', 'title_ar': 'الاستدعاء الذاتي', 'display_order': 2},
                    {'title_en': 'Two Pointers', 'title_ar': 'المؤشران', 'display_order': 3},
                    {'title_en': 'Sliding Window', 'title_ar': 'النافذة المنزلقة', 'display_order': 4},
                    {'title_en': 'Prefix Sum', 'title_ar': 'المجموع التراكمي', 'display_order': 5},
                    {'title_en': 'Binary Search', 'title_ar': 'البحث الثنائي', 'display_order': 6},
                    {'title_en': 'Greedy Fundamentals', 'title_ar': 'أساسيات الجشع', 'display_order': 7},
                    {'title_en': 'Backtracking Fundamentals', 'title_ar': 'أساسيات التراجع', 'display_order': 8},
                    {'title_en': 'Dynamic Programming Introduction', 'title_ar': 'مقدمة في البرمجة الديناميكية', 'display_order': 9},
                ],
            },
        ],
        'faqs': [
            {'question_en': 'Is this course suitable for complete beginners?', 'question_ar': 'هل هذا الكورس مناسب للمبتدئين تماماً؟', 'answer_en': 'Basic programming fundamentals are preferred. If you are a complete beginner, we recommend starting with C++ Programming Fundamentals or Basic Python first.', 'answer_ar': 'يُفضل معرفة أساسيات البرمجة. إذا كنت مبتدئًا تماماً، ننصح بالبدء بأساسيات برمجة C++ أو أساسيات Python أولاً.', 'display_order': 0},
            {'question_en': 'Are the lectures live?', 'question_ar': 'هل المحاضرات مباشرة؟', 'answer_en': FAQ_LIVE_EN, 'answer_ar': FAQ_LIVE_AR, 'display_order': 1},
            {'question_en': 'Are session recordings available?', 'question_ar': 'هل تتوفر تسجيلات للجلسات؟', 'answer_en': FAQ_RECORDINGS_EN, 'answer_ar': FAQ_RECORDINGS_AR, 'display_order': 2},
            {'question_en': 'Is there practical work?', 'question_ar': 'هل يوجد تطبيق عملي؟', 'answer_en': 'Yes, the program is heavily practice-based with structured problem sets, coding challenges, and data structure implementations.', 'answer_ar': 'نعم، البرنامج عملي بكثافة مع مسائل منظمة وتحديات برمجية وتطبيقات هياكل البيانات.', 'display_order': 3},
            {'question_en': 'Is there mentor support?', 'question_ar': 'هل يوجد إشراف ومتابعة؟', 'answer_en': FAQ_MENTOR_EN, 'answer_ar': FAQ_MENTOR_AR, 'display_order': 4},
            {'question_en': 'Are installments available?', 'question_ar': 'هل يتوفر تقسيط؟', 'answer_en': FAQ_INSTALLMENTS_EN, 'answer_ar': FAQ_INSTALLMENTS_AR, 'display_order': 5},
        ],
    },

    # ===================================================================
    # 7. DEVOPS ENGINEERING
    # ===================================================================
    {
        'slug': 'devops-engineering',
        'title_en': 'DevOps Engineering',
        'title_ar': 'هندسة DevOps',
        'short_description_en': 'Master the DevOps lifecycle: Linux, Docker, Kubernetes, CI/CD, Terraform, AWS, and monitoring in a comprehensive 5-month program.',
        'short_description_ar': 'احترف دورة حياة DevOps: Linux و Docker و Kubernetes و CI/CD و Terraform و AWS والمراقبة في برنامج شامل لمدة 5 شهور.',
        'overview_en': (
            "DevOps engineers bridge the gap between writing code and running it reliably in production. "
            "This program covers the entire DevOps lifecycle — from Linux fundamentals to container "
            "orchestration, cloud infrastructure, and monitoring.\n\n"
            "You will learn to automate deployments, manage infrastructure as code, build CI/CD pipelines, "
            "work with Docker and Kubernetes, and deploy applications to AWS. The program includes "
            "continuous hands-on labs, 2 integrated DevOps projects, and 1 final infrastructure project.\n\n"
            "This is a comprehensive 5-month program designed for developers and system administrators "
            "who want to master modern DevOps practices."
        ),
        'overview_ar': (
            "مهندسو DevOps يبنون الجسر بين كتابة الكود وتشغيله بشكل موثوق في الإنتاج. "
            "يغطي هذا البرنامج دورة حياة DevOps الكاملة — من أساسيات Linux إلى تنسيق الحاويات "
            "والبنية السحابية والمراقبة.\n\n"
            "ستتعلم أتمتة النشر وإدارة البنية ككود وبناء خطوط CI/CD والعمل مع Docker و "
            "Kubernetes ونشر التطبيقات على AWS. يتضمن البرنامج مختبرات عملية مستمرة "
            "و 2 مشاريع DevOps متكاملة و 1 مشروع بنية تحتية نهائي.\n\n"
            "هذا برنامج شامل لمدة 5 شهور صُمم للمطورين ومديري الأنظمة "
            "الذين يريدون احتراف ممارسات DevOps الحديثة."
        ),
        'branch': 'professional',
        'status': 'active',
        'display_order': 160,
        'registration_open': True,
        'maximum_capacity': None,
        'registration_url': 'https://forms.gle/tjHRqBZrkNYtrWNL7',
        'image_file': 'devops-engineering.webp',
        'landing': {
            'headline_en': 'Bridge the gap between writing code and running it reliably in production',
            'headline_ar': 'ابنِ الجسر بين كتابة الكود وتشغيله بشكل موثوق في الإنتاج',
            'quick_facts': {
                'level': {'en': 'Intermediate to Advanced', 'ar': 'من متوسط إلى متقدم'},
                'trainingMode': {'en': 'Live Online Training', 'ar': 'تدريب مباشر عبر الإنترنت'},
                'language': {'en': 'English & Arabic', 'ar': 'الإنجليزية والعربية'},
                'practicalType': {'en': 'Hands-on Labs & Projects', 'ar': 'مختبرات ومشاريع عملية'},
                'certificate': {'en': SHARED_CERTIFICATE_EN, 'ar': SHARED_CERTIFICATE_AR},
                'support': {'en': 'Mentor Support', 'ar': 'إشراف ومتابعة'},
                'duration': {'en': '5 Months', 'ar': '5 شهور'},
                'hasRecordings': True,
            },
            'current_price': 6000,
            'currency': 'EGP',
            'show_pricing': True,
            'target_audience': {
                'en': [
                    'Developers who want to learn deployment and operations',
                    'System administrators moving to modern DevOps practices',
                    'Backend developers looking to become full-stack DevOps',
                    'IT professionals interested in cloud and automation',
                ],
                'ar': [
                    'المطورون الذين يريدون تعلم النشر والعمليات',
                    'مديرو الأنظمة المتحولون إلى ممارسات DevOps الحديثة',
                    'مطورو الواجهة الخلفية الذين يريدون أن يصبحوا DevOps متكامل',
                    'محترفو IT المهتمون بالسحابة والأتمتة',
                ],
            },
            'prerequisites': {
                'en': [
                    'Basic technical/computer knowledge recommended',
                    'Familiarity with command-line interfaces is helpful',
                    'Some programming experience is beneficial but not strictly required',
                ],
                'ar': [
                    'يُوصى بمعرفة تقنية/حاسوبية أساسية',
                    'الإلمام بواجهات سطر الأوامر مفيد',
                    'بعض الخبرة في البرمجة مفيدة لكن ليست إلزامية',
                ],
            },
            'tools': {
                'en': ['Linux', 'Docker', 'Kubernetes', 'Ansible', 'Terraform', 'AWS', 'GitLab CI', 'Git'],
                'ar': ['Linux', 'Docker', 'Kubernetes', 'Ansible', 'Terraform', 'AWS', 'GitLab CI', 'Git'],
            },
            'practical_training_en': (
                "Continuous hands-on labs throughout the program plus 2 integrated DevOps projects "
                "and 1 final infrastructure/deployment project. You will build real CI/CD pipelines, "
                "deploy containerized applications, and manage cloud infrastructure."
            ),
            'practical_training_ar': (
                "مختبرات عملية مستمرة طوال البرنامج بالإضافة إلى 2 مشاريع DevOps متكاملة "
                "و 1 مشروع بنية تحتية/نشر نهائي. ستبني خطوط CI/CD حقيقية "
                "وتنشر تطبيقات في حاويات وتدير البنية السحابية."
            ),
            'final_project_en': (
                "Build a complete infrastructure and deployment pipeline: containerize an application, "
                "set up CI/CD, deploy to Kubernetes, configure monitoring, and manage infrastructure "
                "with Terraform on AWS."
            ),
            'final_project_ar': (
                "ابنِ بنية تحتية وخط نشر كامل: حوّل تطبيقًا إلى حاويات، وأعد CI/CD، "
                "وانشر على Kubernetes، واضبط المراقبة، وادر البنية التحتية "
                "بـ Terraform على AWS."
            ),
            'training_experience_en': SHARED_TRAINING_EXPERIENCE_EN,
            'training_experience_ar': SHARED_TRAINING_EXPERIENCE_AR,
            'mentor_info_en': SHARED_MENTOR_INFO_EN,
            'mentor_info_ar': SHARED_MENTOR_INFO_AR,
            'installments_available': True,
            'installments_info_en': SHARED_INSTALLMENTS_INFO_EN,
            'installments_info_ar': SHARED_INSTALLMENTS_INFO_AR,
            'included_items': {
                'en': ['Live interactive sessions', 'Hands-on labs', 'DevOps projects', 'Mentor support', 'Session recordings (per policy)', 'Digital completion certificate'],
                'ar': ['جلسات مباشرة تفاعلية', 'مختبرات عملية', 'مشاريع DevOps', 'إشراف ومتابعة', 'تسجيلات الجلسات (حسب السياسة)', 'شهادة إتمام رقمية'],
            },
            'seo_title_en': 'DevOps Engineering Course | Linux, Docker, CI/CD, Cloud | Sidrah Soft',
            'seo_title_ar': 'كورس هندسة DevOps | Linux, Docker, CI/CD, السحابة | Sidrah Soft',
            'seo_meta_description_en': 'Master the DevOps lifecycle with Linux, Docker, Kubernetes, CI/CD, Terraform, and AWS. Build real pipelines and deploy applications in a 5-month live online program.',
            'seo_meta_description_ar': 'احترف دورة حياة DevOps بـ Linux و Docker و Kubernetes و CI/CD و Terraform و AWS. ابنِ خطوط حقيقية وانشر التطبيقات في برنامج مباشر لمدة 5 شهور.',
            'seo_noindex': False,
            'show_registration_form': True,
        },
        'modules': [
            {
                'title_en': 'Foundations',
                'title_ar': 'الأساسيات',
                'display_order': 0,
                'topics': [
                    {'title_en': 'Introduction to DevOps', 'title_ar': 'مقدمة في DevOps', 'display_order': 0},
                    {'title_en': 'Linux', 'title_ar': 'Linux', 'display_order': 1},
                    {'title_en': 'Shell / Bash Fundamentals', 'title_ar': 'أساسيات Shell / Bash', 'display_order': 2},
                    {'title_en': 'Networking Fundamentals', 'title_ar': 'أساسيات الشبكات', 'display_order': 3},
                ],
            },
            {
                'title_en': 'Version Control & Automation',
                'title_ar': 'التحكم في الإصدارات والأتمتة',
                'display_order': 1,
                'topics': [
                    {'title_en': 'Git', 'title_ar': 'Git', 'display_order': 0},
                    {'title_en': 'GitHub / GitLab Workflows', 'title_ar': 'مسارات عمل GitHub / GitLab', 'display_order': 1},
                    {'title_en': 'Ansible', 'title_ar': 'Ansible', 'display_order': 2},
                ],
            },
            {
                'title_en': 'Containers & CI/CD',
                'title_ar': 'الحاويات و CI/CD',
                'display_order': 2,
                'topics': [
                    {'title_en': 'Docker', 'title_ar': 'Docker', 'display_order': 0},
                    {'title_en': 'Docker Compose', 'title_ar': 'Docker Compose', 'display_order': 1},
                    {'title_en': 'Container Fundamentals', 'title_ar': 'أساسيات الحاويات', 'display_order': 2},
                    {'title_en': 'CI/CD Concepts', 'title_ar': 'مفاهيم CI/CD', 'display_order': 3},
                    {'title_en': 'Pipeline Fundamentals', 'title_ar': 'أساسيات الخطوط', 'display_order': 4},
                    {'title_en': 'GitLab CI', 'title_ar': 'GitLab CI', 'display_order': 5},
                ],
            },
            {
                'title_en': 'Kubernetes',
                'title_ar': 'Kubernetes',
                'display_order': 3,
                'topics': [
                    {'title_en': 'Kubernetes Fundamentals', 'title_ar': 'أساسيات Kubernetes', 'display_order': 0},
                    {'title_en': 'Pods', 'title_ar': 'Pods', 'display_order': 1},
                    {'title_en': 'Deployments', 'title_ar': 'Deployments', 'display_order': 2},
                    {'title_en': 'Services', 'title_ar': 'Services', 'display_order': 3},
                    {'title_en': 'Configuration', 'title_ar': 'الإعداد', 'display_order': 4},
                    {'title_en': 'Scaling', 'title_ar': 'التوسع', 'display_order': 5},
                ],
            },
            {
                'title_en': 'Cloud, IaC & Monitoring',
                'title_ar': 'السحابة والبنية ككود والمراقبة',
                'display_order': 4,
                'topics': [
                    {'title_en': 'AWS Fundamentals', 'title_ar': 'أساسيات AWS', 'display_order': 0},
                    {'title_en': 'Compute, Storage, Networking', 'title_ar': 'الحوسبة والتخزين والشبكات', 'display_order': 1},
                    {'title_en': 'IAM Fundamentals', 'title_ar': 'أساسيات IAM', 'display_order': 2},
                    {'title_en': 'Terraform', 'title_ar': 'Terraform', 'display_order': 3},
                    {'title_en': 'Monitoring Concepts', 'title_ar': 'مفاهيم المراقبة', 'display_order': 4},
                    {'title_en': 'Logging, Metrics, Alerting', 'title_ar': 'السجلات والمقاييس والتنبيهات', 'display_order': 5},
                ],
            },
            {
                'title_en': 'DevSecOps & GitOps',
                'title_ar': 'DevSecOps و GitOps',
                'display_order': 5,
                'topics': [
                    {'title_en': 'Security in Delivery Lifecycle', 'title_ar': 'الأمان في دورة التسليم', 'display_order': 0},
                    {'title_en': 'Secrets Fundamentals', 'title_ar': 'أساسيات الأسرار', 'display_order': 1},
                    {'title_en': 'Vulnerability Awareness', 'title_ar': 'الوعي بالثغرات', 'display_order': 2},
                    {'title_en': 'GitOps Concepts', 'title_ar': 'مفاهيم GitOps', 'display_order': 3},
                    {'title_en': 'GitOps Workflow', 'title_ar': 'مسار عمل GitOps', 'display_order': 4},
                ],
            },
        ],
        'faqs': [
            {'question_en': 'Is this course suitable for complete beginners?', 'question_ar': 'هل هذا الكورس مناسب للمبتدئين تماماً؟', 'answer_en': 'Basic technical or computer knowledge is recommended. This is an intermediate to advanced program that covers a wide range of DevOps tools and practices.', 'answer_ar': 'يُوصى بمعرفة تقنية أو حاسوبية أساسية. هذا برنامج من متوسط إلى متقدم يغطي مجموعة واسعة من أدوات وممارسات DevOps.', 'display_order': 0},
            {'question_en': 'Are the lectures live?', 'question_ar': 'هل المحاضرات مباشرة؟', 'answer_en': FAQ_LIVE_EN, 'answer_ar': FAQ_LIVE_AR, 'display_order': 1},
            {'question_en': 'Are session recordings available?', 'question_ar': 'هل تتوفر تسجيلات للجلسات؟', 'answer_en': FAQ_RECORDINGS_EN, 'answer_ar': FAQ_RECORDINGS_AR, 'display_order': 2},
            {'question_en': 'Is there practical work?', 'question_ar': 'هل يوجد تطبيق عملي؟', 'answer_en': 'Yes, the program includes continuous hands-on labs, 2 integrated DevOps projects, and a final infrastructure project.', 'answer_ar': 'نعم، يتضمن البرنامج مختبرات عملية مستمرة و 2 مشاريع DevOps متكاملة ومشروع بنية تحتية نهائي.', 'display_order': 3},
            {'question_en': 'Is there mentor support?', 'question_ar': 'هل يوجد إشراف ومتابعة؟', 'answer_en': FAQ_MENTOR_EN, 'answer_ar': FAQ_MENTOR_AR, 'display_order': 4},
            {'question_en': 'Are installments available?', 'question_ar': 'هل يتوفر تقسيط؟', 'answer_en': FAQ_INSTALLMENTS_EN, 'answer_ar': FAQ_INSTALLMENTS_AR, 'display_order': 5},
        ],
    },

    # ===================================================================
    # 8. ICDL (remains noindex, temporary content)
    # ===================================================================
    {
        'slug': 'icdl',
        'title_en': 'ICDL Preparation',
        'title_ar': 'تجهيز ICDL',
        'short_description_en': 'Digital skills training covering computer essentials, documents, spreadsheets, presentations, and online collaboration.',
        'short_description_ar': 'تدريب على المهارات الرقمية يغطي أساسيات الحاسب والمستندات والجداول والعروض التقديمية والتعاون عبر الإنترنت.',
        'overview_en': (
            "This is an ICDL preparation and digital skills training program. "
            "It covers the essential computer skills needed for the modern workplace, "
            "including computer essentials, word processing, spreadsheets, presentations, "
            "online collaboration, digital productivity, and cybersecurity awareness.\n\n"
            "Note: Sidrah Soft is not an accredited ICDL test centre. This program prepares "
            "students with digital skills; official ICDL certification must be obtained "
            "through authorized channels."
        ),
        'overview_ar': (
            "هذا برنامج تجهيز ICDL وتدريب على المهارات الرقمية. "
            "يغطي المهارات الحاسوبية الأساسية اللازمة لبيئة العمل الحديثة، "
            "بما في ذلك أساسيات الحاسب ومعالجة النصوص والجداول والعروض التقديمية "
            "والتعاون عبر الإنترنت والإنتاجية الرقمية والوعي بالأمن السيبراني.\n\n"
            "ملاحظة: Sidrah Soft ليست مركز اختبار ICDL معتمد. هذا البرنامج يجهّز "
            "الطلاب بالمهارات الرقمية؛ يجب الحصول على شهادة ICDL الرسمية "
            "عبر القنوات المعتمدة."
        ),
        'branch': 'professional',
        'status': 'active',
        'display_order': 200,
        'registration_open': False,
        'maximum_capacity': None,
        'registration_url': '',
        'image_file': 'icdl.webp',
        'landing': {
            'headline_en': 'Build essential digital skills for the modern workplace',
            'headline_ar': 'ابنِ المهارات الرقمية الأساسية لبيئة العمل الحديثة',
            'quick_facts': {
                'level': {'en': 'Beginner', 'ar': 'مبتدئ'},
                'trainingMode': {'en': 'Live Online Training', 'ar': 'تدريب مباشر عبر الإنترنت'},
                'language': {'en': 'English & Arabic', 'ar': 'الإنجليزية والعربية'},
                'practicalType': {'en': 'Exercises & Practice', 'ar': 'تمارين وتطبيق'},
                'certificate': {'en': SHARED_CERTIFICATE_EN, 'ar': SHARED_CERTIFICATE_AR},
                'support': {'en': 'Mentor Support', 'ar': 'إشراف ومتابعة'},
                'duration': {'en': '2 Months', 'ar': 'شهران'},
                'hasRecordings': True,
            },
            'current_price': 6000,
            'currency': 'EGP',
            'show_pricing': True,
            'target_audience': {
                'en': [
                    'Individuals new to computers and digital tools',
                    'Professionals who need to improve their digital skills',
                    'Students preparing for ICDL certification independently',
                ],
                'ar': [
                    'الأشخاص الجدد على الحاسب والأدوات الرقمية',
                    'المحترفون الذين يحتاجون لتحسين مهاراتهم الرقمية',
                    'الطلاب المستعدون لشهادة ICDL بشكل مستقل',
                ],
            },
            'prerequisites': {
                'en': [
                    'No prior computer experience required',
                    'A computer with internet access',
                ],
                'ar': [
                    'لا تشترط خبرة حاسوبية سابقة',
                    'جهاز كمبيوتر مع اتصال بالإنترنت',
                ],
            },
            'tools': {
                'en': ['Computer', 'Office Applications', 'Web Browser'],
                'ar': ['حاسب', 'تطبيقات Office', 'متصفح ويب'],
            },
            'practical_training_en': (
                "Hands-on exercises and practice sessions covering each ICDL module. "
                "You will work through practical tasks in documents, spreadsheets, "
                "presentations, and online collaboration tools."
            ),
            'practical_training_ar': (
                "تمارين عملية وجلسات تطبيق تغطي كل وحدة ICDL. "
                "ستعمل على مهام عملية في المستندات والجداول "
                "والعروض التقديمية وأدوات التعاون عبر الإنترنت."
            ),
            'final_project_en': (
                "Complete a practical assessment covering the key digital skills modules."
            ),
            'final_project_ar': (
                "أكمل تقييمًا عمليًا يغطي وحدات المهارات الرقمية الرئيسية."
            ),
            'training_experience_en': SHARED_TRAINING_EXPERIENCE_EN,
            'training_experience_ar': SHARED_TRAINING_EXPERIENCE_AR,
            'mentor_info_en': SHARED_MENTOR_INFO_EN,
            'mentor_info_ar': SHARED_MENTOR_INFO_AR,
            'installments_available': True,
            'installments_info_en': SHARED_INSTALLMENTS_INFO_EN,
            'installments_info_ar': SHARED_INSTALLMENTS_INFO_AR,
            'included_items': {
                'en': ['Live interactive sessions', 'Practical exercises', 'Mentor support', 'Session recordings (per policy)', 'Digital completion certificate'],
                'ar': ['جلسات مباشرة تفاعلية', 'تمارين عملية', 'إشراف ومتابعة', 'تسجيلات الجلسات (حسب السياسة)', 'شهادة إتمام رقمية'],
            },
            'seo_title_en': 'ICDL Preparation | Digital Skills Training | Sidrah Soft',
            'seo_title_ar': 'تجهيز ICDL | تدريب المهارات الرقمية | Sidrah Soft',
            'seo_meta_description_en': 'Build essential digital skills with ICDL preparation training. Computer essentials, documents, spreadsheets, presentations, and online collaboration.',
            'seo_meta_description_ar': 'ابنِ المهارات الرقمية الأساسية مع تدريب تجهيز ICDL. أساسيات الحاسب والمستندات والجداول والعروض التقديمية والتعاون عبر الإنترنت.',
            'seo_noindex': True,
            'show_registration_form': False,
        },
        'modules': [
            {
                'title_en': 'Computer & Online Essentials',
                'title_ar': 'أساسيات الحاسب والإنترنت',
                'display_order': 0,
                'topics': [
                    {'title_en': 'Computer Fundamentals', 'title_ar': 'أساسيات الحاسب', 'display_order': 0},
                    {'title_en': 'Operating System Basics', 'title_ar': 'أساسيات نظام التشغيل', 'display_order': 1},
                    {'title_en': 'Internet & Web Browsing', 'title_ar': 'الإنترنت وتصفح الويب', 'display_order': 2},
                    {'title_en': 'Email Fundamentals', 'title_ar': 'أساسيات البريد الإلكتروني', 'display_order': 3},
                ],
            },
            {
                'title_en': 'Documents / Word Processing',
                'title_ar': 'المستندات / معالجة النصوص',
                'display_order': 1,
                'topics': [
                    {'title_en': 'Creating Documents', 'title_ar': 'إنشاء المستندات', 'display_order': 0},
                    {'title_en': 'Formatting Text', 'title_ar': 'تنسيق النص', 'display_order': 1},
                    {'title_en': 'Tables and Images', 'title_ar': 'الجداول والصور', 'display_order': 2},
                    {'title_en': 'Page Layout', 'title_ar': 'تخطيط الصفحة', 'display_order': 3},
                ],
            },
            {
                'title_en': 'Spreadsheets',
                'title_ar': 'الجداول الإلكترونية',
                'display_order': 2,
                'topics': [
                    {'title_en': 'Creating Spreadsheets', 'title_ar': 'إنشاء الجداول', 'display_order': 0},
                    {'title_en': 'Formulas and Functions', 'title_ar': 'الصيغ والدوال', 'display_order': 1},
                    {'title_en': 'Charts', 'title_ar': 'الرسوم البيانية', 'display_order': 2},
                    {'title_en': 'Data Sorting and Filtering', 'title_ar': 'ترتيب وتصفية البيانات', 'display_order': 3},
                ],
            },
            {
                'title_en': 'Presentations & Collaboration',
                'title_ar': 'العروض التقديمية والتعاون',
                'display_order': 3,
                'topics': [
                    {'title_en': 'Creating Presentations', 'title_ar': 'إنشاء العروض التقديمية', 'display_order': 0},
                    {'title_en': 'Slide Design', 'title_ar': 'تصميم الشرائح', 'display_order': 1},
                    {'title_en': 'Online Collaboration', 'title_ar': 'التعاون عبر الإنترنت', 'display_order': 2},
                    {'title_en': 'Digital Productivity', 'title_ar': 'الإنتاجية الرقمية', 'display_order': 3},
                    {'title_en': 'Cybersecurity Awareness', 'title_ar': 'الوعي بالأمن السيبراني', 'display_order': 4},
                ],
            },
        ],
        'faqs': [
            {'question_en': 'Is Sidrah Soft an accredited ICDL test centre?', 'question_ar': 'هل Sidrah Soft مركز اختبار ICDL معتمد؟', 'answer_en': 'No, Sidrah Soft is not an accredited ICDL test centre. This program provides digital skills preparation. Official ICDL certification must be obtained through authorized channels.', 'answer_ar': 'لا، Sidrah Soft ليست مركز اختبار ICDL معتمد. هذا البرنامج يقدم تجهيز المهارات الرقمية. يجب الحصول على شهادة ICDL الرسمية عبر القنوات المعتمدة.', 'display_order': 0},
            {'question_en': 'Is this course suitable for complete beginners?', 'question_ar': 'هل هذا الكورس مناسب للمبتدئين تماماً؟', 'answer_en': _faq_beginners_en(), 'answer_ar': _faq_beginners_ar(), 'display_order': 1},
            {'question_en': 'Are the lectures live?', 'question_ar': 'هل المحاضرات مباشرة؟', 'answer_en': FAQ_LIVE_EN, 'answer_ar': FAQ_LIVE_AR, 'display_order': 2},
            {'question_en': 'Is there practical work?', 'question_ar': 'هل يوجد تطبيق عملي؟', 'answer_en': FAQ_PRACTICAL_EN, 'answer_ar': FAQ_PRACTICAL_AR, 'display_order': 3},
            {'question_en': 'Is there mentor support?', 'question_ar': 'هل يوجد إشراف ومتابعة؟', 'answer_en': FAQ_MENTOR_EN, 'answer_ar': FAQ_MENTOR_AR, 'display_order': 4},
        ],
    },

    # ===================================================================
    # 9. DATA ANALYSIS — NEW PROGRAM
    # ===================================================================
    {
        'slug': 'data-analysis',
        'title_en': 'Data Analysis',
        'title_ar': 'تحليل البيانات',
        'short_description_en': 'Master data analysis with Excel, Power BI, SQL, and Python. From data cleaning to dashboards to insights in a 4-month program.',
        'short_description_ar': 'احترف تحليل البيانات بـ Excel و Power BI و SQL و Python. من تنظيف البيانات إلى لوحات المعلومات إلى الرؤى في برنامج 4 شهور.',
        'overview_en': (
            "Data analysis is the practice of turning raw data into insights that drive decisions. "
            "This program takes you from the fundamentals of analytical thinking to building "
            "interactive dashboards and performing exploratory data analysis with Python.\n\n"
            "You will learn Excel for data cleaning and analysis, Power Query for data transformation, "
            "Power BI for dashboards and reporting, SQL for database queries, and Python with "
            "Pandas, NumPy, Matplotlib, and Seaborn for advanced data analysis.\n\n"
            "The program includes 3 projects: an Excel business analysis project, a Power BI "
            "dashboard project, and a final end-to-end data analysis project that takes you "
            "from raw data through cleaning, analysis, insights, dashboards, and presentation."
        ),
        'overview_ar': (
            "تحليل البيانات هو ممارسة تحويل البيانات الخام إلى رؤى تقود القرارات. "
            "يأخذك هذا البرنامج من أساسيات التفكير التحليلي إلى بناء "
            "لوحات معلومات تفاعلية وإجراء تحليل استكشافي للبيانات بـ Python.\n\n"
            "ستتعلم Excel لتنظيف وتحليل البيانات، و Power Query لتحويل البيانات، "
            "و Power BI للوحات المعلومات والتقارير، و SQL لاستعلامات قواعد البيانات، "
            "و Python مع Pandas و NumPy و Matplotlib و Seaborn لتحليل البيانات المتقدم.\n\n"
            "يتضمن البرنامج 3 مشاريع: مشروع تحليل أعمال بـ Excel، و مشروع لوحة معلومات "
            "بـ Power BI، و مشروع نهائي شامل لتحليل البيانات يأخذك "
            "من البيانات الخام عبر التنظيف والتحليل والرؤى ولوحات المعلومات والعرض."
        ),
        'branch': 'professional',
        'status': 'active',
        'display_order': 170,
        'registration_open': True,
        'maximum_capacity': None,
        'registration_url': 'https://forms.gle/tjHRqBZrkNYtrWNL7',
        'image_file': 'data-analysis.webp',
        'landing': {
            'headline_en': 'Turn raw data into insights that drive real decisions',
            'headline_ar': 'حوّل البيانات الخام إلى رؤى تقود القرارات الحقيقية',
            'quick_facts': {
                'level': {'en': 'Beginner to Intermediate', 'ar': 'من مبتدئ إلى متوسط'},
                'trainingMode': {'en': 'Live Online Training', 'ar': 'تدريب مباشر عبر الإنترنت'},
                'language': {'en': 'English & Arabic', 'ar': 'الإنجليزية والعربية'},
                'practicalType': {'en': 'Data Projects & Dashboards', 'ar': 'مشاريع بيانات ولوحات معلومات'},
                'certificate': {'en': SHARED_CERTIFICATE_EN, 'ar': SHARED_CERTIFICATE_AR},
                'support': {'en': 'Mentor Support', 'ar': 'إشراف ومتابعة'},
                'duration': {'en': '4 Months', 'ar': '4 شهور'},
                'hasRecordings': True,
            },
            'current_price': 6000,
            'currency': 'EGP',
            'show_pricing': True,
            'target_audience': {
                'en': [
                    'Professionals who work with data and want to analyze it effectively',
                    'Business analysts looking to add technical skills',
                    'Career switchers interested in data roles',
                    'Students and graduates interested in data analysis',
                ],
                'ar': [
                    'المحترفون الذين يعملون مع البيانات ويريدون تحليلها بفعالية',
                    'محللو الأعمال الذين يريدون إضافة مهارات تقنية',
                    'المتحولون مهنياً المهتمون بأدوار البيانات',
                    'الطلاب والخريجون المهتمون بتحليل البيانات',
                ],
            },
            'prerequisites': {
                'en': [
                    'Basic computer literacy',
                    'Familiarity with Excel is helpful but not required',
                    'No prior programming experience needed',
                ],
                'ar': [
                    'معرفة أساسية بالحاسب',
                    'الإلمام بـ Excel مفيد لكن ليس مطلوبًا',
                    'لا تشترط خبرة برمجية سابقة',
                ],
            },
            'tools': {
                'en': ['Excel', 'Power Query', 'Power BI', 'SQL', 'Python', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn'],
                'ar': ['Excel', 'Power Query', 'Power BI', 'SQL', 'Python', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn'],
            },
            'practical_training_en': (
                "Three hands-on projects: an Excel business analysis project, a Power BI dashboard "
                "project, and a final end-to-end data analysis project. The final project follows "
                "the complete flow: raw data → cleaning → analysis → insights → dashboard → presentation."
            ),
            'practical_training_ar': (
                "ثلاثة مشاريع عملية: مشروع تحليل أعمال بـ Excel، و مشروع لوحة معلومات "
                "بـ Power BI، و مشروع نهائي شامل لتحليل البيانات. يتبع المشروع النهائي "
                "التدفق الكامل: بيانات خام ← تنظيف ← تحليل ← رؤى ← لوحة معلومات ← عرض."
            ),
            'final_project_en': (
                "Complete an end-to-end data analysis project: start with raw data, clean and "
                "transform it, perform exploratory analysis, build an interactive dashboard, "
                "and present your insights. The project demonstrates the full flow from "
                "data to decision."
            ),
            'final_project_ar': (
                "أكمل مشروع تحليل بيانات شامل: ابدأ بالبيانات الخام، ونظفها وحوّلها، "
                "وأجرِ تحليلًا استكشافيًا، وابنِ لوحة معلومات تفاعلية، "
                "وقدّم رؤاك. يوضح المشروع التدفق الكامل من البيانات إلى القرار."
            ),
            'training_experience_en': SHARED_TRAINING_EXPERIENCE_EN,
            'training_experience_ar': SHARED_TRAINING_EXPERIENCE_AR,
            'mentor_info_en': SHARED_MENTOR_INFO_EN,
            'mentor_info_ar': SHARED_MENTOR_INFO_AR,
            'installments_available': True,
            'installments_info_en': SHARED_INSTALLMENTS_INFO_EN,
            'installments_info_ar': SHARED_INSTALLMENTS_INFO_AR,
            'included_items': {
                'en': ['Live interactive sessions', 'Data analysis projects', 'Mentor support', 'Session recordings (per policy)', 'Digital completion certificate'],
                'ar': ['جلسات مباشرة تفاعلية', 'مشاريع تحليل بيانات', 'إشراف ومتابعة', 'تسجيلات الجلسات (حسب السياسة)', 'شهادة إتمام رقمية'],
            },
            'seo_title_en': 'Data Analysis Course | Excel, Power BI, SQL, Python | Sidrah Soft',
            'seo_title_ar': 'كورس تحليل البيانات | Excel, Power BI, SQL, Python | Sidrah Soft',
            'seo_meta_description_en': 'Learn data analysis with Excel, Power BI, SQL, and Python. Master data cleaning, dashboards, and exploratory analysis in a 4-month live online program.',
            'seo_meta_description_ar': 'تعلّم تحليل البيانات بـ Excel و Power BI و SQL و Python. احترف تنظيف البيانات ولوحات المعلومات والتحليل الاستكشافي في برنامج مباشر لمدة 4 شهور.',
            # Temporarily noindex until management explicitly approves production indexing.
            'seo_noindex': True,
            'show_registration_form': True,
        },
        'modules': [
            {
                'title_en': 'Data Analysis Foundations',
                'title_ar': 'أساسيات تحليل البيانات',
                'display_order': 0,
                'topics': [
                    {'title_en': 'What is Data Analysis?', 'title_ar': 'ما هو تحليل البيانات؟', 'display_order': 0},
                    {'title_en': 'Types of Data', 'title_ar': 'أنواع البيانات', 'display_order': 1},
                    {'title_en': 'Understanding Business Questions', 'title_ar': 'فهم أسئلة الأعمال', 'display_order': 2},
                    {'title_en': 'Analytical Thinking', 'title_ar': 'التفكير التحليلي', 'display_order': 3},
                    {'title_en': 'KPIs', 'title_ar': 'مؤشرات الأداء', 'display_order': 4},
                    {'title_en': 'Turning Data into Insights', 'title_ar': 'تحويل البيانات إلى رؤى', 'display_order': 5},
                ],
            },
            {
                'title_en': 'Excel',
                'title_ar': 'Excel',
                'display_order': 1,
                'topics': [
                    {'title_en': 'Data Cleaning', 'title_ar': 'تنظيف البيانات', 'display_order': 0},
                    {'title_en': 'Tables', 'title_ar': 'الجداول', 'display_order': 1},
                    {'title_en': 'Formulas', 'title_ar': 'الصيغ', 'display_order': 2},
                    {'title_en': 'Functions', 'title_ar': 'الدوال', 'display_order': 3},
                    {'title_en': 'Lookup Functions', 'title_ar': 'دوال البحث', 'display_order': 4},
                    {'title_en': 'Conditional Logic', 'title_ar': 'المنطق الشرطي', 'display_order': 5},
                    {'title_en': 'Pivot Tables', 'title_ar': 'جداول البيانات المحورية', 'display_order': 6},
                    {'title_en': 'Charts', 'title_ar': 'الرسوم البيانية', 'display_order': 7},
                    {'title_en': 'Analytical Reports', 'title_ar': 'التقارير التحليلية', 'display_order': 8},
                ],
            },
            {
                'title_en': 'Power Query & Data Modeling',
                'title_ar': 'Power Query ونمذجة البيانات',
                'display_order': 2,
                'topics': [
                    {'title_en': 'Importing Data', 'title_ar': 'استيراد البيانات', 'display_order': 0},
                    {'title_en': 'Cleaning', 'title_ar': 'التنظيف', 'display_order': 1},
                    {'title_en': 'Transformations', 'title_ar': 'التحويلات', 'display_order': 2},
                    {'title_en': 'Combining Data Sources', 'title_ar': 'دمج مصادر البيانات', 'display_order': 3},
                    {'title_en': 'Reusable Queries', 'title_ar': 'استعلامات قابلة لإعادة الاستخدام', 'display_order': 4},
                    {'title_en': 'Relationships', 'title_ar': 'العلاقات', 'display_order': 5},
                    {'title_en': 'Fact and Dimension Concepts', 'title_ar': 'مفاهيم الحقائق والأبعاد', 'display_order': 6},
                    {'title_en': 'Data Modeling Fundamentals', 'title_ar': 'أساسيات نمذجة البيانات', 'display_order': 7},
                ],
            },
            {
                'title_en': 'Power BI',
                'title_ar': 'Power BI',
                'display_order': 3,
                'topics': [
                    {'title_en': 'Data Import', 'title_ar': 'استيراد البيانات', 'display_order': 0},
                    {'title_en': 'Data Transformation', 'title_ar': 'تحويل البيانات', 'display_order': 1},
                    {'title_en': 'Data Modeling', 'title_ar': 'نمذجة البيانات', 'display_order': 2},
                    {'title_en': 'DAX Fundamentals', 'title_ar': 'أساسيات DAX', 'display_order': 3},
                    {'title_en': 'Measures', 'title_ar': 'المقاييس', 'display_order': 4},
                    {'title_en': 'KPIs', 'title_ar': 'مؤشرات الأداء', 'display_order': 5},
                    {'title_en': 'Interactive Visualizations', 'title_ar': 'التصورات التفاعلية', 'display_order': 6},
                    {'title_en': 'Dashboard Design', 'title_ar': 'تصميم لوحات المعلومات', 'display_order': 7},
                    {'title_en': 'Reporting', 'title_ar': 'التقارير', 'display_order': 8},
                ],
            },
            {
                'title_en': 'SQL for Data Analysis',
                'title_ar': 'SQL لتحليل البيانات',
                'display_order': 4,
                'topics': [
                    {'title_en': 'Database Fundamentals', 'title_ar': 'أساسيات قواعد البيانات', 'display_order': 0},
                    {'title_en': 'SELECT', 'title_ar': 'SELECT', 'display_order': 1},
                    {'title_en': 'WHERE', 'title_ar': 'WHERE', 'display_order': 2},
                    {'title_en': 'ORDER BY', 'title_ar': 'ORDER BY', 'display_order': 3},
                    {'title_en': 'GROUP BY', 'title_ar': 'GROUP BY', 'display_order': 4},
                    {'title_en': 'Aggregate Functions', 'title_ar': 'الدوال التجميعية', 'display_order': 5},
                    {'title_en': 'JOINs', 'title_ar': 'JOINs', 'display_order': 6},
                    {'title_en': 'Subqueries Fundamentals', 'title_ar': 'أساسيات الاستعلامات الفرعية', 'display_order': 7},
                ],
            },
            {
                'title_en': 'Python for Data Analysis',
                'title_ar': 'Python لتحليل البيانات',
                'display_order': 5,
                'topics': [
                    {'title_en': 'Python Refresher', 'title_ar': 'مراجعة Python', 'display_order': 0},
                    {'title_en': 'NumPy Fundamentals', 'title_ar': 'أساسيات NumPy', 'display_order': 1},
                    {'title_en': 'Pandas', 'title_ar': 'Pandas', 'display_order': 2},
                    {'title_en': 'Data Cleaning', 'title_ar': 'تنظيف البيانات', 'display_order': 3},
                    {'title_en': 'Data Manipulation', 'title_ar': 'معالجة البيانات', 'display_order': 4},
                    {'title_en': 'Exploratory Data Analysis', 'title_ar': 'التحليل الاستكشافي للبيانات', 'display_order': 5},
                    {'title_en': 'Matplotlib', 'title_ar': 'Matplotlib', 'display_order': 6},
                    {'title_en': 'Seaborn', 'title_ar': 'Seaborn', 'display_order': 7},
                ],
            },
        ],
        'faqs': [
            {'question_en': 'Is this course suitable for complete beginners?', 'question_ar': 'هل هذا الكورس مناسب للمبتدئين تماماً؟', 'answer_en': _faq_beginners_en('Basic computer literacy is needed but no prior programming or data experience is required.'), 'answer_ar': _faq_beginners_ar('تحتاج إلى معرفة أساسية بالحاسب لكن لا تشترط خبرة سابقة في البرمجة أو البيانات.'), 'display_order': 0},
            {'question_en': 'Do I need to know Python before joining?', 'question_ar': 'هل أحتاج معرفة Python قبل الانضمام؟', 'answer_en': 'No, Python is taught as part of the program. We start with a Python refresher before moving into data analysis libraries.', 'answer_ar': 'لا، Python تُدرّس كجزء من البرنامج. نبدأ بمراجعة Python قبل الانتقال إلى مكتبات تحليل البيانات.', 'display_order': 1},
            {'question_en': 'Are the lectures live?', 'question_ar': 'هل المحاضرات مباشرة؟', 'answer_en': FAQ_LIVE_EN, 'answer_ar': FAQ_LIVE_AR, 'display_order': 2},
            {'question_en': 'Are session recordings available?', 'question_ar': 'هل تتوفر تسجيلات للجلسات؟', 'answer_en': FAQ_RECORDINGS_EN, 'answer_ar': FAQ_RECORDINGS_AR, 'display_order': 3},
            {'question_en': 'Is there practical work?', 'question_ar': 'هل يوجد تطبيق عملي؟', 'answer_en': 'Yes, the program includes 3 projects: an Excel business analysis project, a Power BI dashboard project, and a final end-to-end data analysis project.', 'answer_ar': 'نعم، يتضمن البرنامج 3 مشاريع: مشروع تحليل أعمال بـ Excel، و مشروع لوحة معلومات بـ Power BI، و مشروع نهائي شامل لتحليل البيانات.', 'display_order': 4},
            {'question_en': 'Is there mentor support?', 'question_ar': 'هل يوجد إشراف ومتابعة؟', 'answer_en': FAQ_MENTOR_EN, 'answer_ar': FAQ_MENTOR_AR, 'display_order': 5},
            {'question_en': 'What are the certificate requirements?', 'question_ar': 'ما متطلبات الحصول على الشهادة؟', 'answer_en': FAQ_CERTIFICATE_EN, 'answer_ar': FAQ_CERTIFICATE_AR, 'display_order': 6},
            {'question_en': 'Are installments available?', 'question_ar': 'هل يتوفر تقسيط؟', 'answer_en': FAQ_INSTALLMENTS_EN, 'answer_ar': FAQ_INSTALLMENTS_AR, 'display_order': 7},
        ],
    },
]
