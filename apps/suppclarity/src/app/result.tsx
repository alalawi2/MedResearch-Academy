import { useState } from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { Page, Copy, Card, Button, Notice, Icon, S, C } from "../ui";
import { useStore } from "../store";
import { guidance, type Consideration } from "../guidance";
import { EVIDENCE_REVIEW_DATE } from "../evidence";
export default function Result() {
  const { profile, products, setStep } = useStore();
  const r = guidance(profile, products);
  const [why, setWhy] = useState(false);
  const [more, setMore] = useState(false);
  const act = (c: Consideration) => {
    if (c.route === "/check") setStep(0);
    if (c.route === "/evidence")
      router.push({
        pathname: "/evidence",
        params: {
          ids: c.sourceIds.join(","),
          topic: c.topic || "",
          context: c.id === "individual-review" ? "individual" : "",
        },
      });
    else router.push(c.route);
  };
  return (
    <Page title="YOUR NEXT STEP" back>
      <View style={S.pill}>
        <Copy kind="small">
          {r.status === "educational"
            ? "PERSONALIZED NUTRITION GUIDANCE"
            : "ASSESSMENT LIMIT"}
        </Copy>
      </View>
      <View style={{ gap: 15, paddingVertical: 10 }}>
        <Icon
          name={r.primary.essential ? "alert-circle" : "compass"}
          size={36}
        />
        <Copy kind="title">{r.primary.title}</Copy>
        <Copy style={{ color: C.muted }}>{r.primary.text}</Copy>
      </View>
      <Button label={r.primary.action} onPress={() => act(r.primary)} />
      <Notice>
        {r.coverage} This does not diagnose a deficiency or choose an individual
        dose.
      </Notice>
      {r.additional
        .filter((c) => c.essential)
        .map((c) => (
          <Card key={c.id}>
            <Copy kind="heading">{c.title}</Copy>
            <Copy>{c.text}</Copy>
            <Button secondary label={c.action} onPress={() => act(c)} />
          </Card>
        ))}
      <Card>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: why }}
          aria-expanded={why}
          onPress={() => setWhy(!why)}
          style={[S.row, { minHeight: 48 }]}
        >
          <Copy kind="heading" style={{ flex: 1 }}>
            Why this suggestion?
          </Copy>
          <Icon name={why ? "minus" : "plus"} />
        </Pressable>
        {why && (
          <>
            <Copy>{r.primary.why}</Copy>
            <Copy kind="small" style={{ color: C.muted }}>
              {r.primary.limits}
            </Copy>
            <Copy kind="small">
              Evidence snapshot {EVIDENCE_REVIEW_DATE} · Version {r.version}.
              Research was gathered with Consensus and checked against linked
              primary sources; this is not clinical validation.
            </Copy>
            <Button
              secondary
              label="See the evidence"
              onPress={() =>
                router.push({
                  pathname: "/evidence",
                  params: {
                    ids: r.primary.sourceIds.join(","),
                    topic: r.primary.topic || "",
                  },
                })
              }
            />
          </>
        )}
      </Card>
      {r.additional.some((c) => !c.essential) && (
        <>
          <Button
            secondary
            label={
              more
                ? "Hide other considerations"
                : `${r.additional.filter((c) => !c.essential).length} more considerations`
            }
            onPress={() => setMore(!more)}
          />
          {more &&
            r.additional
              .filter((c) => !c.essential)
              .map((c) => (
                <Card key={c.id}>
                  <Copy kind="heading">{c.title}</Copy>
                  <Copy>{c.text}</Copy>
                  <Button secondary label={c.action} onPress={() => act(c)} />
                </Card>
              ))}
        </>
      )}
      <Button
        secondary
        label="Edit my answers"
        onPress={() => {
          setStep(0);
          router.push("/check");
        }}
      />
    </Page>
  );
}
