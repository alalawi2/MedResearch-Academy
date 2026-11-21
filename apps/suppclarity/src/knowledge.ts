import { faqBank, localGuides } from "./education-data.mjs";
import { sources, type SourceId, type Topic } from "./evidence.ts";
import { researchTopics } from "./research-topics.mjs";
export type GuideId = keyof typeof localGuides;
export type Faq = (typeof faqBank)[number];
export { faqBank, localGuides };
export const validSources = (ids: string[]) =>
  ids.filter((id): id is SourceId => Object.hasOwn(sources, id));
export function guideForTopic(topic: string): GuideId | undefined {
  if (topic.startsWith("b12")) return "b12";
  if (topic.startsWith("vitamin-d")) return "vitamin-d";
  if (topic === "magnesium-sleep") return "magnesium";
  return Object.hasOwn(localGuides, topic) ? (topic as GuideId) : undefined;
}
export function guideTopic(id: GuideId): Topic | undefined {
  const t = localGuides[id].topic;
  return Object.hasOwn(researchTopics, t) ? (t as Topic) : undefined;
}
const corrections: Record<string, string> = {
  magnesum: "magnesium",
  magnisium: "magnesium",
  calicum: "calcium",
  probiotic: "probiotics",
  suplement: "supplement",
  supplements: "supplement",
  vitamins: "vitamin",
  folic: "folic",
  bottles: "bottle",
  medications: "medicine",
  medication: "medicine",
  medicines: "medicine",
  sleeping: "sleep",
};
const stop = new Set(
  "a an the i me my can do does is are what how why to for of in on and or it that this should taking take with".split(
    " ",
  ),
);
function normalized(s: string) {
  return s
    .toLowerCase()
    .replace(/vitamin\s*d\b/g, "vitamind")
    .replace(/vitamin\s*b[ -]?12/g, "b12")
    .replace(/fish\s*oil/g, "fishoil")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function words(s: string) {
  return [
    ...new Set(
      normalized(s)
        .split(" ")
        .map((x) => corrections[x] || x)
        .filter((x) => x && !stop.has(x)),
    ),
  ];
}
export type CopilotReply = {
  kind: "answer" | "choices" | "scope";
  answer?: string;
  faq?: Faq;
  choices: Faq[];
  sourceIds: SourceId[];
  guide?: GuideId;
};
export function askCopilot(question: string): CopilotReply {
  const q = question.slice(0, 500);
  const n = normalized(q);
  const fixed = (id: string): CopilotReply => {
    const f = faqBank.find((x) => x.id === id)!;
    return {
      kind: "answer",
      answer: f.answer,
      faq: f,
      choices: [],
      sourceIds: validSources(f.sourceIds),
      guide: f.guide as GuideId,
    };
  };
  if (
    /trouble breathing|cannot breathe|can t breathe|severe reaction|chest pain|kill myself|want to die/.test(
      n,
    )
  )
    return fixed("q088");
  if (
    /(i|child|someone).*(took|swallowed).*(too many|whole bottle|overdose|by mistake)|accidentally.*(too much|too many)/.test(
      n,
    )
  )
    return fixed("q087");
  if (
    /warfarin|levothyroxine|metformin|sertraline|antibiotic|blood thinner|my medicine|my medication|interact.*medicine|combine.*medicine/.test(
      n,
    )
  )
    return fixed("q081");
  if (
    /how (much|many).*(should i|do i|pills|capsules)|dose for me|prescribe|treat my|diagnose/.test(
      n,
    )
  )
    return {
      kind: "scope",
      answer:
        "I can explain printed amounts and general evidence, but I cannot select your personal dose or diagnose a deficiency. Your full intake and health circumstances matter.",
      choices: [faqBank[11], faqBank[34], faqBank[82]],
      sourceIds: ["basicsNIH"],
      guide: "starting",
    };
  const tokens = words(q);
  if (!tokens.length)
    return { kind: "choices", choices: faqBank.slice(0, 3), sourceIds: [] };
  const scored = faqBank
    .map((f) => {
      const fw = words(f.question + " " + f.tags.join(" "));
      const hits = tokens.filter((t) => fw.includes(t)).length;
      const exact = normalized(f.question) === n;
      return {
        f,
        score: exact
          ? 2
          : (hits / tokens.length) * 0.75 +
            (hits / Math.max(fw.length, 1)) * 0.25,
      };
    })
    .sort((a, b) => b.score - a.score);
  const [best, next] = scored;
  if (best.score >= 0.75 && best.score - (next?.score || 0) >= 0.08)
    return fixed(best.f.id);
  return {
    kind: "choices",
    answer:
      best.score < 0.2
        ? "I do not have a prepared answer to that question yet. Try a related guide or ask a specific supplement question."
        : "These are the closest prepared questions. Choose one so I can give the right answer.",
    choices: scored
      .filter((x) => x.score >= 0.15)
      .slice(0, 3)
      .map((x) => x.f),
    sourceIds: [],
    guide: best.score >= 0.2 ? (best.f.guide as GuideId) : undefined,
  };
}
