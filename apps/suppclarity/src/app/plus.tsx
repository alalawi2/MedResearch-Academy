import { Page, Copy, Card, Notice } from "../ui";
export default function Plus() {
  return (
    <Page title="PLANNED MEMBERSHIP" back>
      <Copy kind="title">Useful for free.{"\n"}More with Plus.</Copy>
      <Notice>
        Planned offers only. There is no checkout, subscription or free-trial
        enrollment in this preview.
      </Notice>
      <Card>
        <Copy kind="heading">Free</Copy>
        <Copy kind="title">$0</Copy>
        <Copy>
          Planned: product inventory, basic summaries and important detected
          warnings within the supported scope.
        </Copy>
      </Card>
      <Card style={{ borderColor: "#164E43", borderWidth: 2 }}>
        <Copy kind="heading">Plus</Copy>
        <Copy kind="title">$6.99 / month</Copy>
        <Copy>
          Or $39.99 per year. Proposed seven-day preview without a card.
        </Copy>
        <Copy>
          Planned: more scans, personal explanations, routine comparisons and
          spending reports.
        </Copy>
      </Card>
      <Copy>
        Prices and features are proposals to test. Important warnings will
        remain available without payment.
      </Copy>
    </Page>
  );
}
