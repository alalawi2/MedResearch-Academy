import { useState } from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { Page, Copy, Button, Card, Notice, Icon, C, S } from "../../ui";
import { useStore } from "../../store";
export default function Account() {
  const { scale, setScale, reset, profile, setProfile } = useStore();
  const [showReference, setShowReference] = useState(false);
  const [confirm, setConfirm] = useState(false);
  return (
    <Page title="YOUR SPACE">
      <Copy kind="title">Make it{"\n"}work for you.</Copy>
      <Card>
        <View style={S.row}>
          <Icon name="type" />
          <Copy kind="heading">Comfortable reading</Copy>
        </View>
        <View style={{ gap: 10 }}>
          {[
            { label: "Standard", value: 1 },
            { label: "Large", value: 1.15 },
            { label: "Extra large", value: 1.3 },
          ].map((x) => (
            <Pressable
              key={x.label}
              accessibilityRole="radio"
              accessibilityState={{ checked: scale === x.value }}
              aria-checked={scale === x.value}
              onPress={() => setScale(x.value)}
              style={[S.choice, scale === x.value && S.chosen]}
            >
              <Copy>{x.label}</Copy>
            </Pressable>
          ))}
        </View>
        <Copy>Your next step should be easy to read.</Copy>
      </Card>
      <Card>
        <Button
          secondary
          label="Intake references (optional)"
          onPress={() => setShowReference(!showReference)}
        />
        {showReference && (
          <>
            <Copy kind="small">
              Sex is used only for general nutrient references. It is not needed
              to scan or find a product. You can leave both values visible.
            </Copy>
            <View
              accessibilityRole="radiogroup"
              accessibilityLabel="Sex reference for daily intake"
              style={{ gap: 10 }}
            >
              {(
                [
                  { value: "both", label: "Show both / prefer not to say" },
                  { value: "male", label: "Male reference" },
                  { value: "female", label: "Female reference" },
                ] as const
              ).map((x) => (
                <Pressable
                  key={x.value}
                  accessibilityRole="radio"
                  accessibilityState={{
                    checked: (profile.sexReference || "both") === x.value,
                  }}
                  onPress={() =>
                    setProfile((p) => ({ ...p, sexReference: x.value }))
                  }
                  style={[
                    S.choice,
                    (profile.sexReference || "both") === x.value && S.chosen,
                  ]}
                >
                  <Copy>{x.label}</Copy>
                </Pressable>
              ))}
            </View>
            <Copy kind="small">
              Pregnancy and breastfeeding are separate circumstances; the
              general adult reference may not apply.
            </Copy>
          </>
        )}
      </Card>
      <Card>
        <Copy kind="heading">Your session</Copy>
        <Copy style={{ color: C.muted }}>
          This preview has no sign-in or cloud storage. Answers and product
          entries disappear on reload. Keep a copy if you need it.
        </Copy>
        <Button
          secondary
          label="View an export of my entries"
          icon="download"
          onPress={() => router.push("/export")}
        />
        {confirm ? (
          <>
            <Notice>
              Clear your answers and products from this session? This cannot be
              undone.
            </Notice>
            <Button
              label="Clear my session"
              onPress={() => {
                reset();
                setConfirm(false);
                router.replace("/");
              }}
            />
            <Button
              secondary
              label="Keep my entries"
              onPress={() => setConfirm(false)}
            />
          </>
        ) : (
          <Button
            secondary
            label="Clear session"
            icon="trash-2"
            onPress={() => setConfirm(true)}
          />
        )}
      </Card>
      <Card>
        <Copy kind="heading">Clarity first. More later.</Copy>
        <Copy style={{ color: C.muted }}>
          Explore the proposed Free and Plus plans. Everything in this research
          preview is free.
        </Copy>
        <Button
          secondary
          label="See planned membership"
          onPress={() => router.push("/plus")}
        />
      </Card>
      <Button
        secondary
        label="About this project"
        onPress={() => router.push("/about")}
      />
    </Page>
  );
}
