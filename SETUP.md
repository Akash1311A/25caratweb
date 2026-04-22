# 25 Carat Website Setup

## Run Locally

Install dependencies:

```bash
npm install
```

Start frontend and backend:

```bash
npm run dev:full
```

Or run production style:

```bash
npm run build
npm start
```

Open:

```txt
http://127.0.0.1:4000
```

Admin:

```txt
http://127.0.0.1:4000/admin
```

## Environment Variables

Create `.env` locally or set these in your hosting panel:

```bash
PORT=4000
ADMIN_EMAIL=admin@email.com
ADMIN_PASSWORD=strongpassword
JWT_SECRET=randomsecret
```

For production, use a long random `JWT_SECRET` and a strong admin password.

## Database

The app supports two database modes:

1. Supabase, recommended for free hosting.
2. JSON file fallback, useful only for local dev or VPS persistent disk.

### Recommended: Supabase

Create a Supabase project, open SQL Editor, and run:

```sql
create table if not exists app_state (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);
```

Then set:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STATE_TABLE=app_state
SUPABASE_STATE_KEY=main
```

Use the **service role key only on the backend**. Never expose it in frontend code.

### Local JSON Fallback

```bash
DB_PATH=./data/store.json
```

Do not depend on this for free hosts where filesystem is temporary.

## API Routes

Public:

```txt
GET  /api/health
GET  /api/content
GET  /api/products
POST /api/orders
POST /api/enquiry
```

Admin:

```txt
POST  /api/login
PUT   /api/content
PUT   /api/products
GET   /api/orders
PATCH /api/orders/:id/status
GET   /api/enquiry
DELETE /api/enquiries/:id
```

Admin routes require:

```txt
Authorization: Bearer <token>
```

## Frontend API URL

If backend serves frontend, no frontend API variable is needed.

If frontend and backend are on different domains, set while building frontend:

```bash
VITE_API_URL=https://your-backend-domain.com
```

## Deploy-Ready Structure

```txt
project/
  dist/
  server/
  src/
  package.json
  .env
```

Never commit:

```txt
node_modules/
dist/
.env
data/
```

## Production Test

Before deploy:

```bash
npm run build
npm start
```

Check:

```txt
http://127.0.0.1:4000
http://127.0.0.1:4000/admin
http://127.0.0.1:4000/api/health
```
