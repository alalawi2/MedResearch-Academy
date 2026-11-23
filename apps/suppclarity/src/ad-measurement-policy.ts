export type Consent = 'not_asked' | 'granted' | 'declined';
export function shouldResumeMeasurement(platform: string, consent: Consent) {
  return platform === 'android' && consent === 'granted';
}
export function measurementDescription(consent: Consent, acknowledged: boolean) {
  if (consent !== 'granted') return 'Off. No new install-measurement request is sent to Meta.';
  return acknowledged
    ? 'On. Meta acknowledged an install receipt. This does not prove a match to an advertisement.'
    : 'On. Waiting for a verified receipt from Meta. An install is not counted here until acknowledged.';
}
