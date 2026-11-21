import { useState } from "react";
import { View, Pressable, Image, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Page, Copy, Button, Card, Field, Notice, C, S } from "../ui";
import { useStore } from "../store";
import { units, validProduct, type Product, type Nutrient } from "../domain";
export default function ProductEntry() {
  const { setProducts } = useStore();
  const [name, setName] = useState("");
  const [nutrient, setNutrient] = useState<Nutrient>("Vitamin D");
  const [unit, setUnit] = useState("mcg");
  const [amount, setAmount] = useState("");
  const [serving, setServing] = useState("");
  const [taken, setTaken] = useState("");
  const [days, setDays] = useState("");
  const [photo, setPhoto] = useState("");
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  const p: Product = {
    id: "",
    name,
    nutrient,
    unit,
    amount: Number(amount),
    unitsPerServing: Number(serving),
    unitsTaken: Number(taken),
    daysPerWeek: Number(days),
  };
  async function pick(camera = false) {
    setError("");
    try {
      if (camera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setError(
            "Camera permission was not granted. You can enter the label manually.",
          );
          return;
        }
      }
      const result = camera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            quality: 0.6,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.6,
          });
      if (!result.canceled) setPhoto(result.assets[0].uri);
    } catch {
      setError(
        "We could not open the photo picker. You can still enter your label manually.",
      );
    }
  }
  return (
    <Page title="ADD A PRODUCT" back>
      <Copy kind="title">Your label,{"\n"}made clearer.</Copy>
      <Copy style={{ color: C.muted }}>
        For this preview, enter a single-ingredient vitamin D, B12 or magnesium
        product. Do not enter a whole multivitamin as one ingredient.
      </Copy>
      {confirm ? (
        <>
          <Card>
            <Copy kind="heading">Check before adding</Copy>
            <Copy>{name}</Copy>
            <Copy>
              {nutrient} · {amount} {unit} per serving
            </Copy>
            <Copy>{serving} unit(s) per serving</Copy>
            <Copy>
              You take {taken} unit(s) on {days} days per week.
            </Copy>
          </Card>
          <Notice>
            These are the quantities you entered, not a recommended amount.
            Check them against the Supplement Facts label.
          </Notice>
          <Button
            label="These details are correct"
            onPress={() => {
              if (validProduct(p)) {
                setProducts((ps) => [
                  ...ps,
                  {
                    ...p,
                    name: name.trim(),
                    id: `${Date.now()}-${Math.random()}`,
                  },
                ]);
                router.replace("/products");
              }
            }}
          />
          <Button
            secondary
            label="Edit details"
            onPress={() => setConfirm(false)}
          />
        </>
      ) : (
        <>
          <Card>
            <Copy kind="label">Optional label photo</Copy>
            <Copy kind="small" style={{ color: C.muted }}>
              For reference while entering amounts. Photos are not read
              automatically or uploaded, and are discarded when you leave this
              screen.
            </Copy>
            <Button
              secondary
              label="Choose label photo"
              icon="image"
              onPress={() => pick()}
            />
            {Platform.OS !== "web" && (
              <Button
                secondary
                label="Take reference photo"
                icon="camera"
                onPress={() => pick(true)}
              />
            )}{" "}
            {!!photo && (
              <>
                <Image
                  source={{ uri: photo }}
                  accessibilityLabel="Your selected label reference"
                  resizeMode="contain"
                  style={{ height: 200, width: "100%", borderRadius: 12 }}
                />
                <Button
                  secondary
                  label="Remove photo"
                  onPress={() => setPhoto("")}
                />
              </>
            )}
          </Card>
          <Field label="Product name" value={name} onChange={setName} />
          <Copy kind="label">Ingredient on your label</Copy>
          <View style={{ gap: 10 }}>
            {(Object.keys(units) as Nutrient[]).map((n) => (
              <Pressable
                key={n}
                accessibilityRole="radio"
                accessibilityState={{ checked: n === nutrient }}
 aria-checked={n === nutrient}
                onPress={() => {
                  setNutrient(n);
                  setUnit(units[n][0]);
                }}
                style={[S.choice, n === nutrient && S.chosen]}
              >
                <Copy>{n}</Copy>
              </Pressable>
            ))}
          </View>
          <Field
            label="Amount per serving"
            value={amount}
            onChange={setAmount}
            number
            hint="Use the amount for this ingredient in Supplement Facts, not the front of the bottle."
          />
          <View style={S.row}>
            {units[nutrient].map((u) => (
              <Pressable
                key={u}
                accessibilityRole="radio"
                accessibilityState={{ checked: unit === u }}
 aria-checked={unit === u}
                onPress={() => setUnit(u)}
                style={[S.choice, { flex: 1 }, unit === u && S.chosen]}
              >
                <Copy style={{ textAlign: "center" }}>{u}</Copy>
              </Pressable>
            ))}
          </View>
          <Field
            label="Units per serving"
            value={serving}
            onChange={setServing}
            number
            hint="For example, if serving size is 2 capsules, enter 2."
          />
          <Field
            label="Units you take on a day you use it"
            value={taken}
            onChange={setTaken}
            number
            hint="For example, 1 tablet. Use the same unit as serving size. Fractions are allowed for measured servings."
          />
          <Field
            label="Days per week you take it"
            value={days}
            onChange={setDays}
            number
            hint="A whole number from 1 to 7."
          />
          {nutrient === "Magnesium" && (
            <Notice>
              Enter elemental magnesium from Supplement Facts, not the total
              weight of the magnesium compound.
            </Notice>
          )}
          <Button
            label="Review my entry"
            disabled={!validProduct(p)}
            onPress={() => setConfirm(true)}
          />
          <Copy kind="small" style={{ color: C.muted }}>
            Complete every quantity to continue. Do not guess unreadable label
            values.
          </Copy>
        </>
      )}
      {!!error && (
        <Copy accessibilityRole="alert" style={{ color: C.amber }}>
          {error}
        </Copy>
      )}
    </Page>
  );
}
