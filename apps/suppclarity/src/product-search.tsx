import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Linking } from "react-native";
import { Button, Card, Copy, Field, Notice, C } from "./ui";
import { findProducts, readProduct, type ProductSearchResult } from "./api";
import type { ReadLabel } from "./labels";
const empty: ProductSearchResult = {
  products: [],
  webMatches: [],
  onlineStatus: "not-started",
  databaseAvailable: true,
};
export function ProductSearch({
  onSelect,
  onIdentityOnly,
  initialQuery = "",
  autoSearch = false,
}: {
  onSelect: (label: ReadLabel) => void;
  onIdentityOnly: (query: string) => void;
  initialQuery?: string;
  autoSearch?: boolean;
}) {
  const [searchConsent, setSearchConsent] = useState(autoSearch);
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState<ProductSearchResult>(empty);
  const [busy, setBusy] = useState(autoSearch);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [more, setMore] = useState(false);
  const request = useRef<AbortController | null>(null);
  useEffect(() => {
    if (!autoSearch) return;
    const controller = new AbortController();
    request.current = controller;
    const timer = setTimeout(() => controller.abort(), 55000);
    findProducts(initialQuery, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setResult(data);
          setSearched(true);
        }
      })
      .catch(() => {
        if (request.current === controller)
          setError(
            controller.signal.aborted
              ? "Lookup timed out. Try again or photograph the ingredient amounts."
              : "Online lookup could not finish. Try again or photograph the ingredient amounts.",
          );
      })
      .finally(() => {
        clearTimeout(timer);
        if (request.current === controller) {
          setBusy(false);
          request.current = null;
        }
      });
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [autoSearch, initialQuery]);
  useEffect(() => () => request.current?.abort(), []);
  async function run(id?: string, web = false) {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const timer = setTimeout(() => controller.abort(), 55000);
    setBusy(true);
    setError("");
    try {
      if (id) {
        const label = await readProduct(id, controller.signal);
        if (!controller.signal.aborted) onSelect(label);
      } else {
        const data = await findProducts(query, controller.signal, web);
        if (!controller.signal.aborted) {
          setResult(data);
          setSearched(true);
          setMore(false);
        }
      }
    } catch (e) {
      if (request.current === controller)
        setError(
          controller.signal.aborted
            ? "Lookup timed out. Try again or use an ingredient photo."
            : e instanceof Error
              ? e.message
              : "Product lookup is unavailable.",
        );
    } finally {
      clearTimeout(timer);
      if (request.current === controller) {
        setBusy(false);
        request.current = null;
      }
    }
  }
  const webItems = result.webMatches.slice(0, more ? 3 : 1);
  return (
    <Card>
      <Copy kind="heading">Find your product</Copy>
      <Field
        label="Product name or brand"
        value={query}
        maxLength={120}
        onChange={(v) => {
          request.current?.abort();
          request.current = null;
          setBusy(false);
          setQuery(v);
          setResult(empty);
          setSearched(false);
          setError("");
        }}
        hint="For example Nature’s Own Magnesium Energy. A barcode number works too."
      />
      {!searchConsent && (
        <Copy kind="small">
          Use NIH and OpenAI to find this product. Only your search terms are
          sent; your profile is not included. Provider retention rules apply.
        </Copy>
      )}
      <Button
        label={
          busy
            ? "Finding your product…"
            : searchConsent
              ? "Find my product"
              : "Agree & find my product"
        }
        icon="search"
        disabled={busy || query.trim().length < 2}
        onPress={() => {
          setSearchConsent(true);
          void run();
        }}
      />
      {busy && (
        <>
          <ActivityIndicator color={C.teal} />
          <Copy kind="small" accessibilityLiveRegion="polite">
            Checking label records and online product information…
          </Copy>
        </>
      )}
      {!!error && <Notice>{error}</Notice>}
      {webItems.map((m) => (
        <Card key={m.url}>
          <Copy kind="small" style={{ color: C.muted }}>
            POSSIBLE MATCH
          </Copy>
          <Copy kind="heading">{m.name}</Copy>
          <Copy>
            {m.brand}
            {m.market ? ` · ${m.market}` : ""}
          </Copy>
          <Copy kind="small">
            Compare the name, strength and form with your bottle.
          </Copy>
          <Copy
            accessibilityRole="link"
            onPress={() => Linking.openURL(m.url)}
            style={{ textDecorationLine: "underline", color: C.teal }}
          >
            Source: {new URL(m.url).hostname}
          </Copy>
          <Button
            label={
              m.label ? "This is my product" : "Read ingredients from my bottle"
            }
            disabled={busy}
            onPress={() =>
              m.label
                ? onSelect(m.label)
                : onIdentityOnly(`${m.brand} ${m.name}`)
            }
          />
        </Card>
      ))}
      {result.products.slice(0, more ? 8 : 3).map((m) => (
        <Card key={m.id}>
          <Copy kind="heading">{m.name}</Copy>
          <Copy kind="small">
            {[m.brand, m.form, m.pack].filter(Boolean).join(" · ")}
          </Copy>
          <Copy kind="small">
            Match the strength and serving with your bottle.
          </Copy>
          <Button
            secondary
            label="Check this product"
            disabled={busy}
            onPress={() => run(m.id)}
          />
        </Card>
      ))}
      {!more &&
        (result.webMatches.length > 1 || result.products.length > 3) && (
          <Button
            secondary
            label="Other possible matches"
            onPress={() => setMore(true)}
          />
        )}
      {searched && !result.products.length && !result.webMatches.length && (
        <Notice>
          {result.onlineStatus === "searched"
            ? "We checked label records and the web but could not confirm your exact product. A photo of the name and brand or ingredient amounts can help."
            : result.onlineStatus === "allowance-reached"
              ? "Online lookup has reached its preview allowance. You can still photograph the ingredients or enter them."
              : "Online search could not finish, so we have not ruled out your product. Try again or use an ingredient photo."}
        </Notice>
      )}
      {searched && result.onlineStatus === "not-needed" && (
        <Button
          secondary
          label="Not my bottle — check online"
          disabled={busy}
          onPress={() => run(undefined, true)}
        />
      )}
      <Copy kind="small" style={{ color: C.muted }}>
        Product terms are checked with NIH and, when needed, OpenAI web search.
        Online information still needs your bottle confirmation.
      </Copy>
    </Card>
  );
}
