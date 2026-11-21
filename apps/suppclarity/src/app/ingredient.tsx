import { router, useLocalSearchParams } from "expo-router";
import { Page, Copy, Card, Button, Notice, C } from "../ui";
import { nutrientCatalog, type Nutrient } from "../domain";
import { dailyReference } from "../daily-references";
import { upperReference } from "../upper-references";
import {
  localGuides,
  type GuideId,
  validSources,
  guideTopic,
} from "../knowledge";
import { useStore } from "../store";
export default function IngredientDetails() {
  const { name } = useLocalSearchParams<{ name?: string }>();
  const { profile } = useStore();
  const nutrient =
    name && Object.hasOwn(nutrientCatalog, name)
      ? (name as Nutrient)
      : undefined;
  if (!nutrient)
    return (
      <Page title="INGREDIENT DETAILS" back>
        <Copy>Choose an ingredient from your product.</Copy>
      </Page>
    );
  const guide = nutrientCatalog[nutrient].guide as GuideId;
  const g = localGuides[guide];
  const age = Number(profile.age);
  const reference = dailyReference(nutrient, age, profile.sexReference);
  const limit = upperReference(nutrient, age);
  return (
    <Page title="A LITTLE MORE DETAIL" back>
      <Copy kind="title">{nutrient}</Copy>
      <Copy>{g.summary}</Copy>
      <Card>
        <Copy kind="heading">How much per day?</Copy>
        {reference ? (
          <>
            {reference.lines.map((line) => (
              <Copy key={line}>{line}</Copy>
            ))}
            <Copy kind="small" style={{ color: C.muted }}>
              General US reference for non-pregnant, non-breastfeeding adults,
              from food and supplements combined. These figures are not an extra
              supplement dose.
            </Copy>
          </>
        ) : (
          <Copy>
            There is no general daily amount shown here for this ingredient or
            formulation. A trial dose or a bottle’s directions do not establish
            what you personally need.
          </Copy>
        )}
      </Card>
      {limit && (
        <Card>
          <Copy kind="heading">Upper limit</Copy>
          <Copy>
            {limit.amount} {limit.unit}/day, for {limit.scope}.
          </Copy>
          <Copy kind="small">
            An upper limit is a ceiling, not a target. Amounts below it can
            still be unsuitable.
          </Copy>
        </Card>
      )}
      {!limit && (
        <Copy kind="small" style={{ color: C.muted }}>
          Age-specific upper references are available after your starting check
          for selected nutrients. Other ingredients can have limits too.
        </Copy>
      )}
      <Notice>
        Food intake has not been measured, so the app cannot calculate how much
        extra you need. Pregnancy, breastfeeding, medicines and health
        conditions can change the interpretation.
      </Notice>
      <Button
        secondary
        label="Reference preference (optional)"
        onPress={() => router.push("/account")}
      />
      <Button
        secondary
        label="Benefits and things to check"
        onPress={() => router.push({ pathname: "/library", params: { guide } })}
      />
      <Button
        secondary
        label="Sources and research"
        onPress={() =>
          router.push({
            pathname: "/evidence",
            params: {
              ids: validSources([
                ...(reference ? [reference.source] : []),
                ...g.sourceIds,
              ]).join(","),
              topic: guideTopic(guide) || "",
            },
          })
        }
      />
    </Page>
  );
}
