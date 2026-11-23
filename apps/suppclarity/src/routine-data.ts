import type { Product } from "./domain.ts";
export type Reminder = {
  productId: string;
  hour: number;
  minute: number;
  days: number[];
  notificationIds: string[];
};
export type RoutineLog = {
  productId: string;
  day: string;
  status: "taken" | "skipped";
};
export type RoutineData = { reminders: Reminder[]; logs: RoutineLog[] };
export const emptyRoutine = (): RoutineData => ({ reminders: [], logs: [] });
export function localDay(date = new Date()) {
  return (
    String(date.getFullYear()) +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0")
  );
}
export function validateRoutine(value: unknown): RoutineData {
  if (value === undefined) return emptyRoutine();
  const x = value as RoutineData;
  if (
    !x ||
    !Array.isArray(x.reminders) ||
    x.reminders.length > 8 ||
    !Array.isArray(x.logs) ||
    x.logs.length > 3700
  )
    throw Error("Invalid routine history");
  const id = (v: unknown) =>
    typeof v === "string" && v.length > 0 && v.length <= 200;
  if (
    x.reminders.some(
      (r) =>
        !id(r.productId) ||
        !Number.isInteger(r.hour) ||
        r.hour < 0 ||
        r.hour > 23 ||
        !Number.isInteger(r.minute) ||
        r.minute < 0 ||
        r.minute > 59 ||
        !Array.isArray(r.days) ||
        !r.days.length ||
        r.days.length > 7 ||
        new Set(r.days).size !== r.days.length ||
        r.days.some((d) => !Number.isInteger(d) || d < 1 || d > 7) ||
        !Array.isArray(r.notificationIds) ||
        r.notificationIds.length > 7 ||
        !r.notificationIds.every(id),
    )
  )
    throw Error("Invalid reminder");
  if (new Set(x.reminders.map((r) => r.productId)).size !== x.reminders.length)
    throw Error("Duplicate reminder");
  if (
    x.logs.some(
      (l) =>
        !id(l.productId) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(l.day) ||
        !["taken", "skipped"].includes(l.status),
    )
  )
    throw Error("Invalid routine log");
  if (
    new Set(x.logs.map((l) => l.productId + ":" + l.day)).size !== x.logs.length
  )
    throw Error("Duplicate routine log");
  return JSON.parse(JSON.stringify(x));
}
export function recordDay(
  logs: RoutineLog[],
  productId: string,
  status: RoutineLog["status"],
  today = localDay(),
) {
  const previous = logs.find(
    (l) => l.productId === productId && l.day === today,
  );
  const next = logs.filter(
    (l) => !(l.productId === productId && l.day === today),
  );
  if (previous?.status !== status) next.push({ productId, day: today, status });
  return next.sort((a, b) => a.day.localeCompare(b.day)).slice(-3700);
}
export function currentRoutine(
  data: RoutineData,
  products: Product[],
): RoutineData {
  const ids = new Set(
    products.filter((p) => p.taking !== false).map((p) => p.id),
  );
  return {
    reminders: data.reminders.filter((r) => ids.has(r.productId)),
    logs: data.logs,
  };
}
