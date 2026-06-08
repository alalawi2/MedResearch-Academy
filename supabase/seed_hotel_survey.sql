-- ══════════════════════════════════════════════════════════════
-- SEED: Hotel Feasibility Survey (Mohamed Al Alawi — MBA Thesis)
-- Bilingual: English + Arabic
-- ══════════════════════════════════════════════════════════════

-- 1. Create the survey
INSERT INTO surveys (id, title_en, title_ar, description_en, description_ar, researcher_name, researcher_email, institution, status, language, estimated_minutes, ethics_approved, ethics_reference)
VALUES (
  'a1b2c3d4-0001-4000-8000-000000000001',
  'Feasibility Study of a Hotel Project in Wilayat Yanqul',
  'دراسة جدوى مشروع فندقي في ولاية ينقل',
  $$Dear Participant,

This survey is conducted as part of an Executive MBA thesis project. The study aims to evaluate the feasibility of establishing a hotel project in Wilayat Yanqul, Al Dhahirah Governorate, Sultanate of Oman. The project type, scale, and star-rating classification will be determined based on the findings of this research to ensure alignment with market expectations and investor requirements.

The questionnaire is designed to understand travel behaviors, accommodation needs, preferences, and acceptable price ranges for travelers. Your participation in this survey is entirely voluntary. Your responses will be used strictly for academic purposes, treated with the utmost confidentiality, and no personal identifying information or identities will be collected.

The survey takes only 4 to 6 minutes to complete. Thank you very much for your participation and valuable time.

Methodological Note (Smart Skip Logic for Local Residents): To eliminate geographic bias in the lodging demand and pricing projections, Omani citizens residing in nearby towns (Yanqul, Dhank, or Ibri) who are unlikely to stay overnight in Yanqul will be automatically routed from Q5 directly to Section 6 (Q21 onwards) to capture their valuable opinions on local community impact and suggestions, while skipping the hotel lodging-specific sections.$$,
  $$عزيزي المشارك الكريم،

يُجرى هذا الاستبيان كجزء من مشروع رسالة الماجستير التنفيذي في إدارة الأعمال. تهدف هذه الدراسة إلى تقييم جدوى إنشاء مشروع فندقي في ولاية ينقل بمحافظة الظاهرة، سلطنة عمان. وسيتم تحديد نوع المشروع وحجمه وتصنيفه بناءً على نتائج هذا البحث لضمان توافقه مع تطلعات السوق ومتطلبات المستثمرين.

تم تصميم هذا الاستبيان لفهم سلوكيات السفر، واحتياجات الإقامة، والتفضيلات، ونطاقات الأسعار المقبولة للمسافرين. إن مشاركتكم في هذا الاستبيان طوعية بالكامل، وستُستخدم إجاباتكم لأغراض أكاديمية بحتة، وتُعامل بمنتهى السرية والأمان، ولن يتم جمع أي معلومات تحدد الهوية الشخصية للمشاركين.

يستغرق الاستبيان من 4 إلى 6 دقائق فقط لإكماله. نشكركم جزيل الشكر على مشاركتكم ووقتكم الثمين.

ملاحظة منهجية (منطق التخطي الذكي للمقيمين المحليين): لتجنب الانحياز الجغرافي في تقديرات الطلب على الإقامة وتوقعات الأسعار، سيتم تلقائياً توجيه المواطنين العُمانيين المقيمين في ولاية ينقل أو الولايات المجاورة (عبري، ضنك) الذين لا يُتوقع مبيتهم في ينقل من السؤال الخامس (س5) مباشرة إلى القسم السادس (س21 فما فوق) لاستقصاء آرائهم القيمة حول الأثر المحلي للمشروع ومقترحاتهم، مع تخطي الأقسام الخاصة بالإقامة الفندقية وأسعار الغرف.$$,
  'Mohamed Al Alawi',
  'mohamed.alawi@example.com',
  'Executive MBA Thesis Project',
  'active',
  'both',
  6,
  true,
  'MBA-2026-YANQUL'
);

-- 2. Create sections
INSERT INTO survey_sections (id, survey_id, title_en, title_ar, description_en, description_ar, order_num)
VALUES
  (
    'b1b1b1b1-0001-4000-8000-000000000001',
    'a1b2c3d4-0001-4000-8000-000000000001',
    'Respondent Profile',
    'الملف الشخصي للمشارك',
    'Please provide some general background to help us classify your responses.',
    'يرجى تقديم بعض المعلومات العامة لمساعدتنا في تصنيف إجاباتكم.',
    1
  ),
  (
    'b1b1b1b1-0002-4000-8000-000000000001',
    'a1b2c3d4-0001-4000-8000-000000000001',
    'Your Experience with Wilayat Yanqul',
    'تجربتك مع ولاية ينقل',
    'This section aims to understand your current visit frequency and accommodation behavior in Wilayat Yanqul.',
    'يهدف هذا القسم إلى فهم معدل زياراتك الحالية وسلوك الإقامة في ولاية ينقل.',
    2
  ),
  (
    'b1b1b1b1-0003-4000-8000-000000000001',
    'a1b2c3d4-0001-4000-8000-000000000001',
    'Demand for a Hotel in Yanqul',
    'الطلب على فندق في ولاية ينقل',
    'Assessing the potential interest and demand for a new high-quality hotel project in Wilayat Yanqul.',
    'تقييم الاهتمام والطلب المحتمل على مشروع فندقي جديد عالي الجودة في ولاية ينقل.',
    3
  );

-- 3. Create questions

-- === SECTION 1: Respondent Profile ===

INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num)
VALUES
  (
    'c1c1c1c1-0001-4000-8000-000000000001',
    'b1b1b1b1-0001-4000-8000-000000000001',
    'a1b2c3d4-0001-4000-8000-000000000001',
    'What is your nationality?',
    'ما هي جنسيتك؟',
    'radio',
    $$["Omani","Other GCC National (Saudi, Emirati, Qatari, Kuwaiti, Bahraini)","Expatriate Resident in Oman","International Visitor (Non-GCC)"]$$::jsonb,
    $$["عُماني","مواطن خليجي آخر (سعودي، إماراتي، قطري، كويتي، بحريني)","مقيم وافد في عُمان","زائر دولي (من خارج دول مجلس التعاون الخليجي)"]$$::jsonb,
    true,
    1
  ),
  (
    'c1c1c1c1-0002-4000-8000-000000000001',
    'b1b1b1b1-0001-4000-8000-000000000001',
    'a1b2c3d4-0001-4000-8000-000000000001',
    'What is your age group?',
    'ما هي فئتك العمرية؟',
    'radio',
    $$["Below 20","20–29","30–39","40–49","50 and above"]$$::jsonb,
    $$["أقل من 20 سنة","20 – 29 سنة","30 – 39 سنة","40 – 49 سنة","50 سنة فما فوق"]$$::jsonb,
    true,
    2
  ),
  (
    'c1c1c1c1-0003-4000-8000-000000000001',
    'b1b1b1b1-0001-4000-8000-000000000001',
    'a1b2c3d4-0001-4000-8000-000000000001',
    'What is your current employment status?',
    'ما هي حالتك الوظيفية الحالية؟',
    'radio',
    $$["Student","Government / Public Sector Employee","Private Sector Employee","Self-employed / Entrepreneur","Retired","Unemployed / Others"]$$::jsonb,
    $$["طالب","موظف في القطاع الحكومي / العام","موظف في القطاع الخاص","أعمل لحسابي الخاص / رائد أعمال","متقاعد","باحث عن عمل / أخرى"]$$::jsonb,
    true,
    3
  ),
  (
    'c1c1c1c1-0004-4000-8000-000000000001',
    'b1b1b1b1-0001-4000-8000-000000000001',
    'a1b2c3d4-0001-4000-8000-000000000001',
    'What is your approximate monthly household income (in Omani Rials - OMR)?',
    'ما هو متوسط الدخل الشهري التقريبي لأسرتك (بالريال العُماني)؟',
    'radio',
    $$["Below OMR 500","OMR 500 – OMR 999","OMR 1,000 – OMR 1,999","OMR 2,000 – OMR 2,999","OMR 3,000 and above"]$$::jsonb,
    $$["أقل من 500 ريال عُماني","من 500 إلى 999 ريال عُماني","من 1,000 إلى 1,999 ريال عُماني","من 2,000 إلى 2,999 ريال عُماني","3,000 ريال عُماني فما فوق"]$$::jsonb,
    true,
    4
  );

INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num, skip_logic)
VALUES (
  'c1c1c1c1-0005-4000-8000-000000000001',
  'b1b1b1b1-0001-4000-8000-000000000001',
  'a1b2c3d4-0001-4000-8000-000000000001',
  'Where do you currently live?',
  'أين تقيم حالياً؟',
  'radio',
  $$[
    {"value":"Yanqul","label_en":"Yanqul (Smart Skip: If respondent is Omani, skip directly to Section 6 / Q21)","label_ar":"ينقل (تخطي ذكي: إذا كان المشارك عُمانياً، انتقل مباشرة إلى القسم السادس / س21)"},
    {"value":"Ibri","label_en":"Ibri (Smart Skip: If respondent is Omani, skip directly to Section 6 / Q21)","label_ar":"عبري (تخطي ذكي: إذا كان المشارك عُمانياً، انتقل مباشرة إلى القسم السادس / س21)"},
    {"value":"Dhank","label_en":"Dhank (Smart Skip: If respondent is Omani, skip directly to Section 6 / Q21)","label_ar":"ضنك (تخطي ذكي: إذا كان المشارك عُمانياً، انتقل مباشرة إلى القسم السادس / س21)"},
    {"value":"Other governorate","label_en":"Other governorate","label_ar":"محافظة أخرى"},
    {"value":"Other","label_en":"Other (Please specify): __________________","label_ar":"أخرى (يرجى التحديد): __________________","requires_text":true}
  ]$$::jsonb,
  $$[
    {"value":"Yanqul","label_en":"Yanqul (Smart Skip: If respondent is Omani, skip directly to Section 6 / Q21)","label_ar":"ينقل (تخطي ذكي: إذا كان المشارك عُمانياً، انتقل مباشرة إلى القسم السادس / س21)"},
    {"value":"Ibri","label_en":"Ibri (Smart Skip: If respondent is Omani, skip directly to Section 6 / Q21)","label_ar":"عبري (تخطي ذكي: إذا كان المشارك عُمانياً، انتقل مباشرة إلى القسم السادس / س21)"},
    {"value":"Dhank","label_en":"Dhank (Smart Skip: If respondent is Omani, skip directly to Section 6 / Q21)","label_ar":"ضنك (تخطي ذكي: إذا كان المشارك عُمانياً، انتقل مباشرة إلى القسم السادس / س21)"},
    {"value":"Other governorate","label_en":"Other governorate","label_ar":"محافظة أخرى"},
    {"value":"Other","label_en":"Other (Please specify): __________________","label_ar":"أخرى (يرجى التحديد): __________________","requires_text":true}
  ]$$::jsonb,
  true,
  5,
  $${
    "skip_to_section":"b1b1b1b1-0006-4000-8000-000000000001",
    "if_question":"c1c1c1c1-0005-4000-8000-000000000001",
    "equals_any":["Yanqul","Ibri","Dhank"],
    "and_question":"c1c1c1c1-0001-4000-8000-000000000001",
    "and_equals":"Omani",
    "auto_advance":true
  }$$::jsonb
);

INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num)
VALUES (
  'c1c1c1c1-0006-4000-8000-000000000001',
  'b1b1b1b1-0001-4000-8000-000000000001',
  'a1b2c3d4-0001-4000-8000-000000000001',
  'Who do you typically travel with?',
  'مع من تسافر عادةً؟',
  'radio',
  $$["Alone","With family including children","With friends or colleagues"]$$::jsonb,
  $$["بمفردي","مع العائلة (بما في ذلك الأطفال)","مع الأصدقاء أو الزملاء"]$$::jsonb,
  true,
  6
);

-- === SECTION 2: Your Experience with Wilayat Yanqul ===

INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num, skip_logic)
VALUES (
  'c1c1c1c1-0007-4000-8000-000000000001',
  'b1b1b1b1-0002-4000-8000-000000000001',
  'a1b2c3d4-0001-4000-8000-000000000001',
  'Have you ever visited Wilayat Yanqul before?',
  'هل سبق لك زيارة ولاية ينقل من قبل؟',
  'radio',
  $$[
    {"value":"Yes","label_en":"Yes","label_ar":"نعم"},
    {"value":"No","label_en":"No (Skip directly to Section 3 / Q13)","label_ar":"لا (انتقل مباشرة إلى القسم الثالث / س13)"}
  ]$$::jsonb,
  $$[
    {"value":"Yes","label_en":"Yes","label_ar":"نعم"},
    {"value":"No","label_en":"No (Skip directly to Section 3 / Q13)","label_ar":"لا (انتقل مباشرة إلى القسم الثالث / س13)"}
  ]$$::jsonb,
  true,
  7,
  $${
    "skip_to_section":"b1b1b1b1-0003-4000-8000-000000000001",
    "if_question":"c1c1c1c1-0007-4000-8000-000000000001",
    "equals":"No",
    "auto_advance":true
  }$$::jsonb
);

INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num, skip_logic)
VALUES
  (
    'c1c1c1c1-0008-4000-8000-000000000001',
    'b1b1b1b1-0002-4000-8000-000000000001',
    'a1b2c3d4-0001-4000-8000-000000000001',
    'If yes, what was the main reason for your visit?',
    'إذا كانت الإجابة بنعم، ما هو السبب الرئيسي لزيارتك؟',
    'radio',
    $$[
      "Family visit / Visiting relatives",
      "Tourism / Leisure",
      "Work / Business",
      "Event / Wedding",
      "Transit to another region",
      {"value":"Other","label_en":"Other (Please specify): __________________","label_ar":"أخرى (يرجى التحديد): __________________","requires_text":true}
    ]$$::jsonb,
    $$[
      "زيارة عائلية / زيارة الأقارب",
      "السياحة / الترفيه والاستجمام",
      "العمل / إدارة الأعمال",
      "مناسبة اجتماعية / حفل زفاف",
      "عبور (ترانزيت) إلى منطقة أخرى",
      {"value":"Other","label_en":"Other (Please specify): __________________","label_ar":"أخرى (يرجى التحديد): __________________","requires_text":true}
    ]$$::jsonb,
    false,
    8,
    $${
      "show_if":{"question_id":"c1c1c1c1-0007-4000-8000-000000000001","equals":"Yes"}
    }$$::jsonb
  ),
  (
    'c1c1c1c1-0009-4000-8000-000000000001',
    'b1b1b1b1-0002-4000-8000-000000000001',
    'a1b2c3d4-0001-4000-8000-000000000001',
    'How often do you visit Yanqul?',
    'كم مرة تزور ولاية ينقل عادةً؟',
    'radio',
    $$["Weekly","Monthly","A few times per year","Once a year","Rarely"]$$::jsonb,
    $$["أسبوعياً","شهرياً","بضع مرات في السنة","مرة واحدة في السنة","نادراً"]$$::jsonb,
    false,
    9,
    $${
      "show_if":{"question_id":"c1c1c1c1-0007-4000-8000-000000000001","equals":"Yes"}
    }$$::jsonb
  ),
  (
    'c1c1c1c1-0010-4000-8000-000000000001',
    'b1b1b1b1-0002-4000-8000-000000000001',
    'a1b2c3d4-0001-4000-8000-000000000001',
    'What time of year are you most likely to visit or travel through Wilayat Yanqul? (Select all that apply)',
    'ما هو الوقت من السنة الذي تفضل فيه زيارة ولاية ينقل أو العبور من خلالها؟ (اختر كل ما ينطبق)',
    'checkbox',
    $$[
      "Winter Season (October – March: Peak heritage and nature tourism)",
      "Summer Season (April – September: High transit traffic / school holidays)",
      "During religious and national holidays (Eid Al Fitr, Eid Al Adha, National Day)",
      "No seasonal preference (Travel is year-round / business-driven)"
    ]$$::jsonb,
    $$[
      "موسم الشتاء (أكتوبر – مارس: ذروة السياحة التراثية والطبيعية)",
      "موسم الصيف (أبريل – سبتمبر: حركة عبور نشطة / الإجازات المدرسية)",
      "خلال الأعياد الدينية والوطنية (عيد الفطر، عيد الأضحى، اليوم الوطني)",
      "لا يوجد تفضيل موسمي (السفر مستمر طوال العام / مرتبط بالعمل)"
    ]$$::jsonb,
    true,
    10,
    $${
      "show_if":{"question_id":"c1c1c1c1-0007-4000-8000-000000000001","equals":"Yes"}
    }$$::jsonb
  ),
  (
    'c1c1c1c1-0011-4000-8000-000000000001',
    'b1b1b1b1-0002-4000-8000-000000000001',
    'a1b2c3d4-0001-4000-8000-000000000001',
    'When you visited Yanqul, did you stay overnight?',
    'عندما زرت ولاية ينقل، هل بتَّ فيها (إقامة ليلة)؟',
    'radio',
    $$[
      "Yes, I stayed overnight in Yanqul",
      "No, I stayed in a nearby town (e.g., Ibri, Sohar, Al Buraimi)",
      "No, I returned the same day"
    ]$$::jsonb,
    $$[
      "نعم، أقمت ليلة في ولاية ينقل",
      "لا، أقمت في مدينة مجاورة (مثل عبري، صحار، البريمي)",
      "لا، عدت في نفس اليوم"
    ]$$::jsonb,
    false,
    11,
    $${
      "show_if":{"question_id":"c1c1c1c1-0007-4000-8000-000000000001","equals":"Yes"}
    }$$::jsonb
  ),
  (
    'c1c1c1c1-0012-4000-8000-000000000001',
    'b1b1b1b1-0002-4000-8000-000000000001',
    'a1b2c3d4-0001-4000-8000-000000000001',
    'If you did NOT stay overnight in Yanqul, what was the main reason?',
    'إذا لم تبت في ولاية ينقل، ما هو السبب الرئيسي؟',
    'radio',
    $$[
      "No suitable hotel or accommodation available",
      "My visit was too short to require overnight stay",
      "I preferred to stay with family or relatives",
      "I preferred to stay in a nearby town with better facilities",
      "I did not need accommodation",
      {"value":"Other","label_en":"Other (Please specify): __________________","label_ar":"أخرى (يرجى التحديد): __________________","requires_text":true}
    ]$$::jsonb,
    $$[
      "عدم توفر فندق أو سكن مناسب وملائم",
      "زيارتي كانت قصيرة جداً ولا تتطلب المبيت",
      "فضلت الإقامة مع العائلة أو الأقارب",
      "فضلت الإقامة في مدينة مجاورة توفر خدمات أفضل",
      "لم أكن بحاجة إلى سكن",
      {"value":"Other","label_en":"Other (Please specify): __________________","label_ar":"أخرى (يرجى التحديد): __________________","requires_text":true}
    ]$$::jsonb,
    false,
    12,
    $${
      "show_if_all":[
        {"question_id":"c1c1c1c1-0007-4000-8000-000000000001","equals":"Yes"},
        {"question_id":"c1c1c1c1-0011-4000-8000-000000000001","not_equals":"Yes, I stayed overnight in Yanqul"}
      ]
    }$$::jsonb
  );

-- === SECTION 3: Demand for a Hotel in Yanqul ===

INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num)
VALUES
  (
    'c1c1c1c1-0013-4000-8000-000000000001',
    'b1b1b1b1-0003-4000-8000-000000000001',
    'a1b2c3d4-0001-4000-8000-000000000001',
    'If a professionally managed, high-quality hotel was available in Wilayat Yanqul, would you consider staying overnight?',
    'إذا توفر فندق مدار باحترافية وعالي الجودة في ولاية ينقل، هل ستفكر في المبيت فيه؟',
    'radio',
    $$["Yes, definitely","Maybe, depending on price and facilities","No, I would still prefer to stay in a nearby town"]$$::jsonb,
    $$["نعم، بالتأكيد","ربما، اعتماداً على السعر والخدمات","لا، سأظل أفضل الإقامة في مدينة مجاورة"]$$::jsonb,
    true,
    13
  ),
  (
    'c1c1c1c1-0014-4000-8000-000000000001',
    'b1b1b1b1-0003-4000-8000-000000000001',
    'a1b2c3d4-0001-4000-8000-000000000001',
    'How likely are you to use a hotel in Yanqul in the next 12 months?',
    'ما مدى احتمالية استخدامك لفندق في ولاية ينقل خلال الـ 12 شهراً القادمة؟',
    'likert',
    $$["1 - Very Unlikely","2 - Unlikely","3 - Neutral","4 - Likely","5 - Very Likely"]$$::jsonb,
    $$["1 - غير محتمل جداً","2 - غير محتمل","3 - محايد","4 - محتمل","5 - محتمل جداً"]$$::jsonb,
    true,
    14
  );
