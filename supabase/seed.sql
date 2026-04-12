-- ============================================================================
-- MedResearch Academy — Seed data
-- Run AFTER supabase/schema.sql has been successfully applied.
-- Idempotent: uses ON CONFLICT DO NOTHING.
-- ============================================================================

-- ──────────────────────────────────────────────────────────────────────────
-- Studies — the research portfolio
-- ──────────────────────────────────────────────────────────────────────────
insert into studies (
  slug, short_name, full_title, description,
  pi_name, co_pi_name, status,
  mrec_number, ethics_refs, ethics_approved_date, ethics_expires_date,
  start_date, end_date, funding_source
) values
  (
    'resident-burnout',
    'Resident Burnout & Biophysical Parameters',
    'The Association Between Healthcare Workers'' Burnout and Biophysical Parameters: A Study Utilizing the Maslach Burnout Inventory (MBI) and WHOOP Wearable Device',
    'A multi-center prospective cohort using the Maslach Burnout Inventory and WHOOP wearable biosensors to quantify the relationship between burnout severity and objective biophysical markers. Current phase is a resident-focused pilot at OMSB.',
    'Dr. Mohamed Al Rawahi',
    'Dr. Masoud Kashoub',
    'data_collection',
    '3190',
    array['SQU-EC/297/2023', 'MoH/CSR/24/28632'],
    '2023-12-11',
    '2026-06-30',
    '2025-03-01',
    '2026-09-30',
    'Ministry of Higher Education, Research, and Innovation (MoHERI)'
  ),
  (
    'parenthood',
    'Residency & Parenthood',
    'Perspectives on Parenthood During Residency Training in Oman',
    'A mixed-methods study exploring how residency training affects family planning decisions and the experiences of resident physicians who are also parents.',
    'Dr. Abdullah M. Al Alawi',
    'Dr. Fatma Al Mahruqi',
    'recruiting',
    '3679',
    array['SQU-EC/228/2025'],
    '2025-09-04',
    null,
    '2025-09-04',
    null,
    null
  ),
  (
    'ai-rota',
    'AI Rota Optimization',
    'AI-Enabled Rota Optimization for OMSB Internal Medicine Residency',
    'A three-phase mixed-methods study to design, build, and evaluate an AI-driven rota optimization system for internal medicine residents across SQUH, Royal Hospital, and MCMSS.',
    'Dr. Abdullah M. Al Alawi',
    null,
    'planning',
    null,
    array[]::text[],
    null,
    null,
    null,
    null,
    null
  ),
  (
    'eman',
    'EMAN — ECG Mastery & Analysis Network',
    'ECG Mastery and Analysis Network: A Platform for Adaptive ECG Learning',
    'An adaptive ECG learning platform for residents, validated through a longitudinal study at SQUH.',
    'Dr. Mohamed Al Rawahi',
    'Dr. Abdullah M. Al Alawi',
    'planning',
    null,
    array[]::text[],
    null,
    null,
    null,
    null,
    null
  )
on conflict (slug) do nothing;

-- Verify:
-- select slug, short_name, status, mrec_number from studies;
