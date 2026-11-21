import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { Page, Copy, Button, Card, Notice, Icon, C, S } from "../../ui";
import { useStore } from "../../store";
import { totals, ingredientsOf } from "../../domain";
export default function Products() {
  const { products, setProducts } = useStore();
  const ts = totals(products);
  return (
    <Page title="MY PRODUCTS">
      <Copy kind="title">Your routine,{"\n"}in one place.</Copy>
      <Copy style={{ color: C.muted }}>
        Scan a label or enter it yourself. Confirm the quantities before they
        are included.
      </Copy>
      <Button
        label="Read a label"
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
            Known quantities only: vitamin D, B12 and magnesium. Other
            ingredients, food and medicine interactions remain unassessed.
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
              {ingredientsOf(p).map((i) => (
                <Copy key={i.nutrient}>
                  {i.nutrient} · {i.amount} {i.unit} per serving
                </Copy>
              ))}
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
            ts.map((t) => (
              <Card key={t.nutrient}>
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
            <Copy>No current, supported quantities to add up yet.</Copy>
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
