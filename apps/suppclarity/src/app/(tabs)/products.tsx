import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { Page, Copy, Button, Card, Notice, Icon, C, S } from "../../ui";
import { useStore } from "../../store";
import { totals } from "../../domain";
export default function Products() {
  const { products, setProducts } = useStore();
  const ts = totals(products);
  return (
    <Page title="MY PRODUCTS">
      <Copy kind="title">Know what’s{"\n"}in your routine.</Copy>
      <Copy style={{ color: C.muted }}>
        Start with a label. Confirm the amounts. See how your entries add up.
      </Copy>
      <Button
        label="Add a product"
        icon="plus"
        onPress={() => router.push("/product")}
      />
      {!products.length ? (
        <Card style={{ alignItems: "center", paddingVertical: 36 }}>
          <Icon name="layers" size={36} />
          <Copy kind="heading">A fresh start</Copy>
          <Copy style={{ textAlign: "center", color: C.muted }}>
            No products added. You can use your personal check without taking
            any supplements.
          </Copy>
        </Card>
      ) : (
        <>
          <Notice>
            Partial summary only: vitamin D, B12 and magnesium entries. Other
            ingredients, food intake and medicine interactions are not assessed.
          </Notice>
          {products.map((p) => (
            <Card key={p.id}>
              <View style={S.row}>
                <View style={{ flex: 1, gap: 5 }}>
                  <Copy kind="heading">{p.name}</Copy>
                  <Copy>
                    {p.nutrient} · {p.amount} {p.unit} per serving
                  </Copy>
                  <Copy kind="small" style={{ color: C.muted }}>
                    {p.unitsTaken} unit(s), {p.daysPerWeek} days/week ·{" "}
                    {p.unitsPerServing} unit(s)/serving
                  </Copy>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${p.name}`}
                  onPress={() =>
                    setProducts((ps) => ps.filter((x) => x.id !== p.id))
                  }
                  style={S.iconButton}
                >
                  <Icon name="trash-2" />
                </Pressable>
              </View>
            </Card>
          ))}
          <Copy kind="heading">Average per day</Copy>
          <Copy kind="small" style={{ color: C.muted }}>
            Weekly total divided by seven. Your amount on days taken may differ.
            These are recorded amounts, not recommended doses.
          </Copy>
          {ts.map((t) => (
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
                  Appears in {t.count} entries. Review ingredient overlap.
                </Notice>
              )}
            </Card>
          ))}
        </>
      )}
      <Button
        secondary
        label="How totals are calculated"
        onPress={() => router.push("/calculation")}
      />
    </Page>
  );
}
