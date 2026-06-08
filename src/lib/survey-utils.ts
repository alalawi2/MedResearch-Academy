export type SurveyAnswers = Record<string, unknown>;

export interface SurveySectionLike {
  id: string;
}

export interface SurveyQuestionLike {
  id: string;
  section_id?: string;
  type?: string;
  order_num?: number;
  options_en?: unknown[] | null;
  options_ar?: unknown[] | null;
  skip_logic?: unknown;
}

interface SurveyOptionObject {
  label_ar?: string;
  label_en?: string;
  requires_text?: boolean;
  text_ar?: string;
  text_en?: string;
  value?: string;
}

export interface NormalizedSurveyOption {
  labelAr: string;
  labelEn: string;
  requiresText: boolean;
  value: string;
}

interface SurveyLogicCondition {
  equals?: unknown;
  equals_any?: unknown[];
  not_equals?: unknown;
  not_equals_any?: unknown[];
  question_id?: string;
}

interface SurveySkipLogic {
  and_equals?: unknown;
  and_equals_any?: unknown[];
  and_not_equals?: unknown;
  and_not_equals_any?: unknown[];
  and_question?: string;
  auto_advance?: boolean;
  equals?: unknown;
  equals_any?: unknown[];
  if_question?: string;
  max_selections?: number;
  not_equals?: unknown;
  not_equals_any?: unknown[];
  show_if?: SurveyLogicCondition;
  show_if_all?: SurveyLogicCondition[];
  show_if_any?: SurveyLogicCondition[];
  skip_to_section?: string;
}

const FALLBACK_LIKERT_LABELS_EN = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
const FALLBACK_LIKERT_LABELS_AR = ['أعارض بشدة', 'أعارض', 'محايد', 'أوافق', 'أوافق بشدة'];
const OTHER_EN_PATTERN = /other\s*\(please specify\)/i;

function isOptionObject(value: unknown): value is SurveyOptionObject {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toText(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function hasAnswerValue(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return value !== undefined && value !== null && value !== '';
}

function answerMatches(value: unknown, expected: unknown): boolean {
  if (Array.isArray(value)) {
    return value.includes(expected);
  }
  return value === expected;
}

function getConditionQuestionId(condition: SurveyLogicCondition): string {
  return toText(condition.question_id);
}

export function getQuestionOtherTextKey(questionId: string): string {
  return `${questionId}__other_text`;
}

export function normalizeSurveyOptions(question: Pick<SurveyQuestionLike, 'options_en' | 'options_ar'>): NormalizedSurveyOption[] {
  const optionsEn = Array.isArray(question.options_en) ? question.options_en : [];
  const optionsAr = Array.isArray(question.options_ar) ? question.options_ar : [];
  const source = optionsEn.length > 0 ? optionsEn : optionsAr;

  return source
    .map((rawOption, index) => {
      const pairedEn = optionsEn[index];
      const pairedAr = optionsAr[index];

      if (isOptionObject(rawOption)) {
        const value = toText(rawOption.value) || toText(rawOption.label_en) || toText(rawOption.text_en);
        const labelEn = toText(rawOption.label_en) || toText(rawOption.text_en) || value;
        const labelAr =
          toText(rawOption.label_ar) ||
          toText(rawOption.text_ar) ||
          (isOptionObject(pairedAr)
            ? toText(pairedAr.label_ar) || toText(pairedAr.text_ar) || toText(pairedAr.value)
            : toText(pairedAr)) ||
          labelEn;

        return {
          labelAr,
          labelEn,
          requiresText: Boolean(rawOption.requires_text) || OTHER_EN_PATTERN.test(labelEn),
          value,
        };
      }

      const labelEn = toText(pairedEn) || toText(rawOption);
      const labelAr =
        (isOptionObject(pairedAr)
          ? toText(pairedAr.label_ar) || toText(pairedAr.text_ar) || toText(pairedAr.value)
          : toText(pairedAr)) ||
        labelEn;

      return {
        labelAr,
        labelEn,
        requiresText: OTHER_EN_PATTERN.test(labelEn),
        value: labelEn,
      };
    })
    .filter(option => option.value);
}

export function getLocalizedOptionLabel(option: NormalizedSurveyOption, language: 'ar' | 'en' | string): string {
  return language === 'ar' && option.labelAr ? option.labelAr : option.labelEn;
}

export function getLikertLabels(question: Pick<SurveyQuestionLike, 'options_en' | 'options_ar'>, language: 'ar' | 'en'): string[] {
  const optionLabels = normalizeSurveyOptions(question).map(option => getLocalizedOptionLabel(option, language));
  if (optionLabels.length === 5) {
    return optionLabels;
  }
  return language === 'ar' ? FALLBACK_LIKERT_LABELS_AR : FALLBACK_LIKERT_LABELS_EN;
}

export function matchesSurveyCondition(answers: SurveyAnswers, condition: SurveyLogicCondition): boolean {
  const questionId = getConditionQuestionId(condition);
  if (!questionId) {
    return false;
  }

  const value = answers[questionId];
  const hasValue = hasAnswerValue(value);

  if (condition.equals !== undefined) {
    return answerMatches(value, condition.equals);
  }
  if (Array.isArray(condition.equals_any)) {
    return condition.equals_any.some(expected => answerMatches(value, expected));
  }
  if (condition.not_equals !== undefined) {
    return hasValue && !answerMatches(value, condition.not_equals);
  }
  if (Array.isArray(condition.not_equals_any)) {
    return hasValue && !condition.not_equals_any.some(expected => answerMatches(value, expected));
  }

  return hasValue;
}

function getSkipLogic(question: SurveyQuestionLike): SurveySkipLogic | null {
  if (!question.skip_logic || typeof question.skip_logic !== 'object' || Array.isArray(question.skip_logic)) {
    return null;
  }
  return question.skip_logic as SurveySkipLogic;
}

export function getQuestionSkipTarget(question: SurveyQuestionLike, answers: SurveyAnswers): string | null {
  const logic = getSkipLogic(question);
  if (!logic?.skip_to_section) {
    return null;
  }

  let matches = true;

  if (logic.if_question) {
    matches = matchesSurveyCondition(answers, {
      equals: logic.equals,
      equals_any: logic.equals_any,
      not_equals: logic.not_equals,
      not_equals_any: logic.not_equals_any,
      question_id: logic.if_question,
    });
  }

  if (matches && logic.and_question) {
    matches = matchesSurveyCondition(answers, {
      equals: logic.and_equals,
      equals_any: logic.and_equals_any,
      not_equals: logic.and_not_equals,
      not_equals_any: logic.and_not_equals_any,
      question_id: logic.and_question,
    });
  }

  return matches ? logic.skip_to_section : null;
}

export function shouldAutoAdvanceQuestion(question: SurveyQuestionLike): boolean {
  return Boolean(getSkipLogic(question)?.auto_advance && getSkipLogic(question)?.skip_to_section);
}

export function getQuestionMaxSelections(question: SurveyQuestionLike): number | null {
  const maxSelections = getSkipLogic(question)?.max_selections;
  return typeof maxSelections === 'number' && maxSelections > 0 ? maxSelections : null;
}

export function isSurveyQuestionVisible(
  question: SurveyQuestionLike,
  sectionQuestions: SurveyQuestionLike[],
  answers: SurveyAnswers
): boolean {
  const logic = getSkipLogic(question);

  if (logic?.show_if && !matchesSurveyCondition(answers, logic.show_if)) {
    return false;
  }
  if (Array.isArray(logic?.show_if_all) && !logic.show_if_all.every(condition => matchesSurveyCondition(answers, condition))) {
    return false;
  }
  if (Array.isArray(logic?.show_if_any) && logic.show_if_any.length > 0 && !logic.show_if_any.some(condition => matchesSurveyCondition(answers, condition))) {
    return false;
  }

  const orderedSectionQuestions = [...sectionQuestions].sort((a, b) => (a.order_num ?? 0) - (b.order_num ?? 0));
  for (const previousQuestion of orderedSectionQuestions) {
    if (previousQuestion.id === question.id) {
      break;
    }
    if (getQuestionSkipTarget(previousQuestion, answers)) {
      return false;
    }
  }

  return true;
}

export function getVisibleQuestionsForSection<T extends SurveyQuestionLike>(
  sectionId: string,
  questions: T[],
  answers: SurveyAnswers
): T[] {
  const sectionQuestions = questions
    .filter(question => question.section_id === sectionId)
    .sort((a, b) => (a.order_num ?? 0) - (b.order_num ?? 0));

  return sectionQuestions.filter(question => isSurveyQuestionVisible(question, sectionQuestions, answers));
}

export function getSurveySectionPath(
  sections: SurveySectionLike[],
  questions: SurveyQuestionLike[],
  answers: SurveyAnswers
): string[] {
  const path: string[] = [];
  const sectionIndexById = new Map(sections.map((section, index) => [section.id, index]));
  const visitedSectionIndexes = new Set<number>();
  let currentIndex = 0;

  while (currentIndex >= 0 && currentIndex < sections.length && !visitedSectionIndexes.has(currentIndex)) {
    const currentSection = sections[currentIndex];
    path.push(currentSection.id);
    visitedSectionIndexes.add(currentIndex);

    const sectionQuestions = questions
      .filter(question => question.section_id === currentSection.id)
      .sort((a, b) => (a.order_num ?? 0) - (b.order_num ?? 0));

    const skipTarget = sectionQuestions
      .map(question => getQuestionSkipTarget(question, answers))
      .find(target => target && sectionIndexById.has(target) && (sectionIndexById.get(target) ?? -1) > currentIndex);

    if (skipTarget) {
      currentIndex = sectionIndexById.get(skipTarget) ?? currentIndex + 1;
      continue;
    }

    currentIndex += 1;
  }

  return path;
}

export function formatSurveyAnswer(
  question: Pick<SurveyQuestionLike, 'id' | 'options_en' | 'options_ar' | 'type'>,
  answers: SurveyAnswers,
  language: 'ar' | 'en' = 'en'
): string {
  const rawAnswer = answers[question.id];
  if (!hasAnswerValue(rawAnswer)) {
    return '';
  }

  const options = normalizeSurveyOptions(question);
  const otherText = toText(answers[getQuestionOtherTextKey(question.id)]).trim();

  const formatSingleValue = (value: unknown): string => {
    const stringValue = String(value ?? '');
    if (!stringValue) {
      return '';
    }

    if (question.type === 'likert') {
      const scaleIndex = Number(stringValue) - 1;
      const likertLabels = getLikertLabels(question, language);
      if (Number.isInteger(scaleIndex) && scaleIndex >= 0 && scaleIndex < likertLabels.length) {
        const likertLabel = likertLabels[scaleIndex];
        return likertLabel.trim().startsWith(`${stringValue}`)
          ? likertLabel
          : `${stringValue} - ${likertLabel}`;
      }
    }

    const option = options.find(item => item.value === stringValue);
    const label = option ? getLocalizedOptionLabel(option, language) : stringValue;

    if (option?.requiresText && otherText) {
      return label.endsWith(':') ? `${label} ${otherText}` : `${label}: ${otherText}`;
    }

    return label;
  };

  if (Array.isArray(rawAnswer)) {
    return rawAnswer.map(formatSingleValue).filter(Boolean).join('; ');
  }

  return formatSingleValue(rawAnswer);
}
