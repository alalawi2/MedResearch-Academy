import { Linking } from "react-native";
import { Page, Copy, Card, Button, Notice } from "../ui";
export default function About() {
  return (
    <Page title="ABOUT SUPPCLARITY" back>
      <Copy kind="title">Clarity for every adult.</Copy>
      <Copy>
        Built for people starting with no supplements and people reviewing an
        existing routine, from younger adults to older adults.
      </Copy>
      <Card>
        <Copy kind="heading">What works today</Copy>
        <Copy>
          A short questionnaire, confirmed manual product entries, arithmetic
          totals, repeated-ingredient notices, reference photos, text sizing and
          session export.
        </Copy>
        <Copy kind="heading">What is still being built</Copy>
        <Copy>
          Automatic label reading, evidence-based personal recommendations,
          medicine interaction screening, secure accounts, payments and wearable
          connections.
        </Copy>
      </Card>
      <Notice>
        This is a development preview, not a validated clinical service or a
        recruiting research study. No ethics approval or clinical validation is
        claimed.
      </Notice>
      <Copy>
        Entries are held in app memory. Photos are shown only on the entry
        screen. No answers or photos are sent to an assessment server. External
        source links open their own websites.
      </Copy>
      <Button
        secondary
        label="Visit the research project"
        onPress={() =>
          Linking.openURL(
            "https://medresearch-academy.om/active-research/suppclarity",
          )
        }
      />
    </Page>
  );
}
