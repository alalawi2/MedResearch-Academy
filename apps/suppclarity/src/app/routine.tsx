import { useState } from "react";
import { View, Pressable, Linking, Platform } from "react-native";
import { router } from "expo-router";
import { Page, Copy, Card, Button, Notice, Field, Icon, C, S } from "../ui";
import { useStore } from "../store";
import { useMembership } from "../membership";
import { PlusGate } from "../plus-gate";
import { localDay, recordDay } from "../routine-data";
import { saveReminder, cancelRoutineReminders } from "../reminders";
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export default function Routine() {
  const { products, routine, setRoutine, routineStatus } = useStore();
  const membership = useMembership();
  const current = products.filter((p) => p.taking !== false);
  const today = localDay();
  const [editing, setEditing] = useState(false);
  const [productId, setProductId] = useState(current[0]?.id || "");
  const [time, setTime] = useState("08:00");
  const [days, setDays] = useState([1, 2, 3, 4, 5, 6, 7]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState(false);
  const save = async () => {
    setMessage("");
    if (
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(time) ||
      !days.length ||
      !current.some((p) => p.id === productId)
    ) {
      setMessage(
        "Choose a product, at least one day and a time such as 08:00 or 20:30.",
      );
      return;
    }
    if (
      routine.reminders.length >= 8 &&
      !routine.reminders.some((r) => r.productId === productId)
    ) {
      setMessage("You can keep reminders for up to eight products.");
      return;
    }
    if (!membership.active || !membership.expiresAt) {
      setMessage("Refresh Plus before saving a reminder.");
      return;
    }
    setBusy(true);
    try {
      await cancelRoutineReminders(productId);
      const [hour, minute] = time.split(":").map(Number);
      const reminder = await saveReminder(
        { productId, hour, minute, days },
        membership.expiresAt,
      );
      setRoutine((r) => ({
        ...r,
        reminders: [
          ...r.reminders.filter((x) => x.productId !== productId),
          reminder,
        ],
      }));
      setEditing(false);
      setMessage(
        "Reminder saved. Open the app regularly to refresh upcoming reminders.",
      );
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Could not save the reminder.",
      );
    } finally {
      setBusy(false);
    }
  };
  const remove = async (id: string) => {
    try {
      await cancelRoutineReminders(id);
      setRoutine((r) => ({
        ...r,
        reminders: r.reminders.filter((x) => x.productId !== id),
      }));
      setMessage("Reminder removed.");
    } catch {
      setMessage(
        "Could not remove the reminder. Try again or turn off notifications in phone settings.",
      );
    }
  };
  return (
    <Page title="MY ROUTINE" back>
      <Copy kind="title">Your day.{"\n"}Your pace.</Copy>
      <Copy style={{ color: C.muted }}>
        Keep a record of the routine you chose. This does not recommend what or
        how much to take.
      </Copy>
      {!membership.active && (
        <PlusGate
          title="Reminders and daily tracking"
          text="Plus adds a simple daily record and reminders you control. Existing history remains readable if your plan ends."
        />
      )}
      {!current.length && (
        <Card>
          <Icon name="sun" size={32} />
          <Copy kind="heading">Nothing to track yet</Copy>
          <Copy>
            Add a product you already take. You do not need to start taking
            supplements to use the free guides.
          </Copy>
          <Button
            secondary
            label="Find a product"
            onPress={() => router.push("/product")}
          />
        </Card>
      )}
      {membership.active &&
        current.map((product) => {
          const log = routine.logs.find(
            (l) => l.productId === product.id && l.day === today,
          );
          return (
            <Card key={product.id}>
              <Copy kind="heading">{product.name}</Copy>
              <Copy kind="small" style={{ color: C.muted }}>
                {log
                  ? log.status === "taken"
                    ? "Marked taken today"
                    : "Marked skipped today"
                  : "No entry today"}{" "}
                · Tap a selected option to undo
              </Copy>
              <View style={[S.row, { flexWrap: "wrap" }]}>
                <Button
                  label="Taken today"
                  secondary={log?.status !== "taken"}
                  onPress={() =>
                    setRoutine((r) => ({
                      ...r,
                      logs: recordDay(r.logs, product.id, "taken"),
                    }))
                  }
                />
                <Button
                  label="Skipped today"
                  secondary={log?.status !== "skipped"}
                  onPress={() =>
                    setRoutine((r) => ({
                      ...r,
                      logs: recordDay(r.logs, product.id, "skipped"),
                    }))
                  }
                />
              </View>
            </Card>
          );
        })}
      <Copy kind="heading">My reminders</Copy>
      {routine.reminders.map((reminder) => (
        <Card key={reminder.productId}>
          <Copy kind="label">
            {products.find((p) => p.id === reminder.productId)?.name ||
              "Removed product"}
          </Copy>
          <Copy>
            {String(reminder.hour).padStart(2, "0")}:
            {String(reminder.minute).padStart(2, "0")} ·{" "}
            {reminder.days.length === 7
              ? "Every day"
              : reminder.days.map((d) => dayNames[d - 1]).join(", ")}
          </Copy>
          {!membership.active && (
            <Copy kind="small">Paused while Plus is inactive.</Copy>
          )}
          <Button
            secondary
            label="Remove reminder"
            onPress={() => void remove(reminder.productId)}
          />
        </Card>
      ))}
      {membership.active && current.length > 0 && (
        <Button
          secondary
          label={
            editing ? "Close reminder settings" : "Add or change a reminder"
          }
          onPress={() => setEditing(!editing)}
        />
      )}
      {membership.active && editing && (
        <Card>
          <Copy kind="heading">Choose your reminder</Copy>
          {current.map((product) => (
            <Pressable
              key={product.id}
              accessibilityRole="radio"
              aria-checked={productId === product.id}
              accessibilityState={{ checked: productId === product.id }}
              onPress={() => setProductId(product.id)}
              style={[S.choice, productId === product.id && S.chosen]}
            >
              <Copy>{product.name}</Copy>
            </Pressable>
          ))}
          <Field
            label="Reminder time"
            value={time}
            onChange={setTime}
            maxLength={5}
            hint="24-hour time, for example 08:00 or 20:30. Uses your phone's local time."
          />
          <View style={[S.row, { flexWrap: "wrap" }]}>
            {dayNames.map((name, i) => (
              <Pressable
                key={name}
                accessibilityRole="checkbox"
                aria-checked={days.includes(i + 1)}
                accessibilityLabel={name}
                accessibilityState={{ checked: days.includes(i + 1) }}
                onPress={() =>
                  setDays((ds) =>
                    ds.includes(i + 1)
                      ? ds.filter((d) => d !== i + 1)
                      : [...ds, i + 1].sort(),
                  )
                }
                style={[
                  S.choice,
                  { padding: 10, minHeight: 48, minWidth: 48 },
                  days.includes(i + 1) && S.chosen,
                ]}
              >
                <Copy kind="small">{name}</Copy>
              </Pressable>
            ))}
          </View>
          <Copy kind="small">
            A reminder is your choice, not a suggested dose. Notifications use
            generic wording. Up to seven upcoming alerts per product are
            refreshed when you open the app and stop at the current Plus expiry.
          </Copy>
          <Button
            label={busy ? "Saving…" : "Save reminder"}
            disabled={busy}
            onPress={() => void save()}
          />
        </Card>
      )}
      {!!message && <Notice>{message}</Notice>}
      {!!routineStatus && <Notice>{routineStatus}</Notice>}
      {Platform.OS !== "web" && (
        <Button
          secondary
          label="Open notification settings"
          onPress={() => void Linking.openSettings()}
        />
      )}
      {!!routine.logs.length && (
        <>
          <Button
            secondary
            label={history ? "Hide history" : "View recent history"}
            onPress={() => setHistory(!history)}
          />
          {history && (
            <Card>
              <Copy kind="heading">Recent entries</Copy>
              {[...routine.logs]
                .reverse()
                .slice(0, 30)
                .map((log) => (
                  <Copy key={log.productId + log.day} kind="small">
                    {log.day} ·{" "}
                    {products.find((p) => p.id === log.productId)?.name ||
                      "Removed product"}{" "}
                    · {log.status}
                  </Copy>
                ))}
              <Copy kind="small">
                Self-reported entries do not confirm ingestion. Your free export
                includes your saved history.
              </Copy>
            </Card>
          )}
        </>
      )}
    </Page>
  );
}
