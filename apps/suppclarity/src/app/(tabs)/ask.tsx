import { useState } from "react";
import { Keyboard, View } from "react-native";
import { router } from "expo-router";
import { Page, Copy, Card, Button, Field, Notice, C, S, Icon } from "../../ui";
import {
  askCopilot,
  guideTopic,
  faqBank,
  type CopilotReply,
  type Faq,
  type GuideId,
} from "../../knowledge";
import { useStore } from "../../store";
export default function Ask() {
  const { resetKey } = useStore();
  return <AskSession key={resetKey} />;
}
function AskSession() {
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState("");
  const [reply, setReply] = useState<CopilotReply>();
  const [browse, setBrowse] = useState(false);
  const [limit, setLimit] = useState(20);
  function submit(value = question) {
    if (!value.trim()) return;
    Keyboard.dismiss();
    setAsked(value.trim());
    setReply(askCopilot(value.trim()));
    setQuestion("");
    setBrowse(false);
  }
  function prepared(f: Faq) {
    setAsked(f.question);
    setReply({
      kind: "answer",
      answer: f.answer,
      faq: f,
      choices: [],
      sourceIds: f.sourceIds as CopilotReply["sourceIds"],
      guide: f.guide as GuideId,
    });
    setBrowse(false);
    Keyboard.dismiss();
  }
  return (
    <Page title="ASK CLARITY">
      <View style={S.row}>
        <Icon name="message-circle" size={34} />
        <Copy kind="title" style={{ flex: 1 }}>
          A clear answer.
        </Copy>
      </View>
      <Copy style={{ color: C.muted }}>
        Ask about labels, ingredients or the evidence. Short answers here;
        sources when you want them.
      </Copy>
      <Field
        label="Your supplement question"
        value={question}
        onChange={setQuestion}
        maxLength={500}
      />
      <Button
        label="Ask Clarity"
        icon="arrow-up-right"
        disabled={!question.trim()}
        onPress={() => submit()}
      />
      <Copy kind="small" style={{ color: C.muted }}>
        General education. This helper cannot diagnose, prescribe or provide
        urgent care.
      </Copy>
      {reply && (
        <>
          <Card>
            <Copy kind="small" style={{ color: C.muted }}>
              YOU ASKED
            </Copy>
            <Copy selectable>{asked}</Copy>
          </Card>
          <Card style={{ backgroundColor: C.pale, borderColor: C.pale }}>
            <Copy kind="heading">Clarity</Copy>
            {reply.answer && (
              <Copy selectable accessibilityLiveRegion="polite">
                {reply.answer}
              </Copy>
            )}
            {reply.choices.map((f) => (
              <Button
                key={f.id}
                secondary
                label={f.question}
                onPress={() => prepared(f)}
              />
            ))}
            {reply.guide && (
              <Button
                secondary
                label="Read the in-app guide"
                onPress={() =>
                  router.push({
                    pathname: "/library",
                    params: { guide: reply.guide },
                  })
                }
              />
            )}
            {reply.sourceIds.length > 0 && (
              <Button
                secondary
                label="Sources and further reading"
                onPress={() =>
                  router.push({
                    pathname: "/evidence",
                    params: {
                      ids: reply.sourceIds.join(","),
                      topic: reply.guide ? guideTopic(reply.guide) || "" : "",
                    },
                  })
                }
              />
            )}
          </Card>
        </>
      )}
      {!reply && (
        <Card>
          <Copy kind="heading">A few common questions</Copy>
          {[faqBank[0], faqBank[10], faqBank[50], faqBank[80]].map((f) => (
            <Button
              key={f.id}
              secondary
              label={f.question}
              onPress={() => prepared(f)}
            />
          ))}
        </Card>
      )}
      <Button
        secondary
        label={browse ? "Hide the questions" : "Browse all 100 questions"}
        onPress={() => setBrowse(!browse)}
      />
      {browse && (
        <>
          {faqBank
            .filter((f) =>
              (f.question + " " + f.tags.join(" "))
                .toLowerCase()
                .includes(question.toLowerCase()),
            )
            .slice(0, limit)
            .map((f) => (
              <Button
                key={f.id}
                secondary
                label={f.question}
                onPress={() => prepared(f)}
              />
            ))}
          {limit < 100 && (
            <Button
              secondary
              label="Show more questions"
              onPress={() => setLimit(limit + 20)}
            />
          )}
        </>
      )}
      <Button
        secondary
        label="Browse supplement guides"
        icon="book-open"
        onPress={() => router.push("/library")}
      />
      {reply?.kind === "choices" && !reply.choices.length && (
        <Notice>
          A question outside the prepared library needs additional evidence.
          Choose a guide, then use Sources and further reading for trusted
          references and related research.
        </Notice>
      )}
    </Page>
  );
}
