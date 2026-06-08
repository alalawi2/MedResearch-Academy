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
  'This survey evaluates the feasibility of establishing a hotel project in Wilayat Yanqul, Al Dhahirah Governorate, Sultanate of Oman. Your responses help determine the project type, scale, and classification. The survey takes 4-6 minutes. All responses are anonymous and confidential.',
  'يُجرى هذا الاستبيان لتقييم جدوى إنشاء مشروع فندقي في ولاية ينقل بمحافظة الظاهرة، سلطنة عمان. إجاباتكم تساعد في تحديد نوع المشروع وحجمه وتصنيفه. يستغرق الاستبيان من 4 إلى 6 دقائق. جميع الإجابات مجهولة وسرية.',
  'Mohamed Al Alawi',
  'mohamed.alawi@example.com',
  'Executive MBA Program',
  'active',
  'both',
  6,
  true,
  'MBA-2026-YANQUL'
);

-- 2. Create sections
-- Section 1: Respondent Profile
INSERT INTO survey_sections (id, survey_id, title_en, title_ar, description_en, description_ar, order_num)
VALUES ('b1b1b1b1-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
  'Respondent Profile', 'الملف الشخصي للمشارك',
  'Please provide some general background to help us classify your responses.',
  'يرجى تقديم بعض المعلومات العامة لمساعدتنا في تصنيف إجاباتكم.',
  1);

-- Section 2: Experience with Yanqul
INSERT INTO survey_sections (id, survey_id, title_en, title_ar, description_en, description_ar, order_num)
VALUES ('b1b1b1b1-0002-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
  'Your Experience with Wilayat Yanqul', 'تجربتك مع ولاية ينقل',
  'This section aims to understand your current visit frequency and accommodation behavior in Wilayat Yanqul.',
  'يهدف هذا القسم إلى فهم معدل زياراتك الحالية وسلوك الإقامة في ولاية ينقل.',
  2);

-- Section 3: Demand for a Hotel
INSERT INTO survey_sections (id, survey_id, title_en, title_ar, description_en, description_ar, order_num)
VALUES ('b1b1b1b1-0003-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
  'Demand for a Hotel in Yanqul', 'الطلب على فندق في ينقل',
  'Assessing the potential interest and demand for a new high-quality hotel project in Wilayat Yanqul.',
  'تقييم الاهتمام المحتمل والطلب على مشروع فندقي جديد عالي الجودة في ولاية ينقل.',
  3);

-- 3. Create questions

-- === SECTION 1: Respondent Profile ===

-- Q1: Nationality
INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num)
VALUES ('c1c1c1c1-0001-4000-8000-000000000001', 'b1b1b1b1-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
  'What is your nationality?', 'ما هي جنسيتك؟',
  'radio',
  '["Omani","Other GCC National (Saudi, Emirati, Qatari, Kuwaiti, Bahraini)","Expatriate Resident in Oman","International Visitor (Non-GCC)"]',
  '["عُماني","مواطن خليجي آخر (سعودي، إماراتي، قطري، كويتي، بحريني)","مقيم وافد في عُمان","زائر دولي (من خارج دول مجلس التعاون الخليجي)"]',
  true, 1);

-- Q2: Age group
INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num)
VALUES ('c1c1c1c1-0002-4000-8000-000000000001', 'b1b1b1b1-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
  'What is your age group?', 'ما هي فئتك العمرية؟',
  'radio',
  '["Below 20","20–29","30–39","40–49","50 and above"]',
  '["أقل من 20 سنة","20 – 29 سنة","30 – 39 سنة","40 – 49 سنة","50 سنة فما فوق"]',
  true, 2);

-- Q3: Employment status
INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num)
VALUES ('c1c1c1c1-0003-4000-8000-000000000001', 'b1b1b1b1-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
  'What is your current employment status?', 'ما هي حالتك الوظيفية الحالية؟',
  'radio',
  '["Student","Government / Public Sector Employee","Private Sector Employee","Self-employed / Entrepreneur","Retired","Unemployed / Others"]',
  '["طالب","موظف في القطاع الحكومي / العام","موظف في القطاع الخاص","أعمل لحسابي الخاص / رائد أعمال","متقاعد","باحث عن عمل / أخرى"]',
  true, 3);

-- Q4: Monthly income
INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num)
VALUES ('c1c1c1c1-0004-4000-8000-000000000001', 'b1b1b1b1-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
  'What is your approximate monthly household income (in OMR)?', 'ما هو متوسط الدخل الشهري التقريبي لأسرتك (بالريال العُماني)؟',
  'radio',
  '["Below OMR 500","OMR 500 – OMR 999","OMR 1,000 – OMR 1,999","OMR 2,000 – OMR 2,999","OMR 3,000 and above"]',
  '["أقل من 500 ريال عُماني","من 500 إلى 999 ريال عُماني","من 1,000 إلى 1,999 ريال عُماني","من 2,000 إلى 2,999 ريال عُماني","3,000 ريال عُماني فما فوق"]',
  true, 4);

-- Q5: Current residence (SKIP LOGIC TRIGGER)
INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num, skip_logic)
VALUES ('c1c1c1c1-0005-4000-8000-000000000001', 'b1b1b1b1-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
  'Where do you currently live?', 'أين تقيم حالياً؟',
  'radio',
  '["Yanqul","Ibri","Dhank","Other governorate","Other (Please specify)"]',
  '["ينقل","عبري","ضنك","محافظة أخرى","أخرى (يرجى التحديد)"]',
  true, 5,
  null);

-- Q6: Travel companion
INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num)
VALUES ('c1c1c1c1-0006-4000-8000-000000000001', 'b1b1b1b1-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
  'Who do you typically travel with?', 'مع من تسافر عادةً؟',
  'radio',
  '["Alone","With family including children","With friends or colleagues"]',
  '["بمفردي","مع العائلة (بما في ذلك الأطفال)","مع الأصدقاء أو الزملاء"]',
  true, 6);

-- === SECTION 2: Experience with Yanqul ===

-- Q7: Visited before
INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num)
VALUES ('c1c1c1c1-0007-4000-8000-000000000001', 'b1b1b1b1-0002-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
  'Have you ever visited Wilayat Yanqul before?', 'هل سبق لك زيارة ولاية ينقل من قبل؟',
  'radio',
  '["Yes","No"]',
  '["نعم","لا"]',
  true, 7);

-- Q8: Reason for visit (show if Q7 = Yes)
INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num, skip_logic)
VALUES ('c1c1c1c1-0008-4000-8000-000000000001', 'b1b1b1b1-0002-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
  'If yes, what was the main reason for your visit?', 'إذا كانت الإجابة بنعم، ما هو السبب الرئيسي لزيارتك؟',
  'radio',
  '["Family visit / Visiting relatives","Tourism / Leisure","Work / Business","Event / Wedding","Transit to another region","Other"]',
  '["زيارة عائلية / زيارة الأقارب","السياحة / الترفيه والاستجمام","العمل / إدارة الأعمال","مناسبة اجتماعية / حفل زفاف","عبور (ترانزيت) إلى منطقة أخرى","أخرى"]',
  false, 8,
  '{"show_if":{"question_id":"c1c1c1c1-0007-4000-8000-000000000001","equals":"Yes"}}');

-- Q9: Visit frequency (show if Q7 = Yes)
INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num, skip_logic)
VALUES ('c1c1c1c1-0009-4000-8000-000000000001', 'b1b1b1b1-0002-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
  'How often do you visit Yanqul?', 'كم مرة تزور ولاية ينقل عادةً؟',
  'radio',
  '["Weekly","Monthly","A few times per year","Once a year","Rarely"]',
  '["أسبوعياً","شهرياً","عدة مرات في السنة","مرة واحدة في السنة","نادراً"]',
  false, 9,
  '{"show_if":{"question_id":"c1c1c1c1-0007-4000-8000-000000000001","equals":"Yes"}}');

-- Q10: Time of year (checkbox - multiple choice)
INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num, skip_logic)
VALUES ('c1c1c1c1-0010-4000-8000-000000000001', 'b1b1b1b1-0002-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
  'What time of year are you most likely to visit Yanqul? (Select all that apply)', 'ما هو الوقت من السنة الذي يُرجح أن تزور فيه ولاية ينقل؟ (اختر كل ما ينطبق)',
  'checkbox',
  '["Winter Season (October – March)","Summer Season (April – September)","During religious and national holidays","No seasonal preference"]',
  '["موسم الشتاء (أكتوبر – مارس)","موسم الصيف (أبريل – سبتمبر)","خلال الأعياد الدينية والوطنية","لا تفضيل موسمي"]',
  true, 10,
  '{"show_if":{"question_id":"c1c1c1c1-0007-4000-8000-000000000001","equals":"Yes"}}');

-- Q11: Overnight stay
INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num, skip_logic)
VALUES ('c1c1c1c1-0011-4000-8000-000000000001', 'b1b1b1b1-0002-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
  'When you visited Yanqul, did you stay overnight?', 'عندما زرت ينقل، هل بقيت ليلة؟',
  'radio',
  '["Yes, I stayed overnight in Yanqul","No, I stayed in a nearby town","No, I returned the same day"]',
  '["نعم، بقيت ليلة في ينقل","لا، أقمت في ولاية مجاورة","لا، عدت في نفس اليوم"]',
  false, 11,
  '{"show_if":{"question_id":"c1c1c1c1-0007-4000-8000-000000000001","equals":"Yes"}}');

-- Q12: Why not overnight
INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num, skip_logic)
VALUES ('c1c1c1c1-0012-4000-8000-000000000001', 'b1b1b1b1-0002-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
  'If you did NOT stay overnight, what was the main reason?', 'إذا لم تبت ليلة في ينقل، ما هو السبب الرئيسي؟',
  'radio',
  '["No suitable hotel or accommodation available","My visit was too short","I preferred to stay with family or relatives","I preferred a nearby town with better facilities","I did not need accommodation","Other"]',
  '["عدم توفر فندق أو سكن مناسب","كانت زيارتي قصيرة جداً","فضلت الإقامة مع العائلة أو الأقارب","فضلت الإقامة في ولاية مجاورة بمرافق أفضل","لم أكن بحاجة لسكن","أخرى"]',
  false, 12,
  '{"show_if":{"question_id":"c1c1c1c1-0011-4000-8000-000000000001","not_equals":"Yes, I stayed overnight in Yanqul"}}');

-- === SECTION 3: Demand for a Hotel ===

-- Q13: Would you stay
INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num)
VALUES ('c1c1c1c1-0013-4000-8000-000000000001', 'b1b1b1b1-0003-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
  'If a professionally managed, high-quality hotel was available in Yanqul, would you consider staying overnight?',
  'إذا كان هناك فندق عالي الجودة ومُدار بشكل احترافي متوفر في ينقل، هل ستفكر في المبيت؟',
  'radio',
  '["Yes, definitely","Maybe, depending on price and facilities","No, I would still prefer a nearby town"]',
  '["نعم، بالتأكيد","ربما، حسب السعر والمرافق","لا، أفضل الإقامة في ولاية مجاورة"]',
  true, 13);

-- Q14: Likelihood of use (Likert)
INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num)
VALUES ('c1c1c1c1-0014-4000-8000-000000000001', 'b1b1b1b1-0003-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
  'How likely are you to use a hotel in Yanqul in the next 12 months?',
  'ما مدى احتمالية استخدامك لفندق في ينقل خلال الـ 12 شهراً القادمة؟',
  'likert',
  '["Very Unlikely","Unlikely","Neutral","Likely","Very Likely"]',
  '["غير مرجح جداً","غير مرجح","محايد","مرجح","مرجح جداً"]',
  true, 14);
