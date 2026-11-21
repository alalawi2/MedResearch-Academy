import { useEffect, useRef, useState } from "react";
import { ActivityIndicator } from "react-native";
import { Button, Card, Copy, Field, Notice, C } from "./ui";
import { findProducts, readProduct, type ProductMatch } from "./api";
import type { ReadLabel } from "./labels";
export function ProductSearch({
  onSelect,
}: {
  onSelect: (label: ReadLabel) => void;
}) {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<ProductMatch[]>([]);
  const [busy, setBusy] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  async function run(id?: string) {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const timer = setTimeout(() => controller.abort(), 25000);
    setBusy(true);
    setError("");
    try {
      if (id) {
        const result = await readProduct(id, controller.signal);
        if (!controller.signal.aborted) onSelect(result);
      } else {
        setMatches([]);
        setSearched(false);
        const result = await findProducts(query, controller.signal);
        if (!controller.signal.aborted) {
          setMatches(result);
          setSearched(true);
        }
      }
    } catch (e) {
      if (request.current === controller)
        setError(
          controller.signal.aborted
            ? "Search timed out. Try again, use a photo or enter the label manually."
            : e instanceof Error
              ? e.message
              : "Product search is unavailable.",
        );
    } finally {
      clearTimeout(timer);
      if (request.current === controller) {
        setBusy(false);
        request.current = null;
      }
    }
  }
  return (
    <Card>
      <Copy kind="heading">Find the exact bottle</Copy>
      <Field
        label="Name, brand or barcode number"
        value={query}
        maxLength={120}
        onChange={(v) => {
          request.current?.abort();
          request.current = null;
          setBusy(false);
          setQuery(v);
          setMatches([]);
          setSearched(false);
          setError("");
        }}
        hint="Try Nature Made vitamin D, Centrum Adults, or type the full barcode."
      />
      <Button
        label="Search products"
        icon="search"
        disabled={busy || query.trim().length < 2}
        onPress={() => run()}
      />
      {busy && (
        <ActivityIndicator
          color={C.teal}
          accessibilityLabel="Looking up product labels"
        />
      )}
      {!!error && <Notice>{error}</Notice>}
      {searched && !matches.length && (
        <Notice>
          No matching label found. Try fewer words or the full barcode. You can
          also choose Photo or Manual above.
        </Notice>
      )}
      {matches.map((m) => (
        <Card key={m.id}>
          <Copy kind="heading">{m.name}</Copy>
          <Copy kind="small">
            {[m.brand, m.form, m.pack].filter(Boolean).join(" · ")}
          </Copy>
          <Copy kind="small" style={{ color: C.muted }}>
            {m.entryDate ? `Record dated ${m.entryDate}. ` : ""}Compare the
            strength and serving with your bottle.
          </Copy>
          <Button
            secondary
            label="Check this label"
            disabled={busy}
            onPress={() => run(m.id)}
          />
        </Card>
      ))}
      <Copy kind="small" style={{ color: C.muted }}>
        Search terms go to the NIH Dietary Supplement Label Database. Records
        can be older or incomplete; your confirmation is required.
      </Copy>
    </Card>
  );
}
