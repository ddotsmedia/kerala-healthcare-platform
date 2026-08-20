-- 0096_research_digests.sql
-- Monthly Research Digest. NO schema change — seeds health_news rows with the
-- existing category='research'. Additive, ON CONFLICT DO NOTHING. Plain-language
-- summaries of Kerala/India health research for patients.

INSERT INTO health_news (slug, title_ml, title_en, summary_ml, summary_en, body_en, source, source_url, category, importance, published_at, is_published)
VALUES
  ('research-digest-current','ഈ മാസത്തെ ആരോഗ്യ ഗവേഷണ സംഗ്രഹം','This Month''s Health Research Digest',
   'കേരള-ഇന്ത്യ ആരോഗ്യ ഗവേഷണത്തിലെ പ്രധാന കണ്ടെത്തലുകൾ ലളിതമായി.','Key findings from Kerala and India health research, in plain language.',
   '<p>A patient-friendly round-up of recent health research relevant to Kerala:</p><ul><li><strong>Diabetes:</strong> Studies continue to show that regular walking and a balanced, lower-refined-carbohydrate diet meaningfully improve blood-sugar control.</li><li><strong>Heart health:</strong> Community screening programmes help detect high blood pressure earlier, when it is easier to manage.</li><li><strong>Infectious disease:</strong> Prompt removal of stagnant water remains the most effective step against dengue during the monsoon.</li><li><strong>Mental health:</strong> Early conversations and helplines such as Tele-MANAS (14416) improve access to support.</li></ul><p>These are simplified summaries for general awareness — always discuss your care with a doctor.</p>',
   'MalayaliDoctor Research Desk (ICMR/WHO sources)', 'https://www.icmr.gov.in/', 'research', 'normal', now(), true),
  ('research-digest-last-month','കഴിഞ്ഞ മാസത്തെ ആരോഗ്യ ഗവേഷണ സംഗ്രഹം','Last Month''s Health Research Digest',
   'പോഷകാഹാരവും പ്രതിരോധവും സംബന്ധിച്ച പുതിയ കണ്ടെത്തലുകൾ.','New findings on nutrition and prevention.',
   '<p>Highlights from the previous month:</p><ul><li><strong>Nutrition:</strong> Traditional Kerala foods such as millets (ragi), pulses and vegetables support steadier blood sugar and heart health.</li><li><strong>Immunisation:</strong> Keeping children on the recommended vaccine schedule remains one of the most cost-effective health measures.</li><li><strong>Women''s health:</strong> Regular cervical screening and the HPV vaccine reduce cervical-cancer risk.</li></ul><p>Simplified for general awareness; consult a doctor for personal advice.</p>',
   'MalayaliDoctor Research Desk (ICMR/WHO sources)', 'https://www.who.int/', 'research', 'normal', now() - interval '1 month', true),
  ('research-digest-two-months','രണ്ട് മാസം മുൻപത്തെ ആരോഗ്യ ഗവേഷണ സംഗ്രഹം','Health Research Digest — Two Months Ago',
   'ജീവിതശൈലിയും ദീർഘകാല രോഗങ്ങളും സംബന്ധിച്ച ഗവേഷണം.','Research on lifestyle and long-term diseases.',
   '<p>Earlier highlights:</p><ul><li><strong>Sleep:</strong> Consistent sleep timing is linked with better blood-pressure and mood control.</li><li><strong>Physical activity:</strong> About 150 minutes of moderate activity a week lowers the risk of several chronic diseases.</li><li><strong>Tobacco:</strong> Quitting at any age brings rapid heart-health benefits.</li></ul><p>Simplified for general awareness; consult a doctor for personal advice.</p>',
   'MalayaliDoctor Research Desk (ICMR/WHO sources)', 'https://www.icmr.gov.in/', 'research', 'normal', now() - interval '2 months', true)
ON CONFLICT (slug) DO NOTHING;
