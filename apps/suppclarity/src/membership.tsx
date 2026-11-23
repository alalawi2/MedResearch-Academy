import React, { createContext, useContext, useEffect, useState } from "react";
import { AppState, Linking, Platform } from "react-native";
import {
  subscriptionClient,
  billingReady,
  type CustomerInfo,
  type PurchasesPackage,
} from "./billing";
import {
  FREE_MEMBERSHIP,
  membershipFromInfo,
  PLUS_PRODUCTS,
  type Membership,
} from "./plus-policy";
import { plusPreview, previewPackages } from "./plus-preview";
type Access = Membership & {
  loading: boolean;
  packages: PurchasesPackage[];
  available: boolean;
  error: string;
  refresh: () => Promise<void>;
  buy: (item: PurchasesPackage) => Promise<boolean>;
  restore: () => Promise<boolean>;
  manage: () => Promise<void>;
  setPreview?: (active: boolean) => void;
};
const Context = createContext<Access | null>(null);
export function MembershipProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [membership, setMembership] = useState(() =>
    plusPreview === "member"
      ? { active: true, expiresAt: Date.now() + 86400000, willRenew: false }
      : { ...FREE_MEMBERSHIP },
  );
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<PurchasesPackage[]>(previewPackages);
  const [available, setAvailable] = useState(false);
  const [error, setError] = useState("");
  const receive = (info: CustomerInfo) =>
    setMembership(membershipFromInfo(info));
  const refresh = async () => {
    if (plusPreview) {
      setLoading(false);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const client = await subscriptionClient();
      if (!client) {
        setMembership({ ...FREE_MEMBERSHIP });
        return;
      }
      setAvailable(true);
      receive(await client.getCustomerInfo());
      if (!(await billingReady())) {
        setPackages([]);
        return;
      }
      const offerings = await client.getOfferings();
      setPackages(
        (offerings.current?.availablePackages || []).filter(
          (p) =>
            PLUS_PRODUCTS.includes(p.product.identifier.split(":")[0]) &&
            ["P1M", "P1Y"].includes(p.product.subscriptionPeriod || ""),
        ),
      );
    } catch {
      setError("Could not refresh Plus. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    let alive = true;
    let unsubscribe = () => {};
    void subscriptionClient()
      .then(async (client) => {
        if (!alive) return;
        if (client && !plusPreview) {
          client.addCustomerInfoUpdateListener(receive);
          unsubscribe = () => client.removeCustomerInfoUpdateListener(receive);
        }
        await refresh();
      })
      .catch(() => {
        if (alive) setLoading(false);
      });
    const listener = AppState.addEventListener("change", (state) => {
      if (state === "active") void refresh();
    });
    return () => {
      alive = false;
      unsubscribe();
      listener.remove();
    };
    // This provider is mounted once; subscription callbacks only update state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!membership.active || !membership.expiresAt) return;
    const timer = setTimeout(
      () => {
        if (membership.expiresAt! <= Date.now())
          setMembership({ ...FREE_MEMBERSHIP });
        void refresh();
      },
      Math.min(Math.max(1, membership.expiresAt - Date.now()), 2147483647),
    );
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [membership.active, membership.expiresAt]);
  const buy = async (item: PurchasesPackage) => {
    if (plusPreview) {
      setError("Preview only. Purchases are disabled.");
      return false;
    }
    setError("");
    try {
      const client = await subscriptionClient();
      if (!client || !(await billingReady())) {
        setError(
          "Plus purchases are temporarily unavailable. Please try again later.",
        );
        return false;
      }
      const result = await client.purchasePackage(item);
      receive(result.customerInfo);
      return membershipFromInfo(result.customerInfo).active;
    } catch (e) {
      if (!(e as { userCancelled?: boolean })?.userCancelled)
        setError(
          "Purchase not completed. You have not been given Plus access; check your store account or try Restore purchases.",
        );
      return false;
    }
  };
  const restore = async () => {
    if (plusPreview) {
      setError("Preview only. No purchases to restore.");
      return false;
    }
    setError("");
    try {
      const client = await subscriptionClient();
      if (!client) throw Error();
      const info = await client.restorePurchases();
      receive(info);
      const active = membershipFromInfo(info).active;
      if (!active)
        setError(
          "No active Plus subscription was found for this store account.",
        );
      return active;
    } catch {
      setError(
        "Could not restore purchases. Check your connection and store account.",
      );
      return false;
    }
  };
  const manage = async () => {
    if (plusPreview) {
      setError("Preview only. No subscription is billed.");
      return;
    }
    try {
      const client = await subscriptionClient();
      if (client && Platform.OS === "ios")
        await client.showManageSubscriptions();
      else
        await Linking.openURL(
          "https://play.google.com/store/account/subscriptions?package=om.medresearchacademy.suppclarity",
        );
    } catch {
      setError(
        "Open your App Store or Google Play subscriptions to manage Plus.",
      );
    }
  };
  return (
    <Context.Provider
      value={{
        ...membership,
        loading,
        packages,
        available,
        error,
        refresh,
        buy,
        restore,
        manage,
        setPreview: plusPreview
          ? (active) =>
              setMembership(
                active
                  ? {
                      active: true,
                      expiresAt: Date.now() + 86400000,
                      willRenew: false,
                    }
                  : { ...FREE_MEMBERSHIP },
              )
          : undefined,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useMembership() {
  const value = useContext(Context);
  if (!value) throw Error("Membership provider required");
  return value;
}
