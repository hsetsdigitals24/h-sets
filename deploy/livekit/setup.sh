#!/usr/bin/env bash
# One-shot configuration for a fresh H-SETS LiveKit host.
#
# Generates an API key pair and substitutes it, your domains, and your app URL
# into livekit.yaml, egress.yaml and caddy.yaml. Safe to read before running —
# it only edits files in this directory and starts nothing.
#
# Usage:
#   ./setup.sh meet.h-sets.com turn.h-sets.com https://h-sets.com
set -euo pipefail

if [ $# -ne 3 ]; then
  cat >&2 <<USAGE
Usage: $0 <meet-domain> <turn-domain> <app-url>

  meet-domain  hostname for the signalling WebSocket   e.g. meet.h-sets.com
  turn-domain  hostname for TURN/TLS                   e.g. turn.h-sets.com
  app-url      public base URL of the Next.js app      e.g. https://h-sets.com

Both hostnames must already resolve to this machine's public IP, or Let's
Encrypt cannot issue certificates on first boot.
USAGE
  exit 1
fi

MEET_DOMAIN=$1
TURN_DOMAIN=$2
APP_URL=${3%/}   # strip any trailing slash so the webhook path is clean

cd "$(dirname "$0")"

# Refuse to clobber a configured host: re-running would mint new keys and every
# live token would stop validating.
# Keyed off the literal placeholder key, not the word CHANGE_ME, which also
# appears in the explanatory comments and would make this check never fire.
if ! grep -q "APIchangeme" livekit.yaml; then
  echo "livekit.yaml is already configured — refusing to overwrite." >&2
  echo "Delete the files and re-copy the templates if you truly want to start over." >&2
  exit 1
fi

# LiveKit keys are arbitrary strings; only the secret needs to be unguessable.
API_KEY="API$(openssl rand -hex 6)"
API_SECRET="$(openssl rand -base64 36 | tr -d '\n=+/' | cut -c1-48)"

echo "Generated key pair:"
echo "  key    $API_KEY"
echo "  secret $API_SECRET"
echo

# Keep originals recoverable in case a substitution goes wrong.
for f in livekit.yaml egress.yaml caddy.yaml; do
  cp "$f" "$f.orig"
done

# livekit.yaml — TURN domain, key pair (twice: keys + webhook), webhook URL.
sed -i \
  -e "s|CHANGE_ME_turn.h-sets.com|${TURN_DOMAIN}|g" \
  -e "s|APIchangeme: changemechangemechangemechangemechangeme|${API_KEY}: ${API_SECRET}|" \
  -e "s|api_key: APIchangeme|api_key: ${API_KEY}|" \
  -e "s|https://CHANGE_ME.h-sets.com/api/livekit/webhook|${APP_URL}/api/livekit/webhook|" \
  livekit.yaml

# egress.yaml — same key pair, or it cannot authenticate to the SFU.
sed -i \
  -e "s|api_key: APIchangeme|api_key: ${API_KEY}|" \
  -e "s|api_secret: changemechangemechangemechangemechangeme|api_secret: ${API_SECRET}|" \
  egress.yaml

# caddy.yaml — both SNI hostnames.
sed -i \
  -e "s|CHANGE_ME_turn.h-sets.com|${TURN_DOMAIN}|g" \
  -e "s|CHANGE_ME_meet.h-sets.com|${MEET_DOMAIN}|g" \
  caddy.yaml

# Check only real settings — the surrounding comments mention CHANGE_ME by name
# to explain each field, and must not count as unfilled values.
if grep -rn CHANGE_ME livekit.yaml egress.yaml caddy.yaml | grep -qv ':[[:space:]]*#'; then
  echo "WARNING: some CHANGE_ME values remain:" >&2
  grep -rn CHANGE_ME livekit.yaml egress.yaml caddy.yaml | grep -v ':[[:space:]]*#' >&2
  exit 1
fi

cat <<DONE

Configuration written. Templates saved as *.orig.

Next:
  1. Open the firewall (see README step 2) — especially UDP 50000-60000.
  2. docker compose up -d
  3. Set these in Vercel (Production + Preview), then redeploy:

LIVEKIT_URL=wss://${MEET_DOMAIN}
LIVEKIT_API_KEY=${API_KEY}
LIVEKIT_API_SECRET=${API_SECRET}

Keep the secret out of git — *.orig and the filled-in files both hold it.
DONE
