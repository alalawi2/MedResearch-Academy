import { Linking } from "react-native";
import { Page, Copy, Card, Button, Notice } from "../ui";
export default function About() {
  return (
    <Page title="ABOUT SUPPCLARITY" back>
      <Copy kind="title">Clarity for every adult.</Copy>
      <Copy>
        For adults from 18 onward, including older adults, whether you take
        nothing yet or already have a routine.
      </Copy>
      <Card>
        <Copy kind="heading">What works today</Copy>
        <Copy>
          Name, brand and barcode lookup, photo label reading with your
          confirmation, current and prospective product records, 54 ingredient
          types, 29 short guides and 100 prepared common questions. Diet and age
          select relevant educational guidance; the app does not calculate
          personal supplement needs.
        </Copy>
        <Copy>
          Results start with one next step. Reasons, dated sources and related
          Consensus research are available when you ask.
        </Copy>
        <Copy kind="heading">What remains outside this preview</Copy>
        <Copy>
          Diagnosis, individual treatment doses, medicine interaction screening,
          complete dietary assessment, secure accounts, payments and wearable
          connections.
        </Copy>
      </Card>
      <Notice>
        This is a development preview, not a clinically validated service or a
        recruiting study. No clinical validation or ethics approval is claimed.
      </Notice>
      <Card>
        <Copy kind="heading">Your information</Copy>
        <Copy>
          In the installed app, answers and confirmed products are saved in
          encrypted device storage. The browser preview clears on reload. A
          selected label photo is sent to OpenAI only when you agree and tap
          Find my product. Your questionnaire is not sent with it. We do not
          save the photo or profile in our database.
        </Copy>
        <Copy>
          Provider retention and abuse-monitoring controls apply; turning off
          response storage does not guarantee zero retention. Your device may
          retain temporary photo files.
        </Copy>
        <Copy>
          Product terms go to NIH and, when needed, OpenAI web search to locate
          manufacturer or retailer pages. Prepared questions and guides run
          locally; other copilot questions and up to two prior question/answer
          exchanges go to OpenAI with curated guides. Your app profile is not
          sent. Consensus receives a general research topic, never your answers
          or photo. We keep keyed hashes for short-lived request allowances,
          without storing the raw network address. External source links open
          their own websites.
        </Copy>
      </Card>
      <Button
        secondary
        label="Privacy policy"
        onPress={() =>
          Linking.openURL(
            "https://www.medresearch-academy.om/suppclarity/privacy",
          )
        }
      />
      <Button
        secondary
        label="Help & support"
        onPress={() =>
          Linking.openURL(
            "https://www.medresearch-academy.om/suppclarity/support",
          )
        }
      />
      <Button
        secondary
        label="Visit the research project"
        onPress={() =>
          Linking.openURL(
            "https://www.medresearch-academy.om/active-research/suppclarity",
          )
        }
      />
    </Page>
  );
}
