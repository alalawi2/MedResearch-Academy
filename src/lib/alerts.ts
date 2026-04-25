// alerts.ts — Clinical alert utility functions for questionnaire review

export interface AlertResult {
  concerning: boolean;
  reasons: string[];
}

/**
 * Determine if a questionnaire response is clinically concerning.
 * @param type - Instrument type: 'phq9' | 'cbi' | 'gad7' | 'who5'
 * @param items - Map of item keys to numeric values (e.g., { q9: 2 } for PHQ-9)
 * @param totalScore - Overall total score (used for PHQ-9, GAD-7, WHO-5)
 */
export function isConcerning(
  type: string,
  items: Record<string, number>,
  totalScore?: number,
): AlertResult {
  const reasons: string[] = [];

  switch (type) {
    case 'phq9': {
      if (totalScore != null && totalScore >= 15) {
        reasons.push(`PHQ-9 total score ${totalScore} indicates moderately severe or worse depression`);
      }
      const q9 = items.q9 ?? items.phq9_q9;
      if (q9 != null && q9 >= 1) {
        reasons.push('Suicidal ideation endorsed (PHQ-9 item 9 > 0) — requires immediate review');
      }
      break;
    }

    case 'cbi': {
      const personal = items.personal ?? items.personal_score;
      const work = items.work ?? items.work_score;
      const patient = items.patient ?? items.patient_score;
      if (personal != null && personal >= 75) {
        reasons.push(`Personal burnout score ${personal} is critically high (>= 75)`);
      }
      if (work != null && work >= 75) {
        reasons.push(`Work-related burnout score ${work} is critically high (>= 75)`);
      }
      if (patient != null && patient >= 75) {
        reasons.push(`Patient-related burnout score ${patient} is critically high (>= 75)`);
      }
      break;
    }

    case 'isi': {
      if (totalScore != null && totalScore >= 22) {
        reasons.push(`ISI total score ${totalScore} indicates severe clinical insomnia`);
      }
      break;
    }

    case 'gad7': {
      if (totalScore != null && totalScore >= 15) {
        reasons.push(`GAD-7 total score ${totalScore} indicates severe anxiety`);
      }
      break;
    }
  }

  return {
    concerning: reasons.length > 0,
    reasons,
  };
}
