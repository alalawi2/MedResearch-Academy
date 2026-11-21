import type { IngredientContext } from "./dose-meaning";
import React, { createContext, useContext, useState, useEffect } from "react";
import { emptyProfile, type Product, type Profile } from "./domain";
import { ActivityIndicator, View } from "react-native";
import { deviceVault } from "./device-vault";
type State = {
  storageStatus: string;
  onlineAnswers: boolean;
  setOnlineAnswers: (value: boolean) => void;
  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  step: number;
  setStep: (n: number) => void;
  scale: number;
  setScale: (n: number) => void;
  reset: () => void;
  resetKey: number;
  ingredientPreview?: IngredientContext;
  setIngredientPreview: (value: IngredientContext | undefined) => void;
};
const Context = createContext<State | null>(null);
export function Store({ children }: { children: React.ReactNode }) {
  const [onlineAnswers, setOnlineAnswers] = useState(false);
  const [savingEnabled, setSavingEnabled] = useState(true);
  const [ready, setReady] = useState(!deviceVault);
  const [storageStatus, setStorageStatus] = useState(
    deviceVault
      ? "Opening your saved routine…"
      : "Browser preview: entries clear on reload.",
  );
  const [profile, setProfile] = useState({ ...emptyProfile });
  const [products, setProducts] = useState<Product[]>([]);
  const [step, setStep] = useState(0);
  const [scale, setScale] = useState(1);
  const [ingredientPreview, setIngredientPreview] =
    useState<IngredientContext>();
  const [resetKey, setResetKey] = useState(0);
  useEffect(() => {
    if (!deviceVault) return;
    let alive = true;
    deviceVault
      .read()
      .then((saved) => {
        if (!alive) return;
        if (saved) {
          setProfile(saved.profile);
          setProducts(saved.products);
          setStep(saved.step);
          setScale(saved.scale);
        }
        setStorageStatus("Saved on this device.");
        setReady(true);
      })
      .catch(() => {
        if (!alive) return;
        setStorageStatus(
          "Could not open the saved routine. New entries stay in this session until you clear saved data.",
        );
        // Do not overwrite an unreadable routine automatically.
        setReady(true);
        setSavingEnabled(false);
      });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    if (!ready || !deviceVault || !savingEnabled) return;
    const vault = deviceVault;
    let alive = true;
    const timer = setTimeout(() => {
      setStorageStatus("Saving on this device…");
      vault
        .write({ version: 1, profile, products, step, scale })
        .then(() => {
          if (alive) setStorageStatus("Saved on this device.");
        })
        .catch(() => {
          if (alive)
            setStorageStatus(
              "Could not finish saving or clearing data. Keep an export and try again.",
            );
        });
    }, 300);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [ready, savingEnabled, profile, products, step, scale]);
  const reset = () => {
    setOnlineAnswers(false);
    if (deviceVault) {
      setSavingEnabled(false);
      setStorageStatus("Clearing saved data…");
      deviceVault
        .clear()
        .then(() => {
          setStorageStatus("Saved data cleared.");
          setSavingEnabled(true);
        })
        .catch(() =>
          setStorageStatus(
            "Could not finish clearing saved data. Please try Clear my data again.",
          ),
        );
    }
    setResetKey((k) => k + 1);
    setIngredientPreview(undefined);
    setProfile({ ...emptyProfile });
    setProducts([]);
    setStep(0);
  };
  if (!ready)
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator accessibilityLabel="Opening your routine" />
      </View>
    );
  return (
    <Context.Provider
      value={{
        storageStatus,
        onlineAnswers,
        setOnlineAnswers,
        profile,
        setProfile,
        products,
        setProducts,
        step,
        setStep,
        scale,
        setScale,
        reset,
        resetKey,
        ingredientPreview,
        setIngredientPreview,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useStore() {
  const state = useContext(Context);
  if (!state) throw new Error("Store required");
  return state;
}
