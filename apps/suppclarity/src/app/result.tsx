import { useState } from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { Page, Copy, Card, Button, Notice, Icon, S, C } from "../ui";
import { useStore } from "../store";
import { report } from "../domain";
export default function Result() {
  const { profile, products, setStep } = useStore();
  const r = report(profile, products);
  const [why, setWhy] = useState(false);
  return (
    <Page title="MY SUMMARY" back>
      <View style={S.pill}>
        <Copy kind="small">PREVIEW · LIMITED ASSESSMENT</Copy>
      </View>
      <View style={{ gap: 18, paddingVertical: 12 }}>
        <Icon name={r.kind === "limited" ? "info" : "compass"} size={40} />
        <Copy kind="title">{r.title}</Copy>
        <Copy style={{ color: C.muted }}>{r.text}</Copy>
      </View>
      <Button
        label={r.action}
        onPress={() =>
          router.push(
            r.kind === "profile"
              ? "/check"
              : r.kind === "products"
                ? "/product"
                : r.kind === "totals"
                  ? "/products"
                  : "/evidence",
          )
        }
      />
      <Notice>
        No suitability, deficiency, dose or interaction assessment has been
        completed. Do not change prescribed treatment based on this preview.
      </Notice>
      <Card>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: why }}
          onPress={() => setWhy(!why)}
          style={[S.row, { minHeight: 48 }]}
        >
          <Copy kind="heading" style={{ flex: 1 }}>
            Why this result?
          </Copy>
          <Icon name={why ? "minus" : "plus"} />
        </Pressable>
        {why && (
          <>
            <Copy>
              This summary follows your answers and confirmed product entries.
              It does not use a live clinical rules service or a fresh research
              search.
            </Copy>
            <Copy style={{ color: C.muted }}>
              Your age, diet or goal alone cannot establish a deficiency. A
              complete assessment may need details this preview does not
              collect.
            </Copy>
          </>
        )}
      </Card>
      <Card>
        <Copy kind="label">Your answers</Copy>
        <Copy>
          {profile.age ? `Age ${profile.age}` : "Age not entered"} ·{" "}
          {profile.diet || "Diet not entered"}
        </Copy>
        <Copy kind="small" style={{ color: C.muted }}>
          {profile.goal || "Goal not entered"}
        </Copy>
        <Button
          secondary
          label="Edit my answers"
          onPress={() => {
            setStep(0);
            router.push("/check");
          }}
        />
      </Card>
      <Button
        secondary
        label="Read sources"
        icon="book-open"
        onPress={() => router.push("/evidence")}
      />
    </Page>
  );
}
