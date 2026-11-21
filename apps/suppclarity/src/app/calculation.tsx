import { Page, Copy, Card, Notice } from "../ui";
export default function Calculation() {
  return (
    <Page title="THE NUMBERS" back>
      <Copy kind="title">Simple, visible arithmetic.</Copy>
      <Card>
        <Copy kind="heading">Your recorded weekly amount</Copy>
        <Copy>
          Amount per serving × units taken ÷ units per serving × days per week.
        </Copy>
        <Copy kind="heading">Your average per day</Copy>
        <Copy>
          Weekly amount ÷ 7, then added to other confirmed entries for the same
          nutrient.
        </Copy>
      </Card>
      <Copy>
        Vitamin D values entered in IU are converted to micrograms: 40 IU equals
        1 mcg. Other supported quantities use the units shown on screen.
      </Copy>
      <Notice>
        An average can hide a large amount taken on a single day. The guidance
        compares recorded on-use-day amounts with general adult upper references
        for vitamin D and supplemental magnesium. It does not determine an
        individual safe dose, assess food quantities or choose treatment.
      </Notice>
      <Copy>
        Overlapping entries indicate repeated ingredients. They do not by
        themselves prove a harmful combination.
      </Copy>
    </Page>
  );
}
