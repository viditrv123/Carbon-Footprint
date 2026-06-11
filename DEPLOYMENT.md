# Deployment Guide

- **Frontend** → [Vercel](https://vercel.com) (Next.js)
- **Backend** → [Render](https://render.com) (NestJS + PostgreSQL)

---

## Part 1 — Backend on Render

### Step 1 · Create a PostgreSQL database

1. Go to [render.com](https://render.com) → **New +** → **PostgreSQL**
2. Fill in:
   | Field | Value |
   |-------|-------|
   | Name | `carbon-footprint-db` |
   | Region | closest to your users |
   | Plan | **Free** (or Starter for production) |
3. Click **Create Database**
4. Once created, open the database page and copy the **Internal Database URL**  
   (looks like `postgresql://user:pass@dpg-xxx.oregon-postgres.render.com/carbon_footprint`)  
   > ⚠️ Use the **Internal** URL when both the DB and API are on Render. Use External only for local migration runs.

---

### Step 2 · Create the API Web Service

1. **New +** → **Web Service**
2. Connect your GitHub repo (or paste the public URL)
3. Configure:

   | Field | Value |
   |-------|-------|
   | **Name** | `carbon-footprint-api` |
   | **Region** | same as your database |
   | **Branch** | `main` |
   | **Root Directory** | *(leave blank — monorepo root)* |
   | **Runtime** | `Node` |
   | **Build Command** | see below |
   | **Start Command** | see below |

   **Build Command:**
   ```bash
   npm install && cd apps/api && npx prisma generate && npx nest build
   ```

   **Start Command:**
   ```bash
   node apps/api/dist/main.js
   ```

4. Scroll down to **Advanced** → **Add Pre-Deploy Command** (runs before each deploy):
   ```bash
   cd apps/api && npx prisma migrate deploy
   ```
   > This automatically applies pending migrations on every deploy — safe in production.

---

### Step 3 · Set environment variables on Render

In the Web Service → **Environment** tab, add:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Internal URL from Step 1 |
| `JWT_SECRET` | random 64-char string (see generator below) |
| `JWT_REFRESH_SECRET` | different random 64-char string |
| `JWT_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `API_PREFIX` | `api/v1` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | your Vercel URL (add after Part 2, e.g. `https://carbon-footprint.vercel.app`) |

**Generate secure secrets** (run locally):
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Run twice — once for `JWT_SECRET`, once for `JWT_REFRESH_SECRET`.

---

### Step 4 · Deploy

Click **Create Web Service**. Render will:
1. Clone the repo
2. Run `npm install`
3. Generate Prisma client
4. Build NestJS (`dist/`)
5. Run `prisma migrate deploy`
6. Start the server

Your API will be live at:
```
https://carbon-footprint-api.onrender.com/api/v1
https://carbon-footprint-api.onrender.com/docs   ← Swagger UI
```

> **Free tier note:** Render free services spin down after 15 min of inactivity. The first request after sleep takes ~30 s. Upgrade to Starter ($7/mo) to avoid cold starts.

---

## Part 2 — Frontend on Vercel

### Step 1 · Import the project

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. On the **Configure Project** screen, set:

   | Field | Value |
   |-------|-------|
   | **Framework Preset** | Next.js *(auto-detected)* |
   | **Root Directory** | `apps/web` |
   | **Build Command** | `npm run build` *(default)* |
   | **Output Directory** | `.next` *(default)* |
   | **Install Command** | `cd ../.. && npm install` |

   > The install command goes to the **monorepo root** so all workspace packages are installed before Next.js builds.

---

### Step 2 · Set environment variables on Vercel

In **Environment Variables**, add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://carbon-footprint-api.onrender.com/api/v1` |

That's the only variable needed for the frontend.

---

### Step 3 · Deploy

Click **Deploy**. Vercel will:
1. Run `npm install` at the monorepo root
2. Build Next.js from `apps/web`
3. Deploy globally via Vercel's CDN

Your site will be live at:
```
https://carbon-footprint.vercel.app
```

---

### Step 4 · Update CORS on Render

Go back to Render → your API service → **Environment** tab and update:

| Key | Value |
|-----|-------|
| `FRONTEND_URL` | `https://carbon-footprint.vercel.app` |

Then **Manual Deploy → Deploy latest commit** (or it redeploys automatically on next push).

---

## Part 3 · Seed the database (optional)

After the API is live, seed the demo user by running this locally against your production DB:

```bash
# In your .env, temporarily set DATABASE_URL to the External URL from Render
npm run db:seed
```

Or via Render's **Shell** tab in the Web Service:
```bash
cd apps/api && npx ts-node prisma/seed.ts
```

---

## Part 4 · Custom domains (optional)

### Vercel
Settings → Domains → Add `yourdomain.com`  
Update your DNS: `A 76.76.21.21` or `CNAME cname.vercel-dns.com`

### Render
Settings → Custom Domains → Add `api.yourdomain.com`  
Update your DNS: `CNAME carbon-footprint-api.onrender.com`

Then update `FRONTEND_URL` and `NEXT_PUBLIC_API_URL` to use the custom domains.

---

## Checklist

```
RENDER
  ☐ PostgreSQL database created
  ☐ Web Service created with correct build/start commands
  ☐ Pre-deploy command set (prisma migrate deploy)
  ☐ All env vars set (DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, ...)
  ☐ First deploy succeeded, /docs is accessible

VERCEL
  ☐ Project imported with Root Directory = apps/web
  ☐ Install command = cd ../.. && npm install
  ☐ NEXT_PUBLIC_API_URL set to Render API URL
  ☐ Site loads at vercel.app URL

FINAL
  ☐ FRONTEND_URL on Render updated to Vercel URL
  ☐ Login / register works end-to-end
  ☐ Dashboard loads data from the API
```

---

## Environment variable summary

### Render (API)
```env
DATABASE_URL=postgresql://...          # From Render Postgres (Internal URL)
JWT_SECRET=<64-char-random>
JWT_REFRESH_SECRET=<64-char-random>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
API_PREFIX=api/v1
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

### Vercel (Web)
```env
NEXT_PUBLIC_API_URL=https://carbon-footprint-api.onrender.com/api/v1
```
