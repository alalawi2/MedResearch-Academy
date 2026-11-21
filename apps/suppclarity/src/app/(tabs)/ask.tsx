import { useEffect, useRef, useState } from "react";
import { Keyboard, View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Page, Copy, Card, Button, Field, Notice, C, S, Icon } from "../../ui";
import {
  askCopilot,
  validSources,
  nutrientForGuide,
  localGuides,
  guideTopic,
  faqBank,
  type CopilotReply,
  type Faq,
  type GuideId,
} from "../../knowledge";
import { copilotAnswer } from "../../api";
import { useStore } from "../../store";
export default function Ask() {
  const { resetKey } = useStore();
  return <AskSession key={resetKey} />;
}
function AskSession() {
  const { setIngredientPreview } = useStore();
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState("");
  const [reply, setReply] = useState<CopilotReply>();
  const [browse, setBrowse] = useState(false);
  const [limit, setLimit] = useState(20);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const history = useRef<{ question: string; answer: string }[]>([]);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  async function submit(value = question) {
    if (!value.trim()) return;
    Keyboard.dismiss();
    const askedQuestion = value.trim();
    const local = askCopilot(askedQuestion);
    setAsked(askedQuestion);
    setReply(local);
    setError("");
    setQuestion("");
    setBrowse(false);
    if (local.kind !== "choices") {
      if (local.answer)
        history.current = [
          ...history.current,
          { question: askedQuestion, answer: local.answer },
        ].slice(-2);
      return;
    }
    const controller = new AbortController();
    request.current?.abort();
    request.current = controller;
    setBusy(true);
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const remote = await copilotAnswer(
        askedQuestion,
        history.current,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      setReply({
        kind: "answer",
        answer: remote.answer,
        choices: [],
        sourceIds: validSources(remote.sourceIds),
        nutrient: nutrientForGuide(remote.guide || ""),
        ...(remote.guide && Object.hasOwn(localGuides, remote.guide)
          ? { guide: remote.guide as GuideId }
          : {}),
      });
      history.current = [
        ...history.current,
        { question: askedQuestion, answer: remote.answer },
      ].slice(-2);
    } catch (e) {
      if (request.current === controller)
        setError(
          controller.signal.aborted
            ? "The answer took too long. Try a shorter question or open the related guide."
            : e instanceof Error
              ? e.message
              : "I could not finish the answer.",
        );
    } finally {
      clearTimeout(timer);
      if (request.current === controller) {
        setBusy(false);
        request.current = null;
      }
    }
  }
  function prepared(f: Faq) {
    request.current?.abort();
    request.current = null;
    setBusy(false);
    setError("");
    history.current = [
      ...history.current,
      { question: f.question, answer: f.answer },
    ].slice(-2);
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
        disabled={busy || !question.trim()}
        onPress={() => submit()}
      />
      <Copy kind="small" style={{ color: C.muted }}>
        General education. This helper cannot diagnose, prescribe or provide
        urgent care. Questions outside the prepared library go to OpenAI with
        the guide evidence. Your app profile is not sent.
      </Copy>
      {busy && (
        <>
          <ActivityIndicator color={C.teal} />
          <Copy accessibilityLiveRegion="polite">
            Checking the guide evidence…
          </Copy>
        </>
      )}
      {!!error && <Notice>{error}</Notice>}
      {reply && !busy && (
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
            {reply.nutrient && (
              <Button
                secondary
                label="Daily amount & more"
                onPress={() => {
                  setIngredientPreview(undefined);
                  router.push({
                    pathname: "/ingredient",
                    params: { name: reply.nutrient },
                  });
                }}
              />
            )}
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
