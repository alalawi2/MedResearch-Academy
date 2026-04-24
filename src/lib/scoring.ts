// scoring.ts — Pure scoring functions for CBI, PHQ-9, GAD-7, ISI

import type { CBIItem } from './instruments';
import { CBI_ITEMS } from './instruments';

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

/** Map of item id → selected numeric value */
export type Responses = Record<string, number>;

// ---------------------------------------------------------------------------
// CBI scoring
// ---------------------------------------------------------------------------

export type CBISubscale = 'personal' | 'work' | 'patient';

export interface CBISubscaleResult {
  score: number;        // 0-100 scale
  burnout: boolean;     // true if score >= 50
  answeredCount: number;
  totalItems: number;
}

export interface CBIResult {
  personal: CBISubscaleResult;
  work: CBISubscaleResult;
  patient: CBISubscaleResult;
  /** True if any subscale >= 50 */
  anyBurnout: boolean;
}

/**
 * Score a single CBI item, handling reverse scoring.
 * Forward: raw value mapped 1→0, 2→25, 3→50, 4→75, 5→100
 * Reverse: raw value mapped 1→100, 2→75, 3→50, 4→25, 5→0
 */
function scoreCBIItem(item: CBIItem, rawValue: number): number {
  if (item.reverse) {
    // Reverse: 5=Never(100), 4=Seldom(75), 3=Sometimes(50), 2=Often(25), 1=Always(0)
    // which is (5 - rawValue) * 25
    return (5 - rawValue) * 25;
  }
  // Forward: (rawValue - 1) * 25
  return (rawValue - 1) * 25;
}

function scoreCBISubscale(
  subscale: CBISubscale,
  responses: Responses,
): CBISubscaleResult {
  const items = CBI_ITEMS.filter((i) => i.subscale === subscale);
  const answered: number[] = [];

  for (const item of items) {
    const raw = responses[item.id];
    if (raw != null && raw >= 1 && raw <= 5) {
      answered.push(scoreCBIItem(item, raw));
    }
  }

  const score =
    answered.length > 0
      ? answered.reduce((a, b) => a + b, 0) / answered.length
      : 0;

  return {
    score: Math.round(score * 100) / 100,
    burnout: score >= 50,
    answeredCount: answered.length,
    totalItems: items.length,
  };
}

export function scoreCBI(responses: Responses): CBIResult {
  const personal = scoreCBISubscale('personal', responses);
  const work = scoreCBISubscale('work', responses);
  const patient = scoreCBISubscale('patient', responses);

  return {
    personal,
    work,
    patient,
    anyBurnout: personal.burnout || work.burnout || patient.burnout,
  };
}

// ---------------------------------------------------------------------------
// PHQ-9 scoring
// ---------------------------------------------------------------------------

export type PHQ9Severity =
  | 'Minimal'
  | 'Mild'
  | 'Moderate'
  | 'Moderately Severe'
  | 'Severe';

export interface PHQ9Result {
  total: number;          // 0-27
  severity: PHQ9Severity;
  answeredCount: number;
  /** True if q9 (suicidal ideation) > 0 */
  suicidalIdeationFlag: boolean;
}

function phq9Severity(total: number): PHQ9Severity {
  if (total < 5) return 'Minimal';
  if (total <= 9) return 'Mild';
  if (total <= 14) return 'Moderate';
  if (total <= 19) return 'Moderately Severe';
  return 'Severe';
}

export function scorePHQ9(responses: Responses): PHQ9Result {
  let total = 0;
  let answeredCount = 0;

  for (let i = 1; i <= 9; i++) {
    const val = responses[`phq9_q${i}`];
    if (val != null && val >= 0 && val <= 3) {
      total += val;
      answeredCount++;
    }
  }

  const q9 = responses['phq9_q9'];
  const suicidalIdeationFlag = q9 != null && q9 > 0;

  return {
    total,
    severity: phq9Severity(total),
    answeredCount,
    suicidalIdeationFlag,
  };
}

// ---------------------------------------------------------------------------
// GAD-7 scoring
// ---------------------------------------------------------------------------

export type GAD7Severity = 'Minimal' | 'Mild' | 'Moderate' | 'Severe';

export interface GAD7Result {
  total: number;          // 0-21
  severity: GAD7Severity;
  answeredCount: number;
}

function gad7Severity(total: number): GAD7Severity {
  if (total < 5) return 'Minimal';
  if (total <= 9) return 'Mild';
  if (total <= 14) return 'Moderate';
  return 'Severe';
}

export function scoreGAD7(responses: Responses): GAD7Result {
  let total = 0;
  let answeredCount = 0;

  for (let i = 1; i <= 7; i++) {
    const val = responses[`gad7_q${i}`];
    if (val != null && val >= 0 && val <= 3) {
      total += val;
      answeredCount++;
    }
  }

  return {
    total,
    severity: gad7Severity(total),
    answeredCount,
  };
}

// ---------------------------------------------------------------------------
// ISI scoring
// ---------------------------------------------------------------------------

export type ISISeverity =
  | 'No clinically significant insomnia'
  | 'Subthreshold insomnia'
  | 'Moderate insomnia'
  | 'Severe insomnia';

export interface ISIResult {
  total: number;          // 0-28
  severity: ISISeverity;
  answeredCount: number;
}

function isiSeverity(total: number): ISISeverity {
  if (total <= 7) return 'No clinically significant insomnia';
  if (total <= 14) return 'Subthreshold insomnia';
  if (total <= 21) return 'Moderate insomnia';
  return 'Severe insomnia';
}

export function scoreISI(responses: Responses): ISIResult {
  let total = 0;
  let answeredCount = 0;

  for (let i = 1; i <= 7; i++) {
    const val = responses[`isi_q${i}`];
    if (val != null && val >= 0 && val <= 4) {
      total += val;
      answeredCount++;
    }
  }

  return {
    total,
    severity: isiSeverity(total),
    answeredCount,
  };
}

// ---------------------------------------------------------------------------
// Combined scoring — score all instruments at once
// ---------------------------------------------------------------------------

export interface CombinedResult {
  cbi: CBIResult;
  phq9: PHQ9Result;
  gad7: GAD7Result;
  isi: ISIResult;
  /** High-level flags for clinical attention */
  flags: string[];
}

export function scoreAll(responses: Responses): CombinedResult {
  const cbi = scoreCBI(responses);
  const phq9 = scorePHQ9(responses);
  const gad7 = scoreGAD7(responses);
  const isi = scoreISI(responses);

  const flags: string[] = [];

  if (cbi.personal.burnout) flags.push('Personal burnout detected (CBI >= 50)');
  if (cbi.work.burnout) flags.push('Work-related burnout detected (CBI >= 50)');
  if (cbi.patient.burnout) flags.push('Patient-related burnout detected (CBI >= 50)');
  if (phq9.suicidalIdeationFlag) flags.push('Suicidal ideation endorsed (PHQ-9 q9 > 0)');
  if (phq9.total >= 15) flags.push(`Depression moderately severe or worse (PHQ-9 = ${phq9.total})`);
  if (gad7.total >= 15) flags.push(`Severe anxiety (GAD-7 = ${gad7.total})`);
  if (isi.total >= 22) flags.push(`Severe insomnia (ISI = ${isi.total})`);

  return { cbi, phq9, gad7, isi, flags };
}

// ---------------------------------------------------------------------------
// Completeness helpers
// ---------------------------------------------------------------------------

export function isCBIComplete(responses: Responses): boolean {
  return CBI_ITEMS.every((item) => {
    const v = responses[item.id];
    return v != null && v >= 1 && v <= 5;
  });
}

export function isPHQ9Complete(responses: Responses): boolean {
  for (let i = 1; i <= 9; i++) {
    const v = responses[`phq9_q${i}`];
    if (v == null || v < 0 || v > 3) return false;
  }
  return true;
}

export function isGAD7Complete(responses: Responses): boolean {
  for (let i = 1; i <= 7; i++) {
    const v = responses[`gad7_q${i}`];
    if (v == null || v < 0 || v > 3) return false;
  }
  return true;
}

export function isISIComplete(responses: Responses): boolean {
  for (let i = 1; i <= 7; i++) {
    const v = responses[`isi_q${i}`];
    if (v == null || v < 0 || v > 4) return false;
  }
  return true;
}

export function isAllComplete(responses: Responses): boolean {
  return (
    isCBIComplete(responses) &&
    isPHQ9Complete(responses) &&
    isGAD7Complete(responses) &&
    isISIComplete(responses)
  );
}
