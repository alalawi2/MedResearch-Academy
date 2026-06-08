-- Align the Yanqul hotel feasibility survey with the original English/Arabic source documents.

BEGIN;

UPDATE surveys
SET
  title_en = 'Feasibility Study of a Hotel Project in Wilayat Yanqul',
  title_ar = 'دراسة جدوى مشروع فندقي في ولاية ينقل',
  description_en = $$Dear Participant,

This survey is conducted as part of an Executive MBA thesis project. The study aims to evaluate the feasibility of establishing a hotel project in Wilayat Yanqul, Al Dhahirah Governorate, Sultanate of Oman. The project type, scale, and star-rating classification will be determined based on the findings of this research to ensure alignment with market expectations and investor requirements.

The questionnaire is designed to understand travel behaviors, accommodation needs, preferences, and acceptable price ranges for travelers. Your participation in this survey is entirely voluntary. Your responses will be used strictly for academic purposes, treated with the utmost confidentiality, and no personal identifying information or identities will be collected.

The survey takes only 4 to 6 minutes to complete. Thank you very much for your participation and valuable time.

Methodological Note (Smart Skip Logic for Local Residents): To eliminate geographic bias in the lodging demand and pricing projections, Omani citizens residing in nearby towns (Yanqul, Dhank, or Ibri) who are unlikely to stay overnight in Yanqul will be automatically routed from Q5 directly to Section 6 (Q21 onwards) to capture their valuable opinions on local community impact and suggestions, while skipping the hotel lodging-specific sections.$$,
  description_ar = $$عزيزي المشارك الكريم،

يُجرى هذا الاستبيان كجزء من مشروع رسالة الماجستير التنفيذي في إدارة الأعمال. تهدف هذه الدراسة إلى تقييم جدوى إنشاء مشروع فندقي في ولاية ينقل بمحافظة الظاهرة، سلطنة عمان. وسيتم تحديد نوع المشروع وحجمه وتصنيفه بناءً على نتائج هذا البحث لضمان توافقه مع تطلعات السوق ومتطلبات المستثمرين.

تم تصميم هذا الاستبيان لفهم سلوكيات السفر، واحتياجات الإقامة، والتفضيلات، ونطاقات الأسعار المقبولة للمسافرين. إن مشاركتكم في هذا الاستبيان طوعية بالكامل، وستُستخدم إجاباتكم لأغراض أكاديمية بحتة، وتُعامل بمنتهى السرية والأمان، ولن يتم جمع أي معلومات تحدد الهوية الشخصية للمشاركين.

يستغرق الاستبيان من 4 إلى 6 دقائق فقط لإكماله. نشكركم جزيل الشكر على مشاركتكم ووقتكم الثمين.

ملاحظة منهجية (منطق التخطي الذكي للمقيمين المحليين): لتجنب الانحياز الجغرافي في تقديرات الطلب على الإقامة وتوقعات الأسعار، سيتم تلقائياً توجيه المواطنين العُمانيين المقيمين في ولاية ينقل أو الولايات المجاورة (عبري، ضنك) الذين لا يُتوقع مبيتهم في ينقل من السؤال الخامس (س5) مباشرة إلى القسم السادس (س21 فما فوق) لاستقصاء آرائهم القيمة حول الأثر المحلي للمشروع ومقترحاتهم، مع تخطي الأقسام الخاصة بالإقامة الفندقية وأسعار الغرف.$$,
  researcher_name = 'Mohamed Al Alawi',
  institution = 'Executive MBA Thesis Project',
  language = 'both',
  estimated_minutes = 6,
  ethics_approved = true,
  ethics_reference = 'MBA-2026-YANQUL'
WHERE id = 'a1b2c3d4-0001-4000-8000-000000000001';

UPDATE survey_sections
SET title_en = 'Respondent Profile',
    title_ar = 'الملف الشخصي للمشارك',
    description_en = 'Please provide some general background to help us classify your responses.',
    description_ar = 'يرجى تقديم بعض المعلومات العامة لمساعدتنا في تصنيف إجاباتكم.',
    order_num = 1
WHERE id = 'b1b1b1b1-0001-4000-8000-000000000001'
  AND survey_id = 'a1b2c3d4-0001-4000-8000-000000000001';

UPDATE survey_sections
SET title_en = 'Your Experience with Wilayat Yanqul',
    title_ar = 'تجربتك مع ولاية ينقل',
    description_en = 'This section aims to understand your current visit frequency and accommodation behavior in Wilayat Yanqul.',
    description_ar = 'يهدف هذا القسم إلى فهم معدل زياراتك الحالية وسلوك الإقامة في ولاية ينقل.',
    order_num = 2
WHERE id = 'b1b1b1b1-0002-4000-8000-000000000001'
  AND survey_id = 'a1b2c3d4-0001-4000-8000-000000000001';

UPDATE survey_sections
SET title_en = 'Demand for a Hotel in Yanqul',
    title_ar = 'الطلب على فندق في ولاية ينقل',
    description_en = 'Assessing the potential interest and demand for a new high-quality hotel project in Wilayat Yanqul.',
    description_ar = 'تقييم الاهتمام والطلب المحتمل على مشروع فندقي جديد عالي الجودة في ولاية ينقل.',
    order_num = 3
WHERE id = 'b1b1b1b1-0003-4000-8000-000000000001'
  AND survey_id = 'a1b2c3d4-0001-4000-8000-000000000001';

UPDATE survey_sections
SET title_en = 'Preferred Hotel Concept & Facilities',
    title_ar = 'المفهوم والخدمات الفندقية المفضلة',
    description_en = 'Helping us design the appropriate style, services, and amenities for the proposed hotel.',
    description_ar = 'مساعدتنا في تصميم النمط المناسب، والخدمات، والمرافق المقترحة للفندق.',
    order_num = 4
WHERE id = 'b1b1b1b1-0004-4000-8000-000000000001'
  AND survey_id = 'a1b2c3d4-0001-4000-8000-000000000001';

UPDATE survey_sections
SET title_en = 'Price Sensitivity & Willingness-to-Pay',
    title_ar = 'حساسية الأسعار والاستعداد للدفع',
    description_en = 'Assessing the acceptable price ceiling and comparing it with the proposed value-add.',
    description_ar = 'تقييم سقف السعر المقبول ومقارنته بالقيمة المضافة المقترحة.',
    order_num = 5
WHERE id = 'b1b1b1b1-0005-4000-8000-000000000001'
  AND survey_id = 'a1b2c3d4-0001-4000-8000-000000000001';

UPDATE survey_sections
SET title_en = 'Public Opinion & Local Impact',
    title_ar = 'الرأي العام والأثر المحلي للمشروع',
    description_en = 'Exploring local community views and expectations regarding the developmental and social impact of the hotel project.',
    description_ar = 'استكشاف آراء وتوقعات المجتمع المحلي بشأن الأثر التنموي والاجتماعي للمشروع الفندقي.',
    order_num = 6
WHERE id = 'b1b1b1b1-0006-4000-8000-000000000001'
  AND survey_id = 'a1b2c3d4-0001-4000-8000-000000000001';

UPDATE survey_questions
SET
  question_en = 'What is your nationality?',
  question_ar = 'ما هي جنسيتك؟',
  type = 'radio',
  options_en = $$["Omani","Other GCC National (Saudi, Emirati, Qatari, Kuwaiti, Bahraini)","Expatriate Resident in Oman","International Visitor (Non-GCC)"]$$::jsonb,
  options_ar = $$["عُماني","مواطن خليجي آخر (سعودي، إماراتي، قطري، كويتي، بحريني)","مقيم وافد في عُمان","زائر دولي (من خارج دول مجلس التعاون الخليجي)"]$$::jsonb,
  required = true,
  order_num = 1,
  skip_logic = null
WHERE id = 'c1c1c1c1-0001-4000-8000-000000000001';

UPDATE survey_questions
SET
  question_en = 'What is your age group?',
  question_ar = 'ما هي فئتك العمرية؟',
  type = 'radio',
  options_en = $$["Below 20","20–29","30–39","40–49","50 and above"]$$::jsonb,
  options_ar = $$["أقل من 20 سنة","20 – 29 سنة","30 – 39 سنة","40 – 49 سنة","50 سنة فما فوق"]$$::jsonb,
  required = true,
  order_num = 2,
  skip_logic = null
WHERE id = 'c1c1c1c1-0002-4000-8000-000000000001';

UPDATE survey_questions
SET
  question_en = 'What is your current employment status?',
  question_ar = 'ما هي حالتك الوظيفية الحالية؟',
  type = 'radio',
  options_en = $$["Student","Government / Public Sector Employee","Private Sector Employee","Self-employed / Entrepreneur","Retired","Unemployed / Others"]$$::jsonb,
  options_ar = $$["طالب","موظف في القطاع الحكومي / العام","موظف في القطاع الخاص","أعمل لحسابي الخاص / رائد أعمال","متقاعد","باحث عن عمل / أخرى"]$$::jsonb,
  required = true,
  order_num = 3,
  skip_logic = null
WHERE id = 'c1c1c1c1-0003-4000-8000-000000000001';

UPDATE survey_questions
SET
  question_en = 'What is your approximate monthly household income (in Omani Rials - OMR)?',
  question_ar = 'ما هو متوسط الدخل الشهري التقريبي لأسرتك (بالريال العُماني)؟',
  type = 'radio',
  options_en = $$["Below OMR 500","OMR 500 – OMR 999","OMR 1,000 – OMR 1,999","OMR 2,000 – OMR 2,999","OMR 3,000 and above"]$$::jsonb,
  options_ar = $$["أقل من 500 ريال عُماني","من 500 إلى 999 ريال عُماني","من 1,000 إلى 1,999 ريال عُماني","من 2,000 إلى 2,999 ريال عُماني","3,000 ريال عُماني فما فوق"]$$::jsonb,
  required = true,
  order_num = 4,
  skip_logic = null
WHERE id = 'c1c1c1c1-0004-4000-8000-000000000001';

UPDATE survey_questions
SET
  question_en = 'Where do you currently live?',
  question_ar = 'أين تقيم حالياً؟',
  type = 'radio',
  options_en = $$[
    {"value":"Yanqul","label_en":"Yanqul (Smart Skip: If respondent is Omani, skip directly to Section 6 / Q21)","label_ar":"ينقل (تخطي ذكي: إذا كان المشارك عُمانياً، انتقل مباشرة إلى القسم السادس / س21)"},
    {"value":"Ibri","label_en":"Ibri (Smart Skip: If respondent is Omani, skip directly to Section 6 / Q21)","label_ar":"عبري (تخطي ذكي: إذا كان المشارك عُمانياً، انتقل مباشرة إلى القسم السادس / س21)"},
    {"value":"Dhank","label_en":"Dhank (Smart Skip: If respondent is Omani, skip directly to Section 6 / Q21)","label_ar":"ضنك (تخطي ذكي: إذا كان المشارك عُمانياً، انتقل مباشرة إلى القسم السادس / س21)"},
    {"value":"Other governorate","label_en":"Other governorate","label_ar":"محافظة أخرى"},
    {"value":"Other","label_en":"Other (Please specify): __________________","label_ar":"أخرى (يرجى التحديد): __________________","requires_text":true}
  ]$$::jsonb,
  options_ar = $$[
    {"value":"Yanqul","label_en":"Yanqul (Smart Skip: If respondent is Omani, skip directly to Section 6 / Q21)","label_ar":"ينقل (تخطي ذكي: إذا كان المشارك عُمانياً، انتقل مباشرة إلى القسم السادس / س21)"},
    {"value":"Ibri","label_en":"Ibri (Smart Skip: If respondent is Omani, skip directly to Section 6 / Q21)","label_ar":"عبري (تخطي ذكي: إذا كان المشارك عُمانياً، انتقل مباشرة إلى القسم السادس / س21)"},
    {"value":"Dhank","label_en":"Dhank (Smart Skip: If respondent is Omani, skip directly to Section 6 / Q21)","label_ar":"ضنك (تخطي ذكي: إذا كان المشارك عُمانياً، انتقل مباشرة إلى القسم السادس / س21)"},
    {"value":"Other governorate","label_en":"Other governorate","label_ar":"محافظة أخرى"},
    {"value":"Other","label_en":"Other (Please specify): __________________","label_ar":"أخرى (يرجى التحديد): __________________","requires_text":true}
  ]$$::jsonb,
  required = true,
  order_num = 5,
  skip_logic = $${
    "skip_to_section":"b1b1b1b1-0006-4000-8000-000000000001",
    "if_question":"c1c1c1c1-0005-4000-8000-000000000001",
    "equals_any":["Yanqul","Ibri","Dhank"],
    "and_question":"c1c1c1c1-0001-4000-8000-000000000001",
    "and_equals":"Omani",
    "auto_advance":true
  }$$::jsonb
WHERE id = 'c1c1c1c1-0005-4000-8000-000000000001';

UPDATE survey_questions
SET
  question_en = 'Who do you typically travel with?',
  question_ar = 'مع من تسافر عادةً؟',
  type = 'radio',
  options_en = $$["Alone","With family including children","With friends or colleagues"]$$::jsonb,
  options_ar = $$["بمفردي","مع العائلة (بما في ذلك الأطفال)","مع الأصدقاء أو الزملاء"]$$::jsonb,
  required = true,
  order_num = 6,
  skip_logic = null
WHERE id = 'c1c1c1c1-0006-4000-8000-000000000001';

UPDATE survey_questions
SET
  question_en = 'Have you ever visited Wilayat Yanqul before?',
  question_ar = 'هل سبق لك زيارة ولاية ينقل من قبل؟',
  type = 'radio',
  options_en = $$[
    {"value":"Yes","label_en":"Yes","label_ar":"نعم"},
    {"value":"No","label_en":"No (Skip directly to Section 3 / Q13)","label_ar":"لا (انتقل مباشرة إلى القسم الثالث / س13)"}
  ]$$::jsonb,
  options_ar = $$[
    {"value":"Yes","label_en":"Yes","label_ar":"نعم"},
    {"value":"No","label_en":"No (Skip directly to Section 3 / Q13)","label_ar":"لا (انتقل مباشرة إلى القسم الثالث / س13)"}
  ]$$::jsonb,
  required = true,
  order_num = 7,
  skip_logic = $${
    "skip_to_section":"b1b1b1b1-0003-4000-8000-000000000001",
    "if_question":"c1c1c1c1-0007-4000-8000-000000000001",
    "equals":"No",
    "auto_advance":true
  }$$::jsonb
WHERE id = 'c1c1c1c1-0007-4000-8000-000000000001';

UPDATE survey_questions
SET
  question_en = 'If yes, what was the main reason for your visit?',
  question_ar = 'إذا كانت الإجابة بنعم، ما هو السبب الرئيسي لزيارتك؟',
  type = 'radio',
  options_en = $$[
    "Family visit / Visiting relatives",
    "Tourism / Leisure",
    "Work / Business",
    "Event / Wedding",
    "Transit to another region",
    {"value":"Other","label_en":"Other (Please specify): __________________","label_ar":"أخرى (يرجى التحديد): __________________","requires_text":true}
  ]$$::jsonb,
  options_ar = $$[
    "زيارة عائلية / زيارة الأقارب",
    "السياحة / الترفيه والاستجمام",
    "العمل / إدارة الأعمال",
    "مناسبة اجتماعية / حفل زفاف",
    "عبور (ترانزيت) إلى منطقة أخرى",
    {"value":"Other","label_en":"Other (Please specify): __________________","label_ar":"أخرى (يرجى التحديد): __________________","requires_text":true}
  ]$$::jsonb,
  required = false,
  order_num = 8,
  skip_logic = $${
    "show_if":{"question_id":"c1c1c1c1-0007-4000-8000-000000000001","equals":"Yes"}
  }$$::jsonb
WHERE id = 'c1c1c1c1-0008-4000-8000-000000000001';

UPDATE survey_questions
SET
  question_en = 'How often do you visit Yanqul?',
  question_ar = 'كم مرة تزور ولاية ينقل عادةً؟',
  type = 'radio',
  options_en = $$["Weekly","Monthly","A few times per year","Once a year","Rarely"]$$::jsonb,
  options_ar = $$["أسبوعياً","شهرياً","بضع مرات في السنة","مرة واحدة في السنة","نادراً"]$$::jsonb,
  required = false,
  order_num = 9,
  skip_logic = $${
    "show_if":{"question_id":"c1c1c1c1-0007-4000-8000-000000000001","equals":"Yes"}
  }$$::jsonb
WHERE id = 'c1c1c1c1-0009-4000-8000-000000000001';

UPDATE survey_questions
SET
  question_en = 'What time of year are you most likely to visit or travel through Wilayat Yanqul? (Select all that apply)',
  question_ar = 'ما هو الوقت من السنة الذي تفضل فيه زيارة ولاية ينقل أو العبور من خلالها؟ (اختر كل ما ينطبق)',
  type = 'checkbox',
  options_en = $$[
    "Winter Season (October – March: Peak heritage and nature tourism)",
    "Summer Season (April – September: High transit traffic / school holidays)",
    "During religious and national holidays (Eid Al Fitr, Eid Al Adha, National Day)",
    "No seasonal preference (Travel is year-round / business-driven)"
  ]$$::jsonb,
  options_ar = $$[
    "موسم الشتاء (أكتوبر – مارس: ذروة السياحة التراثية والطبيعية)",
    "موسم الصيف (أبريل – سبتمبر: حركة عبور نشطة / الإجازات المدرسية)",
    "خلال الأعياد الدينية والوطنية (عيد الفطر، عيد الأضحى، اليوم الوطني)",
    "لا يوجد تفضيل موسمي (السفر مستمر طوال العام / مرتبط بالعمل)"
  ]$$::jsonb,
  required = true,
  order_num = 10,
  skip_logic = $${
    "show_if":{"question_id":"c1c1c1c1-0007-4000-8000-000000000001","equals":"Yes"}
  }$$::jsonb
WHERE id = 'c1c1c1c1-0010-4000-8000-000000000001';

UPDATE survey_questions
SET
  question_en = 'When you visited Yanqul, did you stay overnight?',
  question_ar = 'عندما زرت ولاية ينقل، هل بتَّ فيها (إقامة ليلة)؟',
  type = 'radio',
  options_en = $$[
    "Yes, I stayed overnight in Yanqul",
    "No, I stayed in a nearby town (e.g., Ibri, Sohar, Al Buraimi)",
    "No, I returned the same day"
  ]$$::jsonb,
  options_ar = $$[
    "نعم، أقمت ليلة في ولاية ينقل",
    "لا، أقمت في مدينة مجاورة (مثل عبري، صحار، البريمي)",
    "لا، عدت في نفس اليوم"
  ]$$::jsonb,
  required = false,
  order_num = 11,
  skip_logic = $${
    "show_if":{"question_id":"c1c1c1c1-0007-4000-8000-000000000001","equals":"Yes"}
  }$$::jsonb
WHERE id = 'c1c1c1c1-0011-4000-8000-000000000001';

UPDATE survey_questions
SET
  question_en = 'If you did NOT stay overnight in Yanqul, what was the main reason?',
  question_ar = 'إذا لم تبت في ولاية ينقل، ما هو السبب الرئيسي؟',
  type = 'radio',
  options_en = $$[
    "No suitable hotel or accommodation available",
    "My visit was too short to require overnight stay",
    "I preferred to stay with family or relatives",
    "I preferred to stay in a nearby town with better facilities",
    "I did not need accommodation",
    {"value":"Other","label_en":"Other (Please specify): __________________","label_ar":"أخرى (يرجى التحديد): __________________","requires_text":true}
  ]$$::jsonb,
  options_ar = $$[
    "عدم توفر فندق أو سكن مناسب وملائم",
    "زيارتي كانت قصيرة جداً ولا تتطلب المبيت",
    "فضلت الإقامة مع العائلة أو الأقارب",
    "فضلت الإقامة في مدينة مجاورة توفر خدمات أفضل",
    "لم أكن بحاجة إلى سكن",
    {"value":"Other","label_en":"Other (Please specify): __________________","label_ar":"أخرى (يرجى التحديد): __________________","requires_text":true}
  ]$$::jsonb,
  required = false,
  order_num = 12,
  skip_logic = $${
    "show_if_all":[
      {"question_id":"c1c1c1c1-0007-4000-8000-000000000001","equals":"Yes"},
      {"question_id":"c1c1c1c1-0011-4000-8000-000000000001","not_equals":"Yes, I stayed overnight in Yanqul"}
    ]
  }$$::jsonb
WHERE id = 'c1c1c1c1-0012-4000-8000-000000000001';

UPDATE survey_questions
SET
  question_en = 'If a professionally managed, high-quality hotel was available in Wilayat Yanqul, would you consider staying overnight?',
  question_ar = 'إذا توفر فندق مدار باحترافية وعالي الجودة في ولاية ينقل، هل ستفكر في المبيت فيه؟',
  type = 'radio',
  options_en = $$["Yes, definitely","Maybe, depending on price and facilities","No, I would still prefer to stay in a nearby town"]$$::jsonb,
  options_ar = $$["نعم، بالتأكيد","ربما، اعتماداً على السعر والخدمات","لا، سأظل أفضل الإقامة في مدينة مجاورة"]$$::jsonb,
  required = true,
  order_num = 13,
  skip_logic = null
WHERE id = 'c1c1c1c1-0013-4000-8000-000000000001';

UPDATE survey_questions
SET
  question_en = 'How likely are you to use a hotel in Yanqul in the next 12 months?',
  question_ar = 'ما مدى احتمالية استخدامك لفندق في ولاية ينقل خلال الـ 12 شهراً القادمة؟',
  type = 'likert',
  options_en = $$["1 - Very Unlikely","2 - Unlikely","3 - Neutral","4 - Likely","5 - Very Likely"]$$::jsonb,
  options_ar = $$["1 - غير محتمل جداً","2 - غير محتمل","3 - محايد","4 - محتمل","5 - محتمل جداً"]$$::jsonb,
  required = true,
  order_num = 14,
  skip_logic = null
WHERE id = 'c1c1c1c1-0014-4000-8000-000000000001';

UPDATE survey_questions
SET
  question_en = 'What would be the main purpose that might lead to your stay in Yanqul in the future? (Select all that apply)',
  question_ar = 'ما هو الغرض الرئيسي الذي قد يدفعك للإقامة في ولاية ينقل مستقبلاً؟ (اختر كل ما ينطبق)',
  type = 'checkbox',
  options_en = $$[
    "Tourism / Leisure",
    "Family visit",
    "Work / Business",
    "Event / Wedding",
    "Transit stop to another region",
    {"value":"Other","label_en":"Other (Please specify): __________________","label_ar":"أخرى (يرجى التحديد): __________________","requires_text":true}
  ]$$::jsonb,
  options_ar = $$[
    "السياحة / الترفيه والاستجمام",
    "زيارة عائلية",
    "العمل / إدارة الأعمال",
    "مناسبة اجتماعية / حفل زفاف",
    "محطة عبور (ترانزيت) إلى منطقة أخرى",
    {"value":"Other","label_en":"Other (Please specify): __________________","label_ar":"أخرى (يرجى التحديد): __________________","requires_text":true}
  ]$$::jsonb,
  required = true,
  order_num = 15,
  skip_logic = null
WHERE id = 'c1c1c1c1-0015-4000-8000-000000000001';

UPDATE survey_questions
SET
  question_en = 'Would you prefer to stay in Yanqul or in a nearby town such as Ibri, Sohar, or Al Buraimi?',
  question_ar = 'هل تفضل الإقامة في ولاية ينقل أم في مدينة مجاورة مثل عبري، صحار، أو البريمي؟',
  type = 'radio',
  options_en = $$[
    "I would prefer Yanqul if the hotel quality is good",
    "I would prefer a nearby town regardless",
    "It depends entirely on price and quality",
    "No preference"
  ]$$::jsonb,
  options_ar = $$[
    "أفضل الإقامة في ينقل إذا كانت جودة الفندق جيدة وملائمة",
    "أفضل الإقامة في مدينة مجاورة بغض النظر عن الجودة",
    "يعتمد ذلك بالكامل على السعر والجودة المقدمة",
    "لا يوجد تفضيل"
  ]$$::jsonb,
  required = true,
  order_num = 16,
  skip_logic = null
WHERE id = 'c1c1c1c1-0016-4000-8000-000000000001';

UPDATE survey_questions
SET
  question_en = 'What type of hotel would you prefer to see established in Wilayat Yanqul?',
  question_ar = 'ما هو نوع الفندق الذي تفضل رؤيته في ولاية ينقل؟',
  type = 'radio',
  options_en = $$[
    "Heritage Hotel / Resort: Traditional Omani architecture, heritage decor, and authentic local experiences (heritage tours, local cuisine)",
    "Modern Mid-Scale Hotel: A clean, comfortable 3-star standard hotel focusing on comfort and convenience",
    "Eco-Lodge: Environmentally friendly units integrated with the mountain nature or farms",
    "Budget Motel / Rest House: Clean basic rooms at the lowest price possible, targeting transit travelers"
  ]$$::jsonb,
  options_ar = $$[
    "فندق / منتجع تراثي: يتميز بالهندسة المعمارية العُمانية التقليدية، والديكورات التراثية، ويقدم تجارب محلية أصيلة (جولات تراثية، مأكولات شعبية)",
    "فندق حديث متوسط المستوى: فندق مريح ونظيف من فئة 3 نجوم يركز على توفير الراحة والملاءمة للنزلاء",
    "نزل بيئي (Eco-Lodge): وحدات صديقة للبيئة متكاملة مع الطبيعة الجبلية أو المزارع المحلية",
    "فندق اقتصادي / استراحة مسافرين: غرف أساسية نظيفة بأقل سعر ممكن، تستهدف عابري الطريق والترانزيت"
  ]$$::jsonb,
  required = true,
  order_num = 17,
  skip_logic = null
WHERE id = 'c1c1c1c1-0017-4000-8000-000000000001';

UPDATE survey_questions
SET
  question_en = 'What facilities are most important to you in a hotel in this area? (Select up to 5)',
  question_ar = 'ما هي المرافق الأكثر أهمية بالنسبة لك في فندق بهذه المنطقة؟ (اختر ما يصل إلى 5 مرافق)',
  type = 'checkbox',
  options_en = $$[
    "Clean and comfortable room",
    "Secure parking",
    "Traditional Omani restaurant and café",
    "Breakfast included",
    "Swimming pool",
    "Family rooms",
    "Gym",
    "Meeting room / Business center",
    "Organized local tours (Bait Al Marah Castle, mountain trails, farms)",
    {"value":"Other","label_en":"Other (Please specify): __________________","label_ar":"أخرى (يرجى التحديد): __________________","requires_text":true}
  ]$$::jsonb,
  options_ar = $$[
    "غرفة نظيفة ومريحة",
    "مواقف سيارات آمنة ومحمية",
    "مطعم ومقهى عُماني تقليدي شعبي",
    "وجبة الإفطار مشمولة في السعر",
    "حوض سباحة",
    "غرف عائلية واسعة",
    "صالة ألعاب رياضية (صالة لياقة بدنية)",
    "قاعة اجتماعات / مركز رجال الأعمال",
    "جولات محلية منظمة (مثل حصن بيت المراح، المسارات الجبلية، المزارع)",
    {"value":"Other","label_en":"Other (Please specify): __________________","label_ar":"أخرى (يرجى التحديد): __________________","requires_text":true}
  ]$$::jsonb,
  required = true,
  order_num = 18,
  skip_logic = $${
    "max_selections":5
  }$$::jsonb
WHERE id = 'c1c1c1c1-0018-4000-8000-000000000001';

UPDATE survey_questions
SET
  question_en = 'What is the maximum price you would accept to pay per night for an excellent stay in Yanqul?',
  question_ar = 'ما هو أقصى سعر تقبل دفعه لليلة الواحدة مقابل إقامة ممتازة في ولاية ينقل؟',
  type = 'radio',
  options_en = $$["Below OMR 20","OMR 20 – OMR 30","OMR 31 – OMR 40","OMR 41 – OMR 50","Above OMR 50"]$$::jsonb,
  options_ar = $$["أقل من 20 ريال عُماني","من 20 إلى 30 ريال عُماني","من 31 إلى 40 ريال عُماني","من 41 إلى 50 ريال عُماني","أكثر من 50 ريال عُماني"]$$::jsonb,
  required = true,
  order_num = 19,
  skip_logic = null
WHERE id = 'c1c1c1c1-0019-4000-8000-000000000001';

UPDATE survey_questions
SET
  question_en = 'What is your preferred booking method when securing hotel accommodations?',
  question_ar = 'ما هي طريقة الحجز المفضلة لديك عند تأمين الإقامة الفندقية؟',
  type = 'radio',
  options_en = $$[
    "Online Travel Agencies (Booking.com, Expedia, Agoda, etc.)",
    "Direct via Hotel Website or Mobile App",
    "Direct via Telephone, WhatsApp, or Email",
    "Walk-in (No prior reservation)"
  ]$$::jsonb,
  options_ar = $$[
    "وكالات السفر عبر الإنترنت (مثل Booking.com, Expedia, Agoda)",
    "مباشرة عبر الموقع الإلكتروني للفندق أو تطبيق الهاتف",
    "مباشرة عبر الهاتف أو الواتساب أو البريد الإلكتروني",
    "الحجز المباشر عند الوصول (دون حجز مسبق)"
  ]$$::jsonb,
  required = true,
  order_num = 20,
  skip_logic = null
WHERE id = 'c1c1c1c1-0020-4000-8000-000000000001';

UPDATE survey_questions
SET
  question_en = 'Do you agree that Wilayat Yanqul is in urgent need of a suitable hotel project?',
  question_ar = 'هل توافق على أن ولاية ينقل بحاجة ماسة إلى مشروع فندقي مناسب وملائم؟',
  type = 'radio',
  options_en = $$["Strongly Agree","Agree","Neutral","Disagree","Strongly Disagree"]$$::jsonb,
  options_ar = $$["موافق بشدة","موافق","محايد","غير موافق","غير موافق بشدة"]$$::jsonb,
  required = true,
  order_num = 21,
  skip_logic = null
WHERE id = 'c1c1c1c1-0021-4000-8000-000000000001';

UPDATE survey_questions
SET
  question_en = 'What is the greatest positive impact you expect the hotel to have on Wilayat Yanqul?',
  question_ar = 'ما هو الأثر الإيجابي الأكبر الذي تتوقع أن يحدثه الفندق في ولاية ينقل؟',
  type = 'checkbox',
  options_en = $$[
    "Stimulating tourism and attracting visitors",
    "Providing direct and indirect jobs for Omani youth in the Wilayat",
    "Supporting local businesses, farms, and small projects in the Wilayat",
    "Providing a comfortable stop for transit travelers",
    {"value":"Other","label_en":"Other (Please specify): __________________","label_ar":"أخرى (يرجى التحديد): __________________","requires_text":true}
  ]$$::jsonb,
  options_ar = $$[
    "تنشيط السياحة وجذب الزوار إلى الولاية",
    "توفير فرص عمل مباشرة وغير مباشرة للشباب العُماني في الولاية",
    "دعم الشركات المحلية والمزارع والمشاريع الصغيرة في الولاية",
    "توفير استراحة مريحة للمسافرين وعابري الطريق",
    {"value":"Other","label_en":"Other (Please specify): __________________","label_ar":"أخرى (يرجى التحديد): __________________","requires_text":true}
  ]$$::jsonb,
  required = false,
  order_num = 22,
  skip_logic = null
WHERE id = 'c1c1c1c1-0022-4000-8000-000000000001';

UPDATE survey_questions
SET
  question_en = 'To what extent do you support the idea of converting or integrating existing farms or heritage houses in the Wilayat into heritage/eco-lodges?',
  question_ar = 'إلى أي مدى تدعم فكرة تحويل أو دمج المزارع القائمة أو البيوت الأثرية في الولاية إلى نزل تراثية/بيئية؟',
  type = 'radio',
  options_en = $$["Strongly support","Support","Neutral","Prefer building a completely modern hotel","Do not support the idea"]$$::jsonb,
  options_ar = $$["أدعم بشدة","أدعم","محايد","أفضل بناء فندق حديث بالكامل","لا أدعم الفكرة على الإطلاق"]$$::jsonb,
  required = true,
  order_num = 23,
  skip_logic = null
WHERE id = 'c1c1c1c1-0023-4000-8000-000000000001';

UPDATE survey_questions
SET
  question_en = 'Do you have any additional suggestions or ideas to share for the success of this hotel project in Wilayat Yanqul?',
  question_ar = 'هل لديك أي مقترحات أو أفكار إضافية تود مشاركتها لنجاح هذا المشروع الفندقي في ولاية ينقل؟',
  type = 'text',
  options_en = $$[]$$::jsonb,
  options_ar = $$[]$$::jsonb,
  required = false,
  order_num = 24,
  skip_logic = null
WHERE id = 'c1c1c1c1-0024-4000-8000-000000000001';

COMMIT;
