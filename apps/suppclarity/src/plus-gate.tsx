import { router } from "expo-router";
import { Copy, Card, Button, Icon, C } from "./ui";
export function PlusGate({ title, text }: { title: string; text: string }) {
  return (
    <Card>
      <Icon name="star" size={32} />
      <Copy kind="heading">{title}</Copy>
      <Copy>{text}</Copy>
      <Button
        label="Explore SuppClarity Plus"
        onPress={() => router.push("/plus")}
      />
      <Copy kind="small" style={{ color: C.muted }}>
        Label explanations, safety information and evidence sources stay free.
      </Copy>
    </Card>
  );
}
