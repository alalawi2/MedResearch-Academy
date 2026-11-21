import { useEffect, useRef, useState } from "react";
import { View, Pressable } from "react-native";
import { Button, Copy, Notice, S, C } from "./ui";
import { reportAnswer, type ReportReason } from "./api";
export function ReportAnswer({
  answer,
  sourceIds,
}: {
  answer: string;
  sourceIds: string[];
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>();
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const request = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      request.current?.abort();
      request.current = null;
    },
    [],
  );
  async function send() {
    if (!reason || busy) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setStatus("");
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      await reportAnswer(answer, reason, sourceIds, controller.signal);
      if (!controller.signal.aborted) {
        setStatus("Report received. Thank you for helping improve Clarity.");
        setOpen(false);
      }
    } catch (e) {
      if (request.current === controller)
        setStatus(
          e instanceof Error
            ? e.message
            : "The report was not saved. Please try again.",
        );
    } finally {
      clearTimeout(timer);
      if (request.current === controller) {
        setBusy(false);
        request.current = null;
      }
    }
  }
  return (
    <View style={{ gap: 12 }}>
      {!status.startsWith("Report received") && (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: busy }}
          disabled={busy}
          onPress={() => setOpen(!open)}
          style={{ minHeight: 44, justifyContent: "center" }}
        >
          <Copy
            kind="small"
            style={{ color: C.muted, textDecorationLine: "underline" }}
          >
            {open ? "Cancel report" : "Report this answer"}
          </Copy>
        </Pressable>
      )}
      {open && (
        <>
          <Copy kind="small">
            Send this answer and your reason to MedResearch Academy for
            app-quality review. Your question, profile and saved products are
            not included. Reports are private and kept for up to 31 days. This
            does not request medical help.
          </Copy>
          <View
            accessibilityRole="radiogroup"
            accessibilityLabel="Report reason"
            style={{ gap: 8 }}
          >
            {(
              [
                { value: "incorrect", label: "Incorrect information" },
                { value: "unsafe", label: "Unsafe or harmful" },
                { value: "offensive", label: "Offensive content" },
                { value: "other", label: "Something else" },
              ] as const
            ).map((x) => (
              <Pressable
                key={x.value}
                disabled={busy}
                accessibilityRole="radio"
                accessibilityState={{ checked: reason === x.value }}
                onPress={() => setReason(x.value)}
                style={[S.choice, reason === x.value && S.chosen]}
              >
                <Copy kind="small">{x.label}</Copy>
              </Pressable>
            ))}
          </View>
          <Button
            label={busy ? "Sending report…" : "Agree & send report"}
            disabled={busy || !reason}
            onPress={send}
          />
        </>
      )}
      {!!status && (
        <Notice>
          <Copy accessibilityLiveRegion="polite">{status}</Copy>
        </Notice>
      )}
    </View>
  );
}
