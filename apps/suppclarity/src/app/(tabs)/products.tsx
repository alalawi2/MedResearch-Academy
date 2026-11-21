import { useState } from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { Page, Copy, Button, Card, Notice, Icon, C, S } from "../../ui";
import { useStore } from "../../store";
import { totals, ingredientsOf } from "../../domain";
export default function Products() {
  const { products, setProducts } = useStore();
  const ts = totals(products);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [allTotals, setAllTotals] = useState(false);
  return (
    <Page title="MY PRODUCTS">
      <Copy kind="title">Your routine,{"\n"}in one place.</Copy>
      <Copy style={{ color: C.muted }}>
        Search, scan a label or enter it yourself. Confirm the quantities before
        they are included.
      </Copy>
      <Button
        label="Add a product"
        icon="plus"
        onPress={() => router.push("/product")}
      />
      {!products.length ? (
        <Card>
          <Icon name="layers" size={36} />
          <Copy kind="heading">A fresh start</Copy>
          <Copy>
            No products added. Your starting check works without taking any
            supplements.
          </Copy>
        </Card>
      ) : (
        <>
          <Notice>
            Quantities come from your confirmed entries. Food intake, medicine
            interactions and whole-product suitability are not assessed.
            Upper-reference checks cover nine selected nutrients; other
            ingredients can have limits too. Absence of a flag does not
            establish safety.
          </Notice>
          {products.map((p) => (
            <Card key={p.id}>
              <View style={S.row}>
                <Copy kind="heading" style={{ flex: 1 }}>
                  {p.name}
                </Copy>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${p.name}`}
                  style={S.iconButton}
                  onPress={() =>
                    setProducts((ps) => ps.filter((x) => x.id !== p.id))
                  }
                >
                  <Icon name="trash-2" />
                </Pressable>
              </View>
              {ingredientsOf(p)
                .slice(0, expanded.includes(p.id) ? undefined : 3)
                .map((i) => (
                  <Copy key={i.nutrient}>
                    {i.nutrient} · {i.amount} {i.unit} per serving
                  </Copy>
                ))}
              {ingredientsOf(p).length > 3 && (
                <Button
                  secondary
                  label={
                    expanded.includes(p.id)
                      ? "Show fewer ingredients"
                      : `Show all ${ingredientsOf(p).length} ingredients`
                  }
                  onPress={() =>
                    setExpanded((ids) =>
                      ids.includes(p.id)
                        ? ids.filter((id) => id !== p.id)
                        : [...ids, p.id],
                    )
                  }
                />
              )}
              <Copy kind="small" style={{ color: C.muted }}>
                Serving: {p.unitsPerServing} {p.servingUnit || "unit(s)"}
              </Copy>
              <Copy kind="small">
                {p.taking === false
                  ? "Considering this product · excluded from intake totals"
                  : `Recorded use: ${p.unitsTaken} ${p.servingUnit || "unit(s)"}, ${p.daysPerWeek} days/week`}
              </Copy>
              {(Boolean(p.unassessedIngredients?.length) ||
                p.incompleteLabel) && (
                <Notice>
                  {p.incompleteLabel
                    ? "Some label content is missing or has not been confirmed."
                    : `${p.unassessedIngredients?.length} other ingredient(s) are not assessed.`}
                </Notice>
              )}
            </Card>
          ))}
          <Copy kind="heading">Known average per day</Copy>
          <Copy kind="small" style={{ color: C.muted }}>
            From current, confirmed products. A weekly average can hide a larger
            amount on a day you take it.
          </Copy>
          {ts.length ? (
            ts.slice(0, allTotals ? undefined : 6).map((t) => (
              <Card key={t.nutrient + t.unit}>
                <View
                  style={[
                    S.row,
                    { justifyContent: "space-between", flexWrap: "wrap" },
                  ]}
                >
                  <Copy>{t.nutrient}</Copy>
                  <Copy kind="heading">
                    {Number(t.amount.toFixed(2))} {t.unit}
                  </Copy>
                </View>
                {t.count > 1 && (
                  <Notice>
                    Appears in {t.count} current products. Review the combined
                    quantity.
                  </Notice>
                )}
              </Card>
            ))
          ) : (
            <Copy>
              Some ingredient potencies are kept in their individual product
              records rather than added together. Considering products stay out
              of totals.
            </Copy>
          )}
          {ts.length > 6 && (
            <Button
              secondary
              label={
                allTotals ? "Show fewer totals" : `Show all ${ts.length} totals`
              }
              onPress={() => setAllTotals(!allTotals)}
            />
          )}
          <Button
            label="Review my next step"
            onPress={() => router.push("/result")}
          />
        </>
      )}
      <Button
        secondary
        label="How quantities are calculated"
        onPress={() => router.push("/calculation")}
      />
    </Page>
  );
}
