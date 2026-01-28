# 🎯 START HERE - Averix Setup

## Your app won't work until you complete these 2 steps!

---

## ⚠️ Current Status: Database Not Set Up

Your demo login buttons will fail with **"Invalid login credentials"** because:
- ❌ Database tables don't exist yet
- ❌ Demo users haven't been created

**Fix this in 5 minutes:**

---

## 📋 Setup Checklist

### ✅ STEP 1: Create Database (2 minutes)

**What to do:**
1. Open: https://supabase.com/dashboard/project/xyeoogvecvmbuvoczuva/sql
2. Copy everything from `/DATABASE_SCHEMA.sql`
3. Paste into SQL Editor
4. Click "Run"

**Detailed guide:** See [HOW_TO_RUN_SQL.md](./HOW_TO_RUN_SQL.md)

---

### ✅ STEP 2: Create Demo Users (3 minutes)

**What to do:**
1. Open: https://supabase.com/dashboard/project/xyeoogvecvmbuvoczuva/auth/users
2. Click "Add user" → "Create new user"
3. Create these users:
   - `owner@olympus.com` / password: `demo`
   - `jake@olympus.com` / password: `demo`
   - `sarah@olympus.com` / password: `demo`
   - `mike@olympus.com` / password: `demo`
4. Copy each user's ID
5. Run SQL to create profiles (see QUICK_START.md Step 2.2)

**Detailed guide:** See [QUICK_START.md](./QUICK_START.md) Step 2

---

## 🎉 After Setup

Once you've completed both steps, the demo login buttons will work:

**Owner Dashboard:**
- Email: `owner@olympus.com`
- Password: `demo`
- See: Office-wide metrics, rep leaderboard, store analytics

**Rep Dashboard:**
- Email: `jake@olympus.com`
- Password: `demo`
- See: Personal stats, daily entry form, store history

---

## 📚 All Available Guides

Choose the one that works for you:

1. **[QUICK_START.md](./QUICK_START.md)** ⭐ RECOMMENDED
   - Simple step-by-step
   - 5 minutes total
   - Copy-paste SQL included

2. **[HOW_TO_RUN_SQL.md](./HOW_TO_RUN_SQL.md)**
   - Visual guide
   - Screenshots of what to expect
   - Troubleshooting tips

3. **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**
   - Detailed explanations
   - 15-20 minutes
   - For understanding how everything works

4. **[CREATE_DEMO_USERS.sql](./CREATE_DEMO_USERS.sql)**
   - SQL file with instructions
   - For creating user profiles

---

## 🆘 Getting Errors?

### "Multiple GoTrueClient instances"
- This is a warning, not an error
- It's already been fixed in the code
- Ignore it or refresh the page

### "Invalid login credentials"
- You haven't created the demo users yet
- Follow STEP 2 above

### "Failed to fetch user"
- The user exists in Auth but not in the database
- **See: [TROUBLESHOOTING_FAILED_TO_FETCH_USER.md](./TROUBLESHOOTING_FAILED_TO_FETCH_USER.md)** for the fix
- Quick fix: Run the user profile INSERT SQL queries

### "Failed to resolve import"
- The app should work now
- Try refreshing the page

---

## ✅ Ready to Go!

After setup, your Averix dashboard will have:
- 🏢 1 Office (Olympus Marketing Group)
- 🏪 4 Stores (Best Buy NFW, Best Buy SFW, Target Arlington, Target Terhama)
- 👤 1 Owner (Alex Thompson)
- 👥 3 Reps (Jake, Sarah, Mike)

**Let's get started! 🚀**