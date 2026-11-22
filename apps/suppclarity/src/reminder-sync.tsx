import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { useStore } from "./store";
import { useMembership } from "./membership";
import {
  cancelRoutineReminders,
  saveReminder,
  reminderGeneration,
} from "./reminders";
let scheduleQueue = Promise.resolve();
// A single coordinator prevents overlapping schedule updates. Identifiers are
// app-scoped, and notification text never reveals supplement names.
export function ReminderSync() {
  const { routine, products, setRoutineStatus } = useStore();
  const membership = useMembership();
  const [foreground, setForeground] = useState(0);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") setForeground((n) => n + 1);
    });
    return () => sub.remove();
  }, []);
  const scheduleKey = JSON.stringify(
    routine.reminders.map((r) => ({
      productId: r.productId,
      hour: r.hour,
      minute: r.minute,
      days: r.days,
    })),
  );
  const productKey = products
    .filter((p) => p.taking !== false)
    .map((p) => p.id)
    .join("|");
  useEffect(() => {
    if (membership.loading) return;
    let alive = true;
    scheduleQueue = scheduleQueue
      .catch(() => {})
      .then(async () => {
        if (!alive) return;
        await cancelRoutineReminders();
        const generation = reminderGeneration();
        if (!alive || !membership.active || !membership.expiresAt) return;
        for (const reminder of routine.reminders) {
          if (!alive) return;
          if (
            products.some(
              (p) => p.id === reminder.productId && p.taking !== false,
            )
          )
            await saveReminder(
              reminder,
              membership.expiresAt,
              false,
              generation,
            );
        }
        if (alive) setRoutineStatus("");
      })
      .catch(() => {
        if (alive)
          setRoutineStatus(
            "Reminders could not refresh. Check notification access and save the reminder again.",
          );
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    membership.active,
    membership.loading,
    membership.expiresAt,
    scheduleKey,
    productKey,
    foreground,
  ]);
  return null;
}
