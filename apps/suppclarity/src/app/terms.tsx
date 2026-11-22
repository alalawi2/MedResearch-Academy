import { Linking, Platform } from "react-native";
import { Page, Copy, Card, Button } from "../ui";
export default function Terms() {
  return (
    <Page title="PLUS SUBSCRIPTION TERMS" back>
      <Copy kind="title">Your plan,{"\n"}clearly explained.</Copy>
      <Copy>
        SuppClarity · BAYAN AI TECHNOLOGIES LLC · MedResearch Academy · November
        22, 2026
      </Copy>
      <Card>
        <Copy kind="heading">Free and optional Plus</Copy>
        <Copy>
          SuppClarity provides general supplement education for adults 18 and
          older. Free tools remain available without subscribing. Plus adds the
          features and request allowances displayed before purchase. It does not
          provide diagnosis, treatment, personalized prescribing or clinical
          validation.
        </Copy>
      </Card>
      <Card>
        <Copy kind="heading">Price and renewal</Copy>
        <Copy>
          Your Apple App Store or Google Play checkout shows the applicable
          local price, billing period and taxes before you confirm. The monthly
          plan renews each month; the yearly plan renews each year until
          cancelled. Payment is charged to your store account. The current Plus
          plans do not include a free trial.
        </Copy>
      </Card>
      <Card>
        <Copy kind="heading">Manage, cancel and restore</Copy>
        <Copy>
          Cancel through your App Store or Google Play subscription settings
          before the next renewal. Deleting the app or clearing entries does not
          cancel billing. Access normally continues to the end of the paid
          period unless the store revokes or refunds it. Use Restore purchases
          with the same store account after reinstalling. Cross-platform
          transfer is not included.
        </Copy>
      </Card>
      <Card>
        <Copy kind="heading">Online allowances</Copy>
        <Copy>
          Plus includes 100 photo scans and 300 online AI answers per calendar
          month, counted in UTC. Daily limits are 20 photo scans and 50 online
          answers. Unused requests do not roll over. Requests accepted for
          provider processing count even if the provider cannot finish them.
          Name search, local prepared answers and reference guides have separate
          service availability protections. Internet access and functioning
          third-party services are needed for online features.
        </Copy>
      </Card>
      <Card>
        <Copy kind="heading">Your entries</Copy>
        <Copy>
          Saved products and routine history remain accessible if Plus ends.
          Reminders pause and may need reopening the app to refresh. Alerts are
          best effort and are not a medical alarm. The free text export remains
          available. You control whether to generate and share a PDF.
        </Copy>
      </Card>
      <Card>
        <Copy kind="heading">Support and refunds</Copy>
        <Copy>
          Contact info@medresearch-academy.om for app or subscription support.
          The relevant store handles billing and refund requests under its rules
          and applicable consumer rights. Nothing here removes mandatory
          consumer rights.
        </Copy>
      </Card>
      {Platform.OS === "ios" && (
        <Button
          secondary
          label="Apple standard license agreement"
          onPress={() =>
            void Linking.openURL(
              "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/",
            )
          }
        />
      )}
    </Page>
  );
}
