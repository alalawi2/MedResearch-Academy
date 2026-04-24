// instruments.ts — Questionnaire item definitions for CBI, PHQ-9, GAD-7, ISI

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
}

// ---------------------------------------------------------------------------
// Option sets
// ---------------------------------------------------------------------------

const CBI_OPTIONS: ResponseOption[] = [
  { value: 1, label: 'Never' },
  { value: 2, label: 'Seldom' },
  { value: 3, label: 'Sometimes' },
  { value: 4, label: 'Often' },
  { value: 5, label: 'Always' },
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
  { value: 2, label: 'Moderately satisfied' },
  { value: 3, label: 'Dissatisfied' },
  { value: 4, label: 'Very dissatisfied' },
];

const ISI_NOTICEABLE_OPTIONS: ResponseOption[] = [
  { value: 0, label: 'Not at all noticeable' },
  { value: 1, label: 'A little' },
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

// ---------------------------------------------------------------------------
// CBI — Copenhagen Burnout Inventory (22 items)
// ---------------------------------------------------------------------------

export const CBI_ITEMS: CBIItem[] = [
  // Personal burnout (q1–q6)
  { id: 'cbi_q1',  subscale: 'personal', text: 'How often do you feel tired?', options: CBI_OPTIONS, reverse: false },
  { id: 'cbi_q2',  subscale: 'personal', text: 'How often are you physically exhausted?', options: CBI_OPTIONS, reverse: false },
  { id: 'cbi_q3',  subscale: 'personal', text: 'How often are you emotionally exhausted?', options: CBI_OPTIONS, reverse: false },
  { id: 'cbi_q4',  subscale: 'personal', text: "How often do you think: I can't take it anymore?", options: CBI_OPTIONS, reverse: false },
  { id: 'cbi_q5',  subscale: 'personal', text: 'How often do you feel worn out?', options: CBI_OPTIONS, reverse: false },
  { id: 'cbi_q6',  subscale: 'personal', text: 'How often do you feel weak and susceptible to illness?', options: CBI_OPTIONS, reverse: false },

  // Work-related burnout (q7–q13)
  { id: 'cbi_q7',  subscale: 'work', text: 'Is your work emotionally exhausting?', options: CBI_OPTIONS, reverse: false },
  { id: 'cbi_q8',  subscale: 'work', text: 'Do you feel burnt out because of your work?', options: CBI_OPTIONS, reverse: false },
  { id: 'cbi_q9',  subscale: 'work', text: 'Does your work frustrate you?', options: CBI_OPTIONS, reverse: false },
  { id: 'cbi_q10', subscale: 'work', text: 'Do you feel worn out at the end of the working day?', options: CBI_OPTIONS, reverse: false },
  { id: 'cbi_q11', subscale: 'work', text: 'Are you exhausted in the morning at the thought of another day at work?', options: CBI_OPTIONS, reverse: false },
  { id: 'cbi_q12', subscale: 'work', text: 'Do you feel that every working hour is tiring for you?', options: CBI_OPTIONS, reverse: false },
  { id: 'cbi_q13', subscale: 'work', text: 'Do you have enough energy for family and friends during leisure time?', options: CBI_OPTIONS, reverse: true },

  // Patient-related burnout (q14–q22)
  { id: 'cbi_q14', subscale: 'patient', text: 'Do you find it hard to work with patients?', options: CBI_OPTIONS, reverse: false },
  { id: 'cbi_q15', subscale: 'patient', text: 'Do you find it frustrating to work with patients?', options: CBI_OPTIONS, reverse: false },
  { id: 'cbi_q16', subscale: 'patient', text: 'Does it drain your energy to work with patients?', options: CBI_OPTIONS, reverse: false },
  { id: 'cbi_q17', subscale: 'patient', text: 'Do you feel that you give more than you get back when you work with patients?', options: CBI_OPTIONS, reverse: false },
  { id: 'cbi_q18', subscale: 'patient', text: 'Are you tired of working with patients?', options: CBI_OPTIONS, reverse: false },
  { id: 'cbi_q19', subscale: 'patient', text: 'Do you sometimes wonder how long you will be able to continue working with patients?', options: CBI_OPTIONS, reverse: false },
  { id: 'cbi_q20', subscale: 'patient', text: 'Do you feel that working with patients is an emotional burden?', options: CBI_OPTIONS, reverse: false },
  { id: 'cbi_q21', subscale: 'patient', text: 'Do you feel that working with patients affects your self-esteem?', options: CBI_OPTIONS, reverse: false },
  { id: 'cbi_q22', subscale: 'patient', text: 'Do you feel that working with patients affects your personal life?', options: CBI_OPTIONS, reverse: false },
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
// ---------------------------------------------------------------------------

export const ISI_ITEMS: QuestionnaireItem[] = [
  { id: 'isi_q1', text: 'Difficulty falling asleep', options: ISI_OPTIONS, reverse: false },
  { id: 'isi_q2', text: 'Difficulty staying asleep', options: ISI_OPTIONS, reverse: false },
  { id: 'isi_q3', text: 'Problems waking up too early', options: ISI_OPTIONS, reverse: false },
  { id: 'isi_q4', text: 'How satisfied/dissatisfied are you with your current sleep pattern?', options: ISI_SATISFACTION_OPTIONS, reverse: false },
  { id: 'isi_q5', text: 'How noticeable to others do you think your sleep problem is in terms of impairing the quality of your life?', options: ISI_NOTICEABLE_OPTIONS, reverse: false },
  { id: 'isi_q6', text: 'How worried/distressed are you about your current sleep problem?', options: ISI_WORRIED_OPTIONS, reverse: false },
  { id: 'isi_q7', text: 'To what extent do you consider your sleep problem to interfere with your daily functioning?', options: ISI_INTERFERE_OPTIONS, reverse: false },
];

// ---------------------------------------------------------------------------
// Instrument metadata
// ---------------------------------------------------------------------------

export type InstrumentId = 'cbi' | 'phq9' | 'gad7' | 'isi';

export interface InstrumentMeta {
  id: InstrumentId;
  name: string;
  fullName: string;
  itemCount: number;
  timeframe: string;
}

export const INSTRUMENTS: Record<InstrumentId, InstrumentMeta> = {
  cbi: {
    id: 'cbi',
    name: 'CBI',
    fullName: 'Copenhagen Burnout Inventory',
    itemCount: 22,
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
