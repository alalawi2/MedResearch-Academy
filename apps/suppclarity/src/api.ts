import type { ReadLabel } from "./labels";
import type { Topic } from "./evidence";
const ORIGIN = "https://www.medresearch-academy.om";
// An anonymous session identifier, not a credential. Server IP and global quotas are enforced separately.
const install = Array.from({ length: 64 }, () =>
  Math.floor(Math.random() * 16).toString(16),
).join("");
export async function scanLabel(
  image: string,
  signal: AbortSignal,
): Promise<ReadLabel> {
  const response = await fetch(`${ORIGIN}/api/suppclarity/scan`, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      "X-SuppClarity-Consent": "label-photo-v1",
      "X-SuppClarity-Install": install,
    },
    body: JSON.stringify({ image }),
  });
  const data = await response.json();
  if (!response.ok)
    throw Error(
      typeof data.error === "string"
        ? data.error
        : "Label reading is unavailable.",
    );
  if (
    !data.label ||
    !Array.isArray(data.label.ingredients) ||
    typeof data.label.hasSupplementFacts !== "boolean"
  )
    throw Error("We could not read this label reliably.");
  return data.label;
}
export type ResearchPaper = {
  title: string;
  doi: string | null;
  url: string;
  year: number | null;
  journal: string | null;
};
export async function liveEvidence(
  topic: Topic,
  signal: AbortSignal,
): Promise<{ papers: ResearchPaper[]; retrievedAt: string }> {
  const response = await fetch(
    `${ORIGIN}/api/suppclarity/evidence?topic=${encodeURIComponent(topic)}`,
    { signal },
  );
  const body = await response.json();
  if (!response.ok)
    throw Error(
      typeof body.error === "string"
        ? body.error
        : "Live research is unavailable.",
    );
  if (!Array.isArray(body.papers)) throw Error("Live research is unavailable.");
  return body;
}
