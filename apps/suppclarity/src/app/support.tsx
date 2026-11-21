import { Linking } from "react-native";
import { router } from "expo-router";
import { Page, Copy, Card, Button } from "../ui";
export default function Support() {
  return (
    <Page title="HELP & SUPPORT" back>
      <Copy kind="title">A little help.</Copy>
      <Card>
        <Copy kind="heading">Find a bottle</Copy>
        <Copy>
          Start with a clear front photo or search the brand and full product
          name. Add the printed strength when you know it. We check NIH labels
          and, if needed, online product sources. Confirm the country, formula
          and amounts against your bottle before saving. A second photo is only
          needed when the ingredients cannot be confirmed.
        </Copy>
        <Button
          label="Find my product"
          onPress={() => router.push("/product")}
        />
      </Card>
      <Card>
        <Copy kind="heading">Camera access</Copy>
        <Copy>
          If access is off, use the camera settings button on the photo screen,
          enable Camera for SuppClarity and return. You can also choose an
          existing photo, search by name or enter the label manually. In Expo
          Go, permissions belong to Expo Go.
        </Copy>
      </Card>
      <Card>
        <Copy kind="heading">What does the amount mean?</Copy>
        <Copy>
          Tap Daily amount & more beside an ingredient for its function and,
          where available, general daily references. Those are
          food-and-supplement references, not a prescription to take the
          remaining amount. Caffeine has no daily requirement.
        </Copy>
      </Card>
      <Card>
        <Copy kind="heading">Your routine</Copy>
        <Copy>
          The installed app saves confirmed entries on your device. Your space
          has export, reading-size and clear-data controls. The browser preview
          clears on reload. Considering a product keeps it separate from the
          amounts you currently take.
        </Copy>
      </Card>
      <Card>
        <Copy kind="heading">Contact us</Copy>
        <Copy>MedResearch Academy · info@medresearch-academy.om</Copy>
        <Copy>
          For an app problem, include your app version, phone model and the step
          that failed. Please avoid sending private medical details. This is a
          general education app with no clinical validation claimed; it does not
          diagnose, prescribe or check all medicine interactions. For a health
          concern, contact an appropriate health professional. For an emergency,
          contact local emergency services.
        </Copy>
        <Button
          secondary
          label="Email support"
          onPress={() =>
            Linking.openURL(
              "mailto:info@medresearch-academy.om?subject=SuppClarity%20support",
            )
          }
        />
      </Card>
      <Button
        secondary
        label="Privacy policy"
        onPress={() => router.push("/privacy")}
      />
    </Page>
  );
}
