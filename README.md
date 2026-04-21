# 🤖 JobBot — Automated Job Engine

> **Manu Shukla's personal job automation system.**  
> Fetches, scores, and surfaces the best Full Stack / React / Node.js roles in India — automatically every 6 hours.  
> **100% free to run. No credit card required.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYOUR_USERNAME%2Fjob-engine&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,GEMINI_API_KEY,CRON_SECRET&envDescription=See%20.env.example%20for%20instructions&project-name=job-engine&repository-name=job-engine)

> ⚠️ Replace `YOUR_USERNAME` in the button URL above with your actual GitHub username after uploading.

---

## ⚡ 5-Minute Setup (all free, no credit card)

### Step 1 — Supabase Database (2 min)

1. Go to [supabase.com](https://supabase.com) → **Start your project** (free)
2. New project → name: `job-engine` → set a password → Create
3. Wait ~1 min for it to spin up
4. Go to **SQL Editor** (left sidebar) → paste the entire contents of `supabase-schema.sql` → click **Run**
5. Go to **Settings → API** → copy these 3 values:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon / public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

---

### Step 2 — Free Gemini API Key (1 min)

1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with Google → click **Create API key**
3. Copy the key → this is your `GEMINI_API_KEY`

> **Free tier:** 1,500 requests/day, 15 requests/min. No billing, no credit card.

---

### Step 3 — GitHub (30 sec)

1. Go to [github.com/new](https://github.com/new)
2. Create a new **private** repo called `job-engine`
3. Upload all files from this ZIP (drag & drop the contents)
4. Edit `README.md` line 8: replace `YOUR_USERNAME` with your GitHub username

---

### Step 4 — Deploy to Vercel (2 min)

1. Click the **Deploy with Vercel** button at the top of this README
2. Connect your GitHub account
3. When prompted for environment variables, fill in:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase step above |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase step above |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase step above |
| `GEMINI_API_KEY` | From Google AI Studio step above |
| `CRON_SECRET` | Any string you make up (e.g. `myjobbot2024`) |

4. Click **Deploy** → wait ~2 min
5. ✅ **You have a live URL!** (e.g. `https://job-engine-abc123.vercel.app`)

---

### Step 5 — First Use (30 sec)

1. Open your live URL → click **sign up** → enter email + password
2. You're in. Click **↻ fetch now** on the dashboard
3. Jobs appear in ~30 seconds
4. **Cron runs automatically every 6 hours from now on** — you never need to click fetch again

---

## 🎛 Optional: Adzuna (More India Jobs, Still Free)

1. Register at [developer.adzuna.com](https://developer.adzuna.com) (free, 100 calls/day)
2. Get your `App ID` + `App Key`
3. In Vercel → your project → **Settings → Environment Variables** → add:
   - `ADZUNA_APP_ID`
   - `ADZUNA_APP_KEY`
4. **Redeploy** (Deployments → Redeploy) → Adzuna India jobs now included

---

## 🏗 How It Works

```
Every 6h (Vercel Cron)
┌─────────────────────────────────┐
│  LinkedIn RSS  (India, free)    │
│  Remotive API  (remote, free)   │──▶ Score Engine ──▶ Supabase DB
│  Arbeitnow API (global, free)   │    (0-100 based on
│  Adzuna API    (India, optional)│     your stack + YOE)
└─────────────────────────────────┘          │
                                             ▼
                                    Next.js Dashboard
                                    (login required)
                                             │
                                  Click job → Gemini 1.5 Flash
                                             │
                                    • Resume bullet points
                                    • LinkedIn DM to hiring mgr
                                    • Cover letter
                                             │
                                    Save to Tracker ──▶ Track status
                                    (Applied → OA → Interview → Offer)
```

---

## 💰 Cost Breakdown

| Service | Free Tier | Your Usage |
|---|---|---|
| Vercel | 100GB bandwidth, 2 cron jobs | ~1MB/day ✅ |
| Supabase | 500MB DB, 50k auth users | ~5MB/month ✅ |
| Gemini 1.5 Flash | 1,500 req/day free | ~5-10/day ✅ |
| LinkedIn RSS | Unlimited | Free ✅ |
| Remotive API | Unlimited | Free ✅ |
| Arbeitnow API | Unlimited | Free ✅ |
| Adzuna API | 100 req/day | Free ✅ |
| **Total** | **$0/month** | ✅ |

---

## ✏️ Personalise

**Update your profile** → `app/api/generate/route.ts` → edit `CANDIDATE_PROFILE`  
**Tweak scoring** → `lib/filter-engine.ts` → adjust keyword weights  
**Change cron schedule** → `vercel.json` → edit the cron expression  

---

## 📄 License

Personal use only.
