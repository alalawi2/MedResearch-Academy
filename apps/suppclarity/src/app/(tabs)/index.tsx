import { View, Pressable, Image } from "react-native";
import { router } from "expo-router";
import { Page, Copy, Button, Card, Icon, C, S } from "../../ui";
import { useStore } from "../../store";
import { overlappingIngredients, profileComplete } from "../../domain";
export default function Home() {
  const { profile, step, products } = useStore();
  const started = Object.values(profile).some(Boolean);
  const done = profileComplete(profile);
  const repeated = overlappingIngredients(products).length;
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
          accessibilityLabel="About SuppClarity"
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
            ? "Review your answers, product entries and the limits of this app."
            : started
              ? `Continue from question ${step + 1}. Pick up where you left off.`
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
      <View style={{ gap: 12 }}>
        <Copy kind="heading">What brings you here?</Copy>
        <Card>
          <Copy kind="heading">I’m new to supplements</Copy>
          <Copy kind="small">
            Start with your diet and goals. Taking nothing is a valid starting
            point.
          </Copy>
          <Button
            secondary
            label={
              started ? "Continue my starting check" : "Find my starting point"
            }
            onPress={() => router.push(done ? "/result" : "/check")}
          />
        </Card>
        <Card>
          <Copy kind="heading">I’m checking before buying</Copy>
          <Copy kind="small">
            Find or scan the label. Keep it as “Considering” so it stays out of
            your intake totals.
          </Copy>
          <Button
            secondary
            label="Check a product"
            onPress={() =>
              router.push({
                pathname: "/product",
                params: { intent: "consider" },
              })
            }
          />
        </Card>
        <Card>
          <Copy kind="heading">I already take supplements</Copy>
          <Copy kind="small">
            Record your actual use, compare repeated ingredients and review your
            routine.
          </Copy>
          <Button
            secondary
            label={
              products.length
                ? `Review ${products.length} ${products.length === 1 ? "entry" : "entries"}${repeated ? ` · ${repeated} overlaps` : ""}`
                : "Add my first product"
            }
            onPress={() =>
              router.push(products.length ? "/products" : "/product")
            }
          />
        </Card>
        <Card>
          <Copy kind="heading">I just have a question</Copy>
          <Copy kind="small">
            Get a short prepared answer about sleep, exercise, labels or common
            supplements.
          </Copy>
          <Button
            secondary
            label="Ask Clarity"
            onPress={() => router.push("/ask")}
          />
        </Card>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Read short supplement guides"
        onPress={() => router.push("/library")}
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
            Learn a little, right here.
          </Copy>
          <Copy kind="small" style={{ color: C.muted }}>
            Short guides. Sources when you want them.
          </Copy>
        </View>
        <Icon name="chevron-right" size={19} color={C.muted} />
      </Pressable>
      <View style={{ gap: 6 }}>
        <Copy kind="small" style={{ color: C.muted, fontSize: 12 }}>
          SUPPLEMENT EDUCATION · 0.6
        </Copy>
        <Copy kind="small" style={{ color: C.muted }}>
          Common vitamins, minerals and other supplements. General education,
          not an individual dose.
        </Copy>
      </View>
    </Page>
  );
}
