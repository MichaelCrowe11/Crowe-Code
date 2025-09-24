#!/usr/bin/env bash

set -euo pipefail

# Helper to set NextAuth URL and Secret for a Fly.io app.
# Usage:
#   ./scripts/set-nextauth-config.sh --app crowecode-main \
#     --url https://crowecode-main.fly.dev --generate-secret
#   ./scripts/set-nextauth-config.sh --app crowecode-main \
#     --url https://www.crowecode.com --secret "<your-secret>"

APP_NAME="crowecode-main"
NEXTAUTH_URL_VALUE=""
NEXTAUTH_SECRET_VALUE=""
GENERATE_SECRET=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --app)
      APP_NAME="$2"; shift 2 ;;
    --url)
      NEXTAUTH_URL_VALUE="$2"; shift 2 ;;
    --secret)
      NEXTAUTH_SECRET_VALUE="$2"; shift 2 ;;
    --generate-secret)
      GENERATE_SECRET=true; shift 1 ;;
    -h|--help)
      echo "Usage: $0 --app <fly-app> --url <https://domain> [--secret <value>|--generate-secret]"; exit 0 ;;
    *)
      echo "Unknown argument: $1" ; exit 1 ;;
  esac
done

if ! command -v flyctl >/dev/null 2>&1; then
  echo "Error: flyctl not found. Install from https://fly.io/docs/hands-on/install-flyctl/" >&2
  exit 1
fi

if [[ -z "${NEXTAUTH_URL_VALUE}" ]]; then
  echo "Error: --url is required (e.g., https://crowecode-main.fly.dev or https://www.crowecode.com)" >&2
  exit 1
fi

if [[ -z "${NEXTAUTH_SECRET_VALUE}" && ${GENERATE_SECRET} == false ]]; then
  echo "Info: --secret not provided. Generating a new secret." >&2
  GENERATE_SECRET=true
fi

if [[ ${GENERATE_SECRET} == true ]]; then
  if ! command -v openssl >/dev/null 2>&1; then
    echo "Error: openssl is required to generate a secret. Install openssl or pass --secret." >&2
    exit 1
  fi
  NEXTAUTH_SECRET_VALUE=$(openssl rand -base64 32)
fi

echo "\nApplying NextAuth configuration to Fly app: ${APP_NAME}"
echo "- NEXTAUTH_URL: ${NEXTAUTH_URL_VALUE}"
echo "- NEXTAUTH_SECRET: (hidden)"

flyctl secrets set \
  NEXTAUTH_URL="${NEXTAUTH_URL_VALUE}" \
  NEXTAUTH_SECRET="${NEXTAUTH_SECRET_VALUE}" \
  --app "${APP_NAME}"

echo "\n✅ Secrets set. Redeploy to apply:"
echo "  flyctl deploy --app ${APP_NAME}"

echo "\nℹ️ Verify after deploy:"
echo "  - Visit https://${NEXTAUTH_URL_VALUE#https://}/api/auth/debug-oauth"
echo "  - Visit https://${NEXTAUTH_URL_VALUE#https://}/api/auth/session (after login)"
