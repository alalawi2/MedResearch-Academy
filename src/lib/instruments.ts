// instruments.ts — Questionnaire item definitions for WHO-5, CBI (19-item), PHQ-9, GAD-7

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface ResponseOption {
  value: number;
  label: string;
}

export interface QuestionnaireItem {
  id: string;
  text: string;
  options: ResponseOption[];
  reverse: boolean;
}

export interface CBIItem extends QuestionnaireItem {
  subscale: 'personal' | 'work' | 'patient';
  scaleType: 'frequency' | 'degree';
}

// ---------------------------------------------------------------------------
// Option sets
// ---------------------------------------------------------------------------

/** CBI frequency scale: Always(100) ... Never(0) */
const CBI_FREQUENCY_OPTIONS: ResponseOption[] = [
  { value: 100, label: 'Always' },
  { value: 75, label: 'Often' },
  { value: 50, label: 'Sometimes' },
  { value: 25, label: 'Seldom' },
  { value: 0, label: 'Never/almost never' },
];

/** CBI degree scale: To a very high degree(100) ... To a very low degree(0) */
const CBI_DEGREE_OPTIONS: ResponseOption[] = [
  { value: 100, label: 'To a very high degree' },
  { value: 75, label: 'To a high degree' },
  { value: 50, label: 'Somewhat' },
  { value: 25, label: 'To a low degree' },
  { value: 0, label: 'To a very low degree' },
];

const PHQ9_OPTIONS: ResponseOption[] = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
];

const GAD7_OPTIONS: ResponseOption[] = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
];

/** WHO-5 response options */
const WHO5_OPTIONS: ResponseOption[] = [
  { value: 5, label: 'All of the time' },
  { value: 4, label: 'Most of the time' },
  { value: 3, label: 'More than half the time' },
  { value: 2, label: 'Less than half the time' },
  { value: 1, label: 'Some of the time' },
  { value: 0, label: 'At no time' },
];

// ---------------------------------------------------------------------------
// WHO-5 — WHO Wellbeing Index (5 items)
// ---------------------------------------------------------------------------

export const WHO5_ITEMS: QuestionnaireItem[] = [
  { id: 'who5_q1', text: 'I have felt cheerful and in good spirits', options: WHO5_OPTIONS, reverse: false },
  { id: 'who5_q2', text: 'I have felt calm and relaxed', options: WHO5_OPTIONS, reverse: false },
  { id: 'who5_q3', text: 'I have felt active and vigorous', options: WHO5_OPTIONS, reverse: false },
  { id: 'who5_q4', text: 'I woke up feeling fresh and rested', options: WHO5_OPTIONS, reverse: false },
  { id: 'who5_q5', text: 'My daily life has been filled with things that interest me', options: WHO5_OPTIONS, reverse: false },
];

// ---------------------------------------------------------------------------
// CBI — Copenhagen Burnout Inventory (19 items)
// ---------------------------------------------------------------------------

export const CBI_ITEMS: CBIItem[] = [
  // Personal burnout (q1–q6) — frequency scale
  { id: 'cbi_q1',  subscale: 'personal', scaleType: 'frequency', text: 'How often do you feel tired?', options: CBI_FREQUENCY_OPTIONS, reverse: false },
  { id: 'cbi_q2',  subscale: 'personal', scaleType: 'frequency', text: 'How often are you physically exhausted?', options: CBI_FREQUENCY_OPTIONS, reverse: false },
  { id: 'cbi_q3',  subscale: 'personal', scaleType: 'frequency', text: 'How often are you emotionally exhausted?', options: CBI_FREQUENCY_OPTIONS, reverse: false },
  { id: 'cbi_q4',  subscale: 'personal', scaleType: 'frequency', text: "How often do you think: \"I can't take it anymore\"?", options: CBI_FREQUENCY_OPTIONS, reverse: false },
  { id: 'cbi_q5',  subscale: 'personal', scaleType: 'frequency', text: 'How often do you feel worn out?', options: CBI_FREQUENCY_OPTIONS, reverse: false },
  { id: 'cbi_q6',  subscale: 'personal', scaleType: 'frequency', text: 'How often do you feel weak and susceptible to illness?', options: CBI_FREQUENCY_OPTIONS, reverse: false },

  // Work-related burnout (q7–q13)
  { id: 'cbi_q7',  subscale: 'work', scaleType: 'degree', text: 'Is your work emotionally exhausting?', options: CBI_DEGREE_OPTIONS, reverse: false },
  { id: 'cbi_q8',  subscale: 'work', scaleType: 'degree', text: 'Do you feel burnt out because of your work?', options: CBI_DEGREE_OPTIONS, reverse: false },
  { id: 'cbi_q9',  subscale: 'work', scaleType: 'degree', text: 'Does your work frustrate you?', options: CBI_DEGREE_OPTIONS, reverse: false },
  { id: 'cbi_q10', subscale: 'work', scaleType: 'frequency', text: 'Do you feel worn out at the end of the working day?', options: CBI_FREQUENCY_OPTIONS, reverse: false },
  { id: 'cbi_q11', subscale: 'work', scaleType: 'frequency', text: 'Are you exhausted in the morning at the thought of another day at work?', options: CBI_FREQUENCY_OPTIONS, reverse: false },
  { id: 'cbi_q12', subscale: 'work', scaleType: 'frequency', text: 'Do you feel that every working hour is tiring for you?', options: CBI_FREQUENCY_OPTIONS, reverse: false },
  { id: 'cbi_q13', subscale: 'work', scaleType: 'frequency', text: 'Do you have enough energy for family and friends during leisure time?', options: CBI_FREQUENCY_OPTIONS, reverse: true },

  // Client-related burnout (q14–q19)
  { id: 'cbi_q14', subscale: 'patient', scaleType: 'degree', text: 'Do you find it hard to work with clients?', options: CBI_DEGREE_OPTIONS, reverse: false },
  { id: 'cbi_q15', subscale: 'patient', scaleType: 'degree', text: 'Do you find it frustrating to work with clients?', options: CBI_DEGREE_OPTIONS, reverse: false },
  { id: 'cbi_q16', subscale: 'patient', scaleType: 'degree', text: 'Does it drain your energy to work with clients?', options: CBI_DEGREE_OPTIONS, reverse: false },
  { id: 'cbi_q17', subscale: 'patient', scaleType: 'degree', text: 'Do you feel that you give more than you get back when you work with clients?', options: CBI_DEGREE_OPTIONS, reverse: false },
  { id: 'cbi_q18', subscale: 'patient', scaleType: 'frequency', text: 'Are you tired of working with clients?', options: CBI_FREQUENCY_OPTIONS, reverse: false },
  { id: 'cbi_q19', subscale: 'patient', scaleType: 'frequency', text: 'Do you sometimes wonder how long you will be able to continue working with clients?', options: CBI_FREQUENCY_OPTIONS, reverse: false },
];

// ---------------------------------------------------------------------------
// PHQ-9 — Patient Health Questionnaire (9 items)
// ---------------------------------------------------------------------------

export const PHQ9_ITEMS: QuestionnaireItem[] = [
  { id: 'phq9_q1', text: 'Little interest or pleasure in doing things', options: PHQ9_OPTIONS, reverse: false },
  { id: 'phq9_q2', text: 'Feeling down, depressed, or hopeless', options: PHQ9_OPTIONS, reverse: false },
  { id: 'phq9_q3', text: 'Trouble falling or staying asleep, or sleeping too much', options: PHQ9_OPTIONS, reverse: false },
  { id: 'phq9_q4', text: 'Feeling tired or having little energy', options: PHQ9_OPTIONS, reverse: false },
  { id: 'phq9_q5', text: 'Poor appetite or overeating', options: PHQ9_OPTIONS, reverse: false },
  { id: 'phq9_q6', text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down', options: PHQ9_OPTIONS, reverse: false },
  { id: 'phq9_q7', text: 'Trouble concentrating on things, such as reading the newspaper or watching television', options: PHQ9_OPTIONS, reverse: false },
  { id: 'phq9_q8', text: 'Moving or speaking so slowly that other people could have noticed. Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual', options: PHQ9_OPTIONS, reverse: false },
  { id: 'phq9_q9', text: 'Thoughts that you would be better off dead, or of hurting yourself in some way', options: PHQ9_OPTIONS, reverse: false },
];

// ---------------------------------------------------------------------------
// GAD-7 — Generalized Anxiety Disorder (7 items)
// ---------------------------------------------------------------------------

export const GAD7_ITEMS: QuestionnaireItem[] = [
  { id: 'gad7_q1', text: 'Feeling nervous, anxious, or on edge', options: GAD7_OPTIONS, reverse: false },
  { id: 'gad7_q2', text: 'Not being able to stop or control worrying', options: GAD7_OPTIONS, reverse: false },
  { id: 'gad7_q3', text: 'Worrying too much about different things', options: GAD7_OPTIONS, reverse: false },
  { id: 'gad7_q4', text: 'Trouble relaxing', options: GAD7_OPTIONS, reverse: false },
  { id: 'gad7_q5', text: "Being so restless that it's hard to sit still", options: GAD7_OPTIONS, reverse: false },
  { id: 'gad7_q6', text: 'Becoming easily annoyed or irritable', options: GAD7_OPTIONS, reverse: false },
  { id: 'gad7_q7', text: 'Feeling afraid, as if something awful might happen', options: GAD7_OPTIONS, reverse: false },
];

// ---------------------------------------------------------------------------
// ISI — Insomnia Severity Index (7 items)
//   Each item 0-4. Total 0-28.
//   None 0-7, Subthreshold 8-14, Moderate 15-21, Severe 22-28.
// ---------------------------------------------------------------------------

const ISI_OPTIONS: ResponseOption[] = [
  { value: 0, label: 'None' },
  { value: 1, label: 'Mild' },
  { value: 2, label: 'Moderate' },
  { value: 3, label: 'Severe' },
  { value: 4, label: 'Very severe' },
];

const ISI_SATISFACTION_OPTIONS: ResponseOption[] = [
  { value: 0, label: 'Very satisfied' },
  { value: 1, label: 'Satisfied' },
  { value: 2, label: 'Neutral' },
  { value: 3, label: 'Dissatisfied' },
  { value: 4, label: 'Very dissatisfied' },
];

const ISI_NOTICEABLE_OPTIONS: ResponseOption[] = [
  { value: 0, label: 'Not at all noticeable' },
  { value: 1, label: 'Barely' },
  { value: 2, label: 'Somewhat' },
  { value: 3, label: 'Much' },
  { value: 4, label: 'Very much noticeable' },
];

const ISI_WORRIED_OPTIONS: ResponseOption[] = [
  { value: 0, label: 'Not at all worried' },
  { value: 1, label: 'A little' },
  { value: 2, label: 'Somewhat' },
  { value: 3, label: 'Much' },
  { value: 4, label: 'Very much worried' },
];

const ISI_INTERFERE_OPTIONS: ResponseOption[] = [
  { value: 0, label: 'Not at all interfering' },
  { value: 1, label: 'A little' },
  { value: 2, label: 'Somewhat' },
  { value: 3, label: 'Much' },
  { value: 4, label: 'Very much interfering' },
];

export const ISI_ITEMS: QuestionnaireItem[] = [
  { id: 'isi_q1', text: 'Difficulty falling asleep', options: ISI_OPTIONS, reverse: false },
  { id: 'isi_q2', text: 'Difficulty staying asleep', options: ISI_OPTIONS, reverse: false },
  { id: 'isi_q3', text: 'Problems waking up too early', options: ISI_OPTIONS, reverse: false },
  { id: 'isi_q4', text: 'How satisfied/dissatisfied are you with your current sleep pattern?', options: ISI_SATISFACTION_OPTIONS, reverse: false },
  { id: 'isi_q5', text: 'How noticeable to others do you think your sleep problem is in terms of impairing the quality of your life?', options: ISI_NOTICEABLE_OPTIONS, reverse: false },
  { id: 'isi_q6', text: 'How worried/distressed are you about your current sleep problem?', options: ISI_WORRIED_OPTIONS, reverse: false },
  { id: 'isi_q7', text: 'To what extent do you consider your sleep problem to currently interfere with your daily functioning (e.g., daytime fatigue, mood, ability to function at work/daily chores, concentration, memory, mood, etc.)?', options: ISI_INTERFERE_OPTIONS, reverse: false },
];

// ---------------------------------------------------------------------------
// Instrument metadata
// ---------------------------------------------------------------------------

export type InstrumentId = 'who5' | 'cbi' | 'phq9' | 'gad7' | 'isi';

export interface InstrumentMeta {
  id: InstrumentId;
  name: string;
  fullName: string;
  itemCount: number;
  timeframe: string;
}

export const INSTRUMENTS: Record<InstrumentId, InstrumentMeta> = {
  who5: {
    id: 'who5',
    name: 'WHO-5',
    fullName: 'WHO-5 Well-Being Index',
    itemCount: 5,
    timeframe: 'Over the last 2 weeks',
  },
  cbi: {
    id: 'cbi',
    name: 'CBI',
    fullName: 'Copenhagen Burnout Inventory',
    itemCount: 19,
    timeframe: '',
  },
  phq9: {
    id: 'phq9',
    name: 'PHQ-9',
    fullName: 'Patient Health Questionnaire-9',
    itemCount: 9,
    timeframe: 'Over the last 2 weeks',
  },
  gad7: {
    id: 'gad7',
    name: 'GAD-7',
    fullName: 'Generalized Anxiety Disorder-7',
    itemCount: 7,
    timeframe: 'Over the last 2 weeks',
  },
  isi: {
    id: 'isi',
    name: 'ISI',
    fullName: 'Insomnia Severity Index',
    itemCount: 7,
    timeframe: 'Over the last 2 weeks',
  },
};
