import { useState } from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { useStore } from "../store";
import { useMembership } from "../membership";
import { compareLabels, amountText } from "../comparison";
import { Page, Copy, Card, Button, Notice, C, S } from "../ui";
import { PlusGate } from "../plus-gate";
export default function Compare() {
  const { products } = useStore();
  const { active } = useMembership();
  const [selected, setSelected] = useState<string[]>([]);
  const [all, setAll] = useState(false);
  const chosen = selected
    .map((id) => products.find((p) => p.id === id))
    .filter((p) => !!p);
  const rows = chosen.length === 2 ? compareLabels(chosen[0], chosen[1]) : [];
  return (
    <Page title="COMPARE LABELS" back>
      <Copy kind="title">Two labels.{"\n"}One clear view.</Copy>
      {!active ? (
        <PlusGate
          title="Compare with Plus"
          text="See the amounts in two saved labels together. No product rankings or medical suitability scores."
        />
      ) : (
        <>
          <Copy>
            Choose two saved products. Amounts are per label serving; serving
            sizes may differ.
          </Copy>
          {products.length < 2 && (
            <Card>
              <Copy>
                Add at least two confirmed products first. You can mark a
                product as considering.
              </Copy>
              <Button
                label="Find a product"
                onPress={() => router.push("/product")}
              />
            </Card>
          )}
          {products.map((product) => (
            <Pressable
              key={product.id}
              accessibilityRole="checkbox"
              aria-checked={selected.includes(product.id)}
              accessibilityLabel={product.name}
              accessibilityState={{
                checked: selected.includes(product.id),
                disabled:
                  selected.length === 2 && !selected.includes(product.id),
              }}
              disabled={selected.length === 2 && !selected.includes(product.id)}
              onPress={() =>
                setSelected((ids) =>
                  ids.includes(product.id)
                    ? ids.filter((id) => id !== product.id)
                    : [...ids, product.id],
                )
              }
              style={[S.choice, selected.includes(product.id) && S.chosen]}
            >
              <Copy kind="label">{product.name}</Copy>
              <Copy kind="small" style={{ color: C.muted }}>
                Serving: {product.unitsPerServing}{" "}
                {product.servingUnit || "unit(s)"}
              </Copy>
            </Pressable>
          ))}
          {chosen.length === 2 && (
            <>
              <Notice>
                More is not necessarily better. “Not listed” does not mean
                absent. Labels and units must be confirmed; suitability and
                medicine interactions are not assessed.
              </Notice>
              <View style={S.row}>
                {chosen.map((p) => (
                  <Copy key={p.id} kind="label" style={{ flex: 1 }}>
                    {p.name}
                  </Copy>
                ))}
              </View>
              {rows.slice(0, all ? undefined : 6).map((row) => (
                <Card key={row.name}>
                  <Copy kind="heading">{row.name}</Copy>
                  <View style={S.row}>
                    <Copy style={{ flex: 1 }}>
                      {amountText(row.left, row.unit)}
                    </Copy>
                    <Copy style={{ flex: 1 }}>
                      {amountText(row.right, row.unit)}
                    </Copy>
                  </View>
                </Card>
              ))}
              {rows.length > 6 && (
                <Button
                  secondary
                  label={
                    all ? "Show fewer ingredients" : "Show all ingredients"
                  }
                  onPress={() => setAll(!all)}
                />
              )}
              {chosen.some(
                (p) => p.incompleteLabel || p.unassessedIngredients?.length,
              ) && (
                <Notice>
                  Some label information is incomplete or not supported. Those
                  ingredients are not compared.
                </Notice>
              )}
            </>
          )}
        </>
      )}
    </Page>
  );
}
