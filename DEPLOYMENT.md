# 25 Carat Full-Stack Deployment

## What This Project Runs

- Frontend: React + Vite
- Backend: Node.js HTTP API
- Database: Supabase recommended, `data/store.json` local fallback
- Admin auth: signed token login

## Local Development

Run API and frontend together:

```bash
npm run dev:full
```

Or run separately:

```bash
npm run dev:api
npm run dev
```

Frontend dev URL:

```txt
http://127.0.0.1:3000
```

API URL:

```txt
http://127.0.0.1:4000
```

## Production Build

```bash
npm run build
npm start
```

The Node server serves both:

- Website from `dist`
- API from `/api`

Production URL:

```txt
http://your-domain.com
```

## Important Environment Variables

Set these before deployment:

```bash
PORT=4000
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=strong-password
JWT_SECRET=long-random-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STATE_TABLE=app_state
SUPABASE_STATE_KEY=main
```

For local fallback or VPS persistent storage:

```bash
DB_PATH=/persistent/path/store.json
```

Then attach a Railway Volume mounted at:

```txt
/app/data
```

For hosting providers with separate frontend/backend domains, set this while building frontend:

```bash
VITE_API_URL=https://your-api-domain.com
```

If backend serves the frontend, you do not need `VITE_API_URL`.

## Supabase Setup

Run this SQL in Supabase:

```sql
create table if not exists app_state (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);
```

Use `SUPABASE_SERVICE_ROLE_KEY` only on the backend hosting panel.

## Render Free Deploy Checklist

- Push this project to GitHub:

```bash
git init
git remote add origin https://github.com/Akash1311A/25caratweb.git
git add .
git commit -m "Prepare full-stack deployment"
git branch -M main
git push -u origin main
```

- In Railway, create a new project from GitHub.
- For free hosting, use Render Web Service from GitHub.
- Select `Akash1311A/25caratweb`.
- Build command:

```bash
npm ci && npm run build
```

- Start command:

```bash
npm start
```

- Change default admin credentials.
- Set a strong `JWT_SECRET`.
- Set Supabase environment variables.
- Run `npm run build`.
- Start server with `npm start`.
- Test `/api/health`.
- Login to `/admin`.
- Edit one product and refresh storefront to confirm backend save.

## Current Admin Login For Local Testing

```txt
Email: admin@25carat.local
Password: admin123
```

Change these before going live.
