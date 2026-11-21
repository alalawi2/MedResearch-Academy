import { useEffect, useRef, useState } from "react";
import {
  View,
  Pressable,
  Image,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { router } from "expo-router";
import { Page, Copy, Button, Card, Field, Notice, C, S, Icon } from "../ui";
import { useStore } from "../store";
import { ingredientsOf, units, type Nutrient } from "../domain";
import {
  confirmedProduct,
  draftRows,
  type DraftRow,
  type ReadLabel,
} from "../labels";
import { scanLabel } from "../api";
const blankRow = (n: Nutrient): DraftRow => ({
  id: "manual",
  name: n,
  nutrient: n,
  amount: "",
  unit: units[n][0],
  included: true,
  reading: "clear",
  labelText: "",
});
export default function ProductEntry() {
  const { setProducts, profile, setProfile } = useStore();
  const [name, setName] = useState("");
  const [serving, setServing] = useState("");
  const [servingUnit, setServingUnit] = useState("");
  const [taken, setTaken] = useState("");
  const [days, setDays] = useState("");
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [label, setLabel] = useState<ReadLabel>();
  const [rows, setRows] = useState<DraftRow[]>([blankRow("Vitamin D")]);
  const [taking, setTaking] = useState(profile.use !== "No");
  const [manualOther, setManualOther] = useState<string>("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  const product = confirmedProduct({
    name,
    serving,
    servingUnit,
    taken,
    days,
    taking,
    rows,
    label,
    manualOther: manualOther !== "No",
  });
  const ready = Boolean(product && (label || manualOther));
  const update = (id: string, patch: Partial<DraftRow>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  async function pick(camera = false) {
    setError("");
    try {
      if (camera) {
        const p = await ImagePicker.requestCameraPermissionsAsync();
        if (!p.granted) {
          setError(
            "Camera access was not granted. Choose a photo or enter the label manually.",
          );
          return;
        }
      }
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ["images"],
        quality: 1,
        allowsEditing: true,
      };
      const result = camera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);
      if (!result.canceled) {
        request.current?.abort();
        setBusy(false);
        setPhoto(result.assets[0]);
        setLabel(undefined);
        setRows([blankRow("Vitamin D")]);
        setName("");
        setServing("");
        setServingUnit("");
        setTaken("");
        setDays("");
        setManualOther("");
        setConsent(false);
        setConfirm(false);
      }
    } catch {
      setError("The photo picker could not open. Manual entry still works.");
    }
  }
  async function read() {
    if (!photo || !consent || busy) return;
    setBusy(true);
    setError("");
    const controller = new AbortController();
    request.current = controller;
    const timer = setTimeout(() => controller.abort(), 55000);
    try {
      const context = ImageManipulator.manipulate(photo.uri);
      const longest = Math.max(photo.width, photo.height);
      if (longest > 2000)
        context.resize(
          photo.width >= photo.height ? { width: 2000 } : { height: 2000 },
        );
      const image = await context.renderAsync();
      const resized = await image.saveAsync({
        format: SaveFormat.JPEG,
        compress: 0.85,
        base64: true,
      });
      if (!resized.base64 || resized.base64.length > 3333332)
        throw Error("Please crop closer to Supplement Facts and try again.");
      const result = await scanLabel(
        `data:image/jpeg;base64,${resized.base64}`,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      if (!result.hasSupplementFacts) {
        setError(
          "We could not find a readable Supplement Facts panel. Try a closer, straight-on photo.",
        );
        return;
      }
      setLabel(result);
      setName(result.productName || "");
      setServing(
        result.servingUnits === null ? "" : String(result.servingUnits),
      );
      setServingUnit(result.servingUnit || "");
      setRows(draftRows(result));
      setManualOther("");
    } catch (e) {
      if (controller.signal.aborted)
        setError(
          "Label reading was cancelled or timed out. You can retry or enter it manually.",
        );
      else
        setError(
          e instanceof Error ? e.message : "We could not read that label.",
        );
    } finally {
      clearTimeout(timer);
      if (request.current === controller) {
        setBusy(false);
        request.current = null;
      }
    }
  }
  return (
    <Page title="ADD A PRODUCT" back>
      <Copy kind="title">Read the label.{"\n"}Keep the clarity.</Copy>
      <Copy style={{ color: C.muted }}>
        Take a clear photo of Supplement Facts, or choose a screenshot. You’ll
        check the extracted details before they count.
      </Copy>
      {confirm && product ? (
        <>
          <Card>
            <Copy kind="heading">Check before adding</Copy>
            <Copy>{product.name}</Copy>
            <Copy>
              {product.unitsPerServing} {product.servingUnit} per serving
            </Copy>
            {ingredientsOf(product).map((i) => (
              <Copy key={i.nutrient}>
                {i.nutrient} · {i.amount} {i.unit} per serving
              </Copy>
            ))}
            <Copy>
              {taking
                ? `You take ${product.unitsTaken} ${product.servingUnit} on ${product.daysPerWeek} days per week.`
                : "Considering this product; it will not be added to intake totals."}
            </Copy>
            {Boolean(
              product.unassessedIngredients?.length || product.incompleteLabel,
            ) && (
              <Notice>
                Other or unreadable ingredients remain unassessed. This is not a
                whole-product safety review.
              </Notice>
            )}
          </Card>
          <Notice>
            Check amounts, units and serving size against the label. This is
            your recorded use, not a recommended dose.
          </Notice>
          <Button
            label="These details are correct"
            onPress={() => {
              if (!product) return;
              setProducts((ps) => [
                ...ps,
                { ...product, id: `${Date.now()}-${Math.random()}` },
              ]);
              if (taking && profile.use === "No")
                setProfile((p) => ({ ...p, use: "Yes" }));
              router.replace("/products");
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
            <Copy kind="heading">Start with a photo</Copy>
            <Copy kind="small" style={{ color: C.muted }}>
              Crop to the label. Leave out names, prescriptions and other
              personal information.
            </Copy>
            <Button
              secondary
              label="Choose label photo"
              icon="image"
              disabled={busy}
              onPress={() => pick()}
            />
            {Platform.OS !== "web" && (
              <Button
                secondary
                label="Take a photo"
                icon="camera"
                disabled={busy}
                onPress={() => pick(true)}
              />
            )}{" "}
            {photo && (
              <>
                <Image
                  source={{ uri: photo.uri }}
                  accessibilityLabel="Selected Supplement Facts photo"
                  resizeMode="contain"
                  style={{ height: 220, width: "100%", borderRadius: 12 }}
                />
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: consent }}
                  aria-checked={consent}
                  onPress={() => setConsent(!consent)}
                  disabled={busy}
                  style={[S.row, { paddingVertical: 12, minHeight: 52 }]}
                >
                  <Icon name={consent ? "check-square" : "square"} />
                  <Copy kind="small" style={{ flex: 1 }}>
                    Send this label photo to OpenAI to read it. We don’t save it
                    in your account; provider data controls apply.
                  </Copy>
                </Pressable>
                {busy ? (
                  <>
                    <ActivityIndicator color={C.teal} />
                    <Copy accessibilityLiveRegion="polite">
                      Reading your label…
                    </Copy>
                    <Button
                      secondary
                      label="Cancel reading"
                      onPress={() => request.current?.abort()}
                    />
                  </>
                ) : (
                  <Button
                    label={label ? "Read photo again" : "Read my label"}
                    disabled={!consent}
                    onPress={read}
                  />
                )}
                <Button
                  secondary
                  disabled={busy}
                  label="Remove photo"
                  onPress={() => {
                    setPhoto(null);
                    setConsent(false);
                  }}
                />
              </>
            )}
          </Card>
          {!!error && (
            <Notice>
              <Copy accessibilityRole="alert">{error}</Copy>
            </Notice>
          )}
          {label && (
            <Notice>
              {label.panelComplete
                ? "Label text extracted. Please confirm every included quantity."
                : "Some label content may be missing. Confirm what you can read; unassessed content remains visible."}
            </Notice>
          )}
          {label && label.concerns.length > 0 && (
            <Notice>{label.concerns.join(" ")}</Notice>
          )}
          <Field label="Product name" value={name} onChange={setName} />
          <Copy kind="label">Are you currently taking it?</Copy>
          <View style={S.row}>
            {[
              { title: "Taking it", value: true },
              { title: "Considering it", value: false },
            ].map((x) => (
              <Pressable
                key={x.title}
                accessibilityRole="radio"
                accessibilityState={{ checked: taking === x.value }}
                aria-checked={taking === x.value}
                onPress={() => setTaking(x.value)}
                style={[S.choice, { flex: 1 }, taking === x.value && S.chosen]}
              >
                <Copy kind="small">{x.title}</Copy>
              </Pressable>
            ))}
          </View>
          {label?.servingText && (
            <Copy kind="small">Label serving: {label.servingText}</Copy>
          )}
          <Field
            label="Units per serving"
            value={serving}
            onChange={setServing}
            number
            hint="For 2 capsules, enter 2. For a 5 mL serving, enter 5 and use mL below."
          />
          <Field
            label="Serving unit"
            value={servingUnit}
            onChange={setServingUnit}
            hint="For example capsule, tablet, scoop or mL."
          />
          {!label && (
            <>
              <Copy kind="label">Manual ingredient entry</Copy>
              <View style={{ gap: 10 }}>
                {(Object.keys(units) as Nutrient[]).map((n) => (
                  <Pressable
                    key={n}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: rows[0]?.nutrient === n }}
                    aria-checked={rows[0]?.nutrient === n}
                    onPress={() => setRows([blankRow(n)])}
                    style={[S.choice, rows[0]?.nutrient === n && S.chosen]}
                  >
                    <Copy>{n}</Copy>
                  </Pressable>
                ))}
              </View>
            </>
          )}
          {rows.map((row) => (
            <Card key={row.id}>
              <View style={S.row}>
                <Copy kind="heading" style={{ flex: 1 }}>
                  {row.nutrient}
                </Copy>
                {label && (
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: row.included }}
                    aria-checked={row.included}
                    accessibilityLabel={`Include ${row.nutrient} in quantity checks`}
                    style={S.iconButton}
                    onPress={() => update(row.id, { included: !row.included })}
                  >
                    <Icon name={row.included ? "check-square" : "square"} />
                  </Pressable>
                )}
              </View>
              {row.labelText && (
                <Copy kind="small" style={{ color: C.muted }}>
                  Label text: {row.labelText}
                </Copy>
              )}
              {row.reading !== "clear" && (
                <Notice>
                  We could not read this row confidently. Enter the amount from
                  the label, or leave it unassessed.
                </Notice>
              )}
              {row.included && (
                <>
                  <Field
                    label={`${row.nutrient} amount per serving`}
                    value={row.amount}
                    onChange={(amount) => update(row.id, { amount })}
                    number
                  />
                  <View style={S.row}>
                    {units[row.nutrient].map((u) => (
                      <Pressable
                        key={u}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: row.unit === u }}
                        aria-checked={row.unit === u}
                        onPress={() => update(row.id, { unit: u })}
                        style={[
                          S.choice,
                          { flex: 1 },
                          row.unit === u && S.chosen,
                        ]}
                      >
                        <Copy>{u}</Copy>
                      </Pressable>
                    ))}
                  </View>
                  {row.nutrient === "Magnesium" && (
                    <Copy kind="small">
                      Use elemental magnesium from Supplement Facts, not the
                      weight of a magnesium compound.
                    </Copy>
                  )}
                </>
              )}
            </Card>
          ))}
          {label && label.ingredients.some((r) => !r.nutrient) && (
            <Card>
              <Copy kind="heading">Other ingredients</Copy>
              <Copy kind="small">
                These are recorded for visibility but are not assessed by this
                module.
              </Copy>
              {label.ingredients
                .filter((r) => !r.nutrient)
                .map((r) => (
                  <Copy kind="small" key={r.id}>
                    {r.name}
                  </Copy>
                ))}
            </Card>
          )}
          {!label && (
            <>
              <Copy kind="label">
                Does the label have other active ingredients?
              </Copy>
              <View style={S.row}>
                {["No", "Yes", "Not sure"].map((x) => (
                  <Pressable
                    key={x}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: manualOther === x }}
                    aria-checked={manualOther === x}
                    onPress={() => setManualOther(x)}
                    style={[
                      S.choice,
                      { flex: 1, padding: 12 },
                      manualOther === x && S.chosen,
                    ]}
                  >
                    <Copy kind="small">{x}</Copy>
                  </Pressable>
                ))}
              </View>
            </>
          )}
          {taking && (
            <>
              <Field
                label="Units you actually take on a use day"
                value={taken}
                onChange={setTaken}
                number
                hint="Use the same unit as serving size. This is not asking what dose you should take."
              />
              <Field
                label="Days per week you take it"
                value={days}
                onChange={setDays}
                number
                hint="A whole number from 1 to 7."
              />
            </>
          )}
          {new Set(rows.filter((r) => r.included).map((r) => r.nutrient)).size <
            rows.filter((r) => r.included).length && (
            <Notice>
              An ingredient appears twice in this panel. Include one confirmed
              row for it to avoid double counting paired units.
            </Notice>
          )}
          <Button
            label="Review my entry"
            disabled={!ready || busy}
            onPress={() => setConfirm(true)}
          />
          <Copy kind="small" style={{ color: C.muted }}>
            Only confirmed vitamin D, B12 and magnesium quantities are checked.
            Other ingredients and medicine interactions remain unassessed.
          </Copy>
        </>
      )}
    </Page>
  );
}
