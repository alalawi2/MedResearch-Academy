// scoring.ts — Pure scoring functions for WHO-5, CBI (19-item), PHQ-9, GAD-7

import type { CBIItem } from './instruments';
import { CBI_ITEMS } from './instruments';

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

/** Map of item id -> selected numeric value */
export type Responses = Record<string, number>;

// ---------------------------------------------------------------------------
// WHO-5 scoring
// ---------------------------------------------------------------------------

export interface WHO5Result {
  total: number;        // 0-25 raw sum
  percent: number;      // 0-100 (total * 4)
  poorWellbeing: boolean; // true if percent <= 50
  answeredCount: number;
}

export function scoreWHO5(responses: Responses): WHO5Result {
  let total = 0;
  let answeredCount = 0;

  for (let i = 1; i <= 5; i++) {
    const val = responses[`who5_q${i}`];
    if (val != null && val >= 0 && val <= 5) {
      total += val;
      answeredCount++;
    }
  }

  const percent = total * 4;

  return {
    total,
    percent,
    poorWellbeing: percent <= 50,
    answeredCount,
  };
}

export function isWHO5Complete(responses: Responses): boolean {
  for (let i = 1; i <= 5; i++) {
    const v = responses[`who5_q${i}`];
    if (v == null || v < 0 || v > 5) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// CBI scoring (19-item version)
// ---------------------------------------------------------------------------

export type CBISubscale = 'personal' | 'work' | 'patient';

export interface CBISubscaleResult {
  score: number;        // 0-100 scale (mean of item scores)
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
 * Score a single CBI item.
 * In the 19-item CBI, option values are already on 0-100 scale (0, 25, 50, 75, 100).
 * For reverse-scored items (q13), we invert: score = 100 - rawValue.
 */
function scoreCBIItem(item: CBIItem, rawValue: number): number {
  if (item.reverse) {
    return 100 - rawValue;
  }
  return rawValue;
}

function scoreCBISubscale(
  subscale: CBISubscale,
  responses: Responses,
): CBISubscaleResult {
  const items = CBI_ITEMS.filter((i) => i.subscale === subscale);
  const answered: number[] = [];

  for (const item of items) {
    const raw = responses[item.id];
    if (raw != null && raw >= 0 && raw <= 100) {
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

export type ISISeverity = 'No clinically significant insomnia' | 'Subthreshold insomnia' | 'Moderate clinical insomnia' | 'Severe clinical insomnia';

export interface ISIResult {
  total: number;          // 0-28
  severity: ISISeverity;
  answeredCount: number;
}

function isiSeverity(total: number): ISISeverity {
  if (total <= 7) return 'No clinically significant insomnia';
  if (total <= 14) return 'Subthreshold insomnia';
  if (total <= 21) return 'Moderate clinical insomnia';
  return 'Severe clinical insomnia';
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
// Completeness helpers
// ---------------------------------------------------------------------------

export function isCBIComplete(responses: Responses): boolean {
  return CBI_ITEMS.every((item) => {
    const v = responses[item.id];
    return v != null && v >= 0 && v <= 100;
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

// ---------------------------------------------------------------------------
// Combined scoring — score all instruments at once
// ---------------------------------------------------------------------------

export interface CombinedResult {
  who5: WHO5Result;
  cbi: CBIResult;
  phq9: PHQ9Result;
  gad7: GAD7Result;
  isi: ISIResult;
  /** High-level flags for clinical attention */
  flags: string[];
}

export function scoreAll(responses: Responses): CombinedResult {
  const who5 = scoreWHO5(responses);
  const cbi = scoreCBI(responses);
  const phq9 = scorePHQ9(responses);
  const gad7 = scoreGAD7(responses);
  const isi = scoreISI(responses);

  const flags: string[] = [];

  if (who5.poorWellbeing) flags.push(`Poor wellbeing (WHO-5 = ${who5.percent}%)`);
  if (cbi.personal.burnout) flags.push('Personal burnout detected (CBI >= 50)');
  if (cbi.work.burnout) flags.push('Work-related burnout detected (CBI >= 50)');
  if (cbi.patient.burnout) flags.push('Patient-related burnout detected (CBI >= 50)');
  if (phq9.suicidalIdeationFlag) flags.push('Suicidal ideation endorsed (PHQ-9 q9 > 0)');
  if (phq9.total >= 15) flags.push(`Depression moderately severe or worse (PHQ-9 = ${phq9.total})`);
  if (gad7.total >= 15) flags.push(`Severe anxiety (GAD-7 = ${gad7.total})`);
  if (isi.total >= 15) flags.push(`Clinical insomnia (ISI = ${isi.total})`);

  return { who5, cbi, phq9, gad7, isi, flags };
}

// ---------------------------------------------------------------------------
// Full assessment completeness
// ---------------------------------------------------------------------------

export function isAllComplete(responses: Responses): boolean {
  return (
    isWHO5Complete(responses) &&
    isCBIComplete(responses) &&
    isPHQ9Complete(responses) &&
    isGAD7Complete(responses) &&
    isISIComplete(responses)
  );
}
