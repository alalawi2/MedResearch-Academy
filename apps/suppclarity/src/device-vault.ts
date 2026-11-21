import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { createVault } from "./local-vault";
export const deviceVault =
  Platform.OS === "web"
    ? null
    : createVault({
        get: (key) => SecureStore.getItemAsync(key),
        set: (key, value) =>
          SecureStore.setItemAsync(key, value, {
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
          }),
        remove: (key) => SecureStore.deleteItemAsync(key),
      });
