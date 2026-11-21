import { useState } from "react";
import { Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Page, Copy, Card, Button, Field, Notice, C, S, Icon } from "../ui";
import {
  localGuides,
  type GuideId,
  guideTopic,
  validSources,
} from "../knowledge";
import { EVIDENCE_REVIEW_DATE } from "../evidence";
export default function Library() {
  const params = useLocalSearchParams<{ guide?: string }>();
  const [query, setQuery] = useState("");
  const id =
    params.guide && Object.hasOwn(localGuides, params.guide)
      ? (params.guide as GuideId)
      : undefined;
  if (id) {
    const g = localGuides[id];
    return (
      <Page title="YOUR QUICK GUIDE" back>
        <Copy kind="title">{g.title}</Copy>
        <Copy>{g.summary}</Copy>
        <Card>
          <Copy kind="heading">A useful starting point</Copy>
          <Copy>{g.food}</Copy>
        </Card>
        <Card>
          <Copy kind="heading">What the evidence says</Copy>
          <Copy>{g.evidence}</Copy>
        </Card>
        <Notice>{g.check}</Notice>
        <Copy kind="small" style={{ color: C.muted }}>
          General education · Evidence snapshot {EVIDENCE_REVIEW_DATE}. This
          does not choose an individual dose or diagnose a deficiency.
        </Copy>
        <Button
          secondary
          label="Sources and further reading"
          onPress={() =>
            router.push({
              pathname: "/evidence",
              params: {
                ids: validSources(g.sourceIds).join(","),
                topic: guideTopic(id) || "",
              },
            })
          }
        />
        <Button
          secondary
          label="Ask a common question"
          onPress={() => router.push("/ask")}
        />
      </Page>
    );
  }
  const items = Object.entries(localGuides).filter(([, g]) =>
    (g.title + " " + g.summary).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <Page title="LEARN, WITHOUT THE JARGON" back>
      <Copy kind="title">A little clarity.{"\n"}Right here.</Copy>
      <Copy style={{ color: C.muted }}>
        Short guides inside the app. Outside sources are there when you want to
        explore.
      </Copy>
      <Field
        label="Find a supplement or topic"
        value={query}
        onChange={setQuery}
      />
      {items.map(([key, g]) => (
        <Pressable
          key={key}
          accessibilityRole="button"
          accessibilityLabel={`Read ${g.title}`}
          onPress={() =>
            router.push({ pathname: "/library", params: { guide: key } })
          }
        >
          <Card>
            <View style={S.row}>
              <Copy kind="heading" style={{ flex: 1 }}>
                {g.title}
              </Copy>
              <Icon name="chevron-right" />
            </View>
            <Copy kind="small">{g.summary}</Copy>
          </Card>
        </Pressable>
      ))}
      {!items.length && (
        <Copy>
          No exact guide found. Try a general ingredient name or ask a common
          question.
        </Copy>
      )}
      <Button
        secondary
        label="Ask Clarity"
        onPress={() => router.push("/ask")}
      />
    </Page>
  );
}
