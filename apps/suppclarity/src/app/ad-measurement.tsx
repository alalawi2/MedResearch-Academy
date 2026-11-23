import { Page, Copy, Card, Button } from '../ui';
import { MeasurementExplanation, useMeasurement } from '../ad-measurement';
import { measurementDescription } from '../ad-measurement-policy';
export default function MeasurementSettings() {
  const { available, status, busy, error, choose } = useMeasurement();
  return <Page title="AD MEASUREMENT" back>
    <Copy kind="title">Your choice.</Copy>
    <MeasurementExplanation />
    <Card><Copy kind="heading">Status</Copy><Copy>{!available ? 'Optional install measurement is available only in the updated Android app. This browser or iPhone version does not send Meta measurement events.' : status ? (!status.eligibleNewInstall && status.consent === 'granted' && !status.receiptAcknowledged ? 'On for future eligible measurement. This older installation is excluded so an app update is not counted as a new download.' : measurementDescription(status.consent, status.receiptAcknowledged)) : 'Loading your choice. Measurement remains off until confirmed.'}</Copy>{error ? <Copy>{error}</Copy> : null}</Card>
    {available && <><Button secondary label="Allow install measurement" disabled={busy} onPress={() => { void choose(true); }} /><Button secondary label="Turn off install measurement" disabled={busy} onPress={() => { void choose(false); }} /></>}
  </Page>;
}
