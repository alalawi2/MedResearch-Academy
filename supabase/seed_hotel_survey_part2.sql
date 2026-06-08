-- ══════════════════════════════════════════════════════════════
-- SEED PART 2: Missing sections 4-6 and questions Q15-Q24
-- ══════════════════════════════════════════════════════════════

-- Section 4: Preferred Hotel Concept & Facilities
INSERT INTO survey_sections (id, survey_id, title_en, title_ar, description_en, description_ar, order_num)
VALUES ('b1b1b1b1-0004-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
  'Preferred Hotel Concept & Facilities', 'المفهوم والخدمات الفندقية المفضلة',
  'Helping us design the appropriate style, services, and amenities for the proposed hotel.',
  'مساعدتنا في تصميم النمط المناسب، والخدمات، والمرافق المقترحة للفندق.',
  4);

-- Section 5: Price Sensitivity & Willingness-to-Pay
INSERT INTO survey_sections (id, survey_id, title_en, title_ar, description_en, description_ar, order_num)
VALUES ('b1b1b1b1-0005-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
  'Price Sensitivity & Willingness-to-Pay', 'حساسية الأسعار والاستعداد للدفع',
  'Assessing the acceptable price ceiling and comparing it with the proposed value-add.',
  'تقييم سقف السعر المقبول ومقارنته بالقيمة المضافة المقترحة.',
  5);

-- Section 6: Public Opinion & Local Impact
INSERT INTO survey_sections (id, survey_id, title_en, title_ar, description_en, description_ar, order_num)
VALUES ('b1b1b1b1-0006-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
  'Public Opinion & Local Impact', 'الرأي العام والأثر المحلي للمشروع',
  'Exploring local community views and expectations regarding the developmental and social impact of the hotel project.',
  'استكشاف آراء وتوقعات المجتمع المحلي بشأن الأثر التنموي والاجتماعي للمشروع الفندقي.',
  6);

-- Q15: Future purpose of stay (checkbox)
INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num)
VALUES ('c1c1c1c1-0015-4000-8000-000000000001', 'b1b1b1b1-0003-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
  'What would be the main purpose that might lead to your stay in Yanqul in the future? (Select all that apply)',
  'ما هو الغرض الرئيسي الذي قد يدفعك للإقامة في ولاية ينقل مستقبلاً؟ (اختر كل ما ينطبق)',
  'checkbox',
  '["Tourism / Leisure","Family visit","Work / Business","Event / Wedding","Transit stop to another region","Other"]',
  '["السياحة / الترفيه والاستجمام","زيارة عائلية","العمل / إدارة الأعمال","مناسبة اجتماعية / حفل زفاف","محطة عبور (ترانزيت) إلى منطقة أخرى","أخرى"]',
  true, 15);

-- Q16: Prefer Yanqul or nearby town
INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num)
VALUES ('c1c1c1c1-0016-4000-8000-000000000001', 'b1b1b1b1-0003-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
  'Would you prefer to stay in Yanqul or in a nearby town such as Ibri, Sohar, or Al Buraimi?',
  'هل تفضل الإقامة في ولاية ينقل أم في مدينة مجاورة مثل عبري، صحار، أو البريمي؟',
  'radio',
  '["I would prefer Yanqul if the hotel quality is good","I would prefer a nearby town regardless","It depends entirely on price and quality","No preference"]',
  '["أفضل الإقامة في ينقل إذا كانت جودة الفندق جيدة وملائمة","أفضل الإقامة في مدينة مجاورة بغض النظر عن الجودة","يعتمد ذلك بالكامل على السعر والجودة المقدمة","لا يوجد تفضيل"]',
  true, 16);

-- Q17: Hotel type preference
INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num)
VALUES ('c1c1c1c1-0017-4000-8000-000000000001', 'b1b1b1b1-0004-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
  'What type of hotel would you prefer to see established in Wilayat Yanqul?',
  'ما هو نوع الفندق الذي تفضل رؤيته في ولاية ينقل؟',
  'radio',
  '["Heritage Hotel / Resort: Traditional Omani architecture, heritage decor, and authentic local experiences","Modern Mid-Scale Hotel: A clean, comfortable 3-star standard hotel","Eco-Lodge: Environmentally friendly units integrated with mountain nature or farms","Budget Motel / Rest House: Clean basic rooms at the lowest price, targeting transit travelers"]',
  '["فندق / منتجع تراثي: هندسة معمارية عُمانية تقليدية وتجارب محلية أصيلة","فندق حديث متوسط المستوى: فندق مريح ونظيف من فئة 3 نجوم","نزل بيئي: وحدات صديقة للبيئة متكاملة مع الطبيعة الجبلية أو المزارع","فندق اقتصادي / استراحة مسافرين: غرف أساسية نظيفة بأقل سعر ممكن"]',
  true, 17);

-- Q18: Important facilities (checkbox, up to 5)
INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num)
VALUES ('c1c1c1c1-0018-4000-8000-000000000001', 'b1b1b1b1-0004-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
  'What facilities are most important to you in a hotel in this area? (Select up to 5)',
  'ما هي المرافق الأكثر أهمية بالنسبة لك في فندق بهذه المنطقة؟ (اختر ما يصل إلى 5 مرافق)',
  'checkbox',
  '["Clean and comfortable room","Secure parking","Traditional Omani restaurant and café","Breakfast included","Swimming pool","Family rooms","Gym","Meeting room / Business center","Organized local tours (Bait Al Marah Castle, mountain trails, farms)","Other"]',
  '["غرفة نظيفة ومريحة","مواقف سيارات آمنة ومحمية","مطعم ومقهى عُماني تقليدي شعبي","وجبة الإفطار مشمولة في السعر","حوض سباحة","غرف عائلية واسعة","صالة ألعاب رياضية","قاعة اجتماعات / مركز رجال الأعمال","جولات محلية منظمة (حصن بيت المراح، المسارات الجبلية، المزارع)","أخرى"]',
  true, 18);

-- Q19: Maximum price per night
INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num)
VALUES ('c1c1c1c1-0019-4000-8000-000000000001', 'b1b1b1b1-0005-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
  'What is the maximum price you would accept to pay per night for an excellent stay in Yanqul?',
  'ما هو أقصى سعر تقبل دفعه لليلة الواحدة مقابل إقامة ممتازة في ولاية ينقل؟',
  'radio',
  '["Below OMR 20","OMR 20 – OMR 30","OMR 31 – OMR 40","OMR 41 – OMR 50","Above OMR 50"]',
  '["أقل من 20 ريال عُماني","من 20 إلى 30 ريال عُماني","من 31 إلى 40 ريال عُماني","من 41 إلى 50 ريال عُماني","أكثر من 50 ريال عُماني"]',
  true, 19);

-- Q20: Preferred booking method
INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num)
VALUES ('c1c1c1c1-0020-4000-8000-000000000001', 'b1b1b1b1-0005-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
  'What is your preferred booking method when securing hotel accommodations?',
  'ما هي طريقة الحجز المفضلة لديك عند تأمين الإقامة الفندقية؟',
  'radio',
  '["Online Travel Agencies (Booking.com, Expedia, Agoda, etc.)","Direct via Hotel Website or Mobile App","Direct via Telephone, WhatsApp, or Email","Walk-in (No prior reservation)"]',
  '["وكالات السفر عبر الإنترنت (Booking.com, Expedia, Agoda)","مباشرة عبر الموقع الإلكتروني للفندق أو تطبيق الهاتف","مباشرة عبر الهاتف أو الواتساب أو البريد الإلكتروني","الحجز المباشر عند الوصول (دون حجز مسبق)"]',
  true, 20);

-- Q21: Urgent need for hotel (Likert-style)
INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num)
VALUES ('c1c1c1c1-0021-4000-8000-000000000001', 'b1b1b1b1-0006-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
  'Do you agree that Wilayat Yanqul is in urgent need of a suitable hotel project?',
  'هل توافق على أن ولاية ينقل بحاجة ماسة إلى مشروع فندقي مناسب وملائم؟',
  'radio',
  '["Strongly Agree","Agree","Neutral","Disagree","Strongly Disagree"]',
  '["موافق بشدة","موافق","محايد","غير موافق","غير موافق بشدة"]',
  true, 21);

-- Q22: Greatest positive impact (checkbox)
INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num)
VALUES ('c1c1c1c1-0022-4000-8000-000000000001', 'b1b1b1b1-0006-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
  'What is the greatest positive impact you expect the hotel to have on Wilayat Yanqul?',
  'ما هو الأثر الإيجابي الأكبر الذي تتوقع أن يحدثه الفندق في ولاية ينقل؟',
  'checkbox',
  '["Stimulating tourism and attracting visitors","Providing direct and indirect jobs for Omani youth","Supporting local businesses, farms, and small projects","Providing a comfortable stop for transit travelers","Other"]',
  '["تنشيط السياحة وجذب الزوار إلى الولاية","توفير فرص عمل مباشرة وغير مباشرة للشباب العُماني","دعم الشركات المحلية والمزارع والمشاريع الصغيرة","توفير استراحة مريحة للمسافرين وعابري الطريق","أخرى"]',
  false, 22);

-- Q23: Support for heritage/eco-lodges
INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num)
VALUES ('c1c1c1c1-0023-4000-8000-000000000001', 'b1b1b1b1-0006-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
  'To what extent do you support the idea of converting or integrating existing farms or heritage houses into heritage/eco-lodges?',
  'إلى أي مدى تدعم فكرة تحويل أو دمج المزارع القائمة أو البيوت الأثرية في الولاية إلى نزل تراثية/بيئية؟',
  'radio',
  '["Strongly support","Support","Neutral","Prefer building a completely modern hotel","Do not support the idea"]',
  '["أدعم بشدة","أدعم","محايد","أفضل بناء فندق حديث بالكامل","لا أدعم الفكرة على الإطلاق"]',
  true, 23);

-- Q24: Additional suggestions (open text)
INSERT INTO survey_questions (id, section_id, survey_id, question_en, question_ar, type, options_en, options_ar, required, order_num)
VALUES ('c1c1c1c1-0024-4000-8000-000000000001', 'b1b1b1b1-0006-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
  'Do you have any additional suggestions or ideas to share for the success of this hotel project in Wilayat Yanqul?',
  'هل لديك أي مقترحات أو أفكار إضافية تود مشاركتها لنجاح هذا المشروع الفندقي في ولاية ينقل؟',
  'text',
  '[]',
  '[]',
  false, 24);
