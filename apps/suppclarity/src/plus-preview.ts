import { Platform } from "react-native";
import type { Product } from "./domain";
import type { PurchasesPackage } from "react-native-purchases";
// Local UI review only. Production builds reject this environment setting.
export const plusPreview =
  __DEV__ && Platform.OS === "web"
    ? process.env.EXPO_PUBLIC_PLUS_PREVIEW || ""
    : "";
export const previewPackages: PurchasesPackage[] = plusPreview ? [
  { identifier: "$rc_annual", product: { identifier: "suppclarity_plus_yearly", subscriptionPeriod: "P1Y", price: 39.99, priceString: "$39.99", currencyCode: "USD" } },
  { identifier: "$rc_monthly", product: { identifier: "suppclarity_plus_monthly", subscriptionPeriod: "P1M", price: 4.99, priceString: "$4.99", currencyCode: "USD" } },
] as unknown as PurchasesPackage[] : [];
export const previewProducts: Product[] = plusPreview
  ? [
      {
        id: "preview-magnesium",
        name: "Magnesium · sample label",
        unitsPerServing: 1,
        unitsTaken: 1,
        daysPerWeek: 7,
        ingredients: [{ nutrient: "Magnesium", amount: 200, unit: "mg" }],
        taking: true,
      },
      {
        id: "preview-multi",
        name: "Daily multi · sample label",
        unitsPerServing: 2,
        unitsTaken: 0,
        daysPerWeek: 0,
        ingredients: [
          { nutrient: "Magnesium", amount: 100, unit: "mg" },
          { nutrient: "Vitamin D", amount: 25, unit: "mcg" },
        ],
        taking: false,
      },
    ]
  : [];
