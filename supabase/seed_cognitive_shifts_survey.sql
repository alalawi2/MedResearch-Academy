-- ══════════════════════════════════════════════════════════════
-- SEED: Cognitive Effects of Shift Work Survey
-- PI: Dr. Said Al Farsi (said.alfarsi96@gmail.com)
-- English only (as specified in proposal)
-- 9 sections: Demographics, STOP-BANG, rMEQ, WHO-5, PHQ-9,
--             GAD-7, PSS-10, CBI-19, NASA-TLX
-- ══════════════════════════════════════════════════════════════

-- Survey UUID base: d1d1d1d1-xxxx-4000-8000-000000000001

-- 1. Create the survey
INSERT INTO surveys (id, title_en, title_ar, description_en, description_ar, researcher_name, researcher_email, institution, status, language, estimated_minutes, ethics_approved, ethics_reference)
VALUES (
  'd1d1d1d1-0001-4000-8000-000000000001',
  'Comparative Study of Cognitive Effects of 24-Hour and 12-Hour Shifts on OMSB Residents',
  'دراسة مقارنة للتأثيرات المعرفية لنوبات العمل على مدار 24 و12 ساعة على المقيمين في المجلس العماني للاختصاصات الطبية',
  $$Dear Participant,

You are invited to participate in a research study examining the impact of shift work on cognitive function among resident physicians at the Oman Medical Specialty Board (OMSB).

This study compares the effects of 24-hour on-call shifts versus 12-hour night shifts on short-term memory and attention. Your participation will also help us understand how sleep patterns, mental health, stress, and burnout may influence cognitive performance.

The survey includes validated screening instruments covering demographics, sleep assessment, chronotype, well-being, mental health, stress, burnout, and post-shift workload. It takes approximately 20-25 minutes to complete.

Your participation is entirely voluntary. All responses are confidential and will be used for research purposes only. No personally identifying information will be shared.

Thank you for contributing to this important research.

Principal Investigator: Dr. Said Al Farsi
Co-PI: Dr. Siham Al Shimli
Research Supervisor: Prof. Samir Al Adawi$$,
  $$عزيزي المشارك،

أنت مدعو للمشاركة في دراسة بحثية تبحث في تأثير نوبات العمل على الوظائف المعرفية لدى الأطباء المقيمين في المجلس العماني للاختصاصات الطبية.

مشاركتك طوعية بالكامل وجميع الإجابات سرية.

الباحث الرئيسي: د. سعيد الفارسي$$,
  'Dr. Said Al Farsi',
  'said.alfarsi96@gmail.com',
  'Oman Medical Specialty Board (OMSB)',
  'active',
  'en',
  25,
  true,
  'OMSB-RIC-2024'
);

-- 2. Create sections (9 sections)
INSERT INTO survey_sections (id, survey_id, title_en, title_ar, description_en, description_ar, order_num)
VALUES
  ('d2d2d2d2-0001-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Demographics & Shift Information', 'المعلومات الديموغرافية ونوبات العمل',
   'Please provide your background information and details about your shift work pattern.', 'يرجى تقديم معلوماتك الأساسية وتفاصيل نمط عملك.', 1),
  ('d2d2d2d2-0002-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'STOP-BANG Questionnaire', 'استبيان ستوب-بانغ',
   'Screening tool for obstructive sleep apnea (OSA). Please answer honestly.', 'أداة فحص لانقطاع التنفس الانسدادي أثناء النوم.', 2),
  ('d2d2d2d2-0003-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Chronotype (rMEQ-5)', 'النمط الزمني',
   'The Reduced Morningness-Eveningness Questionnaire. These questions help determine your natural circadian preference.', 'استبيان الصباحية والمسائية المختصر. تساعد هذه الأسئلة في تحديد تفضيلك الطبيعي للإيقاع اليومي.', 3),
  ('d2d2d2d2-0004-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'WHO-5 Well-Being Index', 'مؤشر الرفاهية WHO-5',
   'Please indicate for each of the five statements which is closest to how you have been feeling over the past two weeks. Scoring: 0 = At no time, 1 = Some of the time, 2 = Less than half of the time, 3 = More than half of the time, 4 = Most of the time, 5 = All of the time.', 'يرجى الإشارة لكل من العبارات الخمس إلى أقرب وصف لشعورك خلال الأسبوعين الماضيين.', 4),
  ('d2d2d2d2-0005-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Patient Health Questionnaire (PHQ-9)', 'استبيان صحة المريض',
   'Over the last 2 weeks, how often have you been bothered by any of the following problems? 0 = Not at all, 1 = Several days, 2 = More than half the days, 3 = Nearly every day.', 'خلال الأسبوعين الماضيين، كم مرة أزعجتك أي من المشاكل التالية؟', 5),
  ('d2d2d2d2-0006-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Generalized Anxiety Disorder (GAD-7)', 'اضطراب القلق العام',
   'Over the last 2 weeks, how often have you been bothered by the following problems? 0 = Not at all, 1 = Several days, 2 = More than half the days, 3 = Nearly every day.', 'خلال الأسبوعين الماضيين، كم مرة أزعجتك المشاكل التالية؟', 6),
  ('d2d2d2d2-0007-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Perceived Stress Scale (PSS-10)', 'مقياس الإجهاد المدرك',
   'The questions ask about your feelings and thoughts during the last month. In each case, indicate how often you felt or thought a certain way. 0 = Never, 1 = Almost never, 2 = Sometimes, 3 = Fairly often, 4 = Very often.', 'تسأل الأسئلة التالية عن مشاعرك وأفكارك خلال الشهر الماضي.', 7),
  ('d2d2d2d2-0008-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Copenhagen Burnout Inventory (CBI)', 'مقياس كوبنهاغن للاحتراق الوظيفي',
   'Please rate how often you experience the following. The CBI measures burnout across three dimensions: personal, work-related, and client-related.', 'يرجى تقييم مدى تكرار تجربتك لما يلي. يقيس مقياس كوبنهاغن الاحتراق عبر ثلاثة أبعاد.', 8),
  ('d2d2d2d2-0009-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'NASA Task Load Index (NASA-TLX)', 'مؤشر حمل العمل ناسا',
   'Rate each dimension on a scale from 0 (Very Low) to 100 (Very High) based on your experience during your most recent shift. This tool measures your perceived workload.', 'قيّم كل بُعد على مقياس من 0 (منخفض جداً) إلى 100 (مرتفع جداً) بناءً على تجربتك خلال نوبتك الأخيرة.', 9);

-- ══════════════════════════════════════════════════════════════
-- 3. QUESTIONS
-- ══════════════════════════════════════════════════════════════

-- === SECTION 1: Demographics & Shift Information ===

INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num)
VALUES
  -- Q1: Age
  ('d3d3d3d3-0001-4000-8000-000000000001', 'd2d2d2d2-0001-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Age (years)', 'العمر (سنوات)', 'number', '[]'::jsonb, '[]'::jsonb, true, 1),

  -- Q2: Gender
  ('d3d3d3d3-0002-4000-8000-000000000001', 'd2d2d2d2-0001-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Gender', 'الجنس', 'radio',
   '["Male", "Female"]'::jsonb,
   '["ذكر", "أنثى"]'::jsonb, true, 2),

  -- Q3: Year of residency
  ('d3d3d3d3-0003-4000-8000-000000000001', 'd2d2d2d2-0001-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Years of residency training', 'سنوات التدريب في الإقامة', 'radio',
   '["R1 (1st year)", "R2 (2nd year)", "R3 (3rd year)", "R4 (4th year)", "R5 (5th year)", "R6 (6th year)"]'::jsonb,
   '["السنة الأولى", "السنة الثانية", "السنة الثالثة", "السنة الرابعة", "السنة الخامسة", "السنة السادسة"]'::jsonb, true, 3),

  -- Q4: Specialty
  ('d3d3d3d3-0004-4000-8000-000000000001', 'd2d2d2d2-0001-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Specialty', 'التخصص', 'radio',
   '["Internal Medicine", "Pediatrics", "General Surgery", "Psychiatry", "Orthopedic", "OB/GYNE", "ENT", "Anesthesia", "Other"]'::jsonb,
   '["الطب الباطني", "طب الأطفال", "الجراحة العامة", "الطب النفسي", "العظام", "النساء والتوليد", "الأنف والأذن والحنجرة", "التخدير", "أخرى"]'::jsonb, true, 4),

  -- Q5: Years on shift-based schedule
  ('d3d3d3d3-0005-4000-8000-000000000001', 'd2d2d2d2-0001-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'How many years have you been working on a shift-based schedule?', 'كم سنة عملت في جدول قائم على النوبات؟', 'number', '[]'::jsonb, '[]'::jsonb, true, 5),

  -- Q6: Night shifts per month
  ('d3d3d3d3-0006-4000-8000-000000000001', 'd2d2d2d2-0001-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'How often do you work night shifts (12-hour) or extended shifts (24-hour on-call) per month on average?', 'كم مرة تعمل نوبات ليلية (12 ساعة) أو نوبات ممتدة (24 ساعة) شهرياً في المتوسط؟', 'number', '[]'::jsonb, '[]'::jsonb, true, 6),

  -- Q7: Average sleep hours on workdays
  ('d3d3d3d3-0007-4000-8000-000000000001', 'd2d2d2d2-0001-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'On average, how many hours of sleep do you get per night on workdays?', 'في المتوسط، كم ساعة تنام في الليلة خلال أيام العمل؟', 'number', '[]'::jsonb, '[]'::jsonb, true, 7),

  -- Q8: Feel rested after shift
  ('d3d3d3d3-0008-4000-8000-000000000001', 'd2d2d2d2-0001-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'How often do you feel rested after a night shift or extended shift (24-hour on-call)?', 'كم مرة تشعر بالراحة بعد نوبة ليلية أو نوبة ممتدة (24 ساعة)؟', 'radio',
   '["Always", "Often", "Sometimes", "Rarely", "Never"]'::jsonb,
   '["دائماً", "غالباً", "أحياناً", "نادراً", "أبداً"]'::jsonb, true, 8),

  -- Q9: Coping mechanisms
  ('d3d3d3d3-0009-4000-8000-000000000001', 'd2d2d2d2-0001-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Indicate which coping mechanisms you use to manage the challenges of shift work (select all that apply):', 'حدد آليات التكيف التي تستخدمها لإدارة تحديات العمل بنظام النوبات:', 'checkbox',
   '["Regular exercise", "Healthy diet", "Mindfulness or meditation", "Napping during breaks", "Social support from colleagues", "None of the above"]'::jsonb,
   '["ممارسة الرياضة بانتظام", "نظام غذائي صحي", "التأمل واليقظة الذهنية", "القيلولة أثناء الاستراحات", "الدعم الاجتماعي من الزملاء", "لا شيء مما سبق"]'::jsonb, true, 9),

  -- Q10: Work environment satisfaction
  ('d3d3d3d3-0010-4000-8000-000000000001', 'd2d2d2d2-0001-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'On a scale of 1 to 5, rate your overall satisfaction with your current work environment (1 = Very Unsatisfied, 5 = Very Satisfied)', 'على مقياس من 1 إلى 5، قيّم رضاك العام عن بيئة عملك الحالية', 'likert',
   '["1 - Very Unsatisfied", "2 - Unsatisfied", "3 - Neutral", "4 - Satisfied", "5 - Very Satisfied"]'::jsonb,
   '["1 - غير راضٍ جداً", "2 - غير راضٍ", "3 - محايد", "4 - راضٍ", "5 - راضٍ جداً"]'::jsonb, true, 10),

  -- Q11: Factors contributing to cognitive decline (open-ended)
  ('d3d3d3d3-0011-4000-8000-000000000001', 'd2d2d2d2-0001-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Are there specific factors in your work environment that you believe contribute to cognitive decline or affect your ability to cope with shift work?', 'هل هناك عوامل محددة في بيئة عملك تعتقد أنها تساهم في التدهور المعرفي أو تؤثر على قدرتك على التكيف مع العمل بنظام النوبات؟', 'text', '[]'::jsonb, '[]'::jsonb, false, 11),

  -- Q12: Road traffic accidents after night shifts
  ('d3d3d3d3-0012-4000-8000-000000000001', 'd2d2d2d2-0001-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Have you been involved in road traffic accidents after working night shifts?', 'هل تعرضت لحوادث مرورية بعد العمل في نوبات ليلية؟', 'radio',
   '["Yes", "No"]'::jsonb, '["نعم", "لا"]'::jsonb, true, 12),

  -- Q13: Near-miss accidents
  ('d3d3d3d3-0013-4000-8000-000000000001', 'd2d2d2d2-0001-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Have you had near-miss accidents while driving following night shifts?', 'هل تعرضت لحوادث وشيكة أثناء القيادة بعد نوبات ليلية؟', 'radio',
   '["Yes", "No"]'::jsonb, '["نعم", "لا"]'::jsonb, true, 13);


-- === SECTION 2: STOP-BANG Questionnaire ===

INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num)
VALUES
  -- Height
  ('d3d3d3d3-0014-4000-8000-000000000001', 'd2d2d2d2-0002-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Height (cm)', 'الطول (سم)', 'number', '[]'::jsonb, '[]'::jsonb, true, 14),
  -- Weight
  ('d3d3d3d3-0015-4000-8000-000000000001', 'd2d2d2d2-0002-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Weight (kg)', 'الوزن (كجم)', 'number', '[]'::jsonb, '[]'::jsonb, true, 15),
  -- Neck circumference
  ('d3d3d3d3-0016-4000-8000-000000000001', 'd2d2d2d2-0002-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Neck circumference (cm) — measured around Adam''s apple', 'محيط الرقبة (سم) — يُقاس حول تفاحة آدم', 'number', '[]'::jsonb, '[]'::jsonb, true, 16),
  -- S: Snoring
  ('d3d3d3d3-0017-4000-8000-000000000001', 'd2d2d2d2-0002-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Do you snore loudly (louder than talking or loud enough to be heard through closed doors)?', 'هل تشخر بصوت عالٍ (أعلى من الكلام أو بما يكفي لسماعه عبر الأبواب المغلقة)؟', 'radio',
   '["Yes", "No"]'::jsonb, '["نعم", "لا"]'::jsonb, true, 17),
  -- T: Tired
  ('d3d3d3d3-0018-4000-8000-000000000001', 'd2d2d2d2-0002-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Do you often feel tired, fatigued, or sleepy during the day?', 'هل تشعر غالباً بالتعب أو الإرهاق أو النعاس أثناء النهار؟', 'radio',
   '["Yes", "No"]'::jsonb, '["نعم", "لا"]'::jsonb, true, 18),
  -- O: Observed
  ('d3d3d3d3-0019-4000-8000-000000000001', 'd2d2d2d2-0002-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Has anyone observed that you stopped breathing during your sleep?', 'هل لاحظ أحد أنك تتوقف عن التنفس أثناء نومك؟', 'radio',
   '["Yes", "No"]'::jsonb, '["نعم", "لا"]'::jsonb, true, 19),
  -- P: Blood pressure
  ('d3d3d3d3-0020-4000-8000-000000000001', 'd2d2d2d2-0002-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Do you have or are you being treated for high blood pressure?', 'هل لديك أو تُعالج من ارتفاع ضغط الدم؟', 'radio',
   '["Yes", "No"]'::jsonb, '["نعم", "لا"]'::jsonb, true, 20);


-- === SECTION 3: Chronotype (rMEQ-5) ===

INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num)
VALUES
  -- rMEQ Q1
  ('d3d3d3d3-0021-4000-8000-000000000001', 'd2d2d2d2-0003-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Taking into account only your own diurnal rhythm, at what time would you get up if you were entirely free to plan your day?', 'مع الأخذ بعين الاعتبار إيقاعك اليومي فقط، في أي وقت ستستيقظ لو كنت حراً تماماً في تخطيط يومك؟', 'radio',
   '["5:00 – 6:30 AM (5 points)", "6:30 – 7:45 AM (4 points)", "7:45 – 9:45 AM (3 points)", "9:45 – 11:00 AM (2 points)", "11:00 AM – 12:00 PM (1 point)", "12:00 PM – 5:00 AM (0 points)"]'::jsonb,
   '["5:00 – 6:30 صباحاً", "6:30 – 7:45 صباحاً", "7:45 – 9:45 صباحاً", "9:45 – 11:00 صباحاً", "11:00 صباحاً – 12:00 ظهراً", "12:00 ظهراً – 5:00 صباحاً"]'::jsonb, true, 21),

  -- rMEQ Q2
  ('d3d3d3d3-0022-4000-8000-000000000001', 'd2d2d2d2-0003-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'During the first half-hour after you wake up in the morning, how tired do you feel?', 'خلال النصف ساعة الأولى بعد استيقاظك صباحاً، ما مدى شعورك بالتعب؟', 'radio',
   '["Very tired (1 point)", "Fairly tired (2 points)", "Fairly refreshed (3 points)", "Very refreshed (4 points)"]'::jsonb,
   '["متعب جداً", "متعب إلى حد ما", "منتعش إلى حد ما", "منتعش جداً"]'::jsonb, true, 22),

  -- rMEQ Q3
  ('d3d3d3d3-0023-4000-8000-000000000001', 'd2d2d2d2-0003-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'At what time of the night do you feel tired and as a result need sleep?', 'في أي وقت من الليل تشعر بالتعب وتحتاج للنوم؟', 'radio',
   '["8:00 – 9:00 PM (5 points)", "9:00 – 10:15 PM (4 points)", "10:15 PM – 12:45 AM (3 points)", "12:45 – 2:00 AM (2 points)", "2:00 – 3:00 AM (1 point)"]'::jsonb,
   '["8:00 – 9:00 مساءً", "9:00 – 10:15 مساءً", "10:15 مساءً – 12:45 صباحاً", "12:45 – 2:00 صباحاً", "2:00 – 3:00 صباحاً"]'::jsonb, true, 23),

  -- rMEQ Q4
  ('d3d3d3d3-0024-4000-8000-000000000001', 'd2d2d2d2-0003-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'At what time of the day do you think you reach your "feeling best" peak?', 'في أي وقت من اليوم تعتقد أنك تصل إلى ذروة "أفضل حالاتك"؟', 'radio',
   '["5:00 – 8:00 AM (5 points)", "8:00 – 10:00 AM (4 points)", "10:00 AM – 5:00 PM (3 points)", "5:00 – 10:00 PM (2 points)", "10:00 PM – 5:00 AM (1 point)"]'::jsonb,
   '["5:00 – 8:00 صباحاً", "8:00 – 10:00 صباحاً", "10:00 صباحاً – 5:00 مساءً", "5:00 – 10:00 مساءً", "10:00 مساءً – 5:00 صباحاً"]'::jsonb, true, 24),

  -- rMEQ Q5
  ('d3d3d3d3-0025-4000-8000-000000000001', 'd2d2d2d2-0003-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'One hears about "morning" and "evening" types of people. Which of these types do you consider yourself to be?', 'يُقال إن هناك أشخاصاً من النوع "الصباحي" وآخرين من النوع "المسائي". أي نوع تعتبر نفسك؟', 'radio',
   '["Definitely a morning type (6 points)", "Rather more a morning than an evening type (4 points)", "Rather more an evening than a morning type (2 points)", "Definitely an evening type (0 points)"]'::jsonb,
   '["بالتأكيد نوع صباحي", "أقرب للنوع الصباحي", "أقرب للنوع المسائي", "بالتأكيد نوع مسائي"]'::jsonb, true, 25);


-- === SECTION 4: WHO-5 Well-Being Index ===

INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num)
VALUES
  ('d3d3d3d3-0026-4000-8000-000000000001', 'd2d2d2d2-0004-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'I have felt cheerful and in good spirits', 'شعرت بالبهجة وبمعنويات جيدة', 'radio',
   '["5 - All of the time", "4 - Most of the time", "3 - More than half of the time", "2 - Less than half of the time", "1 - Some of the time", "0 - At no time"]'::jsonb,
   '["5 - طوال الوقت", "4 - معظم الوقت", "3 - أكثر من نصف الوقت", "2 - أقل من نصف الوقت", "1 - بعض الوقت", "0 - في أي وقت"]'::jsonb, true, 26),

  ('d3d3d3d3-0027-4000-8000-000000000001', 'd2d2d2d2-0004-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'I have felt calm and relaxed', 'شعرت بالهدوء والاسترخاء', 'radio',
   '["5 - All of the time", "4 - Most of the time", "3 - More than half of the time", "2 - Less than half of the time", "1 - Some of the time", "0 - At no time"]'::jsonb,
   '["5 - طوال الوقت", "4 - معظم الوقت", "3 - أكثر من نصف الوقت", "2 - أقل من نصف الوقت", "1 - بعض الوقت", "0 - في أي وقت"]'::jsonb, true, 27),

  ('d3d3d3d3-0028-4000-8000-000000000001', 'd2d2d2d2-0004-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'I have felt active and vigorous', 'شعرت بالنشاط والحيوية', 'radio',
   '["5 - All of the time", "4 - Most of the time", "3 - More than half of the time", "2 - Less than half of the time", "1 - Some of the time", "0 - At no time"]'::jsonb,
   '["5 - طوال الوقت", "4 - معظم الوقت", "3 - أكثر من نصف الوقت", "2 - أقل من نصف الوقت", "1 - بعض الوقت", "0 - في أي وقت"]'::jsonb, true, 28),

  ('d3d3d3d3-0029-4000-8000-000000000001', 'd2d2d2d2-0004-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'I woke up feeling fresh and rested', 'استيقظت وأنا أشعر بالانتعاش والراحة', 'radio',
   '["5 - All of the time", "4 - Most of the time", "3 - More than half of the time", "2 - Less than half of the time", "1 - Some of the time", "0 - At no time"]'::jsonb,
   '["5 - طوال الوقت", "4 - معظم الوقت", "3 - أكثر من نصف الوقت", "2 - أقل من نصف الوقت", "1 - بعض الوقت", "0 - في أي وقت"]'::jsonb, true, 29),

  ('d3d3d3d3-0030-4000-8000-000000000001', 'd2d2d2d2-0004-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'My daily life has been filled with things that interest me', 'كانت حياتي اليومية مليئة بأشياء تهمني', 'radio',
   '["5 - All of the time", "4 - Most of the time", "3 - More than half of the time", "2 - Less than half of the time", "1 - Some of the time", "0 - At no time"]'::jsonb,
   '["5 - طوال الوقت", "4 - معظم الوقت", "3 - أكثر من نصف الوقت", "2 - أقل من نصف الوقت", "1 - بعض الوقت", "0 - في أي وقت"]'::jsonb, true, 30);


-- === SECTION 5: PHQ-9 ===

INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num)
VALUES
  ('d3d3d3d3-0031-4000-8000-000000000001', 'd2d2d2d2-0005-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Little interest or pleasure in doing things', 'قلة الاهتمام أو المتعة في القيام بالأشياء', 'radio',
   '["0 - Not at all", "1 - Several days", "2 - More than half the days", "3 - Nearly every day"]'::jsonb,
   '["0 - أبداً", "1 - عدة أيام", "2 - أكثر من نصف الأيام", "3 - تقريباً كل يوم"]'::jsonb, true, 31),

  ('d3d3d3d3-0032-4000-8000-000000000001', 'd2d2d2d2-0005-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Feeling down, depressed, or hopeless', 'الشعور بالإحباط أو الاكتئاب أو اليأس', 'radio',
   '["0 - Not at all", "1 - Several days", "2 - More than half the days", "3 - Nearly every day"]'::jsonb,
   '["0 - أبداً", "1 - عدة أيام", "2 - أكثر من نصف الأيام", "3 - تقريباً كل يوم"]'::jsonb, true, 32),

  ('d3d3d3d3-0033-4000-8000-000000000001', 'd2d2d2d2-0005-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Trouble falling or staying asleep, or sleeping too much', 'صعوبة في النوم أو البقاء نائماً، أو النوم كثيراً', 'radio',
   '["0 - Not at all", "1 - Several days", "2 - More than half the days", "3 - Nearly every day"]'::jsonb,
   '["0 - أبداً", "1 - عدة أيام", "2 - أكثر من نصف الأيام", "3 - تقريباً كل يوم"]'::jsonb, true, 33),

  ('d3d3d3d3-0034-4000-8000-000000000001', 'd2d2d2d2-0005-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Feeling tired or having little energy', 'الشعور بالتعب أو قلة الطاقة', 'radio',
   '["0 - Not at all", "1 - Several days", "2 - More than half the days", "3 - Nearly every day"]'::jsonb,
   '["0 - أبداً", "1 - عدة أيام", "2 - أكثر من نصف الأيام", "3 - تقريباً كل يوم"]'::jsonb, true, 34),

  ('d3d3d3d3-0035-4000-8000-000000000001', 'd2d2d2d2-0005-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Poor appetite or overeating', 'ضعف الشهية أو الإفراط في الأكل', 'radio',
   '["0 - Not at all", "1 - Several days", "2 - More than half the days", "3 - Nearly every day"]'::jsonb,
   '["0 - أبداً", "1 - عدة أيام", "2 - أكثر من نصف الأيام", "3 - تقريباً كل يوم"]'::jsonb, true, 35),

  ('d3d3d3d3-0036-4000-8000-000000000001', 'd2d2d2d2-0005-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Feeling bad about yourself — or that you are a failure or have let yourself or your family down', 'الشعور بالسوء تجاه نفسك — أو أنك فاشل أو خذلت نفسك أو عائلتك', 'radio',
   '["0 - Not at all", "1 - Several days", "2 - More than half the days", "3 - Nearly every day"]'::jsonb,
   '["0 - أبداً", "1 - عدة أيام", "2 - أكثر من نصف الأيام", "3 - تقريباً كل يوم"]'::jsonb, true, 36),

  ('d3d3d3d3-0037-4000-8000-000000000001', 'd2d2d2d2-0005-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Trouble concentrating on things, such as reading the newspaper or watching television', 'صعوبة التركيز على الأشياء مثل قراءة الصحيفة أو مشاهدة التلفاز', 'radio',
   '["0 - Not at all", "1 - Several days", "2 - More than half the days", "3 - Nearly every day"]'::jsonb,
   '["0 - أبداً", "1 - عدة أيام", "2 - أكثر من نصف الأيام", "3 - تقريباً كل يوم"]'::jsonb, true, 37),

  ('d3d3d3d3-0038-4000-8000-000000000001', 'd2d2d2d2-0005-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual', 'التحرك أو التحدث ببطء شديد لدرجة أن الآخرين لاحظوا ذلك؟ أو العكس — الشعور بالتململ لدرجة التحرك أكثر من المعتاد', 'radio',
   '["0 - Not at all", "1 - Several days", "2 - More than half the days", "3 - Nearly every day"]'::jsonb,
   '["0 - أبداً", "1 - عدة أيام", "2 - أكثر من نصف الأيام", "3 - تقريباً كل يوم"]'::jsonb, true, 38),

  ('d3d3d3d3-0039-4000-8000-000000000001', 'd2d2d2d2-0005-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Thoughts that you would be better off dead or of hurting yourself in some way', 'أفكار بأنك ستكون أفضل حالاً ميتاً أو بإيذاء نفسك بطريقة ما', 'radio',
   '["0 - Not at all", "1 - Several days", "2 - More than half the days", "3 - Nearly every day"]'::jsonb,
   '["0 - أبداً", "1 - عدة أيام", "2 - أكثر من نصف الأيام", "3 - تقريباً كل يوم"]'::jsonb, true, 39);


-- === SECTION 6: GAD-7 ===

INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num)
VALUES
  ('d3d3d3d3-0040-4000-8000-000000000001', 'd2d2d2d2-0006-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Feeling nervous, anxious, or on edge', 'الشعور بالتوتر أو القلق أو عدم الراحة', 'radio',
   '["0 - Not at all", "1 - Several days", "2 - More than half the days", "3 - Nearly every day"]'::jsonb,
   '["0 - أبداً", "1 - عدة أيام", "2 - أكثر من نصف الأيام", "3 - تقريباً كل يوم"]'::jsonb, true, 40),

  ('d3d3d3d3-0041-4000-8000-000000000001', 'd2d2d2d2-0006-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Not being able to stop or control worrying', 'عدم القدرة على التوقف عن القلق أو السيطرة عليه', 'radio',
   '["0 - Not at all", "1 - Several days", "2 - More than half the days", "3 - Nearly every day"]'::jsonb,
   '["0 - أبداً", "1 - عدة أيام", "2 - أكثر من نصف الأيام", "3 - تقريباً كل يوم"]'::jsonb, true, 41),

  ('d3d3d3d3-0042-4000-8000-000000000001', 'd2d2d2d2-0006-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Worrying too much about different things', 'القلق الزائد بشأن أشياء مختلفة', 'radio',
   '["0 - Not at all", "1 - Several days", "2 - More than half the days", "3 - Nearly every day"]'::jsonb,
   '["0 - أبداً", "1 - عدة أيام", "2 - أكثر من نصف الأيام", "3 - تقريباً كل يوم"]'::jsonb, true, 42),

  ('d3d3d3d3-0043-4000-8000-000000000001', 'd2d2d2d2-0006-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Trouble relaxing', 'صعوبة في الاسترخاء', 'radio',
   '["0 - Not at all", "1 - Several days", "2 - More than half the days", "3 - Nearly every day"]'::jsonb,
   '["0 - أبداً", "1 - عدة أيام", "2 - أكثر من نصف الأيام", "3 - تقريباً كل يوم"]'::jsonb, true, 43),

  ('d3d3d3d3-0044-4000-8000-000000000001', 'd2d2d2d2-0006-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Being so restless that it is hard to sit still', 'التململ لدرجة صعوبة الجلوس بثبات', 'radio',
   '["0 - Not at all", "1 - Several days", "2 - More than half the days", "3 - Nearly every day"]'::jsonb,
   '["0 - أبداً", "1 - عدة أيام", "2 - أكثر من نصف الأيام", "3 - تقريباً كل يوم"]'::jsonb, true, 44),

  ('d3d3d3d3-0045-4000-8000-000000000001', 'd2d2d2d2-0006-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Becoming easily annoyed or irritable', 'الانزعاج أو التهيج بسهولة', 'radio',
   '["0 - Not at all", "1 - Several days", "2 - More than half the days", "3 - Nearly every day"]'::jsonb,
   '["0 - أبداً", "1 - عدة أيام", "2 - أكثر من نصف الأيام", "3 - تقريباً كل يوم"]'::jsonb, true, 45),

  ('d3d3d3d3-0046-4000-8000-000000000001', 'd2d2d2d2-0006-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Feeling afraid as if something awful might happen', 'الشعور بالخوف كأن شيئاً فظيعاً قد يحدث', 'radio',
   '["0 - Not at all", "1 - Several days", "2 - More than half the days", "3 - Nearly every day"]'::jsonb,
   '["0 - أبداً", "1 - عدة أيام", "2 - أكثر من نصف الأيام", "3 - تقريباً كل يوم"]'::jsonb, true, 46);


-- === SECTION 7: PSS-10 ===

INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num)
VALUES
  ('d3d3d3d3-0047-4000-8000-000000000001', 'd2d2d2d2-0007-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'In the last month, how often have you been upset because of something that happened unexpectedly?', 'في الشهر الماضي، كم مرة انزعجت بسبب شيء حدث بشكل غير متوقع؟', 'radio',
   '["0 - Never", "1 - Almost never", "2 - Sometimes", "3 - Fairly often", "4 - Very often"]'::jsonb,
   '["0 - أبداً", "1 - نادراً جداً", "2 - أحياناً", "3 - غالباً", "4 - كثيراً جداً"]'::jsonb, true, 47),

  ('d3d3d3d3-0048-4000-8000-000000000001', 'd2d2d2d2-0007-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'In the last month, how often have you felt that you were unable to control the important things in your life?', 'في الشهر الماضي، كم مرة شعرت بعدم قدرتك على التحكم في الأشياء المهمة في حياتك؟', 'radio',
   '["0 - Never", "1 - Almost never", "2 - Sometimes", "3 - Fairly often", "4 - Very often"]'::jsonb,
   '["0 - أبداً", "1 - نادراً جداً", "2 - أحياناً", "3 - غالباً", "4 - كثيراً جداً"]'::jsonb, true, 48),

  ('d3d3d3d3-0049-4000-8000-000000000001', 'd2d2d2d2-0007-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'In the last month, how often have you felt nervous and stressed?', 'في الشهر الماضي، كم مرة شعرت بالتوتر والإجهاد؟', 'radio',
   '["0 - Never", "1 - Almost never", "2 - Sometimes", "3 - Fairly often", "4 - Very often"]'::jsonb,
   '["0 - أبداً", "1 - نادراً جداً", "2 - أحياناً", "3 - غالباً", "4 - كثيراً جداً"]'::jsonb, true, 49),

  ('d3d3d3d3-0050-4000-8000-000000000001', 'd2d2d2d2-0007-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'In the last month, how often have you felt confident about your ability to handle your personal problems?', 'في الشهر الماضي، كم مرة شعرت بالثقة في قدرتك على التعامل مع مشاكلك الشخصية؟', 'radio',
   '["0 - Never", "1 - Almost never", "2 - Sometimes", "3 - Fairly often", "4 - Very often"]'::jsonb,
   '["0 - أبداً", "1 - نادراً جداً", "2 - أحياناً", "3 - غالباً", "4 - كثيراً جداً"]'::jsonb, true, 50),

  ('d3d3d3d3-0051-4000-8000-000000000001', 'd2d2d2d2-0007-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'In the last month, how often have you felt that things were going your way?', 'في الشهر الماضي، كم مرة شعرت أن الأمور تسير كما تريد؟', 'radio',
   '["0 - Never", "1 - Almost never", "2 - Sometimes", "3 - Fairly often", "4 - Very often"]'::jsonb,
   '["0 - أبداً", "1 - نادراً جداً", "2 - أحياناً", "3 - غالباً", "4 - كثيراً جداً"]'::jsonb, true, 51),

  ('d3d3d3d3-0052-4000-8000-000000000001', 'd2d2d2d2-0007-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'In the last month, how often have you found that you could not cope with all the things that you had to do?', 'في الشهر الماضي، كم مرة وجدت أنك لا تستطيع التعامل مع كل الأشياء التي كان عليك القيام بها؟', 'radio',
   '["0 - Never", "1 - Almost never", "2 - Sometimes", "3 - Fairly often", "4 - Very often"]'::jsonb,
   '["0 - أبداً", "1 - نادراً جداً", "2 - أحياناً", "3 - غالباً", "4 - كثيراً جداً"]'::jsonb, true, 52),

  ('d3d3d3d3-0053-4000-8000-000000000001', 'd2d2d2d2-0007-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'In the last month, how often have you been able to control irritations in your life?', 'في الشهر الماضي، كم مرة تمكنت من السيطرة على مصادر الإزعاج في حياتك؟', 'radio',
   '["0 - Never", "1 - Almost never", "2 - Sometimes", "3 - Fairly often", "4 - Very often"]'::jsonb,
   '["0 - أبداً", "1 - نادراً جداً", "2 - أحياناً", "3 - غالباً", "4 - كثيراً جداً"]'::jsonb, true, 53),

  ('d3d3d3d3-0054-4000-8000-000000000001', 'd2d2d2d2-0007-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'In the last month, how often have you felt that you were on top of things?', 'في الشهر الماضي، كم مرة شعرت بأنك مسيطر على الأمور؟', 'radio',
   '["0 - Never", "1 - Almost never", "2 - Sometimes", "3 - Fairly often", "4 - Very often"]'::jsonb,
   '["0 - أبداً", "1 - نادراً جداً", "2 - أحياناً", "3 - غالباً", "4 - كثيراً جداً"]'::jsonb, true, 54),

  ('d3d3d3d3-0055-4000-8000-000000000001', 'd2d2d2d2-0007-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'In the last month, how often have you been angered because of things that were outside of your control?', 'في الشهر الماضي، كم مرة غضبت بسبب أشياء خارجة عن سيطرتك؟', 'radio',
   '["0 - Never", "1 - Almost never", "2 - Sometimes", "3 - Fairly often", "4 - Very often"]'::jsonb,
   '["0 - أبداً", "1 - نادراً جداً", "2 - أحياناً", "3 - غالباً", "4 - كثيراً جداً"]'::jsonb, true, 55),

  ('d3d3d3d3-0056-4000-8000-000000000001', 'd2d2d2d2-0007-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?', 'في الشهر الماضي، كم مرة شعرت أن الصعوبات تتراكم لدرجة لا تستطيع التغلب عليها؟', 'radio',
   '["0 - Never", "1 - Almost never", "2 - Sometimes", "3 - Fairly often", "4 - Very often"]'::jsonb,
   '["0 - أبداً", "1 - نادراً جداً", "2 - أحياناً", "3 - غالباً", "4 - كثيراً جداً"]'::jsonb, true, 56);


-- === SECTION 8: Copenhagen Burnout Inventory (CBI) - 19 items ===

INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num)
VALUES
  -- Personal Burnout (6 items)
  ('d3d3d3d3-0057-4000-8000-000000000001', 'd2d2d2d2-0008-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'How often do you feel tired?', 'كم مرة تشعر بالتعب؟', 'radio',
   '["0 - Never/Almost never", "1 - Seldom", "2 - Sometimes", "3 - Often", "4 - Always"]'::jsonb,
   '["0 - أبداً/تقريباً أبداً", "1 - نادراً", "2 - أحياناً", "3 - غالباً", "4 - دائماً"]'::jsonb, true, 57),

  ('d3d3d3d3-0058-4000-8000-000000000001', 'd2d2d2d2-0008-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'How often are you physically exhausted?', 'كم مرة تشعر بالإرهاق الجسدي؟', 'radio',
   '["0 - Never/Almost never", "1 - Seldom", "2 - Sometimes", "3 - Often", "4 - Always"]'::jsonb,
   '["0 - أبداً/تقريباً أبداً", "1 - نادراً", "2 - أحياناً", "3 - غالباً", "4 - دائماً"]'::jsonb, true, 58),

  ('d3d3d3d3-0059-4000-8000-000000000001', 'd2d2d2d2-0008-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'How often are you emotionally exhausted?', 'كم مرة تشعر بالإرهاق العاطفي؟', 'radio',
   '["0 - Never/Almost never", "1 - Seldom", "2 - Sometimes", "3 - Often", "4 - Always"]'::jsonb,
   '["0 - أبداً/تقريباً أبداً", "1 - نادراً", "2 - أحياناً", "3 - غالباً", "4 - دائماً"]'::jsonb, true, 59),

  ('d3d3d3d3-0060-4000-8000-000000000001', 'd2d2d2d2-0008-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'How often do you think: "I can''t take it anymore"?', 'كم مرة تفكر: "لا أستطيع تحمل المزيد"؟', 'radio',
   '["0 - Never/Almost never", "1 - Seldom", "2 - Sometimes", "3 - Often", "4 - Always"]'::jsonb,
   '["0 - أبداً/تقريباً أبداً", "1 - نادراً", "2 - أحياناً", "3 - غالباً", "4 - دائماً"]'::jsonb, true, 60),

  ('d3d3d3d3-0061-4000-8000-000000000001', 'd2d2d2d2-0008-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'How often do you feel worn out?', 'كم مرة تشعر بالإنهاك؟', 'radio',
   '["0 - Never/Almost never", "1 - Seldom", "2 - Sometimes", "3 - Often", "4 - Always"]'::jsonb,
   '["0 - أبداً/تقريباً أبداً", "1 - نادراً", "2 - أحياناً", "3 - غالباً", "4 - دائماً"]'::jsonb, true, 61),

  ('d3d3d3d3-0062-4000-8000-000000000001', 'd2d2d2d2-0008-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'How often do you feel weak and susceptible to illness?', 'كم مرة تشعر بالضعف والقابلية للمرض؟', 'radio',
   '["0 - Never/Almost never", "1 - Seldom", "2 - Sometimes", "3 - Often", "4 - Always"]'::jsonb,
   '["0 - أبداً/تقريباً أبداً", "1 - نادراً", "2 - أحياناً", "3 - غالباً", "4 - دائماً"]'::jsonb, true, 62),

  -- Work-Related Burnout (7 items)
  ('d3d3d3d3-0063-4000-8000-000000000001', 'd2d2d2d2-0008-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Is your work emotionally exhausting?', 'هل عملك مرهق عاطفياً؟', 'radio',
   '["0 - To a very low degree", "1 - To a low degree", "2 - Somewhat", "3 - To a high degree", "4 - To a very high degree"]'::jsonb,
   '["0 - بدرجة منخفضة جداً", "1 - بدرجة منخفضة", "2 - إلى حد ما", "3 - بدرجة عالية", "4 - بدرجة عالية جداً"]'::jsonb, true, 63),

  ('d3d3d3d3-0064-4000-8000-000000000001', 'd2d2d2d2-0008-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Do you feel burnt out because of your work?', 'هل تشعر بالاحتراق الوظيفي بسبب عملك؟', 'radio',
   '["0 - To a very low degree", "1 - To a low degree", "2 - Somewhat", "3 - To a high degree", "4 - To a very high degree"]'::jsonb,
   '["0 - بدرجة منخفضة جداً", "1 - بدرجة منخفضة", "2 - إلى حد ما", "3 - بدرجة عالية", "4 - بدرجة عالية جداً"]'::jsonb, true, 64),

  ('d3d3d3d3-0065-4000-8000-000000000001', 'd2d2d2d2-0008-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Does your work frustrate you?', 'هل يُحبطك عملك؟', 'radio',
   '["0 - To a very low degree", "1 - To a low degree", "2 - Somewhat", "3 - To a high degree", "4 - To a very high degree"]'::jsonb,
   '["0 - بدرجة منخفضة جداً", "1 - بدرجة منخفضة", "2 - إلى حد ما", "3 - بدرجة عالية", "4 - بدرجة عالية جداً"]'::jsonb, true, 65),

  ('d3d3d3d3-0066-4000-8000-000000000001', 'd2d2d2d2-0008-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Do you feel worn out at the end of the working day?', 'هل تشعر بالإنهاك في نهاية يوم العمل؟', 'radio',
   '["0 - Never/Almost never", "1 - Seldom", "2 - Sometimes", "3 - Often", "4 - Always"]'::jsonb,
   '["0 - أبداً/تقريباً أبداً", "1 - نادراً", "2 - أحياناً", "3 - غالباً", "4 - دائماً"]'::jsonb, true, 66),

  ('d3d3d3d3-0067-4000-8000-000000000001', 'd2d2d2d2-0008-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Are you exhausted in the morning at the thought of another day at work?', 'هل تشعر بالإرهاق صباحاً عند التفكير في يوم عمل آخر؟', 'radio',
   '["0 - Never/Almost never", "1 - Seldom", "2 - Sometimes", "3 - Often", "4 - Always"]'::jsonb,
   '["0 - أبداً/تقريباً أبداً", "1 - نادراً", "2 - أحياناً", "3 - غالباً", "4 - دائماً"]'::jsonb, true, 67),

  ('d3d3d3d3-0068-4000-8000-000000000001', 'd2d2d2d2-0008-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Do you feel that every working hour is tiring for you?', 'هل تشعر أن كل ساعة عمل متعبة بالنسبة لك؟', 'radio',
   '["0 - Never/Almost never", "1 - Seldom", "2 - Sometimes", "3 - Often", "4 - Always"]'::jsonb,
   '["0 - أبداً/تقريباً أبداً", "1 - نادراً", "2 - أحياناً", "3 - غالباً", "4 - دائماً"]'::jsonb, true, 68),

  ('d3d3d3d3-0069-4000-8000-000000000001', 'd2d2d2d2-0008-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Do you have enough energy for family and friends during leisure time?', 'هل لديك طاقة كافية للعائلة والأصدقاء في أوقات الفراغ؟', 'radio',
   '["0 - Always", "1 - Often", "2 - Sometimes", "3 - Seldom", "4 - Never/Almost never"]'::jsonb,
   '["0 - دائماً", "1 - غالباً", "2 - أحياناً", "3 - نادراً", "4 - أبداً/تقريباً أبداً"]'::jsonb, true, 69),

  -- Client-Related Burnout (6 items)
  ('d3d3d3d3-0070-4000-8000-000000000001', 'd2d2d2d2-0008-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Do you find it hard to work with patients?', 'هل تجد صعوبة في العمل مع المرضى؟', 'radio',
   '["0 - To a very low degree", "1 - To a low degree", "2 - Somewhat", "3 - To a high degree", "4 - To a very high degree"]'::jsonb,
   '["0 - بدرجة منخفضة جداً", "1 - بدرجة منخفضة", "2 - إلى حد ما", "3 - بدرجة عالية", "4 - بدرجة عالية جداً"]'::jsonb, true, 70),

  ('d3d3d3d3-0071-4000-8000-000000000001', 'd2d2d2d2-0008-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Do you find it frustrating to work with patients?', 'هل تجد العمل مع المرضى محبطاً؟', 'radio',
   '["0 - To a very low degree", "1 - To a low degree", "2 - Somewhat", "3 - To a high degree", "4 - To a very high degree"]'::jsonb,
   '["0 - بدرجة منخفضة جداً", "1 - بدرجة منخفضة", "2 - إلى حد ما", "3 - بدرجة عالية", "4 - بدرجة عالية جداً"]'::jsonb, true, 71),

  ('d3d3d3d3-0072-4000-8000-000000000001', 'd2d2d2d2-0008-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Does working with patients drain your energy?', 'هل يستنزف العمل مع المرضى طاقتك؟', 'radio',
   '["0 - To a very low degree", "1 - To a low degree", "2 - Somewhat", "3 - To a high degree", "4 - To a very high degree"]'::jsonb,
   '["0 - بدرجة منخفضة جداً", "1 - بدرجة منخفضة", "2 - إلى حد ما", "3 - بدرجة عالية", "4 - بدرجة عالية جداً"]'::jsonb, true, 72),

  ('d3d3d3d3-0073-4000-8000-000000000001', 'd2d2d2d2-0008-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Do you feel that you give more than you get back when you work with patients?', 'هل تشعر أنك تعطي أكثر مما تحصل عليه عند العمل مع المرضى؟', 'radio',
   '["0 - To a very low degree", "1 - To a low degree", "2 - Somewhat", "3 - To a high degree", "4 - To a very high degree"]'::jsonb,
   '["0 - بدرجة منخفضة جداً", "1 - بدرجة منخفضة", "2 - إلى حد ما", "3 - بدرجة عالية", "4 - بدرجة عالية جداً"]'::jsonb, true, 73),

  ('d3d3d3d3-0074-4000-8000-000000000001', 'd2d2d2d2-0008-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Are you tired of working with patients?', 'هل أنت متعب من العمل مع المرضى؟', 'radio',
   '["0 - Never/Almost never", "1 - Seldom", "2 - Sometimes", "3 - Often", "4 - Always"]'::jsonb,
   '["0 - أبداً/تقريباً أبداً", "1 - نادراً", "2 - أحياناً", "3 - غالباً", "4 - دائماً"]'::jsonb, true, 74),

  ('d3d3d3d3-0075-4000-8000-000000000001', 'd2d2d2d2-0008-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Do you sometimes wonder how long you will be able to continue working with patients?', 'هل تتساءل أحياناً كم ستتمكن من الاستمرار في العمل مع المرضى؟', 'radio',
   '["0 - Never/Almost never", "1 - Seldom", "2 - Sometimes", "3 - Often", "4 - Always"]'::jsonb,
   '["0 - أبداً/تقريباً أبداً", "1 - نادراً", "2 - أحياناً", "3 - غالباً", "4 - دائماً"]'::jsonb, true, 75);


-- === SECTION 9: NASA-TLX (6 dimensions) ===

INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num)
VALUES
  ('d3d3d3d3-0076-4000-8000-000000000001', 'd2d2d2d2-0009-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Mental Demand: How mentally demanding was your most recent shift? (1 = Very Low, 21 = Very High)', 'المتطلبات الذهنية: ما مدى المتطلبات الذهنية لنوبتك الأخيرة؟', 'likert',
   '["1 - Very Low", "2", "3", "4", "5 - Very High"]'::jsonb,
   '["1 - منخفض جداً", "2", "3", "4", "5 - مرتفع جداً"]'::jsonb, true, 76),

  ('d3d3d3d3-0077-4000-8000-000000000001', 'd2d2d2d2-0009-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Physical Demand: How physically demanding was your most recent shift? (1 = Very Low, 21 = Very High)', 'المتطلبات الجسدية: ما مدى المتطلبات الجسدية لنوبتك الأخيرة؟', 'likert',
   '["1 - Very Low", "2", "3", "4", "5 - Very High"]'::jsonb,
   '["1 - منخفض جداً", "2", "3", "4", "5 - مرتفع جداً"]'::jsonb, true, 77),

  ('d3d3d3d3-0078-4000-8000-000000000001', 'd2d2d2d2-0009-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Temporal Demand: How hurried or rushed was the pace of your most recent shift? (1 = Very Low, 21 = Very High)', 'ضغط الوقت: ما مدى الاستعجال أو الضغط الزمني في نوبتك الأخيرة؟', 'likert',
   '["1 - Very Low", "2", "3", "4", "5 - Very High"]'::jsonb,
   '["1 - منخفض جداً", "2", "3", "4", "5 - مرتفع جداً"]'::jsonb, true, 78),

  ('d3d3d3d3-0079-4000-8000-000000000001', 'd2d2d2d2-0009-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Performance: How successful were you in accomplishing what you were asked to do during your most recent shift? (1 = Perfect, 5 = Failure)', 'الأداء: ما مدى نجاحك في إنجاز ما طُلب منك خلال نوبتك الأخيرة؟', 'likert',
   '["1 - Perfect", "2", "3", "4", "5 - Failure"]'::jsonb,
   '["1 - مثالي", "2", "3", "4", "5 - فشل"]'::jsonb, true, 79),

  ('d3d3d3d3-0080-4000-8000-000000000001', 'd2d2d2d2-0009-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Effort: How hard did you have to work to accomplish your level of performance during your most recent shift? (1 = Very Low, 5 = Very High)', 'الجهد: ما مدى الجهد الذي بذلته لتحقيق مستوى أدائك خلال نوبتك الأخيرة؟', 'likert',
   '["1 - Very Low", "2", "3", "4", "5 - Very High"]'::jsonb,
   '["1 - منخفض جداً", "2", "3", "4", "5 - مرتفع جداً"]'::jsonb, true, 80),

  ('d3d3d3d3-0081-4000-8000-000000000001', 'd2d2d2d2-0009-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001',
   'Frustration: How insecure, discouraged, irritated, stressed, and annoyed were you during your most recent shift? (1 = Very Low, 5 = Very High)', 'الإحباط: ما مدى شعورك بعدم الأمان والإحباط والتوتر والانزعاج خلال نوبتك الأخيرة؟', 'likert',
   '["1 - Very Low", "2", "3", "4", "5 - Very High"]'::jsonb,
   '["1 - منخفض جداً", "2", "3", "4", "5 - مرتفع جداً"]'::jsonb, true, 81);


-- ══════════════════════════════════════════════════════════════
-- SUMMARY
-- ══════════════════════════════════════════════════════════════
-- Survey: d1d1d1d1-0001-4000-8000-000000000001
-- Sections: 9
-- Questions: 81 total
--   Section 1 (Demographics): 13 questions (Q1-Q13)
--   Section 2 (STOP-BANG): 7 questions (Q14-Q20) — 3 measurements + 4 Yes/No
--   Section 3 (rMEQ-5): 5 questions (Q21-Q25)
--   Section 4 (WHO-5): 5 questions (Q26-Q30)
--   Section 5 (PHQ-9): 9 questions (Q31-Q39)
--   Section 6 (GAD-7): 7 questions (Q40-Q46)
--   Section 7 (PSS-10): 10 questions (Q47-Q56)
--   Section 8 (CBI-19): 19 questions (Q57-Q75)
--   Section 9 (NASA-TLX): 6 questions (Q76-Q81)
-- Researcher: said.alfarsi96@gmail.com
-- ══════════════════════════════════════════════════════════════
