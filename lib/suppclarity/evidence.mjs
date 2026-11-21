export const topics = {
  "b12-older":
    "Vitamin B12 absorption fortified foods older adults systematic review nutritional intake",
  "b12-vegan":
    "Vitamin B12 reliable fortified foods supplementation vegan vegetarian adults systematic review",
  "vitamin-d-older":
    "Vitamin D supplementation adults 75 years older Endocrine Society 2024 guideline systematic review mortality",
  "vitamin-d-adult":
    "Vitamin D disease prevention generally healthy adults ages 19 to 74 guideline dietary reference intake",
  "magnesium-sleep":
    "Oral magnesium supplementation insomnia sleep adults randomized trial systematic review evidence certainty",
};
export function safePaper(r) {
  if (
    !r ||
    typeof r.title !== "string" ||
    !r.title.trim() ||
    r.title.length > 800
  )
    return null;
  const doi =
    typeof r.doi === "string" && /^10\.\d{4,9}\/\S{1,250}$/.test(r.doi)
      ? r.doi
      : null;
  let url = null;
  try {
    const u = new URL(r.url);
    if (
      u.protocol === "https:" &&
      u.hostname === "consensus.app" &&
      u.pathname.startsWith("/papers/")
    )
      url = u.href;
  } catch {}
  if (doi)
    url = "https://doi.org/" + encodeURIComponent(doi).replace("%2F", "/");
  if (!url) return null;
  return {
    title: r.title,
    doi,
    url,
    year:
      Number.isInteger(r.publish_year) &&
      r.publish_year >= 1900 &&
      r.publish_year <= new Date().getUTCFullYear() + 1
        ? r.publish_year
        : null,
    journal:
      typeof r.journal_name === "string" ? r.journal_name.slice(0, 200) : null,
  };
}
export async function searchEvidence({
  apiKey,
  topic,
  upstream = fetch,
  signal,
}) {
  if (!topics[topic]) throw Error("Unknown topic");
  const url = new URL("https://api.consensus.app/v1/search");
  url.searchParams.set("query", topics[topic]);
  url.searchParams.set("page_size", "5");
  const response = await upstream(url, {
    headers: { "x-api-key": apiKey },
    signal,
  });
  if (!response.ok) throw Error("Research unavailable");
  const body = await response.json();
  if (!Array.isArray(body.results)) throw Error("Invalid research response");
  return body.results.slice(0, 5).map(safePaper).filter(Boolean);
}
