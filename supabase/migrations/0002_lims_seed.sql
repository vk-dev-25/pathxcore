-- PathxDx LIMS Seed Data — Tissue Abbreviations
-- Run after 0001_lims_schema.sql

insert into tissue_abbreviations (abbreviation, name, organ_system, requires_decal, notes) values
  -- Brain / CNS
  ('BN',  'Brain (NOS)',               'Brain/CNS',        false, 'Whole brain, not otherwise specified'),
  ('CB',  'Cerebellum',                'Brain/CNS',        false, null),
  ('CX',  'Cerebral Cortex',           'Brain/CNS',        false, null),
  ('HC',  'Hippocampus',               'Brain/CNS',        false, null),
  ('SC',  'Spinal Cord',               'Brain/CNS',        false, null),
  ('DG',  'Dorsal Root Ganglion',      'Brain/CNS',        false, null),
  -- Cardiopulmonary
  ('LU',  'Lung',                      'Cardiopulmonary',  false, null),
  ('HE',  'Heart',                     'Cardiopulmonary',  false, null),
  ('TH',  'Thymus',                    'Cardiopulmonary',  false, null),
  -- Gastrointestinal
  ('LI',  'Liver',                     'GI',               false, null),
  ('PA',  'Pancreas',                  'GI',               false, null),
  ('SI',  'Small Intestine',           'GI',               false, null),
  ('LG',  'Large Intestine',           'GI',               false, null),
  ('ES',  'Esophagus',                 'GI',               false, null),
  ('ST',  'Stomach',                   'GI',               false, null),
  -- Urinary / Endocrine
  ('KD',  'Kidney',                    'Urinary',          false, null),
  ('BL',  'Bladder',                   'Urinary',          false, null),
  ('AD',  'Adrenal Gland',             'Urinary',          false, null),
  -- Immune
  ('SP',  'Spleen',                    'Immune',           false, null),
  ('LN',  'Lymph Node',                'Immune',           false, 'Site captured in metadata notes'),
  ('BM',  'Bone Marrow',               'Immune',           true,  'Requires decalcification'),
  -- Skin / Integument
  ('SK',  'Skin',                      'Skin/Integument',  false, null),
  ('MA',  'Mammary Gland',             'Skin/Integument',  false, null),
  -- Reproductive
  ('OV',  'Ovary',                     'Reproductive',     false, null),
  ('UT',  'Uterus',                    'Reproductive',     false, null),
  ('TE',  'Testis',                    'Reproductive',     false, null),
  ('PR',  'Prostate',                  'Reproductive',     false, null),
  -- Musculoskeletal
  ('MU',  'Muscle',                    'Musculoskeletal',  false, null),
  ('BO',  'Bone',                      'Musculoskeletal',  true,  'Requires decalcification'),
  ('JO',  'Joint',                     'Musculoskeletal',  true,  'Requires decalcification'),
  -- Sensory / Other Neural
  ('EY',  'Eye',                       'Sensory',          false, null),
  -- Other
  ('FA',  'Fat / Adipose',             'Other',            false, 'Brown or white — specify in notes'),
  ('TU',  'Tumor (NOS)',               'Other',            false, null),
  ('WB',  'Whole Blood',               'Other',            false, null),
  ('NA',  'Nasal Turbinates',          'Other',            true,  'Requires decalcification'),
  ('CP',  'Cell Pellet',               'Other',            false, 'Sentinel row — ID uses cell line name')
on conflict (abbreviation) do nothing;
