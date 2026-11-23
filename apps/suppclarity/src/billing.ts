import { Platform } from "react-native";
import Constants from "expo-constants";
import { API_ORIGIN } from "./api-origin";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import type Purchases from "react-native-purchases";
export type { PurchasesPackage, CustomerInfo } from "react-native-purchases";
const identityKey = "suppclarity.billing.identity.v1";
let identityPromise: Promise<string> | undefined;
let clientPromise: Promise<typeof Purchases> | undefined;
export const billingEnabled = process.env.EXPO_PUBLIC_PLUS_ENABLED === "true";
function fallbackBillingIdentity() {
  if (!identityPromise)
    identityPromise = (async () => {
      if (Platform.OS === "web") return Crypto.randomUUID();
      const saved = await SecureStore.getItemAsync(identityKey);
      if (saved && /^[a-f0-9-]{36}$/.test(saved)) return saved;
      const value = Crypto.randomUUID();
      await SecureStore.setItemAsync(identityKey, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      return value;
    })().catch((error) => {
      identityPromise = undefined;
      throw error;
    });
  return identityPromise;
}
export async function subscriptionClient() {
  if (
    !billingEnabled ||
    Platform.OS === "web" ||
    Constants.executionEnvironment === "storeClient"
  )
    return null;
  const key =
    Platform.OS === "ios"
      ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
      : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
  if (!key || (!__DEV__ && key.startsWith("test_"))) return null;
  if (!clientPromise)
    clientPromise = (async () => {
      const purchases = (await import("react-native-purchases")).default;
      await purchases.setLogLevel(
        __DEV__
          ? (await import("react-native-purchases")).LOG_LEVEL.WARN
          : (await import("react-native-purchases")).LOG_LEVEL.ERROR,
      );
      purchases.configure({
        apiKey: key,
        // Let RevenueCat create an anonymous ID. Anonymous restores alias
        // customer records, preserving the original identity used for quotas.
        automaticDeviceIdentifierCollectionEnabled: false,
      });
      return purchases;
    })().catch((error) => {
      clientPromise = undefined;
      throw error;
    });
  return clientPromise;
}
export async function billingIdentity() {
  const client = await subscriptionClient();
  return client ? await client.getAppUserID() : fallbackBillingIdentity();
}
export async function billingHeaders(): Promise<Record<string, string>> {
  if (!billingEnabled) return {};
  // An unguessable anonymous identifier, sent only to our own HTTPS backend.
  return { "X-SuppClarity-Billing": await billingIdentity() };
}
export async function billingReady() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(
      `${API_ORIGIN}/api/suppclarity/billing-status`,
      { signal: controller.signal, headers: await billingHeaders() },
    );
    return response.ok && (await response.json()).ready === true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
