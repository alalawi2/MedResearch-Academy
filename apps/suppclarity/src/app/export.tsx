import { TextInput, Share, Platform } from "react-native";
import { Page, Copy, Button, C, S } from "../ui";
import { useStore } from "../store";
export default function Export() {
  const { profile, products } = useStore();
  const text = JSON.stringify(
    {
      app: "SuppClarity research preview",
      exportedAt: new Date().toISOString(),
      profile,
      products,
      assessment: "No clinical assessment performed",
    },
    null,
    2,
  );
  return (
    <Page title="YOUR COPY" back>
      <Copy kind="title">Your entries,{"\n"}in one place.</Copy>
      <Copy>
        Copy the text below to keep a record. It contains the personal answers
        you entered.
      </Copy>
      <TextInput
        accessibilityLabel="Exported session data"
        multiline
        editable={false}
        selectTextOnFocus
        value={text}
        style={[
          S.input,
          {
            minHeight: 380,
            fontSize: 14,
            color: C.ink,
            textAlignVertical: "top",
          },
        ]}
      />
      {Platform.OS !== "web" && (
        <Button
          label="Share my copy"
          onPress={() => {
            void Share.share({ message: text });
          }}
        />
      )}
    </Page>
  );
}
