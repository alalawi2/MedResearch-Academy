#!/usr/bin/env node
// EAS currently omits Apple's newer required age-rating flags from requests.
// Run: node release/push-store-metadata.cjs /absolute/path/to/eas
// This only adapts the current CLI process; installed packages are unchanged.
const fs = require('node:fs');
const path = require('node:path');
const app = JSON.parse(fs.readFileSync('app.json', 'utf8'));
const submit = JSON.parse(fs.readFileSync('eas.json', 'utf8'));
if (app.expo.ios.bundleIdentifier !== 'om.medresearchacademy.suppclarity' ||
    submit.submit?.production?.ios?.ascAppId !== '6837860843') {
  throw new Error('This helper only supports the SuppClarity store record.');
}
const entry = fs.realpathSync(process.argv[2]);
const root = path.dirname(path.dirname(entry));
if (JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).name !== 'eas-cli') {
  throw new Error('Provide the official EAS CLI entry point.');
}
const cliRequire = require('node:module').createRequire(entry);
const client = cliRequire('@expo/apple-utils').getRequestClient();
client.interceptors.request.use(request => {
  if (String(request.method).toUpperCase() !== 'PATCH') return request;
  const wasText = typeof request.data === 'string';
  let body = request.data;
  if (wasText) {
    try { body = JSON.parse(request.data); } catch { return request; }
  }
  if (body?.data?.type !== 'ageRatingDeclarations') return request;
  // The official client's serializer drops these newer Apple attributes.
  // SuppClarity has no social network, location sharing, or dating features.
  body.data.attributes.socialMedia = false;
  body.data.attributes.socialMediaAgeRestricted = false;
  body.data.attributes.sharedLocation = false;
  body.data.attributes.datingAndRelationships = false;
  request.data = wasText ? JSON.stringify(body) : body;
  return request;
});
process.argv = [process.execPath, entry, 'metadata:push', '--non-interactive'];
require(entry);
