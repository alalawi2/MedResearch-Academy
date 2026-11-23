import { useState } from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { Page, Copy, Card, Button, Icon, Notice, C, S } from "../ui";
import { useMembership } from "../membership";
import { PLUS_FEATURES, annualSaving } from "../plus-policy";
export default function Plus() {
  const membership = useMembership();
  const [period, setPeriod] = useState("P1Y");
  const [busy, setBusy] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState("");
  const [details, setDetails] = useState(false);
  const monthly = membership.packages.find(
    (p) => p.product.subscriptionPeriod === "P1M",
  );
  const annual = membership.packages.find(
    (p) => p.product.subscriptionPeriod === "P1Y",
  );
  const chosen = period === "P1Y" ? annual : monthly;
  const saving =
    monthly &&
    annual &&
    monthly.product.currencyCode === annual.product.currencyCode
      ? annualSaving(monthly.product.price, annual.product.price)
      : 0;
  const act = async (action: () => Promise<unknown>) => {
    setRestoreMessage("");
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  };
  return (
    <Page
      title="SUPPCLARITY PLUS"
      back
      footer={
        !membership.active && chosen ? (
          <>
            <Copy kind="label" style={{ textAlign: "center" }}>
              {chosen.product.priceString}
              {period === "P1Y" ? " billed yearly" : " billed monthly"}
            </Copy>
            <Button
              label={
                busy
                  ? "Please wait…"
                  : "Continue with " + (period === "P1Y" ? "yearly" : "monthly")
              }
              disabled={busy}
              onPress={() => void act(() => membership.buy(chosen))}
            />
            <Copy kind="small" style={{ textAlign: "center", color: C.muted }}>
              Auto-renews until cancelled. No free trial.
            </Copy>
          </>
        ) : undefined
      }
    >
      <View style={S.pill}>
        <Copy kind="label" style={{ color: C.teal }}>
          {membership.active
            ? "Your Plus membership"
            : "More clarity. Less effort."}
        </Copy>
      </View>
      <Copy kind="title">A little more{"\n"}room for you.</Copy>
      <Copy style={{ color: C.muted }}>
        One optional plan for exploring labels and keeping your own routine.
      </Copy>
      <Card>
        {PLUS_FEATURES.map((feature) => (
          <View
            key={feature.title}
            style={[S.row, { alignItems: "flex-start" }]}
          >
            <Icon name={feature.icon} />
            <View style={{ flex: 1, gap: 4 }}>
              <Copy kind="label">{feature.title}</Copy>
              <Copy kind="small" style={{ color: C.muted }}>
                {feature.text}
              </Copy>
            </View>
          </View>
        ))}
      </Card>
      {membership.active ? (
        <Card>
          <Copy kind="heading">You have Plus</Copy>
          <Copy>
            {membership.willRenew ? "Renews on " : "Available until "}
            {new Date(membership.expiresAt!).toLocaleDateString()}.
          </Copy>
          <Button
            label="Open my routine"
            onPress={() => router.push("/routine")}
          />
          <Button
            secondary
            label="Compare my labels"
            onPress={() => router.push("/compare")}
          />
          <Button
            secondary
            label="My PDF summary"
            onPress={() => router.push("/summary")}
          />
          <Button
            secondary
            label="Manage subscription"
            onPress={() => void act(membership.manage)}
            disabled={busy}
          />
        </Card>
      ) : (
        <>
          {!!membership.packages.length && (
            <View
              accessibilityRole="radiogroup"
              accessibilityLabel="Plus billing period"
              style={{ gap: 10 }}
            >
              {[annual, monthly]
                .filter((p) => !!p)
                .map((item) => (
                  <Pressable
                    key={item.identifier}
                    accessibilityRole="radio"
                    aria-checked={period === item.product.subscriptionPeriod}
                    accessibilityLabel={
                      (item.product.subscriptionPeriod === "P1Y"
                        ? "Yearly "
                        : "Monthly ") + item.product.priceString
                    }
                    accessibilityState={{
                      checked: period === item.product.subscriptionPeriod,
                    }}
                    onPress={() => setPeriod(item.product.subscriptionPeriod!)}
                    style={[
                      S.choice,
                      period === item.product.subscriptionPeriod && S.chosen,
                    ]}
                  >
                    <View
                      style={[
                        S.row,
                        { justifyContent: "space-between", flexWrap: "wrap" },
                      ]}
                    >
                      <Copy kind="heading">
                        {item.product.subscriptionPeriod === "P1Y"
                          ? "Yearly"
                          : "Monthly"}
                      </Copy>
                      <Copy kind="heading">
                        {item.product.priceString}
                        {item.product.subscriptionPeriod === "P1Y"
                          ? "/year"
                          : "/month"}
                      </Copy>
                    </View>
                    {item.product.subscriptionPeriod === "P1Y" &&
                      saving > 0 && (
                        <Copy kind="small" style={{ color: C.teal }}>
                          Save {saving}% compared with 12 monthly payments
                        </Copy>
                      )}
                    <Copy kind="small">
                      Billed{" "}
                      {item.product.subscriptionPeriod === "P1Y"
                        ? "once each year"
                        : "each month"}
                      . Automatically renews until cancelled.
                    </Copy>
                  </Pressable>
                ))}
            </View>
          )}
          {membership.loading ? (
            <Copy>Checking available plans…</Copy>
          ) : chosen ? (
            <Copy kind="small" style={{ color: C.muted }}>
              Your store will show the final price and ask you to confirm. No
              free trial is included. Cancel in your store subscription settings
              before the next renewal.
            </Copy>
          ) : (
            <Card>
              <Copy kind="heading">Keep exploring for free</Copy>
              <Copy>
                Plus is not available to purchase here right now. Your free
                guides, product search and label explanations are ready to use.
              </Copy>
              <Button
                secondary
                label="Check plans again"
                onPress={() => void membership.refresh()}
                disabled={busy}
              />
            </Card>
          )}
        </>
      )}
      {!!membership.error && <Notice>{membership.error}</Notice>}
      {membership.available && (
        <Button
          secondary
          label={busy ? "Please wait…" : "Restore purchases"}
          disabled={busy}
          onPress={() =>
            void act(async () => {
              if (await membership.restore()) {
                setRestoreMessage("Purchases restored. Your Plus is ready to use.");
              }
            })
          }
        />
      )}
      {!!restoreMessage && (
        <View accessibilityLiveRegion="polite">
          <Notice>{restoreMessage}</Notice>
        </View>
      )}
      <Button
        secondary
        label={details ? "Hide plan details" : "What stays free?"}
        onPress={() => setDetails(!details)}
      />
      {details && (
        <Card>
          <Copy>
            Free includes manual entry, name search, your saved product list,
            basic amount explanations, safety information, evidence sources, all
            29 guides and 100 prepared answers. New-app online allowances: 3
            photo scans and 10 AI answers per calendar month. Plus includes 100
            scans and 300 online answers per calendar month, with daily limits
            of 20 scans and 50 answers. Unused requests do not roll over.
            Provider availability and reasonable service protection limits apply
            to both plans.
          </Copy>
          <Copy kind="small">
            Your entries and history remain yours if Plus ends. Reminders pause;
            existing entries and the free text export remain available. Restore
            uses the same Apple or Google store account. Cross-platform transfer
            is not included.
          </Copy>
        </Card>
      )}
      <View style={[S.row, { flexWrap: "wrap", justifyContent: "center" }]}>
        <Pressable
          accessibilityRole="link"
          onPress={() => router.push("/privacy")}
          style={{ padding: 8 }}
        >
          <Copy kind="small" style={{ color: C.teal }}>
            Privacy
          </Copy>
        </Pressable>
        <Pressable
          accessibilityRole="link"
          onPress={() => router.push("/terms")}
          style={{ padding: 8 }}
        >
          <Copy kind="small" style={{ color: C.teal }}>
            Terms of Use
          </Copy>
        </Pressable>
      </View>
      <Button
        secondary
        label={membership.active ? "Back to my app" : "Continue with free"}
        onPress={() =>
          router.canGoBack() ? router.back() : router.replace("/")
        }
      />
    </Page>
  );
}
