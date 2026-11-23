import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { shouldResumeMeasurement, measurementDescription } from '../src/ad-measurement-policy.ts';

test('refusal, missing choice and unsupported platforms never resume measurement', () => {
  for (const platform of ['android', 'ios', 'web']) {
    assert.equal(shouldResumeMeasurement(platform, 'not_asked'), false);
    assert.equal(shouldResumeMeasurement(platform, 'declined'), false);
  }
  assert.equal(shouldResumeMeasurement('ios', 'granted'), false);
  assert.equal(shouldResumeMeasurement('web', 'granted'), false);
  assert.equal(shouldResumeMeasurement('android', 'granted'), true);
});
test('a queued install is never described as an acknowledged or ad-attributed install', () => {
  assert.match(measurementDescription('granted', false), /Waiting for a verified receipt/);
  assert.match(measurementDescription('granted', true), /does not prove a match/);
  assert.match(measurementDescription('declined', true), /^Off/);
});
test('native startup is blocked and consent is committed before SDK startup', () => {
  const manifest = readFileSync('modules/suppclarity-install-measurement/android/src/main/AndroidManifest.xml','utf8');
  assert.match(manifest, /FacebookInitProvider[^>]+tools:node="remove"/);
  for (const flag of ['AutoInitEnabled','AutoLogAppEventsEnabled','AdvertiserIDCollectionEnabled'])
    assert.match(manifest, new RegExp(flag+'" android:value="false"'));
  const native = readFileSync('modules/suppclarity-install-measurement/android/src/main/java/om/medresearchacademy/measurement/SuppClarityInstallMeasurementModule.kt','utf8');
  assert.match(native, /if \(preferences\(\).getString\("consent", "not_asked"\) != "granted"\) return/);
  assert.ok(native.indexOf('check(preferences().edit()') < native.indexOf('try { startAfterConsent() }'));
  assert.doesNotMatch(native, /logEvent\(|logPurchase\(|setUserData\(|setUserID\(/);
  assert.match(native, /setAdvertiserIDCollectionEnabled\(false\)/);
});
