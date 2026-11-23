import { useState } from "react";
import { Platform, Switch, View } from "react-native";
import { useStore } from "../store";
import { useMembership } from "../membership";
import { Page, Copy, Card, Button, Notice, C, S } from "../ui";
import { PlusGate } from "../plus-gate";
import { summaryHtml } from "../pdf-summary";
export default function Summary() {
  const { products, routine } = useStore();
  const { active } = useMembership();
  const [includeHistory, setIncludeHistory] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const create = async () => {
    setBusy(true);
    setError("");
    let uri: string | undefined;
    try {
      const print = await import("expo-print");
      const html = summaryHtml(products, routine.logs, includeHistory);
      if (Platform.OS === "web")
        throw Error("Use the installed app to share a PDF.");
      const share = await import("expo-sharing");
      if (!(await share.isAvailableAsync()))
        throw Error("File sharing is not available on this device.");
      const result = await print.printToFileAsync({ html, base64: false });
      uri = result.uri;
      await share.shareAsync(uri, {
        mimeType: "application/pdf",
        UTI: "com.adobe.pdf",
        dialogTitle: "Share my supplement summary",
      });
    } catch {
      setError(
        "Could not create or share the PDF. Your entries are unchanged; try again.",
      );
    } finally {
      try {
        if (uri) {
          const { File } = await import("expo-file-system");
          const file = new File(uri);
          if (file.exists) file.delete();
        }
      } catch {
        setError(
          "The temporary PDF could not be removed from this device. Your shared copy may still exist in the receiving app.",
        );
      } finally {
        setBusy(false);
      }
    }
  };
  return (
    <Page title="MY PDF SUMMARY" back>
      <Copy kind="title">A clearer{"\n"}conversation.</Copy>
      {!active ? (
        <PlusGate
          title="Share a clear PDF with Plus"
          text="Bring your confirmed product entries to a pharmacist or dietitian. Your free text export stays available."
        />
      ) : (
        <>
          <Card>
            <Copy kind="heading">What will be included</Copy>
            <Copy>
              {products.length} saved product{products.length === 1 ? "" : "s"},
              their ingredient amounts, your recorded use and available product
              sources.
            </Copy>
            <Copy kind="small" style={{ color: C.muted }}>
              Questionnaire answers and AI conversations are excluded. Preview
              your products before sharing. The recipient can keep a copy.
            </Copy>
            <View style={[S.row, { justifyContent: "space-between" }]}>
              <Copy style={{ flex: 1 }}>Include recent routine history</Copy>
              <Switch
                accessibilityLabel="Include recent routine history"
                value={includeHistory}
                onValueChange={setIncludeHistory}
              />
            </View>
          </Card>
          <Notice>
            This is a record of your entries, not a prescription or clinical
            assessment. Share it only with someone you choose.
          </Notice>
          <Button
            label={busy ? "Preparing PDF…" : "Create & share PDF"}
            disabled={busy || !products.length || Platform.OS === "web"}
            onPress={() => void create()}
          />
          {Platform.OS === "web" && (
            <Copy kind="small">
              PDF sharing is available in the installed iPhone or Android app.
            </Copy>
          )}
          {!products.length && <Copy>Add a confirmed product first.</Copy>}
          {!!error && <Notice>{error}</Notice>}
        </>
      )}
    </Page>
  );
}
