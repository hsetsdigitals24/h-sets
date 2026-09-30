# H-SETS Video Infrastructure — Deployment & Domain Design

Self-hosted LiveKit for class calls, project meetings, company standups and
guest rooms. Replaces LiveKit Cloud with no application code changes.

**Audience:** whoever provisions or maintains the video host.
**Prerequisite:** a VPS you control, and DNS control over `h-sets.com`.

---

## 1. The three names, at a glance

| Hostname | Points at | Serves | Who terminates TLS |
|---|---|---|---|
| `h-sets.com` | Vercel | The Next.js application | Vercel |
| `meet.h-sets.com` | Your VPS | LiveKit signalling (`wss://`) | Caddy, on the VPS |
| `turn.h-sets.com` | Your VPS | TURN/TLS media relay | Caddy, on the VPS |

Two of these are new. The rest of this document explains why each exists,
why they cannot be collapsed into fewer names, and what breaks if they are.

---

## 2. Why the video server needs its own hostname at all

The application lives on Vercel. The SFU cannot.

LiveKit is a long-lived stateful process holding WebRTC peer connections and a
UDP media path. Vercel runs stateless functions with a request/response
lifecycle. Even with Vercel's WebSocket support, there is no way to run an SFU
there: it needs raw UDP on a wide port range, which no serverless platform
exposes.

So the video server is a separate machine, and a separate machine needs a
separate name. The question is only *which* name.

**Why not a path on the app's domain** (`h-sets.com/livekit`)? Path routing
requires something in front that understands paths — an HTTP proxy. Vercel would
have to reverse-proxy the WebSocket to your VPS, which adds a hop, breaks the
direct connection LiveKit's reconnect logic assumes, and does nothing at all for
TURN, which is not HTTP and cannot be path-routed. The media path would still
need its own public address, so you would end up with an extra hostname anyway,
plus a fragile proxy.

**Why a subdomain rather than a separate domain** (`hsets-video.com`)? Nothing
technical forbids it, but a subdomain inherits the organisational trust of the
main domain, costs nothing extra, and keeps renewal in one place. Users see
`meet.h-sets.com` in browser permission prompts and connection errors; an
unrelated domain there looks like a third party and invites support tickets.

---

## 3. Why `meet` and `turn` must be two names, not one

This is the one choice that is a hard functional requirement rather than a
preference, and it is the one most often "simplified" into an outage.

Both services must be reachable on **port 443**, for reasons in §4. But two
different protocols cannot share a port unless something can tell them apart.
Caddy distinguishes them by **SNI** — the hostname the client announces during
the TLS handshake, before any application data flows:

```
client → 443 ─┬─ SNI "turn.h-sets.com" + ALPN stun.turn → TURN relay (:5349)
              └─ SNI "meet.h-sets.com"                   → LiveKit signal (:7880)
```

The hostname *is* the routing key. With one name, an arriving connection is
ambiguous: Caddy cannot know whether the bytes after the handshake are a
WebSocket upgrade or a STUN binding request, and one of the two services becomes
unreachable.

This is why `caddy.yaml` uses the `livekit/caddyl4` image rather than stock
Caddy — the `layer4` module does SNI-based routing for non-HTTP protocols.
Stock Caddy can only route HTTP.

### Could TURN just use a different port?

Partly. TURN also listens on **3478/UDP**, which is open and is the fast relay
path whenever the network permits it.

Its **5349/TCP** listener is *not* public and must not be. Because
`livekit.yaml` sets `external_tls: true`, LiveKit expects Caddy to have already
terminated TLS, so 5349 speaks **plaintext** TURN — reachable only over
loopback, from Caddy. Opening it in the firewall would expose an unencrypted
relay on a port clients assume is TLS.

So the only TLS-protected TURN path is the one on 443, and §4 explains why that
path must exist. Once TURN is on 443 alongside signalling, the second hostname
is forced.

---

## 4. Why everything is on port 443

LiveKit's default ports are 7880 (signalling), 7881 (TCP media), 3478 (TURN/UDP)
and 50000-60000 (UDP media). On an open network these are the fast path and are
what most participants will use.

On a restricted network, all of them are blocked. Corporate firewalls, hotel
and hospital Wi-Fi, and many Nigerian office networks permit outbound 443 and
little else — and to such a firewall, TURN/TLS on 443 is indistinguishable from
ordinary HTTPS.

This is not hypothetical for H-SETS. The Corporate Training module
(`/academy/corporate`) sells private cohorts delivered to employees *inside
corporate networks*. A staff member of a client bank who cannot join a session
is a failed contract, not a support ticket. The 443 path is what makes that
work, at the cost of relaying media through the VPS instead of peer-to-peer.

**Order of preference, automatic, per participant:**

1. Direct UDP on 50000-60000 — best quality, lowest server load
2. TURN over UDP on 3478 — relayed, still efficient
3. TURN over TLS on 443 — always works, highest server bandwidth cost

Most users get #1. The point of #3 is that nobody is ever fully excluded.

> **Consequence for capacity:** every participant forced to #3 consumes VPS
> bandwidth for their entire call. A cohort behind a strict corporate firewall
> is far more expensive to serve than the same cohort at home.

---

## 5. Why `meet` and `turn` specifically

Both are free choices. The reasoning, should you want to change them:

**`meet`** — describes the function, not the vendor. `livekit.h-sets.com` would
leak an implementation detail into a name that is expensive to change later: it
appears in every issued TLS certificate, in browser error messages, and in
`LIVEKIT_URL` across every environment. If you ever replace LiveKit, a
vendor-named host is either misleading or a migration. `meet` survives that.

**`turn`** — here the protocol name *is* the right name. Unlike `meet`, TURN is
an IETF standard (RFC 5766), not a product, so the name cannot go stale. It is
also a recognised convention that tells a future engineer exactly what the host
does.

**Avoid:** `video` (ambiguous with VOD/recordings), `rtc` (jargon), `api`
(already means the Next.js API routes), and anything with a region or number
until you actually run more than one node.

### If you later run more than one SFU

Name them `meet-fra.h-sets.com`, `meet-lag.h-sets.com` by region, keeping `meet`
as the stable prefix. Do not renumber an existing host: `meet.h-sets.com` should
stay valid forever, as the first node or as an alias to the nearest one.

---

## 6. The application URL, and the redirect trap

`livekit.yaml` carries a webhook URL:

```yaml
webhook:
  urls:
    - https://h-sets.com/api/livekit/webhook
```

This must be **the exact URL Vercel serves with a 200** — not one that redirects
to it.

If the project canonicalises apex → `www` (or the reverse), LiveKit's POST
receives a 308 and stops. **LiveKit does not follow redirects on webhooks.**

The failure is silent and badly disguised. Calls work. Video works. Recording
starts and stops. But `participant_joined` and `participant_left` never arrive,
so:

- no student is ever marked present — the attendance feature appears "broken"
  with no error anywhere
- `room_finished` never arrives, so recordings stay stuck in `PROCESSING`
  until the reconciliation path in `finalizeInFlightRecordings()` heals them

Confirm which form is canonical before deploying:

```bash
curl -sI https://h-sets.com | head -3
curl -sI https://www.h-sets.com | head -3
```

Pass whichever returns `200` as the third argument to `setup.sh`.

---

## 7. Names that are deliberately *not* public

Inside the box, services address each other by loopback:

| In config | Value | Why not the public name |
|---|---|---|
| `egress.yaml` → `ws_url` | `ws://127.0.0.1:7880` | Egress and the SFU are on the same host. Going out via `meet.h-sets.com` would exit to the internet, re-enter through Caddy, and re-negotiate TLS — adding latency and a hairpin-NAT dependency for a connection that never needed to leave the machine. |
| `egress.yaml` → `redis.address` | `127.0.0.1:6379` | Same reasoning, plus Redis is bound to loopback and has no auth. It must never be reachable publicly. |
| `livekit.yaml` → `redis.address` | `127.0.0.1:6379` | Must be the *same* Redis as egress — that is how egress discovers rooms. |

`insecure: true` in `egress.yaml` looks alarming and is correct: it refers only
to that loopback connection, which never crosses the network.

### Why `use_external_ip: true`

A cloud VM sees only its private IP. ICE candidates built from that address are
unreachable, so every call would silently fall back to TURN relay — working, but
slow and expensive. This setting makes LiveKit discover and advertise the public
IP instead.

---

## 8. DNS configuration

Two A records, both to the same VPS IP:

```
meet.h-sets.com.  A  <vps-ip>
turn.h-sets.com.  A  <vps-ip>
```

**If your DNS is on Cloudflare, both must be DNS-only (grey cloud).**

Cloudflare's proxy handles HTTP. It does not pass WebRTC media or TURN, and it
terminates TLS itself — which destroys the SNI routing in §3. A proxied record
produces calls that connect and then have no audio or video: a failure that
looks like a LiveKit bug and is not.

The apex `h-sets.com` stays pointed at Vercel and may be proxied as before. It
carries no media.

### Certificates

Caddy obtains one certificate per hostname from Let's Encrypt via HTTP-01,
which requires **port 80 open and DNS resolving before first boot**. Both must
be true or issuance fails and Caddy retries with backoff while nothing works.

Renewal is automatic. A wildcard (`*.h-sets.com`) would work but needs DNS-01
and an API token for your DNS provider — more moving parts for no benefit at two
hostnames.

---

## 9. Deployment

```bash
# 1. DNS first — verify before proceeding
dig +short meet.h-sets.com turn.h-sets.com

# 2. On the VPS
curl -fsSL https://get.docker.com | sh

# 3. Copy the templates up, FROM THE REPOSITORY ROOT on your workstation.
#    The scp path is relative -- running this from your home directory fails
#    with: stat local "deploy/livekit/docker-compose.yaml": No such file.
#    Copy all five: setup.sh in step 4 edits them in place, on the VPS.
cd /path/to/h_sets                       # the repository root
VPS=root@<vps-ip>
ssh "$VPS" 'mkdir -p /opt/livekit'
scp deploy/livekit/{docker-compose,caddy,livekit,egress}.yaml \
    deploy/livekit/setup.sh "$VPS":/opt/livekit/

# 4. Configure, on the VPS — generates the key pair and fills in all three
#    names across caddy.yaml, livekit.yaml and egress.yaml.
ssh "$VPS"
cd /opt/livekit
chmod +x setup.sh
./setup.sh meet.h-sets.com turn.h-sets.com https://h-sets.com

# 5. Firewall (and the same in your provider's cloud firewall panel).
#    Allow SSH FIRST: `ufw enable` on a VPS with no SSH rule locks you out.
ufw allow OpenSSH
ufw allow 80,443,7881/tcp
ufw allow 3478/udp
ufw allow 50000:60000/udp
ufw enable

# 6. Boot
docker compose up -d && docker compose logs -f
```

TURN's 5349 is deliberately absent from those rules — see §3. If you later edit
`caddy.yaml` by hand on the VPS, apply it with
`docker compose restart caddy && docker compose logs --tail=60 caddy`; a bad
`layer4` block makes Caddy exit rather than start with the old config.

Then set the three values `setup.sh` prints in Vercel, Production **and**
Preview, and redeploy:

```
LIVEKIT_URL=wss://meet.h-sets.com
LIVEKIT_API_KEY=<generated>
LIVEKIT_API_SECRET=<generated>
```

Leave `ATTENDANCE_MIN_SECONDS` and every `R2_*` variable untouched — egress
uploads to the same bucket and playback is unchanged.

---

## 10. Verification

In order; each step depends on the one before it.

| # | Check | Proves |
|---|---|---|
| 1 | `curl -s https://meet.h-sets.com/` returns `OK` | DNS, certificate, Caddy routing |
| 2 | Two browsers join a project meeting, both see video | SFU, tokens, UDP media |
| 3 | "N in call" badge appears on `/admin/projects` | `RoomServiceClient` over the REST path |
| 4 | Student joins a class past `ATTENDANCE_MIN_SECONDS`, leaves, is marked present | **Webhook reachability — §6** |
| 5 | Record, stop, row reaches `READY`, MP4 plays | Egress, Redis, R2 upload |
| 6 | Mute *and unmute* another participant | `enable_remote_unmute` (see §11) |
| 7 | Join from a mobile hotspot with a VPN active | TURN/TLS path, `turn.h-sets.com` |

Step 4 is the one to dwell on. It is the only check that exercises the
inbound path from LiveKit to the app, and the failure in §6 is invisible
everywhere else.

---

## 11. Behaviour that changes versus LiveKit Cloud

`room.enable_remote_unmute: true` is set in `livekit.yaml`. LiveKit Cloud does
not expose this setting, so `muteParticipantMic(..., muted=false)` in
`src/lib/livekit.ts` always returned `unmute-blocked`, and the UI fell back to
*asking* the participant to unmute themselves.

Self-hosted, that call succeeds. Once step 6 above passes, the `unmute-blocked`
branch is unreachable and can be removed.

Everything else — tokens, data channels (reactions, raised hands), participant
attributes, egress, webhooks, presence — is byte-for-byte the same software
Cloud runs. LiveKit is Apache 2.0; Cloud sells hosting, not a different server.

---

## 12. Operating notes

**Sizing.** SFU alone: 4 vCPU / 8 GB serves roughly 100-200 concurrent
participants. Egress: budget **~4 cores and ~2 GB RAM per concurrent
recording** on top. Exceeding it corrupts recordings rather than queuing them —
`room_composite_cpu_cost` in `egress.yaml` is the limiter.

**Region.** Choose one close to users. Falkenstein or Nuremberg are the usual
picks for Nigerian traffic; avoid US regions, which add ~150ms each way.

**Runaway recordings.** A recording bills CPU for as long as it runs.
`room.empty_timeout: 300` closes idle rooms after five minutes, which is the
backstop. Audit periodically:

```sql
SELECT id, "roomName", status, "startedAt"
FROM "Recording"
WHERE status IN ('STARTING','ACTIVE','PROCESSING')
  AND "startedAt" < now() - interval '4 hours';
```

**Upgrades.** Pin explicit image versions in production rather than `latest`; a
surprise SFU upgrade mid-cohort is a poor way to discover a regression.

**Backups.** None needed here. Redis is coordination only, recordings live in
R2, and all metadata is in Postgres. The box is disposable — rebuilding it is
re-running §9.

**Secrets.** `livekit.yaml` and `egress.yaml` hold the API secret once
configured, as do the `*.orig` backups. Both are gitignored. The repository
copies must stay as `CHANGE_ME` templates.
