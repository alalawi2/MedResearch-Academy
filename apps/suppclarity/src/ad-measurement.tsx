import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Modal, Platform, ScrollView, View } from 'react-native';
import NativeMeasurement, { type MeasurementStatus } from '../modules/suppclarity-install-measurement/src/SuppClarityInstallMeasurementModule';
import { shouldResumeMeasurement } from './ad-measurement-policy';
import { Button, Card, Copy, C } from './ui';
import { router } from 'expo-router';
const Context = createContext<{
  available: boolean; status: MeasurementStatus | null; busy: boolean;
  error: string; choose(granted: boolean): Promise<void>;
} | null>(null);
export function MeasurementProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<MeasurementStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dismissed, setDismissed] = useState(false);
  const available = Platform.OS === 'android' && !!NativeMeasurement;
  useEffect(() => {
    if (!available || !NativeMeasurement) return;
    const native = NativeMeasurement;
    let live = true;
    const refresh = async () => {
      try {
        const current = await native.getStatus();
        const next = shouldResumeMeasurement(Platform.OS, current.consent)
          ? await native.resume() : current;
        if (live) { setStatus(next); setError(''); }
      } catch { if (live) setError('Measurement is unavailable. Your app still works normally.'); }
    };
    void refresh();
    const sub = AppState.addEventListener('change', state => { if (state === 'active') void refresh(); });
    return () => { live = false; sub.remove(); };
  }, [available]);
  async function choose(granted: boolean) {
    if (!available || !NativeMeasurement || busy) return;
    setBusy(true); setError('');
    try { setStatus(await NativeMeasurement.setConsent(granted)); setDismissed(true); }
    catch { setError('Could not save this choice. Measurement has not been confirmed. Please try again.'); }
    finally { setBusy(false); }
  }
  return <Context.Provider value={{ available, status, busy, error, choose }}>
    {children}
    <Modal visible={available && status?.consent === 'not_asked' && !dismissed} transparent animationType="fade" onRequestClose={() => { void choose(false); }}>
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0008' }}>
        <View style={{ height: '90%', backgroundColor: C.bg, borderRadius: 20, overflow: 'hidden' }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, gap: 18 }}>
          <Copy kind="heading">Help us measure our ads?</Copy>
          <Copy>Optional: allow Meta (Facebook and Instagram) to receive an install receipt, advertising/device identifiers, app and device information, referral information when available, and network information such as your IP address. Meta may match this with its data to measure which ads lead people to open SuppClarity after installing it.</Copy>
          <Copy>We do not send your supplement list, health answers, photos, searches or chat content. Automatic screen, purchase and subscription event logging stays off. This choice does not affect your access.</Copy>
          <Copy kind="small">You can change your choice in Your space → Ad measurement. Turning it off stops future requests; it cannot recall information already received by Meta.</Copy>
          {error ? <Copy>{error}</Copy> : null}
        </ScrollView>
        <View style={{ padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: C.line }}>
          <Button secondary label="Allow install measurement" disabled={busy} onPress={() => { void choose(true); }} />
          <Button secondary label="No thanks" disabled={busy} onPress={() => { void choose(false); }} />
          <Button secondary label="Read privacy details" onPress={() => { setDismissed(true); router.push('/privacy'); }} />
        </View>
        </View>
      </View>
    </Modal>
  </Context.Provider>;
}
export function useMeasurement() {
  const value = useContext(Context);
  if (!value) throw new Error('MeasurementProvider missing');
  return value;
}
export function MeasurementExplanation() {
  return <Card><Copy kind="heading">Optional install measurement</Copy><Copy>Android version 0.6.1 adds optional Meta install measurement, off until you agree. If allowed, Meta receives an install receipt, advertising/device identifiers, app/device and referral information, and network information including your IP address. It may combine these with its data to measure ads. No supplement records, health answers, photos, searches or chat content are included. Automatic screen, purchase and subscription logging stays off. Older installations updating to this version are excluded from new-install receipts.</Copy><Copy>Change your choice in Your space → Ad measurement. Withdrawal stops future requests, not requests already in progress or data already received. For deletion requests contact info@medresearch-academy.om; Meta retention is governed by its privacy policy, available through the public policy link. Meta also provides its own privacy controls. Store download totals and Meta-attributed installs differ; not every download can be matched.</Copy></Card>;
}
