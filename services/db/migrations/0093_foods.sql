-- 0093_foods.sql
-- Nutrition Database — Kerala foods and their nutritional value. Additive only.
-- Educational; values are approximate per 100g. ON CONFLICT DO NOTHING.

CREATE TABLE IF NOT EXISTS foods (
  id                 uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug               varchar(255) UNIQUE NOT NULL,
  name_ml            text,
  name_en            text NOT NULL,
  category           varchar(50),   -- grain|vegetable|fruit|protein|dairy|spice
  calories_per_100g  integer,
  protein_g          decimal(5,2),
  carbs_g            decimal(5,2),
  fat_g              decimal(5,2),
  fiber_g            decimal(5,2),
  key_nutrients      text[],
  health_benefits_ml text,
  health_benefits_en text,
  good_for           text[],        -- diabetes|heart|weight_loss|pregnancy|immunity|bone_health|digestion
  caution_for        text[],        -- kidney_disease|gout|diabetes
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz,
  deleted_at         timestamptz,
  is_published       boolean DEFAULT true
);
CREATE INDEX IF NOT EXISTS idx_foods_category ON foods (category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_foods_name_trgm ON foods USING gin (name_en gin_trgm_ops) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_foods_goodfor ON foods USING gin (good_for) WHERE deleted_at IS NULL;

INSERT INTO foods (slug, name_ml, name_en, category, calories_per_100g, protein_g, carbs_g, fat_g, fiber_g, key_nutrients, health_benefits_en, good_for, caution_for)
VALUES
  ('rice-white','വെള്ള അരി','White Rice (cooked)','grain',130,2.7,28,0.3,0.4,ARRAY['Carbohydrate','Manganese'],'A staple energy source; low in fat but refined.',ARRAY['weight_gain'],ARRAY['diabetes']),
  ('brown-rice','തവിട് അരി','Brown Rice (cooked)','grain',123,2.7,26,1.0,1.8,ARRAY['Fibre','Magnesium','B vitamins'],'Whole grain with more fibre; gentler on blood sugar than white rice.',ARRAY['diabetes','heart','weight_loss'],ARRAY[]::text[]),
  ('tapioca','കപ്പ','Tapioca (Kappa)','grain',160,1.4,38,0.3,1.8,ARRAY['Carbohydrate','Vitamin C'],'A filling Kerala staple; energy-rich, best paired with protein.',ARRAY['weight_gain'],ARRAY['diabetes']),
  ('wheat','ഗോതമ്പ്','Wheat (whole)','grain',340,13.2,72,2.5,10.7,ARRAY['Fibre','Protein','Iron'],'Whole wheat provides fibre and steady energy.',ARRAY['heart','digestion'],ARRAY[]::text[]),
  ('oats','ഓട്സ്','Oats','grain',389,16.9,66,6.9,10.6,ARRAY['Beta-glucan fibre','Protein'],'Soluble fibre helps lower cholesterol and control blood sugar.',ARRAY['heart','diabetes','weight_loss'],ARRAY[]::text[]),
  ('ragi','റാഗി','Ragi (Finger Millet)','grain',328,7.3,72,1.3,3.6,ARRAY['Calcium','Iron','Fibre'],'Very high in calcium; good for bones and diabetes-friendly.',ARRAY['bone_health','diabetes','pregnancy'],ARRAY[]::text[]),
  ('red-rice','ചുവന്ന അരി','Kerala Red Rice','grain',135,3.0,29,0.8,2.0,ARRAY['Fibre','Magnesium','Antioxidants'],'Traditional Kerala rice with more fibre and minerals than white rice.',ARRAY['heart','diabetes'],ARRAY[]::text[]),
  ('coconut','തേങ്ങ','Coconut','protein',354,3.3,15,33,9.0,ARRAY['Healthy fats','Manganese','Fibre'],'Rich in fibre; high in saturated fat, so use in moderation.',ARRAY['digestion'],ARRAY['heart']),
  ('fish-sardine','മത്തി','Sardine','protein',208,25,0,11,0,ARRAY['Omega-3','Protein','Vitamin D','Calcium'],'Oily fish rich in heart-healthy omega-3 fats.',ARRAY['heart','pregnancy','bone_health'],ARRAY['gout']),
  ('fish-mackerel','അയല','Mackerel (Ayala)','protein',205,19,0,13.9,0,ARRAY['Omega-3','Protein','Vitamin B12'],'Omega-3 rich fish supporting heart and brain health.',ARRAY['heart','pregnancy'],ARRAY['gout']),
  ('egg','മുട്ട','Egg','protein',155,13,1.1,11,0,ARRAY['Protein','Vitamin B12','Choline'],'High-quality complete protein and nutrients.',ARRAY['pregnancy','weight_loss','immunity'],ARRAY[]::text[]),
  ('chicken','കോഴി','Chicken (breast)','protein',165,31,0,3.6,0,ARRAY['Protein','Niacin','Selenium'],'Lean protein for muscle and repair.',ARRAY['weight_loss','immunity'],ARRAY[]::text[]),
  ('green-gram','ചെറുപയർ','Green Gram (Moong)','protein',347,24,63,1.2,16,ARRAY['Protein','Fibre','Folate'],'Plant protein and fibre; easy to digest.',ARRAY['diabetes','heart','weight_loss'],ARRAY[]::text[]),
  ('chickpea','കടല','Chickpea (Kadala)','protein',364,19,61,6.0,17,ARRAY['Protein','Fibre','Iron'],'Filling plant protein that supports blood-sugar control.',ARRAY['diabetes','heart','weight_loss'],ARRAY[]::text[]),
  ('lentil','പരിപ്പ്','Lentils (Dal)','protein',116,9.0,20,0.4,7.9,ARRAY['Protein','Fibre','Folate'],'Affordable protein and fibre for everyday meals.',ARRAY['diabetes','heart','pregnancy'],ARRAY[]::text[]),
  ('milk','പാൽ','Milk','dairy',62,3.2,4.8,3.3,0,ARRAY['Calcium','Protein','Vitamin B12'],'Good source of calcium and protein for bones.',ARRAY['bone_health','pregnancy'],ARRAY[]::text[]),
  ('curd','തൈര്','Curd (Yoghurt)','dairy',60,3.5,4.7,3.3,0,ARRAY['Probiotics','Calcium','Protein'],'Probiotic dairy that supports digestion.',ARRAY['digestion','bone_health'],ARRAY[]::text[]),
  ('banana','പഴം','Banana','fruit',89,1.1,23,0.3,2.6,ARRAY['Potassium','Vitamin B6','Fibre'],'Quick energy and potassium for the heart and muscles.',ARRAY['heart','digestion'],ARRAY['kidney_disease']),
  ('jackfruit','ചക്ക','Jackfruit','fruit',95,1.7,23,0.6,1.5,ARRAY['Vitamin C','Potassium','Fibre'],'Fibre-rich fruit; unripe jackfruit is diabetes-friendly.',ARRAY['digestion','immunity'],ARRAY[]::text[]),
  ('mango','മാങ്ങ','Mango','fruit',60,0.8,15,0.4,1.6,ARRAY['Vitamin C','Vitamin A','Fibre'],'Rich in vitamins A and C for immunity and eyes.',ARRAY['immunity'],ARRAY['diabetes']),
  ('papaya','പപ്പായ','Papaya','fruit',43,0.5,11,0.3,1.7,ARRAY['Vitamin C','Vitamin A','Enzymes'],'Aids digestion and boosts immunity.',ARRAY['digestion','immunity'],ARRAY[]::text[]),
  ('pineapple','കൈതച്ചക്ക','Pineapple','fruit',50,0.5,13,0.1,1.4,ARRAY['Vitamin C','Manganese','Bromelain'],'Contains enzymes that aid digestion.',ARRAY['digestion','immunity'],ARRAY[]::text[]),
  ('guava','പേരയ്ക്ക','Guava','fruit',68,2.6,14,1.0,5.4,ARRAY['Vitamin C','Fibre'],'Very high in vitamin C and fibre.',ARRAY['immunity','digestion','diabetes'],ARRAY[]::text[]),
  ('orange','ഓറഞ്ച്','Orange','fruit',47,0.9,12,0.1,2.4,ARRAY['Vitamin C','Folate','Fibre'],'Immunity-boosting citrus rich in vitamin C.',ARRAY['immunity','heart'],ARRAY[]::text[]),
  ('amla','നെല്ലിക്ക','Amla (Gooseberry)','fruit',44,0.9,10,0.6,4.3,ARRAY['Vitamin C','Antioxidants'],'One of the richest natural sources of vitamin C.',ARRAY['immunity','heart'],ARRAY[]::text[]),
  ('spinach','ചീര','Spinach (Cheera)','vegetable',23,2.9,3.6,0.4,2.2,ARRAY['Iron','Folate','Vitamin K'],'Iron- and folate-rich leafy green.',ARRAY['pregnancy','heart'],ARRAY['kidney_disease']),
  ('drumstick','മുരിങ്ങ','Drumstick (Moringa)','vegetable',37,2.1,8.5,0.2,3.2,ARRAY['Vitamin C','Iron','Calcium'],'Nutrient-dense pods and leaves used across Kerala.',ARRAY['immunity','bone_health','pregnancy'],ARRAY[]::text[]),
  ('bitter-gourd','പാവയ്ക്ക','Bitter Gourd (Pavakka)','vegetable',17,1.0,3.7,0.2,2.8,ARRAY['Vitamin C','Fibre'],'May help lower blood sugar; very diabetes-friendly.',ARRAY['diabetes','weight_loss'],ARRAY[]::text[]),
  ('ash-gourd','കുമ്പളങ്ങ','Ash Gourd','vegetable',13,0.4,3.0,0.2,2.9,ARRAY['Water','Fibre'],'Low-calorie, cooling vegetable good for weight loss.',ARRAY['weight_loss','digestion'],ARRAY[]::text[]),
  ('okra','വെണ്ട','Okra (Vendakka)','vegetable',33,1.9,7.5,0.2,3.2,ARRAY['Fibre','Vitamin C','Folate'],'Soluble fibre helps control blood sugar.',ARRAY['diabetes','digestion'],ARRAY[]::text[]),
  ('yam','ചേന','Yam (Chena)','vegetable',118,1.5,28,0.2,4.1,ARRAY['Fibre','Potassium','Vitamin C'],'Starchy tuber with good fibre and potassium.',ARRAY['digestion'],ARRAY['diabetes']),
  ('carrot','കാരറ്റ്','Carrot','vegetable',41,0.9,10,0.2,2.8,ARRAY['Vitamin A','Fibre','Antioxidants'],'Rich in beta-carotene for eye health.',ARRAY['immunity','heart'],ARRAY[]::text[]),
  ('tomato','തക്കാളി','Tomato','vegetable',18,0.9,3.9,0.2,1.2,ARRAY['Vitamin C','Lycopene','Potassium'],'Lycopene antioxidant supports heart health.',ARRAY['heart','immunity'],ARRAY[]::text[]),
  ('cabbage','മുട്ടക്കോസ്','Cabbage','vegetable',25,1.3,5.8,0.1,2.5,ARRAY['Vitamin C','Vitamin K','Fibre'],'Low-calorie vegetable rich in vitamins.',ARRAY['weight_loss','digestion'],ARRAY[]::text[]),
  ('cucumber','വെള്ളരി','Cucumber','vegetable',15,0.7,3.6,0.1,0.5,ARRAY['Water','Vitamin K'],'Hydrating and very low in calories.',ARRAY['weight_loss'],ARRAY[]::text[]),
  ('pumpkin','മത്തങ്ങ','Pumpkin','vegetable',26,1.0,6.5,0.1,0.5,ARRAY['Vitamin A','Potassium'],'Beta-carotene-rich vegetable for eyes and immunity.',ARRAY['immunity','heart'],ARRAY[]::text[]),
  ('sweet-potato','മധുരക്കിഴങ്ങ്','Sweet Potato','vegetable',86,1.6,20,0.1,3.0,ARRAY['Vitamin A','Fibre','Potassium'],'Fibre-rich tuber with a lower glycaemic load than potato.',ARRAY['digestion','heart'],ARRAY[]::text[]),
  ('beetroot','ബീറ്റ്റൂട്ട്','Beetroot','vegetable',43,1.6,10,0.2,2.8,ARRAY['Folate','Nitrates','Iron'],'May support blood pressure and stamina.',ARRAY['heart'],ARRAY[]::text[]),
  ('curry-leaves','കറിവേപ്പില','Curry Leaves','spice',108,6.1,19,1.0,6.4,ARRAY['Iron','Calcium','Antioxidants'],'A Kerala staple herb with iron and antioxidants.',ARRAY['immunity','digestion'],ARRAY[]::text[]),
  ('turmeric','മഞ്ഞൾ','Turmeric','spice',354,8.0,65,10,21,ARRAY['Curcumin','Iron'],'Curcumin has anti-inflammatory properties.',ARRAY['immunity','heart'],ARRAY[]::text[]),
  ('ginger','ഇഞ്ചി','Ginger','spice',80,1.8,18,0.8,2.0,ARRAY['Gingerol','Antioxidants'],'Eases nausea and aids digestion.',ARRAY['digestion','immunity'],ARRAY[]::text[]),
  ('garlic','വെളുത്തുള്ളി','Garlic','spice',149,6.4,33,0.5,2.1,ARRAY['Allicin','Manganese'],'May support heart health and immunity.',ARRAY['heart','immunity'],ARRAY[]::text[]),
  ('black-pepper','കുരുമുളക്','Black Pepper','spice',251,10,64,3.3,25,ARRAY['Piperine','Manganese'],'Aids digestion and nutrient absorption.',ARRAY['digestion'],ARRAY[]::text[]),
  ('cardamom','ഏലം','Cardamom','spice',311,11,68,7,28,ARRAY['Antioxidants','Manganese'],'Aromatic spice that aids digestion.',ARRAY['digestion'],ARRAY[]::text[]),
  ('fenugreek','ഉലുവ','Fenugreek (Uluva)','spice',323,23,58,6.4,25,ARRAY['Fibre','Iron'],'May help lower blood sugar and cholesterol.',ARRAY['diabetes','heart'],ARRAY[]::text[]),
  ('cumin','ജീരകം','Cumin (Jeerakam)','spice',375,18,44,22,11,ARRAY['Iron','Antioxidants'],'Aids digestion and is rich in iron.',ARRAY['digestion'],ARRAY[]::text[]),
  ('coconut-oil','വെളിച്ചെണ്ണ','Coconut Oil','protein',862,0,0,100,0,ARRAY['Saturated fat','MCT'],'Traditional cooking oil; high in saturated fat, use sparingly.',ARRAY[]::text[],ARRAY['heart']),
  ('groundnut','നിലക്കടല','Groundnut (Peanut)','protein',567,26,16,49,8.5,ARRAY['Protein','Healthy fats','Niacin'],'Protein- and healthy-fat-rich; energy dense.',ARRAY['weight_gain','heart'],ARRAY[]::text[]),
  ('cashew','കശുവണ്ടി','Cashew','protein',553,18,30,44,3.3,ARRAY['Healthy fats','Magnesium','Zinc'],'Nutritious nut; eat in moderation for the calories.',ARRAY['heart','bone_health'],ARRAY['weight_gain']),
  ('honey','തേൻ','Honey','fruit',304,0.3,82,0,0.2,ARRAY['Antioxidants','Natural sugars'],'A natural sweetener; still raises blood sugar, use sparingly.',ARRAY['immunity'],ARRAY['diabetes'])
ON CONFLICT (slug) DO NOTHING;
