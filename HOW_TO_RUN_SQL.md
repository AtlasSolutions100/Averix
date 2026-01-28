# 📝 How to Run SQL in Supabase

## Visual Step-by-Step Guide

### Step 1: Open SQL Editor
1. Click this link: **https://supabase.com/dashboard/project/xyeoogvecvmbuvoczuva/sql**
2. You'll see a page that looks like this:
   ```
   [Supabase Logo] Project: xyeoogvecvmbuvoczuva
   
   SQL Editor
   ┌─────────────────────────────────────┐
   │ + New query                         │
   │                                     │
   │ [SQL Editor Window - Empty]         │
   │                                     │
   │                                     │
   │                      [▶ Run] button │
   └─────────────────────────────────────┘
   ```

### Step 2: Copy SQL from File
1. Open the file `/DATABASE_SCHEMA.sql` from your project
2. Select ALL the text (Ctrl+A or Cmd+A)
3. Copy it (Ctrl+C or Cmd+C)

### Step 3: Paste into SQL Editor
1. Click inside the SQL Editor window (the big text area)
2. Paste the SQL (Ctrl+V or Cmd+V)
3. You should now see lots of SQL code starting with:
   ```sql
   -- Averix Database Schema
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE TABLE IF NOT EXISTS offices (
   ...
   ```

### Step 4: Run the SQL
1. Click the green **"Run"** button (or press Ctrl+Enter / Cmd+Enter)
2. Wait 2-3 seconds
3. You should see at the bottom:
   ```
   ✅ Success. No rows returned
   ```

**That's it!** Your database tables are now created. 🎉

---

## What Just Happened?

You created these database tables:
- ✅ `offices` - Stores office information
- ✅ `stores` - Retail locations (Best Buy, Target, etc.)
- ✅ `user_profiles` - User info (name, role, office)
- ✅ `daily_entries` - Daily sales metrics
- ✅ `goals` - Performance goals
- ✅ `rep_store_assignments` - Which reps work at which stores

Plus you got some demo data:
- 🏢 1 office: "Olympus Marketing Group"
- 🏪 4 stores: Best Buy NFW, Best Buy SFW, Target Arlington, Target Terhama

---

## ❌ Troubleshooting

### "Error: relation already exists"
**This is fine!** It means the tables were already created. The SQL uses `IF NOT EXISTS` so it's safe to run multiple times.

### "Error: permission denied"
Make sure you're logged into Supabase and viewing YOUR project (xyeoogvecvmbuvoczuva).

### "Syntax error near line X"
Make sure you copied the ENTIRE file. The SQL has many statements that depend on each other.

---

## ➡️ Next Step: Create Demo Users

Now that your database is set up, follow **[QUICK_START.md](./QUICK_START.md)** Step 2 to create demo users.
