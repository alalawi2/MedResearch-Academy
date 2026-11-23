import { Linking } from "react-native";
import { Page, Copy, Card, Button } from "../ui";
import { MeasurementExplanation } from "../ad-measurement";
export default function Privacy() {
  return (
    <Page title="PRIVACY" back>
      <Copy kind="title">Your data, explained.</Copy>
      <Copy>SuppClarity · MedResearch Academy · Updated November 23, 2026</Copy>
      <Card>
        <Copy kind="heading">On your device</Copy>
        <Copy>
          The installed iPhone and Android app saves your questionnaire answers,
          confirmed products, questionnaire progress and reading size in
          encrypted device storage, together with optional reminders and routine
          history. There is no app account or cloud sync. Optional Android install
          measurement is described below. The browser preview keeps entries in memory and clears on reload.
          Chat history stays in memory for this session and is not persisted
          with your routine. Selected photos are not saved as routine entries.
        </Copy>
        <Copy>
          Use Your space → Clear my data to remove saved answers and products.
          Keep an export if you need a copy. Device storage can fail; an error
          will be shown. On iOS, keychain entries may survive reinstalling the
          app, so clear data inside the app before uninstalling. Android
          encrypted entries are excluded from device backup. Temporary photo
          files may remain under the device or photo library’s own controls.
        </Copy>
      </Card>
      <Card>
        <Copy kind="heading">Optional Plus subscriptions</Copy>
        <Copy>
          When subscriptions are enabled, RevenueCat and Apple or Google process
          a separate random billing identifier, purchase and renewal records,
          product identifiers and operational device or network information to
          provide purchases, restore access, prevent abuse and report
          subscription activity in the RevenueCat dashboard. We do not send your
          questionnaire, label photos, routine entries or conversations to
          RevenueCat. Your payment details are handled by the store. An opaque
          billing identifier is also sent to our server when you request online
          help so we can verify your entitlement and allowance. It is kept
          separate from your local health entries.
        </Copy>
        <Copy>
          Monthly usage counters contain keyed hashes and counts, not question
          or photo contents, and are removed after at most 63 days. Clearing
          local entries does not cancel a subscription or erase store
          transaction records. Manage or cancel through your store account;
          contact us for privacy requests concerning subscription records.
          Billing providers retain records under their own policies and legal
          obligations.
        </Copy>
        <Copy>
          Reminders are scheduled on your phone only after you choose them and
          allow notifications. Alerts use generic wording. PDF summaries are
          generated locally and shared only through the phone sharing screen you
          open. Temporary generated PDFs are deleted by the app after sharing;
          copies retained by recipients or other apps are outside that deletion.
        </Copy>
      </Card>
      <MeasurementExplanation />
      <Card>
        <Copy kind="heading">When you choose online help</Copy>
        <Copy>
          Photo reading: with your permission, the selected image is sent
          through our server to OpenAI to transcribe its visible label. Avoid
          including faces, prescriptions or personal details. Your questionnaire
          is not included. If a readable name or brand needs an online match, it
          is used for product search.
        </Copy>
        <Copy>
          Product search: after you agree to search, the terms you type, or the
          name and brand read from a label, go to the NIH Dietary Supplement
          Label Database. When needed, OpenAI web search locates public
          manufacturer or retailer pages. Our server retrieves the selected
          public page and uses OpenAI to transcribe its ingredient text.
          Formulas can differ by country and change over time: confirm your
          bottle.
        </Copy>
        <Copy>
          Ask Clarity: prepared answers and in-app guides work locally. Before
          an online answer, we ask permission to send your question and up to
          two recent question-and-answer exchanges to OpenAI with our authored
          guide evidence. Your profile and saved products are not included.
          Permission lasts for this session and can be turned off in Your space.
        </Copy>
        <Copy>
          Related research: when requested, Consensus receives a general
          research topic, without your profile, question history or photo.
          External links open the source website under its own privacy rules.
        </Copy>
      </Card>
      <Card>
        <Copy kind="heading">Reports you choose to send</Copy>
        <Copy>
          If you report an answer, we save that answer, your selected reason,
          its source identifiers, the time and a keyed network hash in a
          separate private feedback table. Your question, profile and product
          inventory are not included. We ask before sending. Reports help us
          review app quality and are kept for up to 31 days, with automatic
          daily cleanup. They are not a request for medical care. Contact us for
          a privacy request.
        </Copy>
      </Card>
      <Card>
        <Copy kind="heading">Service records and retention</Copy>
        <Copy>
          Apart from answer reports you choose to send, our application does not
          save photos, copilot conversations or questionnaire answers in its
          database. AI response storage is disabled in our requests; OpenAI’s
          retention, abuse-monitoring and other provider controls still apply.
          This does not promise zero retention. OpenAI, Consensus, NIH and our
          hosting providers may process requests in other countries, including
          the United States.
        </Copy>
        <Copy>
          To limit automated abuse and service costs, short-lived request
          allowances use keyed hashes of network and anonymous session
          identifiers, without storing the raw network address in our quota
          database. Hosting providers may keep operational network, security and
          error logs under their own policies. Successfully retrieved public
          product metadata may be cached; it does not include your profile or
          photo.
        </Copy>
        <Copy>
          We do not sell your health answers or use them for advertising. We do
          not connect to Apple Health, Health Connect or wearables. The app is
          intended for adults 18 and older.
        </Copy>
      </Card>
      <Card>
        <Copy kind="heading">Your choices and contact</Copy>
        <Copy>
          You can use local guides and manual product entry without photo
          reading or online copilot answers. Device settings control camera and
          photo access. You choose whether to export or share your entries. For
          privacy questions or requests, contact MedResearch Academy at
          info@medresearch-academy.om. Avoid emailing sensitive medical details.
        </Copy>
      </Card>
      <Button
        secondary
        label="Contact MedResearch Academy"
        onPress={() => Linking.openURL("mailto:info@medresearch-academy.om")}
      />
      <Button
        secondary
        label="OpenAI privacy policy"
        onPress={() =>
          Linking.openURL("https://openai.com/policies/privacy-policy/")
        }
      />
      <Button
        secondary
        label="Consensus privacy policy"
        onPress={() => Linking.openURL("https://consensus.app/privacy-policy/")}
      />
    </Page>
  );
}
