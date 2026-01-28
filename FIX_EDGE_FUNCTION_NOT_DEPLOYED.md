# 🚨 Fix: Edge Function Not Deployed

## Problem
Your backend server (Edge Function) isn't deployed to Supabase. The health check is returning a 401 error from Supabase's infrastructure instead of from your Hono app.

## Solution

### Step 1: Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows (with Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
brew install supabase/tap/supabase
```

### Step 2: Login to Supabase

```bash
npx supabase login
```

This will open a browser window. Login and authorize the CLI.

### Step 3: Link Your Project

```bash
npx supabase link --project-ref xyeoogvecvmbuvoczuva
```

When prompted for the database password, enter your Supabase database password.

### Step 4: Deploy the Edge Function

```bash
npx supabase functions deploy make-server-45dc47a9 --project-ref xyeoogvecvmbuvoczuva
```

The CLI will read from `/supabase/functions/server/index.tsx` and deploy it.

### Step 5: Set Environment Variables

Your Edge Function needs these secrets:

```bash
npx supabase secrets set SUPABASE_URL=https://xyeoogvecvmbuvoczuva.supabase.co --project-ref xyeoogvecvmbuvoczuva

npx supabase secrets set SUPABASE_ANON_KEY=<your-anon-key> --project-ref xyeoogvecvmbuvoczuva

npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key> --project-ref xyeoogvecvmbuvoczuva
```

**To get your Service Role Key:**
1. Go to: https://supabase.com/dashboard/project/xyeoogvecvmbuvoczuva/settings/api
2. Copy the `service_role` key (keep this secret!)
3. Use it in the command above

### Step 6: Verify Deployment

Run the debug test again. The health check should now return:
```json
{"status":"ok","timestamp":"2026-01-27T..."}
```

## Alternative: Deploy via Supabase Dashboard

If CLI doesn't work, you can deploy via the dashboard:

1. Go to: https://supabase.com/dashboard/project/xyeoogvecvmbuvoczuva/functions
2. Click "Create a new function"
3. Name it: `make-server-45dc47a9`
4. Copy the contents of `/supabase/functions/server/index.tsx`
5. Paste into the editor
6. Click "Deploy"
7. Set environment variables in Settings > Edge Functions

## Troubleshooting

**Error: "supabase command not found"**
- Make sure you installed the Supabase CLI
- Restart your terminal

**Error: "Invalid project ref"**
- Double-check the project ref: `xyeoogvecvmbuvoczuva`
- Make sure you're logged in: `npx supabase login`

**Error: "Permission denied"**
- Make sure you have owner/admin access to the Supabase project
- Check you're logged in with the correct account
