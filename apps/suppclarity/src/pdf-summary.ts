import { ingredientsOf, type Product } from "./domain.ts";
import type { RoutineLog } from "./routine-data.ts";
export function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
export function summaryHtml(
  products: Product[],
  logs: RoutineLog[],
  includeHistory: boolean,
  date = new Date(),
) {
  const esc = escapeHtml;
  const cards = products
    .map(
      (p) =>
        "<section><h2>" +
        esc(p.name) +
        "</h2><p>" +
        (p.taking === false
          ? "Considering; not included in current intake"
          : "Recorded use: " +
            esc(String(p.unitsTaken)) +
            " " +
            esc(p.servingUnit || "unit(s)") +
            ", " +
            p.daysPerWeek +
            " days per week") +
        "</p><p>Label serving: " +
        p.unitsPerServing +
        " " +
        esc(p.servingUnit || "unit(s)") +
        "</p><table><thead><tr><th>Ingredient</th><th>Amount per label serving</th></tr></thead><tbody>" +
        ingredientsOf(p)
          .map(
            (i) =>
              "<tr><td>" +
              esc(i.nutrient) +
              "</td><td>" +
              esc(String(i.amount) + " " + i.unit) +
              "</td></tr>",
          )
          .join("") +
        "</tbody></table>" +
        (p.incompleteLabel || p.unassessedIngredients?.length
          ? "<p class='muted'>Label incomplete or contains unassessed ingredients. Confirm the bottle.</p>"
          : "") +
        (p.web || p.database
          ? "<p class='muted'>Product source: " +
            esc(p.web?.url || p.database?.url || "") +
            "</p>"
          : "") +
        (includeHistory
          ? "<p>Recent self-reported entries: " +
            esc(
              logs
                .filter((l) => l.productId === p.id)
                .slice(-14)
                .map((l) => l.day + " — " + l.status)
                .join("; ") || "None",
            ) +
            "</p>"
          : "") +
        "</section>",
    )
    .join("");
  return (
    "<!doctype html><html><head><meta charset='utf-8'><style>@page{margin:32px}body{font:14px/1.6 -apple-system,Arial,sans-serif;color:#20232b}h1{color:#6955df;font-size:28px}h2{font-size:18px}section{break-inside:avoid;margin:24px 0}table{border-collapse:collapse;width:100%}td,th{text-align:left;padding:8px;border-bottom:1px solid #e7e7ed}.muted{color:#646873;font-size:12px}footer{margin-top:30px;border-top:1px solid #ddd;padding-top:12px}</style></head><body><h1>SuppClarity · My supplement summary</h1><p>Prepared " +
    esc(date.toLocaleDateString("en-US")) +
    " · Entries selected by the user</p>" +
    cards +
    "<footer><strong>For discussion, not a clinical assessment.</strong><p>Amounts reflect confirmed entries, not verified intake, absorption, personal requirements or recommended treatment. Food intake and medicine interactions are not assessed. A log is self-reported and does not confirm ingestion. No questionnaire answers or conversations are included.</p><p>MedResearch Academy · info@medresearch-academy.om</p></footer></body></html>"
  );
}
