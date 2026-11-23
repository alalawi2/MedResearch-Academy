import { Platform } from "react-native";
import type { Reminder } from "./routine-data";
const prefix = "suppclarity-routine:";
let generation = 0;
export const reminderGeneration = () => generation;
export async function cancelRoutineReminders(productId?: string) {
  if (!productId) generation++;
  if (Platform.OS === "web") return;
  const n = await import("expo-notifications");
  const pending = await n.getAllScheduledNotificationsAsync();
  for (const entry of pending)
    if (
      entry.identifier.startsWith(prefix) &&
      (!productId || entry.content.data?.productId === productId)
    )
      await n.cancelScheduledNotificationAsync(entry.identifier);
}
export async function saveReminder(
  input: Omit<Reminder, "notificationIds">,
  expiresAt: number,
  askPermission = true,
  expectedGeneration = generation,
): Promise<Reminder> {
  if (Platform.OS === "web")
    throw Error(
      "Reminders are available in the installed iPhone or Android app.",
    );
  if (expiresAt <= Date.now())
    throw Error("Refresh Plus before adding a reminder.");
  const n = await import("expo-notifications");
  if (Platform.OS === "android")
    await n.setNotificationChannelAsync("routine", {
      name: "Routine reminders",
      importance: n.AndroidImportance.DEFAULT,
    });
  let permission = await n.getPermissionsAsync();
  if (!permission.granted && askPermission)
    permission = await n.requestPermissionsAsync();
  if (!permission.granted)
    throw Error(
      "Notifications are off. Open phone settings to allow routine reminders.",
    );
  const ensureCurrent = () => {
    if (expectedGeneration !== generation)
      throw Error("Reminder settings changed. Try saving again.");
  };
  const identifiers: string[] = [];
  try {
    // Schedule a bounded set of one-off dates. Nothing fires after the verified
    // subscription expiry; opening the app refreshes the next seven reminders.
    ensureCurrent();
    const now = new Date();
    for (let offset = 0; offset < 28 && identifiers.length < 7; offset++) {
      ensureCurrent();
      const date = new Date(now);
      date.setDate(date.getDate() + offset);
      date.setHours(input.hour, input.minute, 0, 0);
      if (
        date.getTime() <= now.getTime() ||
        date.getTime() >= expiresAt ||
        !input.days.includes(date.getDay() + 1)
      )
        continue;
      const identifier = prefix + input.productId + ":" + date.getTime();
      await n.scheduleNotificationAsync({
        identifier,
        content: {
          title: "Your routine, at your pace",
          body: "Open SuppClarity to review your planned routine.",
          data: { productId: input.productId },
          sound: "default",
        },
        trigger: {
          type: n.SchedulableTriggerInputTypes.DATE,
          date,
          channelId: "routine",
        },
      });
      identifiers.push(identifier);
      ensureCurrent();
    }
    if (!identifiers.length)
      throw Error("No reminder falls before your current Plus period ends.");
    return { ...input, notificationIds: identifiers };
  } catch (error) {
    for (const id of identifiers) await n.cancelScheduledNotificationAsync(id);
    throw error;
  }
}
