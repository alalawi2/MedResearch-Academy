import type { ReadLabel } from "./labels";
import type { Topic } from "./evidence";
import { billingHeaders } from "./billing";
import { API_ORIGIN as ORIGIN } from "./api-origin";
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
      ...(await billingHeaders()),
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

export type ProductMatch = {
  id: string;
  name: string;
  brand: string;
  form: string;
  pack: string;
  entryDate: string | null;
  offMarket: boolean;
};
async function productRequest(params: string, signal: AbortSignal) {
  const response = await fetch(`${ORIGIN}/api/suppclarity/products?${params}`, {
    signal,
  });
  const data = await response.json();
  if (!response.ok)
    throw Error(
      typeof data.error === "string"
        ? data.error
        : "Product search is unavailable. Try a photo or manual entry.",
    );
  return data;
}
export type WebMatch = {
  name: string;
  brand: string;
  url: string;
  sourceType: "manufacturer" | "retailer";
  market: string | null;
  label: ReadLabel | null;
};
export type ProductSearchResult = {
  products: ProductMatch[];
  webMatches: WebMatch[];
  onlineStatus: string;
  databaseAvailable: boolean;
};
export async function findProducts(
  query: string,
  signal: AbortSignal,
  web = false,
): Promise<ProductSearchResult> {
  const data = await productRequest(
    `q=${encodeURIComponent(query)}${web ? "&web=1" : ""}`,
    signal,
  );
  if (!Array.isArray(data.products))
    throw Error("Product search is unavailable.");
  return {
    products: data.products,
    webMatches: data.webMatches || [],
    onlineStatus: data.onlineStatus || "unavailable",
    databaseAvailable: data.databaseAvailable !== false,
  };
}
export async function readProduct(
  id: string,
  signal: AbortSignal,
): Promise<ReadLabel> {
  const data = await productRequest(`id=${encodeURIComponent(id)}`, signal);
  if (!data.label || !Array.isArray(data.label.ingredients))
    throw Error("This label could not be loaded. Try a photo instead.");
  return data.label;
}

export async function copilotAnswer(
  question: string,
  history: { question: string; answer: string }[],
  signal: AbortSignal,
): Promise<{ answer: string; sourceIds: string[]; guide: string | null }> {
  const response = await fetch(`${ORIGIN}/api/suppclarity/copilot`, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      ...(await billingHeaders()),
    },
    body: JSON.stringify({ question, history: history.slice(-2) }),
  });
  const data = await response.json();
  if (!response.ok)
    throw Error(
      typeof data.error === "string"
        ? data.error
        : "Live answers are unavailable.",
    );
  if (typeof data.answer !== "string" || !Array.isArray(data.sourceIds))
    throw Error("The answer could not be checked.");
  return data;
}
export type ReportReason = "incorrect" | "unsafe" | "offensive" | "other";
export async function reportAnswer(
  answer: string,
  category: ReportReason,
  sourceIds: string[],
  signal: AbortSignal,
) {
  const response = await fetch(`${ORIGIN}/api/suppclarity/feedback`, {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      answer,
      category,
      sourceIds,
      consent: "answer-report-v1",
    }),
  });
  const data = await response.json();
  if (!response.ok || data.saved !== true)
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "The report was not saved. Please try again.",
    );
}
