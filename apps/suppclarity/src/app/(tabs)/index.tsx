import { View, Pressable, Image } from "react-native";
import { router } from "expo-router";
import { Page, Copy, Button, Icon, C, S } from "../../ui";
import { useStore } from "../../store";
import { totals } from "../../domain";
export default function Home() {
  const { profile, step, products } = useStore();
  const started = Object.values(profile).some(Boolean);
  const done = Object.values(profile).every(Boolean);
  const repeated = totals(products).filter((t) => t.count > 1).length;
  return (
    <Page>
      <View
        style={[
          S.row,
          { justifyContent: "space-between", paddingTop: 6, paddingBottom: 8 },
        ]}
      >
        <View style={[S.row, { gap: 8 }]}>
          <Image
            source={require("../../../assets/brand-mark.png")}
            style={{ width: 36, height: 36 }}
            accessibilityLabel="SuppClarity logo"
          />
          <Copy kind="heading" style={{ fontSize: 21, letterSpacing: -0.7 }}>
            SuppClarity
          </Copy>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="About this research preview"
          onPress={() => router.push("/about")}
          style={[
            S.iconButton,
            { backgroundColor: C.white, borderWidth: 1, borderColor: C.line },
          ]}
        >
          <Icon name="info" size={20} color={C.ink} />
        </Pressable>
      </View>
      <View style={{ gap: 9 }}>
        <Copy
          kind="label"
          style={{ color: C.muted, fontSize: 12, letterSpacing: 1.8 }}
        >
          YOUR SUPPLEMENT COMPANION
        </Copy>
        <Copy kind="title">
          {done ? "Your overview." : "Your routine.\nMade clearer."}
        </Copy>
        <Copy style={{ color: C.muted }}>
          {done
            ? "A clear view of what you’ve entered and where to go next."
            : "Find your starting point. Understand what you take."}
        </Copy>
      </View>
      <View
        style={{
          backgroundColor: "#25252F",
          borderRadius: 26,
          padding: 24,
          gap: 18,
          overflow: "hidden",
        }}
      >
        <View
          style={[S.row, { justifyContent: "space-between", flexWrap: "wrap" }]}
        >
          <View
            style={{
              backgroundColor: "#41404F",
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <Copy kind="small" style={{ color: "#F3F0FF", fontSize: 12 }}>
              {done
                ? "YOUR PERSONAL CHECK"
                : started
                  ? "PICK UP WHERE YOU LEFT OFF"
                  : "START WITH YOU"}
            </Copy>
          </View>
          <Icon name="aperture" color="#E5DDFF" size={20} />
        </View>
        <Copy
          kind="heading"
          style={{ color: "#FFFFFF", fontSize: 26, lineHeight: 34 }}
        >
          {done
            ? "Your next step,\nin plain English."
            : started
              ? "A few answers.\nA clearer picture."
              : "Do you need\na supplement?"}
        </Copy>
        <Copy style={{ color: "#D0CCD8", fontSize: 15 }}>
          {done
            ? "Review your answers, product entries and the limits of this preview."
            : started
              ? `Continue from question ${step + 1}. Your answers are kept for this session.`
              : "Start with your diet and goals. You don’t need a bottle to begin."}
        </Copy>
        <Button
          label={
            done
              ? "Open my summary"
              : started
                ? "Continue my check"
                : "Find my starting point"
          }
          onPress={() => router.push(done ? "/result" : "/check")}
        />
        <Copy
          kind="small"
          style={{ color: "#D0CCD8", textAlign: "center", fontSize: 12 }}
        >
          Free · No card needed · All adults 18+
        </Copy>
      </View>
      <View style={{ gap: 14 }}>
        <View style={[S.row, { justifyContent: "space-between" }]}>
          <Copy kind="heading" style={{ fontSize: 20 }}>
            Your toolkit
          </Copy>
          <Copy kind="small" style={{ color: C.muted }}>
            Ready when you are
          </Copy>
        </View>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Enter a supplement label"
            onPress={() => router.push("/product")}
            style={({ pressed }) => [
              {
                flex: 1,
                backgroundColor: "#FCECE6",
                borderRadius: 20,
                padding: 18,
                gap: 20,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Icon name="maximize" size={26} color="#A43E27" />
            <View style={{ gap: 5 }}>
              <Copy kind="label" style={{ fontSize: 16 }}>
                Read a label
              </Copy>
              <Copy kind="small" style={{ fontSize: 13, color: "#7A4E43" }}>
                Enter & confirm
              </Copy>
            </View>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open my product routine"
            onPress={() => router.push("/products")}
            style={({ pressed }) => [
              {
                flex: 1,
                backgroundColor: "#ECE9FA",
                borderRadius: 20,
                padding: 18,
                gap: 20,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Icon name="layers" size={26} />
            <View style={{ gap: 5 }}>
              <Copy kind="label" style={{ fontSize: 16 }}>
                My routine
              </Copy>
              <Copy kind="small" style={{ fontSize: 13, color: "#65558A" }}>
                {products.length
                  ? `${products.length} entries · ${repeated} overlaps`
                  : "See your entries"}
              </Copy>
            </View>
          </Pressable>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Explore evidence sources"
        onPress={() => router.push("/evidence")}
        style={[
          S.row,
          {
            paddingVertical: 12,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: C.line,
          },
        ]}
      >
        <View
          style={{ backgroundColor: C.white, borderRadius: 16, padding: 14 }}
        >
          <Icon name="book-open" color={C.ink} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Copy kind="label" style={{ fontSize: 16 }}>
            Curious about the evidence?
          </Copy>
          <Copy kind="small" style={{ color: C.muted }}>
            Trusted sources, at your pace.
          </Copy>
        </View>
        <Icon name="chevron-right" size={19} color={C.muted} />
      </Pressable>
      <View style={{ gap: 6 }}>
        <Copy kind="small" style={{ color: C.muted, fontSize: 12 }}>
          RESEARCH PREVIEW
        </Copy>
        <Copy kind="small" style={{ color: C.muted }}>
          No personal medical assessment. Entries clear on reload.
        </Copy>
      </View>
    </Page>
  );
}
