export const DEFAULT_API_ORIGIN = "https://www.medresearch-academy.om";
// A separate, explicitly configured backend lets native sandbox tests run
// without changing allowances or accepting test purchases on the live service.
export function resolveApiOrigin(value?: string): string {
  if (!value) return DEFAULT_API_ORIGIN;
  const url = new URL(value);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/"
  )
    throw Error(
      "The app backend must be an HTTPS origin without credentials or a path.",
    );
  return url.origin;
}
export const API_ORIGIN = resolveApiOrigin(
  process.env.EXPO_PUBLIC_SUPPCLARITY_API_ORIGIN,
);
