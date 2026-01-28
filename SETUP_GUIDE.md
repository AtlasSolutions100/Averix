# Averix Setup Guide
## Complete Instructions to Make Your Dashboard Fully Operational

---

## 🎯 Overview

This guide will walk you through setting up the complete Averix dashboard with:
- Real Supabase database
- User authentication
- Data persistence
- Full LOA tracking functionality

**Estimated Time:** 15-20 minutes

---

## ✅ Step 1: Set Up Your Supabase Database (5 minutes)

### 1.1 Access Your Supabase SQL Editor

1. Go to: `https://supabase.com/dashboard/project/xyeoogvecvmbuvoczuva/sql`
2. Click "New Query" or use the existing SQL editor

### 1.2 Create Database Tables

1. Copy the ENTIRE contents of `/DATABASE_SCHEMA.sql` (this file is in your project root)
2. Paste it into the Supabase SQL Editor
3. Click "Run" (or press Ctrl/Cmd + Enter)
4. You should see: ✅ **Success. No rows returned**

This creates:
- ✅ 6 tables (offices, stores, user_profiles, daily_entries, goals, rep_store_assignments)
- ✅ Indexes for performance
- ✅ Row Level Security policies
- ✅ Sample office and store data

---

## ✅ Step 2: Create Demo User Accounts (5 minutes)

### 2.1 Create Owner Account

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" → "Create new user"
3. Fill in:
   - Email: `owner@olympus.com`
   - Password: `demo123` (or your choice)
   - Auto Confirm User: ✅ **CHECKED**
4. Click "Create user"
5. **COPY THE USER ID** (looks like: `a1b2c3d4-e5f6-...`)

### 2.2 Create Owner Profile

1. Go back to SQL Editor
2. Run this query (replace `YOUR_USER_ID` with the ID you copied):

```sql
INSERT INTO user_profiles (id, email, name, role, office_id)
VALUES (
  'YOUR_USER_ID',
  'owner@olympus.com',
  'Olympus Marketing',
  'owner',
  '00000000-0000-0000-0000-000000000001'
);
```

### 2.3 Create Rep Account

1. Authentication → Users → Add User
2. Fill in:
   - Email: `jake@olympus.com`
   - Password: `demo123`
   - Auto Confirm User: ✅ **CHECKED**
3. Copy the new user ID
4. Run in SQL Editor:

```sql
INSERT INTO user_profiles (id, email, name, role, office_id)
VALUES (
  'JAKES_USER_ID',
  'jake@olympus.com',
  'Jake Reynolds',
  'rep',
  '00000000-0000-0000-0000-000000000001'
);
```

### 2.4 Create More Reps (Optional)

Repeat step 2.3 for additional reps:
- `sarah@olympus.com` → Sarah Kim
- `marcus@olympus.com` → Marcus Lewis
- etc.

---

## ✅ Step 3: Test the Application (3 minutes)

### 3.1 Login as Owner

1. Open your Averix application
2. Click "Owner: owner@olympus.com / demo"
3. You should see the owner dashboard!

### 3.2 Login as Rep

1. Logout (or use incognito window)
2. Click "Rep: jake@olympus.com / demo"
3. You should see the rep mobile dashboard with daily entry form

### 3.3 Submit a Test Entry

1. As Jake (rep), go to "Daily Entry"
2. Select a store (e.g., "Best Buy NFW")
3. Fill in some numbers:
   - Stops: 100
   - Contacts: 40
   - Presentations: 20
   - Sales: 5
   - Revenue: 600
4. Click "Submit Day"
5. You should see: ✅ **"Daily entry saved successfully!"**

### 3.4 Verify Data Persistence

1. Refresh the page
2. Your data should still be there!
3. Go to Supabase → Table Editor → `daily_entries`
4. You should see your entry in the database

---

## ✅ Step 4: Verify Analytics (2 minutes)

### 4.1 Check Owner Dashboard

1. Login as owner
2. Navigate to different tabs:
   - **Dashboard**: Should show office-wide metrics
   - **Reps**: Should list all reps
   - **Stores**: Should show store cards
   - **LOA Analyzer**: Should display funnel metrics

### 4.2 Submit More Data

To see real analytics:
1. Login as different reps
2. Submit entries for different days
3. Vary the stores and metrics
4. Go back to owner dashboard to see aggregated data

---

## 🔐 Step 5: Security & Production Setup (Optional)

### 5.1 Change Default Passwords

For production use:
1. Go to Authentication → Users
2. For each user, click "..." → "Reset Password"
3. Send password reset emails to real users

### 5.2 Enable Email Confirmations

1. Go to Authentication → Settings
2. Configure email templates
3. Set up SMTP (or use Supabase's email service)
4. Disable "Auto Confirm User" for new signups

### 5.3 Configure Row Level Security

The database schema already includes RLS policies, but you can customize:

```sql
-- Example: Allow only owners to view all entries
CREATE POLICY "Owners can view all entries"
  ON daily_entries FOR SELECT
  USING (
    office_id IN (
      SELECT office_id FROM user_profiles 
      WHERE id = auth.uid() AND role = 'owner'
    )
  );
```

---

## 🎨 Step 6: Customize for Your Organization

### 6.1 Add Your Office

```sql
INSERT INTO offices (name, location) VALUES
  ('Your Office Name', 'Your City, State');
```

### 6.2 Add Your Stores

```sql
-- Get your office_id first
SELECT id FROM offices WHERE name = 'Your Office Name';

-- Then insert stores
INSERT INTO stores (office_id, name, brand, location) VALUES
  ('your-office-id', 'Best Buy Location 1', 'Best Buy', 'City Name'),
  ('your-office-id', 'Target Location 1', 'Target', 'City Name');
```

### 6.3 Add Your Team

Use the process from Step 2 to create accounts for your entire team.

---

## 📊 What's Working Now

After completing this setup, you have:

✅ **Full Authentication**
- Secure login/logout
- Role-based access (Owner vs Rep)
- Session persistence

✅ **Data Persistence**
- Daily entries saved to database
- Real-time data retrieval
- Historical tracking

✅ **LOA Tracking**
- Complete funnel: Stops → Contacts → Presentations → Address Checks → Credit Checks → Sales
- Auto-calculated conversion rates
- Revenue tracking

✅ **Analytics**
- Office-wide metrics
- Rep leaderboards
- Store performance
- Trend analysis

✅ **Mobile-Optimized**
- Rep daily entry form works perfectly on phones
- Touch-friendly inputs
- Responsive design

---

## 🚀 Next Steps: Advanced Features

### Phase 2 Features (Can implement next):

1. **Real-time Dashboard Updates**
   - Live data refresh
   - Websocket connections

2. **Goal Tracking**
   - Set monthly/weekly targets
   - Progress indicators
   - Achievement notifications

3. **Advanced Analytics**
   - Predictive modeling
   - Trend forecasting
   - A/B testing different stores

4. **Rep Store Assignments**
   - Schedule reps to stores
   - Track assignment history
   - Calendar integration

5. **Reports & Exports**
   - PDF report generation
   - CSV exports
   - Email scheduled reports

6. **Notifications**
   - Push notifications
   - Performance alerts
   - Goal achievement celebrations

---

## 🐛 Troubleshooting

### Problem: "Login Failed"

**Solution:**
1. Check that you created the user in Supabase Auth
2. Verify you added the user profile in `user_profiles` table
3. Make sure passwords match
4. Check browser console for detailed errors

### Problem: "Failed to load stores"

**Solution:**
1. Verify stores were created in Step 1
2. Check that `office_id` matches in both stores and user_profiles
3. Run: `SELECT * FROM stores;` to verify data exists

### Problem: "Failed to save entry"

**Solution:**
1. Make sure you're logged in
2. Check that you selected a store
3. Verify the store_id exists in the stores table
4. Check browser console for detailed error messages

### Problem: Database errors

**Solution:**
1. Re-run the entire `/DATABASE_SCHEMA.sql` file
2. Check for error messages in Supabase SQL Editor
3. Verify all tables were created: Go to Table Editor and check

---

## 📞 Support

If you encounter issues:

1. **Check Browser Console**: Press F12 → Console tab for detailed errors
2. **Check Supabase Logs**: Dashboard → Logs → Real-time logs
3. **Verify Database**: Table Editor → Check data exists
4. **Re-run Setup**: You can safely re-run all SQL commands

---

## ✨ Success!

Your Averix dashboard is now fully operational with:
- Real authentication
- Database persistence  
- LOA tracking
- Analytics
- Multi-user support

**Start tracking your team's performance today!** 🚀

---

**Remember**: This is now a fully functional production-ready dashboard. All data is persistent, secure, and ready for your team to use.
