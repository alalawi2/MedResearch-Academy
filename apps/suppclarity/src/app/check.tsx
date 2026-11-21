import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { useStore } from "../store";
import { Page, Copy, Button, Field, Notice, Icon, C, S } from "../ui";
import { validAge, type Profile } from "../domain";
const baseQuestions: {
  key: keyof Profile;
  title: string;
  hint: string;
  options?: string[];
}[] = [
  {
    key: "use",
    title: "Where are you starting?",
    hint: "There is no expectation to take a supplement.",
    options: ["No", "Yes", "Not sure"],
  },
  {
    key: "age",
    title: "How old are you?",
    hint: "For adults 18 and above. Older adults are welcome.",
  },
  {
    key: "screening",
    title: "Does any of this apply?",
    hint: "Choose the closest answer. This app does not check medicine interactions or health conditions.",
    options: [
      "I take medicines",
      "I have a health condition",
      "Both medicines and a condition",
      "None of these",
      "Clinician-directed supplements or a known deficiency",
      "Not sure",
    ],
  },
  {
    key: "context",
    title: "Any special circumstances?",
    hint: "This helps us explain the limits of your check.",
    options: [
      "Pregnant or breastfeeding",
      "Trying to conceive",
      "No special circumstances",
      "Prefer not to say",
    ],
  },
  {
    key: "diet",
    title: "How would you describe your diet?",
    hint: "A starting point, rather than a detailed food diary.",
    options: ["Mixed diet", "Vegetarian", "Vegan", "Another diet", "Not sure"],
  },
  {
    key: "goal",
    title: "What would you like clarity on?",
    hint: "Choose one thing to start with.",
    options: [
      "Whether to start supplements",
      "Understand my routine",
      "Ingredient overlap",
      "Understand a label",
      "Sleep",
      "General wellbeing",
      "Exercise and recovery",
      "Digestion and gut health",
    ],
  },
];
export default function Check() {
  const { profile, setProfile, step: savedStep, setStep } = useStore();
  const needsB12 =
    profile.diet === "Vegan" ||
    profile.diet === "Vegetarian" ||
    Number(profile.age) >= 50;
  const b12Question = {
    key: "b12Source" as const,
    title: "Do you have a regular B12 source?",
    hint: "Fortified foods and supplements can supply B12. A source does not by itself prove adequate intake.",
    options: [
      "Regular fortified foods",
      "I take a B12-containing supplement",
      "Neither regularly",
      "Not sure",
    ],
  };
  const questions = [
    ...baseQuestions.slice(0, 5),
    ...(needsB12 ? [b12Question] : []),
    baseQuestions[5],
  ];
  const step = Math.min(savedStep, questions.length - 1);
  const q = questions[step] || questions[0];
  const value = profile[q.key] || "";
  const valid = q.key === "age" ? validAge(value) : !!value;
  const earlyLimit =
    (q.key === "screening" && value && value !== "None of these") ||
    (q.key === "context" && value && value !== "No special circumstances");
  return (
    <Page>
      <View style={[S.row, { justifyContent: "space-between" }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous question"
          style={S.iconButton}
          onPress={() => (step ? setStep(step - 1) : router.back())}
        >
          <Icon name="chevron-left" />
        </Pressable>
        <Copy kind="small">
          {step + 1} of {questions.length}
        </Copy>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace("/")}
          style={{ minHeight: 48, justifyContent: "center" }}
        >
          <Copy kind="label">Pause & exit</Copy>
        </Pressable>
      </View>
      <View
        accessibilityRole="progressbar"
        aria-valuemin={1}
        aria-valuemax={questions.length}
        aria-valuenow={step + 1}
        aria-valuetext={`Question ${step + 1} of ${questions.length}`}
        accessibilityValue={{
          min: 1,
          max: questions.length,
          now: step + 1,
          text: `Question ${step + 1} of ${questions.length}`,
        }}
        accessibilityLabel="Check progress"
        style={{ height: 5, backgroundColor: C.line, borderRadius: 4 }}
      >
        <View
          style={{
            height: 5,
            width: `${((step + 1) / questions.length) * 100}%`,
            backgroundColor: C.teal,
            borderRadius: 4,
          }}
        />
      </View>
      <View style={{ gap: 12, marginTop: 12 }}>
        <Copy kind="title">{q.title}</Copy>
        <Copy style={{ color: C.muted }}>{q.hint}</Copy>
      </View>
      {q.key === "age" ? (
        <>
          <Field
            label="Age in years"
            value={value}
            onChange={(v) => setProfile((p) => ({ ...p, age: v }))}
            number
          />
          {value && !valid && (
            <Copy style={{ color: C.amber }} accessibilityRole="alert">
              Enter a whole-number age of 18 or above.
            </Copy>
          )}
        </>
      ) : (
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel={q.title}
          style={{ gap: 12 }}
        >
          {q.options?.map((option) => (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ checked: value === option }}
              aria-checked={value === option}
              onPress={() =>
                setProfile((p) => ({
                  ...p,
                  [q.key]: option,
                  ...(q.key === "b12Source" &&
                  option === "I take a B12-containing supplement"
                    ? { use: "Yes" }
                    : {}),
                }))
              }
              style={[S.choice, value === option && S.chosen]}
            >
              <View style={S.row}>
                <Copy style={{ flex: 1, fontWeight: "500" }}>
                  {q.key === "use"
                    ? option === "No"
                      ? "I'm new to supplements"
                      : option === "Yes"
                        ? "I already take supplements"
                        : "I'm not sure"
                    : option}
                </Copy>
                <Icon
                  name={value === option ? "check-circle" : "circle"}
                  size={22}
                />
              </View>
            </Pressable>
          ))}
        </View>
      )}
      {earlyLimit && (
        <Notice>
          Your personal assessment will be limited. You can still explore
          sources and calculate quantities from your labels. This app cannot
          tell you whether a supplement is suitable for your circumstances.
        </Notice>
      )}
      <Button
        disabled={!valid}
        label={step === questions.length - 1 ? "See my summary" : "Continue"}
        onPress={() => {
          if (step === questions.length - 1) router.replace("/result");
          else setStep(step + 1);
        }}
      />
      <Copy kind="small" style={{ color: C.muted }}>
        Installed app: progress saves on your device. Browser preview: clears on
        reload.
      </Copy>
    </Page>
  );
}
