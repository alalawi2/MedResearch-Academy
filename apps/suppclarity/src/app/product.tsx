import { useEffect, useRef, useState } from "react";
import {
  View,
  Pressable,
  Image,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { router, useLocalSearchParams } from "expo-router";
import { ProductSearch } from "../product-search";
import { Page, Copy, Button, Card, Field, Notice, C, S, Icon } from "../ui";
import { useStore } from "../store";
import { ingredientsOf, units, type Nutrient } from "../domain";
import {
  confirmedProduct,
  draftRows,
  type DraftRow,
  type ReadLabel,
} from "../labels";
import { ingredientContext } from "../dose-meaning";
import { prospectiveNotes } from "../prospective";
import { scanLabel } from "../api";
const blankRow = (n: Nutrient): DraftRow => ({
  id: `manual-${n}`,
  name: n,
  nutrient: n,
  amount: "",
  unit: units[n][0],
  included: true,
  reading: "clear",
  labelText: "",
});
export default function ProductEntry() {
  const { products, setProducts, profile, setProfile, setIngredientPreview } =
    useStore();
  const { intent } = useLocalSearchParams<{ intent?: string }>();
  const [method, setMethod] = useState("Photo");
  const [searchSeed, setSearchSeed] = useState("");
  const [searchKey, setSearchKey] = useState(0);
  const [identityMessage, setIdentityMessage] = useState("");
  const [ingredientQuery, setIngredientQuery] = useState("");
  const [name, setName] = useState("");
  const [serving, setServing] = useState("");
  const [servingUnit, setServingUnit] = useState("");
  const [taken, setTaken] = useState("");
  const [days, setDays] = useState("");
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [label, setLabel] = useState<ReadLabel>();
  const [photoReading, setPhotoReading] = useState<ReadLabel>();
  const [rows, setRows] = useState<DraftRow[]>([blankRow("Vitamin D")]);
  const [taking, setTaking] = useState(
    intent !== "consider" && profile.use === "Yes",
  );
  const [manualOther, setManualOther] = useState<string>("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cameraBlocked, setCameraBlocked] = useState(false);
  const [error, setError] = useState("");
  const [showAllRows, setShowAllRows] = useState(false);
  const [editRows, setEditRows] = useState<string[]>([]);
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
  const displayRows =
    label && !showAllRows
      ? rows.filter(
          (row, index) =>
            index < 3 ||
            row.reading !== "clear" ||
            !row.amount.trim() ||
            !row.unit,
        )
      : rows;
  const notes = product
    ? prospectiveNotes(product, products, Number(profile.age))
    : [];
  const missing = !name.trim()
    ? "Enter the product name."
    : !serving.trim() ||
        !Number.isFinite(Number(serving)) ||
        Number(serving) <= 0
      ? "Enter a positive number of units per serving."
      : rows.some(
            (r) =>
              r.included &&
              (!r.amount.trim() ||
                !r.unit ||
                !Number.isFinite(Number(r.amount)) ||
                Number(r.amount) < 0),
          )
        ? "Check every included ingredient’s amount and unit, or leave it unassessed."
        : taking &&
            (!taken.trim() ||
              !Number.isFinite(Number(taken)) ||
              Number(taken) <= 0)
          ? "Enter the units you actually take on a use day."
          : taking &&
              (!days.trim() ||
                !Number.isInteger(Number(days)) ||
                Number(days) < 1 ||
                Number(days) > 7)
            ? "Enter a whole number of days per week from 1 to 7."
            : !label && !manualOther
              ? "Confirm whether the label has other active ingredients."
              : "Check the quantities and units above.";
  const update = (id: string, patch: Partial<DraftRow>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  function applyLabel(result: ReadLabel) {
    setLabel(result);
    setName(result.productName || "");
    setServing(result.servingUnits === null ? "" : String(result.servingUnits));
    setServingUnit(result.servingUnit || "");
    setRows(draftRows(result));
    setShowAllRows(false);
    setEditRows([]);
    setManualOther("");
    setConfirm(false);
    setTaken("");
    setDays("");
    setError("");
  }
  async function pick(camera = false) {
    setError("");
    try {
      if (camera) {
        const p = await ImagePicker.requestCameraPermissionsAsync();
        if (!p.granted) {
          setCameraBlocked(true);
          setError(
            "Camera access is off. Open camera settings, allow Camera, then return and tap Take a photo.",
          );
          return;
        }
        setCameraBlocked(false);
      }
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ["images"],
        quality: 1,
        // iOS editing forces a square crop, which can cut off tall Facts panels.
        allowsEditing: false,
      };
      const result = camera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);
      if (!result.canceled) {
        request.current?.abort();
        setBusy(false);
        setPhoto(result.assets[0]);
        setSearchSeed("");
        setIdentityMessage("");
        setLabel(undefined);
        setPhotoReading(undefined);
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
        throw Error(
          "Choose a closer photo of the product name or ingredient panel.",
        );
      const result = await scanLabel(
        `data:image/jpeg;base64,${resized.base64}`,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      if (
        result.productName &&
        (!result.hasSupplementFacts || !result.panelComplete)
      ) {
        const query = [result.brand, result.productName]
          .filter(Boolean)
          .join(" ")
          .slice(0, 120);
        setPhotoReading(result.hasSupplementFacts ? result : undefined);
        setSearchSeed(query);
        setSearchKey((k) => k + 1);
        setIdentityMessage(
          `Found ${query}. Checking the full product details…`,
        );
        setMethod("Search");
        return;
      }
      if (!result.hasSupplementFacts) {
        setError(
          "We could not read the name or ingredient details. Try a photo showing the name and brand, or type the product name.",
        );
        return;
      }
      applyLabel(result);
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
      <Copy kind="title">Find your product.{"\n"}Check the details.</Copy>
      <Copy style={{ color: C.muted }}>
        Start with one photo of the name and brand, or type the product name.
        We’ll find the details and ask for a closer photo only when needed.
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
          {notes.map((note) => (
            <Notice key={note}>{note}</Notice>
          ))}
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
          <View style={[S.row, { flexWrap: "wrap" }]}>
            {["Search", "Photo", "Manual"].map((m) => (
              <Pressable
                key={m}
                accessibilityRole="button"
                accessibilityLabel={`${m} entry`}
                accessibilityState={{ selected: method === m, disabled: busy }}
                disabled={busy}
                onPress={() => setMethod(m)}
                style={[
                  S.choice,
                  { flex: 1, minWidth: 80, padding: 12 },
                  method === m && S.chosen,
                ]}
              >
                <Copy kind="small" style={{ textAlign: "center" }}>
                  {m}
                </Copy>
              </Pressable>
            ))}
          </View>
          {!!identityMessage && (
            <Copy kind="small" accessibilityLiveRegion="polite">
              {identityMessage}
            </Copy>
          )}
          {method === "Search" && (
            <ProductSearch
              key={searchKey}
              initialQuery={searchSeed}
              autoSearch={Boolean(searchSeed)}
              onIdentityOnly={(query) => {
                setName(query);
                setMethod("Photo");
                setIdentityMessage(
                  "Product found online, but some quantities need a closer look. Photograph the ingredient amounts to finish.",
                );
              }}
              onSelect={(result) => {
                setIdentityMessage("");
                setPhotoReading(undefined);
                setPhoto(null);
                setConsent(false);
                applyLabel(result);
              }}
            />
          )}
          {method === "Search" && photoReading && !label && (
            <Button
              secondary
              label="Use the details already read from my photo"
              onPress={() => {
                applyLabel(photoReading);
                setIdentityMessage("");
              }}
            />
          )}
          {method === "Manual" && label && (
            <Button
              secondary
              label="Start a fresh manual entry"
              onPress={() => {
                setLabel(undefined);
                setPhoto(null);
                setRows([blankRow("Vitamin D")]);
                setName("");
                setServing("");
                setServingUnit("");
                setManualOther("");
                setTaken("");
                setDays("");
              }}
            />
          )}
          {method === "Photo" && (
            <Card>
              <Copy kind="heading">Start with a photo</Copy>
              <Copy kind="small" style={{ color: C.muted }}>
                The name and brand are enough to start. If you have the
                ingredient panel, include it too. Leave out personal
                information.
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
              )}
              {cameraBlocked && Platform.OS !== "web" && (
                <>
                  <Notice>
                    Allow Camera in this app’s settings, then return here to try
                    again.
                  </Notice>
                  <Button
                    secondary
                    label="Open camera settings"
                    icon="settings"
                    onPress={async () => {
                      try {
                        await Linking.openSettings();
                      } catch {
                        setError(
                          "Open your phone’s Settings, find this app, and allow Camera. You can also choose an existing label photo.",
                        );
                      }
                    }}
                  />
                </>
              )}
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
                      Use OpenAI to read this photo and search online by the
                      product name if needed. Your profile is not sent. Provider
                      data controls apply.
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
                      label={label ? "Read photo again" : "Find my product"}
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
          )}
          {!!error && (
            <Notice>
              <Copy accessibilityRole="alert">{error}</Copy>
            </Notice>
          )}
          {!!error && (
            <Button
              secondary
              label="Search by name instead"
              onPress={() => setMethod("Search")}
            />
          )}
          {label?.web && (
            <Notice>
              Found on{" "}
              {label.web.sourceType === "manufacturer"
                ? "the manufacturer’s website"
                : "a retailer’s website"}
              . Match the product and strength with your bottle before saving.{" "}
              <Copy
                onPress={() => Linking.openURL(label.web!.url)}
                accessibilityRole="link"
                style={{ textDecorationLine: "underline" }}
              >
                View source
              </Copy>
            </Notice>
          )}
          {label?.database && (
            <Notice>
              NIH label record
              {label.database.entryDate
                ? ` dated ${label.database.entryDate}`
                : ""}
              . Formulas can change. Match the exact product, strength and
              serving on your bottle; this database is not a product
              endorsement.
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
          {(label || method === "Manual") && (
            <>
              <Field label="Product name" value={name} onChange={setName} />
              <Copy kind="label">Are you currently taking it?</Copy>
              <View
                style={S.row}
                accessibilityRole="radiogroup"
                accessibilityLabel="Product status"
              >
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
                    style={[
                      S.choice,
                      { flex: 1 },
                      taking === x.value && S.chosen,
                    ]}
                  >
                    <Copy kind="small">{x.title}</Copy>
                  </Pressable>
                ))}
              </View>
              {!taking && (
                <Copy kind="small">
                  Considering keeps this product out of the amounts you
                  currently take.
                </Copy>
              )}
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
              {!label && (
                <>
                  <Copy kind="label">Add ingredients from the label</Copy>
                  <Field
                    label="Find an ingredient"
                    value={ingredientQuery}
                    onChange={setIngredientQuery}
                    hint="Search vitamins, minerals, omega-3, protein, creatine, probiotics or herbs."
                  />
                  <View style={{ gap: 10 }}>
                    {(Object.keys(units) as Nutrient[])
                      .filter((n) =>
                        n.toLowerCase().includes(ingredientQuery.toLowerCase()),
                      )
                      .slice(0, ingredientQuery ? 12 : 6)
                      .map((n) => (
                        <Pressable
                          key={n}
                          accessibilityRole="radio"
                          accessibilityState={{
                            checked: rows.some((r) => r.nutrient === n),
                          }}
                          aria-checked={rows.some((r) => r.nutrient === n)}
                          onPress={() =>
                            setRows((current) =>
                              current.some((r) => r.nutrient === n)
                                ? current
                                : current.length === 1 && !current[0].amount
                                  ? [blankRow(n)]
                                  : [...current, blankRow(n)],
                            )
                          }
                          style={[
                            S.choice,
                            rows.some((r) => r.nutrient === n) && S.chosen,
                          ]}
                        >
                          <Copy>{n}</Copy>
                        </Pressable>
                      ))}
                  </View>
                </>
              )}
              {displayRows.map((row) => (
                <Card key={row.id}>
                  <View style={S.row}>
                    <Copy kind="heading" style={{ flex: 1 }}>
                      {row.nutrient}
                    </Copy>
                    {!label && (
                      <Button
                        secondary
                        label="Remove"
                        onPress={() =>
                          setRows((rs) => rs.filter((r) => r.id !== row.id))
                        }
                      />
                    )}
                    {label && (
                      <Pressable
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: row.included }}
                        aria-checked={row.included}
                        accessibilityLabel={`Include ${row.nutrient} in quantity checks`}
                        style={S.iconButton}
                        onPress={() =>
                          update(row.id, { included: !row.included })
                        }
                      >
                        <Icon name={row.included ? "check-square" : "square"} />
                      </Pressable>
                    )}
                  </View>
                  <Button
                    secondary
                    label="Daily amount & more"
                    onPress={() => {
                      const use =
                        taking && Number(serving) > 0 && Number(taken) > 0;
                      setIngredientPreview(
                        row.amount.trim()
                          ? ingredientContext(
                              row.nutrient,
                              Number(row.amount),
                              row.unit,
                              use ? "use-day" : "label-serving",
                              use ? Number(serving) : 1,
                              use ? Number(taken) : 1,
                            )
                          : undefined,
                      );
                      router.push({
                        pathname: "/ingredient",
                        params: { name: row.nutrient },
                      });
                    }}
                  />
                  {label &&
                  row.amount &&
                  row.unit &&
                  row.reading === "clear" &&
                  !editRows.includes(row.id) ? (
                    <>
                      <Copy>
                        {row.amount} {row.unit} per serving
                        {row.included ? "" : " · left unassessed"}
                      </Copy>
                      <Button
                        secondary
                        label="Edit amount or unit"
                        onPress={() => setEditRows((ids) => [...ids, row.id])}
                      />
                    </>
                  ) : (
                    <>
                      {row.labelText && (
                        <Copy kind="small" style={{ color: C.muted }}>
                          Label text: {row.labelText}
                        </Copy>
                      )}
                      {row.reading !== "clear" && (
                        <Notice>
                          We could not read this row confidently. Enter the
                          amount from the label, or leave it unassessed.
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
                          {[
                            "Vitamin A",
                            "Vitamin E",
                            "Folate",
                            "Niacin",
                          ].includes(row.nutrient) && (
                            <Copy kind="small">
                              Use the unit exactly as printed. Form-specific
                              units stay separate; they are not automatically
                              checked against an upper reference.
                            </Copy>
                          )}
                          {row.nutrient === "Magnesium" && (
                            <Copy kind="small">
                              Use elemental magnesium from Supplement Facts, not
                              the weight of a magnesium compound.
                            </Copy>
                          )}
                        </>
                      )}
                    </>
                  )}
                </Card>
              ))}
              {label && rows.length > 3 && (
                <Button
                  secondary
                  label={
                    showAllRows
                      ? "Show fewer ingredients"
                      : `Show all ${rows.length} ingredients`
                  }
                  onPress={() => setShowAllRows(!showAllRows)}
                />
              )}
              {label && label.ingredients.some((r) => !r.nutrient) && (
                <Card>
                  <Copy kind="heading">Other ingredients</Copy>
                  <Copy kind="small">
                    These are recorded for visibility but are not assessed by
                    this module.
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
              {new Set(rows.filter((r) => r.included).map((r) => r.nutrient))
                .size < rows.filter((r) => r.included).length && (
                <Notice>
                  An ingredient appears twice in this panel. Include one
                  confirmed row for it to avoid double counting paired units.
                </Notice>
              )}
              {!ready && (name || label) && <Notice>{missing}</Notice>}
              <Button
                label="Review my entry"
                disabled={!ready || busy}
                onPress={() => setConfirm(true)}
              />
            </>
          )}
          <Copy kind="small" style={{ color: C.muted }}>
            Confirmed quantities are recorded; selected nutrients can be added
            across products. Extracts and probiotic strengths are not
            interchangeable. Medicine interactions and personal doses are not
            assessed.
          </Copy>
        </>
      )}
    </Page>
  );
}
