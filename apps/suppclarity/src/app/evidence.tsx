import { researchTopics } from "../research-topics.mjs";
import { useEffect, useRef, useState } from "react";
import { Linking, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Page, Copy, Card, Button, Notice, C } from "../ui";
import {
  sources,
  EVIDENCE_REVIEW_DATE,
  CONSENSUS_REVIEW_URL,
  type SourceId,
  type Topic,
} from "../evidence";
import { liveEvidence, type ResearchPaper } from "../api";
const topics = Object.keys(researchTopics) as Topic[];
export default function Evidence() {
  const params = useLocalSearchParams<{
    ids?: string;
    topic?: string;
    context?: string;
  }>();
  const selected = (params.ids || "")
    .split(",")
    .filter((k): k is SourceId => Object.hasOwn(sources, k));
  const ids = selected.length ? selected : (Object.keys(sources) as SourceId[]);
  const topic = topics.includes(params.topic as Topic)
    ? (params.topic as Topic)
    : undefined;
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [date, setDate] = useState("");
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  async function search() {
    if (!topic || busy) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError("");
    try {
      const r = await liveEvidence(topic, controller.signal);
      setPapers(r.papers);
      setDate(r.retrievedAt);
    } catch (e) {
      if (!controller.signal.aborted)
        setError(e instanceof Error ? e.message : "Research could not load.");
    } finally {
      if (request.current === controller) setBusy(false);
    }
  }
  return (
    <Page title="DETAIL, WHEN YOU WANT IT" back>
      <Copy kind="title">The reason.{"\n"}The references.</Copy>
      <Copy style={{ color: C.muted }}>
        Guidance uses a dated evidence snapshot. You can also look up related
        research through Consensus.
      </Copy>
      {params.context === "individual" && (
        <Card>
          <Copy kind="heading">What to ask in an individual review</Copy>
          <Copy>
            Do these products fit my medicines, health conditions and current
            instructions?
          </Copy>
          <Copy>
            Am I duplicating an ingredient, and does my clinician-directed plan
            require a different approach?
          </Copy>
          <Copy>
            Would my history or symptoms justify further assessment? This app
            cannot answer that from a short questionnaire.
          </Copy>
        </Card>
      )}
      <Notice>
        Snapshot: {EVIDENCE_REVIEW_DATE}. Broad diet answers and supplement
        labels do not measure your complete intake or absorption. Nutritional
        guidance is not a diagnosis, treatment dose or whole-product safety
        clearance.
      </Notice>
      {topic &&
        [
          "b12-vegan",
          "b12-older",
          "vitamin-d-adult",
          "vitamin-d-older",
          "magnesium-sleep",
        ].includes(topic) && (
          <Card>
            <Copy kind="heading">A practical starting point</Copy>
            <Copy>
              {topic.startsWith("b12")
                ? "Look for B12 on the labels of fortified foods such as some plant milks, breakfast cereals or nutritional yeast. Unfortified plant foods are not a reliable B12 source. Record any B12-containing supplement before considering another. A label amount alone does not prove adequate absorption."
                : topic === "magnesium-sleep"
                  ? "Review magnesium-rich foods such as beans, nuts and whole grains. Sleep symptoms alone do not establish magnesium deficiency or a need for a supplement."
                  : "Review vitamin D from fortified foods and any current supplements. Food quantities and your full intake have not been measured here; this page does not select an individual dose."}
            </Copy>
          </Card>
        )}
      {ids.map((id) => (
        <Card key={id}>
          <Copy kind="small" style={{ color: C.muted }}>
            {sources[id].by}
          </Copy>
          <Copy kind="heading">{sources[id].title}</Copy>
          <Copy>{sources[id].note}</Copy>
          <Button
            secondary
            label="Open this source"
            onPress={() => Linking.openURL(sources[id].url)}
          />
        </Card>
      ))}
      <Button
        secondary
        label="Open the Consensus evidence review"
        onPress={() => Linking.openURL(CONSENSUS_REVIEW_URL)}
      />
      {topic && (
        <Card>
          <Copy kind="heading">More research on this topic</Copy>
          <Copy kind="small">
            Searches send a general research topic, not your answers or photo.
            Matches provide further reading and do not automatically change the
            guidance rules.
          </Copy>
          {busy ? (
            <>
              <ActivityIndicator color={C.teal} />
              <Copy accessibilityLiveRegion="polite">Searching Consensus…</Copy>
            </>
          ) : (
            <Button label="Find related papers in Consensus" onPress={search} />
          )}
          {!!error && (
            <Copy accessibilityRole="alert" style={{ color: C.amber }}>
              {error}
            </Copy>
          )}
          {!!date && (
            <Copy kind="small">
              Retrieved {date.slice(0, 10)} · {papers.length} matches
            </Copy>
          )}
          {papers.map((p, i) => (
            <Card key={p.url + String(i)}>
              <Copy kind="label">{p.title}</Copy>
              <Copy kind="small" style={{ color: C.muted }}>
                {[p.journal, p.year].filter(Boolean).join(" · ")}
              </Copy>
              <Button
                secondary
                label="Open paper"
                onPress={() => Linking.openURL(p.url)}
              />
            </Card>
          ))}
        </Card>
      )}
    </Page>
  );
}
