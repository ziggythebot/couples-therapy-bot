# Deployment Guide

## Services

| Service | Platform | Env vars needed |
|---|---|---|
| `apps/session-api` | Railway | `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `S3_*` (optional) |
| `services/ingress-processor` | Railway | `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `OPENAI_API_KEY`, `MEMORY_ROOT`, `INGRESS_PORT` |
| `apps/intake-web` | Vercel | `SESSION_API_URL` |
| `services/agent-worker` | LiveKit Cloud | Already deployed — use `lk agent update-secrets` |

---

## session-api → Railway

```bash
# From repo root
railway login
railway init          # link or create project
railway up --service session-api --source apps/session-api
```

Set env vars in Railway dashboard or:
```bash
railway variables set LIVEKIT_URL=wss://couples-ernf7w3e.livekit.cloud
railway variables set LIVEKIT_API_KEY=APIeoEfRdUXZYRc
railway variables set LIVEKIT_API_SECRET=<secret>
```

---

## ingress-processor → Railway

```bash
railway up --service ingress-processor --source services/ingress-processor
```

Then configure the LiveKit webhook in your LiveKit Cloud dashboard:
- URL: `https://<your-ingress-processor>.up.railway.app/webhook/livekit`
- Events: `room_finished`, `egress_ended`

---

## intake-web → Vercel

```bash
cd apps/intake-web
vercel deploy --prod
```

Set `SESSION_API_URL` to your Railway session-api URL in Vercel dashboard.

---

## agent-worker — add remaining secrets

```bash
lk agent update-secrets \
  --url wss://couples-ernf7w3e.livekit.cloud \
  --api-key APIeoEfRdUXZYRc \
  --api-secret <secret> \
  "OPENAI_API_KEY=sk-...,TAVUS_API_KEY=...,TAVUS_REPLICA_ID=...,TAVUS_PERSONA_ID=..."
```

---

## Tavus persona setup (required for avatar)

In Tavus dashboard, create a persona with:
```json
{
  "pipeline_mode": "echo",
  "layers": {
    "transport": {
      "transport_type": "livekit"
    }
  }
}
```

Copy the `persona_id` → add as `TAVUS_PERSONA_ID` secret on the agent.
