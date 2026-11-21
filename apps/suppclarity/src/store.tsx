import React, { createContext, useContext, useState } from "react";
import { emptyProfile, type Product, type Profile } from "./domain";
type State = {
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
};
const Context = createContext<State | null>(null);
export function Store({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState({ ...emptyProfile });
  const [products, setProducts] = useState<Product[]>([]);
  const [step, setStep] = useState(0);
  const [scale, setScale] = useState(1);
  const [resetKey, setResetKey] = useState(0);
  const reset = () => {
    setResetKey((k) => k + 1);
    setProfile({ ...emptyProfile });
    setProducts([]);
    setStep(0);
  };
  return (
    <Context.Provider
      value={{
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
