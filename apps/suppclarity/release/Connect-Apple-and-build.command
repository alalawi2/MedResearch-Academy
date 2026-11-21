#!/bin/zsh
set -euo pipefail
cd "${0:A:h}/.."
export PATH="/Users/abdullah/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH"
printf '%s\n' 'SuppClarity — Apple signing and release build' 'Complete Apple verification in this Terminal window. Do not put passwords or codes in chat.'
npx eas-cli@latest build --platform ios --profile production --wait
printf '%s\n' 'Build complete. App Store Connect metadata and privacy declarations are in STORE_RELEASE.md.' 'To upload the completed iOS build, run: npx eas-cli@latest submit --platform ios --latest'
