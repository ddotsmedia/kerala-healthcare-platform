-- 0094_wellness_content.sql
-- Yoga & Wellness content. Reuses content_items with type='wellness'. Additive:
-- widen the type CHECK (existing values preserved). Seeds 6 wellness categories
-- + 10 wellness articles + category links. Educational; each page shows a
-- "consult your doctor before starting exercise" disclaimer.

ALTER TABLE content_items DROP CONSTRAINT IF EXISTS content_items_type_check;
ALTER TABLE content_items ADD CONSTRAINT content_items_type_check
  CHECK (type IN ('article','disease','procedure','news','calculator','faq','journey_guide','wellness'));

INSERT INTO content_categories (slug, name_ml, name_en) VALUES
  ('yoga','യോഗ','Yoga'),
  ('meditation','ധ്യാനം','Meditation'),
  ('breathing','ശ്വസനം','Breathing'),
  ('fitness','ഫിറ്റ്നസ്','Fitness'),
  ('sleep','ഉറക്കം','Sleep'),
  ('stress','സ്ട്രെസ് മാനേജ്മെന്റ്','Stress Management')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content_items (slug, type, title_ml, title_en, excerpt_ml, excerpt_en, body_en, status, published_at, requires_disclaimer)
VALUES
  ('yoga-for-back-pain','wellness','നടുവേദനയ്ക്കുള്ള അടിസ്ഥാന യോഗ','Basic Yoga Poses for Back Pain',
   'നടുവേദന കുറയ്ക്കാൻ സൗമ്യമായ യോഗ ആസനങ്ങൾ.','Gentle yoga poses to ease and prevent back pain.',
   '<p>Gentle stretching can ease mild back pain and improve posture. Move slowly and stop if any pose hurts.</p><ul><li><strong>Cat-Cow:</strong> On hands and knees, alternately arch and round the back for 1-2 minutes.</li><li><strong>Child''s Pose:</strong> Sit back on the heels, arms forward, and breathe for 1 minute.</li><li><strong>Knees-to-chest:</strong> Lying down, hug both knees gently for 30 seconds.</li><li><strong>Cobra (gentle):</strong> Lift the chest slightly, keeping hips down.</li></ul><p>Practise daily and pair with regular walking.</p>',
   'published', now(), true),
  ('pranayama-for-stress','wellness','സ്ട്രെസിനുള്ള പ്രാണായാമം','Pranayama (Breathing) for Stress',
   'സമ്മർദ്ദം കുറയ്ക്കാൻ ലളിതമായ ശ്വസന വ്യായാമങ്ങൾ.','Simple breathing exercises to calm stress.',
   '<p>Slow breathing signals the body to relax. Try these for 5-10 minutes.</p><ul><li><strong>Deep belly breathing:</strong> Inhale slowly through the nose, letting the belly rise; exhale gently.</li><li><strong>Nadi Shodhana:</strong> Alternate-nostril breathing, closing one nostril at a time.</li><li><strong>4-7-8 breath:</strong> Inhale for 4, hold for 7, exhale for 8 counts.</li></ul><p>Practise sitting comfortably; never strain the breath.</p>',
   'published', now(), true),
  ('meditation-for-anxiety','wellness','ഉത്കണ്ഠയ്ക്കുള്ള ധ്യാനം','Meditation for Anxiety',
   'ഉത്കണ്ഠ ലഘൂകരിക്കാൻ ലളിതമായ ധ്യാന രീതികൾ.','Simple meditation techniques to ease anxiety.',
   '<p>Meditation helps quiet an anxious mind with regular practice.</p><ul><li>Sit comfortably and close the eyes.</li><li>Focus on the natural breath; when the mind wanders, gently return to it.</li><li>Start with 5 minutes and build up slowly.</li></ul><p>Guided meditation apps or a calm space can help. This complements, but does not replace, professional care for anxiety.</p>',
   'published', now(), true),
  ('yoga-for-diabetes','wellness','പ്രമേഹ നിയന്ത്രണത്തിനുള്ള യോഗ','Yoga for Diabetes Management',
   'രക്തത്തിലെ പഞ്ചസാര നിയന്ത്രിക്കാൻ സഹായിക്കുന്ന യോഗ.','Yoga that supports blood-sugar control.',
   '<p>Regular gentle yoga plus walking can support blood-sugar control alongside your medicines and diet.</p><ul><li>Sun salutations at a gentle pace.</li><li>Seated twists and forward bends.</li><li>Relaxation (Shavasana) to reduce stress hormones.</li></ul><p>Monitor your sugar and never stop prescribed medicines without your doctor.</p>',
   'published', now(), true),
  ('yoga-for-hypertension','wellness','രക്തസമ്മർദ്ദത്തിനുള്ള യോഗ','Yoga for Hypertension',
   'രക്തസമ്മർദ്ദം കുറയ്ക്കാൻ സഹായിക്കുന്ന സൗമ്യ യോഗ.','Calming yoga to support healthy blood pressure.',
   '<p>Slow, calming practice may help lower blood pressure over time.</p><ul><li>Gentle poses and slow breathing.</li><li>Avoid intense inversions or breath-holding.</li><li>End with deep relaxation.</li></ul><p>Keep taking your BP medicines and check your readings regularly.</p>',
   'published', now(), true),
  ('yoga-during-pregnancy','wellness','ഗർഭകാലത്തെ യോഗ','Yoga During Pregnancy',
   'ഗർഭകാലത്ത് സുരക്ഷിതമായ സൗമ്യ യോഗ (ഡോക്ടറുടെ അനുമതിയോടെ).','Gentle, safe yoga during pregnancy (with a doctor''s approval).',
   '<p>Gentle prenatal yoga can ease back pain and aid relaxation, but always get your obstetrician''s approval first.</p><ul><li>Focus on gentle stretching and breathing.</li><li>Avoid lying flat on the back after the first trimester, deep twists and intense poses.</li><li>Stop immediately if you feel dizzy, breathless or any pain.</li></ul><p>Prefer a class led by a qualified prenatal instructor.</p>',
   'published', now(), true),
  ('walking-for-heart-health','wellness','ഹൃദയാരോഗ്യത്തിനുള്ള നടത്ത പരിപാടി','Walking Program for Heart Health',
   'ഹൃദയാരോഗ്യത്തിന് ലളിതമായ നടത്ത പദ്ധതി.','A simple walking plan for a healthy heart.',
   '<p>Walking is one of the safest, most effective exercises for the heart.</p><ul><li><strong>Week 1-2:</strong> 15-20 minutes at an easy pace, most days.</li><li><strong>Week 3-4:</strong> Build up to 30 minutes at a brisk pace.</li><li>Warm up and cool down for a few minutes.</li></ul><p>Aim for about 150 minutes of moderate activity per week. Check with your doctor if you have heart disease.</p>',
   'published', now(), true),
  ('sleep-hygiene-program','wellness','നല്ല ഉറക്കത്തിനുള്ള ശീലങ്ങൾ','Sleep Hygiene Program',
   'നല്ല ഉറക്കത്തിനായി ലളിതമായ ശീലങ്ങൾ.','Simple habits for better sleep.',
   '<p>Good sleep habits improve rest and health.</p><ul><li>Keep a fixed sleep and wake time, even on weekends.</li><li>Avoid screens, caffeine and heavy meals before bed.</li><li>Keep the bedroom dark, quiet and cool.</li><li>Wind down with reading or slow breathing.</li></ul><p>See a doctor if poor sleep persists or you snore heavily.</p>',
   'published', now(), true),
  ('stress-reduction-techniques','wellness','സമ്മർദ്ദം കുറയ്ക്കാനുള്ള വഴികൾ','Stress Reduction Techniques',
   'ദൈനംദിന സമ്മർദ്ദം കുറയ്ക്കാൻ പ്രായോഗിക വഴികൾ.','Practical ways to reduce everyday stress.',
   '<p>Small daily habits can lower stress.</p><ul><li>Take short breaks and breathe slowly.</li><li>Move your body — a short walk helps.</li><li>Talk to someone you trust.</li><li>Limit news and screen time; keep a regular routine.</li></ul><p>If stress feels overwhelming, seek support from a professional.</p>',
   'published', now(), true),
  ('mindfulness-basics-malayalam','wellness','മൈൻഡ്ഫുൾനെസ് അടിസ്ഥാനങ്ങൾ','Mindfulness Basics',
   'വർത്തമാനകാലത്ത് ശ്രദ്ധ കേന്ദ്രീകരിക്കുന്ന ലളിതമായ മൈൻഡ്ഫുൾനെസ്.','Simple mindfulness to stay present and calm.',
   '<p>Mindfulness means gently paying attention to the present moment.</p><ul><li>Notice your breath, sounds or the feeling of your feet on the ground.</li><li>When thoughts arise, observe them without judgement and return to the present.</li><li>Try one mindful minute several times a day.</li></ul><p>Regular practice can reduce stress and improve focus.</p>',
   'published', now(), true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content_item_categories (content_item_id, category_id)
SELECT c.id, cat.id FROM content_items c, content_categories cat
 WHERE (c.slug, cat.slug) IN (VALUES
   ('yoga-for-back-pain','yoga'),('pranayama-for-stress','breathing'),('meditation-for-anxiety','meditation'),
   ('yoga-for-diabetes','yoga'),('yoga-for-hypertension','yoga'),('yoga-during-pregnancy','yoga'),
   ('walking-for-heart-health','fitness'),('sleep-hygiene-program','sleep'),
   ('stress-reduction-techniques','stress'),('mindfulness-basics-malayalam','meditation'))
ON CONFLICT DO NOTHING;
