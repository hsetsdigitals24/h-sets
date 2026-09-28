# Self-hosted LiveKit for H-SETS

Replaces LiveKit Cloud. **No application code changes** — only three
environment variables move.

**→ Read [DEPLOYMENT.md](./DEPLOYMENT.md)** for the full runbook, the domain
design and the reasoning behind each choice.

## Files

| File | Purpose |
|---|---|
| `DEPLOYMENT.md` | The runbook. Start here. |
| `setup.sh` | Generates keys and fills in your domains across the configs |
| `docker-compose.yaml` | SFU + Redis + Egress + Caddy |
| `livekit.yaml` | SFU config — TURN, webhook, room timeouts |
| `egress.yaml` | Recording service — talks to the SFU over loopback |
| `caddy.yaml` | TLS + SNI routing for `wss://` and TURN on 443 |

## Quick start

```bash
# DNS must resolve to the VPS first, or certificate issuance fails
./setup.sh meet.h-sets.com turn.h-sets.com https://h-sets.com
docker compose up -d
```

Then set the printed `LIVEKIT_URL` / `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET`
in Vercel and redeploy.

The committed `*.yaml` files are templates holding `CHANGE_ME` placeholders.
Once `setup.sh` runs they contain the API secret — never commit the filled-in
versions.
