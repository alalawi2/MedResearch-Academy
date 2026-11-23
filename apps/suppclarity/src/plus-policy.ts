export const PLUS_ENTITLEMENT = "suppclarity_plus";
export const PLUS_PRODUCTS = [
  "suppclarity_plus_monthly",
  "suppclarity_plus_yearly",
];
export const PLUS_FEATURES = [
  {
    icon: "camera",
    title: "More room to explore",
    text: "100 photo scans and 300 online answers each month.",
  },
  {
    icon: "columns",
    title: "Compare two labels",
    text: "See ingredient amounts side by side.",
  },
  {
    icon: "bell",
    title: "A routine that fits your day",
    text: "Choose reminders and keep a simple taken or skipped log.",
  },
  {
    icon: "file-text",
    title: "A clear PDF summary",
    text: "Share the entries you choose with a pharmacist or dietitian.",
  },
] as const;
export type Membership = {
  active: boolean;
  expiresAt: number | null;
  willRenew: boolean;
};
export const FREE_MEMBERSHIP: Membership = {
  active: false,
  expiresAt: null,
  willRenew: false,
};
export function membershipFromInfo(
  info: unknown,
  now = Date.now(),
): Membership {
  const entry = (
    info as {
      entitlements?: {
        active?: Record<
          string,
          {
            isActive?: boolean;
            expirationDate?: string | null;
            willRenew?: boolean;
            productIdentifier?: string;
          }
        >;
      };
    }
  )?.entitlements?.active?.[PLUS_ENTITLEMENT];
  const subscriptions = (
    info as {
      subscriptionsByProductIdentifier?: Record<
        string,
        { gracePeriodExpiresDate?: string | null; refundedAt?: string | null }
      >;
    }
  )?.subscriptionsByProductIdentifier;
  const subscription = subscriptions?.[entry?.productIdentifier || ""];
  const expiry = Math.max(
    Date.parse(entry?.expirationDate || "") || 0,
    Date.parse(subscription?.gracePeriodExpiresDate || "") || 0,
  );
  if (
    !entry?.isActive ||
    subscription?.refundedAt ||
    !Number.isFinite(expiry) ||
    expiry <= now ||
    !PLUS_PRODUCTS.includes((entry.productIdentifier || "").split(":")[0])
  )
    return { ...FREE_MEMBERSHIP };
  return {
    active: true,
    expiresAt: expiry,
    willRenew: entry.willRenew === true,
  };
}
export function annualSaving(monthly: number, annual: number) {
  return monthly > 0 && annual > 0 && annual < monthly * 12
    ? Math.round((1 - annual / (monthly * 12)) * 100)
    : 0;
}
