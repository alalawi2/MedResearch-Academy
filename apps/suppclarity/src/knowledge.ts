import { nutrientCatalog, type Nutrient } from "./domain.ts";
import { dailyReference } from "./daily-references.ts";
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
  vitamine: "vitamin",
  protien: "protein",
  creatiene: "creatine",
  zink: "zinc",
  magensium: "magnesium",
  magensuim: "magnesium",
  magnesuim: "magnesium",
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
  nutrient?: Nutrient;
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
  if (/kill myself|want to die|hurt myself|end my life/.test(n))
    return {
      kind: "scope",
      answer:
        "Please reach out now to someone you trust and a local crisis support service. If you might act on these thoughts or have taken something to harm yourself, contact your local emergency service immediately. This supplement helper cannot provide crisis care.",
      choices: [],
      sourceIds: [],
    };
  if (
    /trouble breathing|cannot breathe|can t breathe|severe reaction|chest pain/.test(
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
  const exact = faqBank.find((f) => normalized(f.question) === n);
  if (exact) return fixed(exact.id);
  const mentioned = Object.entries(nutrientCatalog).filter(([name, info]) =>
    [name, ...info.aliases].some((alias) => {
      const terms = words(alias);
      return terms.length && terms.every((t) => tokens.includes(t));
    }),
  );
  const uniqueGuides = [...new Set(mentioned.map(([, info]) => info.guide))];
  if (uniqueGuides.length === 1) {
    const nutrient = mentioned[0][0] as Nutrient;
    const guide = mentioned[0][1].guide as GuideId;
    const g = localGuides[guide];
    const topicTokens = new Set(
      mentioned.flatMap(([name, info]) =>
        [name, ...info.aliases].flatMap(words),
      ),
    );
    const general = new Set(
      "tell about explain information info please benefits benefit uses use good help overview know more everything general all used need want learn".split(
        " ",
      ),
    );
    if (tokens.every((t) => topicTokens.has(t) || general.has(t)))
      return {
        kind: "answer",
        answer: `${g.summary} ${g.food}`,
        choices: [],
        sourceIds: validSources(g.sourceIds),
        guide,
        nutrient,
      };
    if (
      /daily|per day|rda|recommended (intake|amount|dose)|how much.*(day|need)/.test(
        n,
      )
    ) {
      if (/pregnan|breastfeed|breast feed|child|under 18/.test(n))
        return {
          kind: "scope",
          answer:
            "Pregnancy, breastfeeding and childhood use different intake references. The general adult figures should not be applied automatically, and they do not choose an extra supplement dose. These circumstances need individual context.",
          choices: [],
          sourceIds: validSources(g.sourceIds),
          guide,
          nutrient,
        };
      const reference = dailyReference(nutrient);
      if (reference)
        return {
          kind: "answer",
          answer:
            reference.lines.join(" ") +
            " These are general intake references from food and supplements combined, not an extra supplement dose. Food intake and health circumstances determine whether extra is needed.",
          choices: [],
          sourceIds: [reference.source],
          guide,
          nutrient,
        };
    }
  }
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

export function nutrientForGuide(guide?: string): Nutrient | undefined {
  const matches = Object.entries(nutrientCatalog).filter(
    ([, info]) => info.guide === guide,
  );
  return matches.length === 1 ? (matches[0][0] as Nutrient) : undefined;
}
