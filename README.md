# Wine Night — Deploy Guide

## What this is
A blind wine tasting app. Each guest rates 20 wines (1–10 reds, 11–20 whites) on taste, finish, and overall (max 15 pts each). Scores go to a live database. You (the host) watch the leaderboard update in real time.

---

## Deploy in ~5 minutes

### Step 1 — Put the files on GitHub
1. Go to [github.com](https://github.com) and sign in (or create a free account)
2. Click **New repository** → name it `wine-night` → **Create repository**
3. Click **uploading an existing file** and drag in all the files from this zip (keep the folder structure: `api/`, `public/`, `vercel.json`, `package.json`)
4. Click **Commit changes**

### Step 2 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click **Add New Project** → select your `wine-night` repo → click **Deploy**
3. Wait ~60 seconds — Vercel will give you a live URL like `wine-night-abc123.vercel.app`

### Step 3 — Add the database (Vercel KV)
1. In your Vercel project dashboard, click **Storage** in the top nav
2. Click **Create Database** → choose **KV (Redis)** → name it `wine-night-kv` → click **Create**
3. Click **Connect to Project** → select your `wine-night` project → **Connect**
4. Go to **Settings → Environment Variables** in your project and confirm `KV_REST_API_URL` and `KV_REST_API_TOKEN` are present (Vercel adds them automatically)
5. Go to **Deployments** → click the three dots on your latest deployment → **Redeploy**

### Step 4 — Share the link
Your app is live. Share the Vercel URL with all your guests. Everyone opens the same link — tasters tap "I'm tasting," you tap "Host view."

---

## Reset scores between events
In your Vercel KV dashboard, click **CLI** and run:
```
del winenight:submissions
del winenight:names
```
Or go to the **Data** tab and delete the keys manually.

---

## Troubleshooting
- **Scores not saving?** Make sure the KV database is connected and you redeployed after connecting it.
- **Already submitted message showing wrong?** Names are matched case-insensitively. "Sarah" and "sarah" are the same person.
- **Want to change wine count?** Edit the loops in `public/index.html` and `api/scores.js` — search for `<= 20` and `<= 10`.
