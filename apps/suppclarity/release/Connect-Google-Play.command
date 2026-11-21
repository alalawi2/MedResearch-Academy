#!/bin/zsh
set -euo pipefail
cd "${0:A:h}/.."
export PATH="/Users/abdullah/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH"
printf '%s\n' 'SuppClarity — Google Play access' 'Choose production, then Google Service Account and Play submission access.' 'Select the private key file locally; do not paste it in chat or commit it.'
npx eas-cli@latest credentials --platform android
printf '%s\n' 'Use the final verified production build ID in STORE_RELEASE.md when submitting.' 'The Google Play app record and required declarations must also be completed.'
