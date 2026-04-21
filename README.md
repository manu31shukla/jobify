# 🤖 JobBot — Automated Job Engine

> **Manu Shukla's personal job automation system.**  
> Fetches, scores, and surfaces the best Full Stack / React / Node.js roles in India — automatically every 6 hours.  
> **100% free to run. No credit card required.**


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


## 📄 License

Personal use only.
