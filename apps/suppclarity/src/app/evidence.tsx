import { Linking } from "react-native";
import { Page, Copy, Card, Button, Notice, C } from "../ui";
const sources = [
  {
    title: "Nutrient reference values",
    by: "NIH Office of Dietary Supplements",
    url: "https://ods.od.nih.gov/HealthInformation/nutrientrecommendations.aspx",
    text: "Background on reference values used for nutritional planning.",
  },
  {
    title: "Vitamin D",
    by: "NIH Office of Dietary Supplements",
    url: "https://ods.od.nih.gov/factsheets/VitaminD-Consumer/",
    text: "General information about vitamin D, including sources and cautions.",
  },
  {
    title: "Vitamin B12",
    by: "NIH Office of Dietary Supplements",
    url: "https://ods.od.nih.gov/factsheets/VitaminB12-Consumer/",
    text: "General information about B12, including sources and cautions.",
  },
  {
    title: "Magnesium",
    by: "NIH Office of Dietary Supplements",
    url: "https://ods.od.nih.gov/factsheets/Magnesium-Consumer/",
    text: "General information about magnesium, including sources and cautions.",
  },
];
export default function Evidence() {
  return (
    <Page title="EVIDENCE, WHEN YOU WANT IT" back>
      <Copy kind="title">Understand{"\n"}the background.</Copy>
      <Copy style={{ color: C.muted }}>
        Start with trusted references. Read more only when it is useful to you.
      </Copy>
      <Notice>
        These are general educational sources. They do not validate a personal
        recommendation from this preview. Consensus research integration is
        planned and is not connected.
      </Notice>
      {sources.map((s) => (
        <Card key={s.url}>
          <Copy kind="small" style={{ color: C.muted }}>
            {s.by}
          </Copy>
          <Copy kind="heading">{s.title}</Copy>
          <Copy>{s.text}</Copy>
          <Button
            secondary
            label={`Read ${s.title.toLowerCase()} source`}
            onPress={() => Linking.openURL(s.url)}
          />
        </Card>
      ))}
    </Page>
  );
}
