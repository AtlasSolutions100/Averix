# Testing Multi-Tenant Isolation in Veridex

## 🎯 The Problem You Were Experiencing

When you created a second owner account, both owners were seeing the same demo data. This was because:

1. Both accounts were being assigned to the same `office_id` in the database
2. The demo accounts share a single office
3. There was no proper signup flow to create separate offices

## ✅ The Solution

We've now implemented:

1. **Automatic Office Creation**: When an owner signs up, a NEW office is automatically created
2. **Signup Page**: A proper signup flow where owners can create their own office
3. **Data Isolation**: All API endpoints filter by `office_id` to ensure complete isolation
4. **Store & Rep Management**: Backend ready for owners to manage their own stores and reps

## 🧪 How to Test Multi-Tenant Isolation

### Step 1: Run the Database Setup (Required)

Open your Supabase Dashboard → SQL Editor and run `/database-setup.sql`. This creates:
- `offices` table
- `user_profiles` table (with office_id)
- `stores` table (scoped to office)
- `daily_entries` table (scoped to office)
- Proper indexes for fast filtering

### Step 2: Create Two Separate Owner Accounts

**Owner 1: Create First Office**
1. Click "Create one now" on login page
2. Fill in details:
   - Name: `Sarah Johnson`
   - Email: `sarah@office-a.com`
   - Password: `test123`
   - Role: **Office Owner**
   - Office Name: `Office A - Los Angeles`
3. Click "Create Account"
4. You'll be automatically logged in

**What happens behind the scenes:**
```
1. New office created: "Office A - Los Angeles" → officeId: abc-123
2. User created in Supabase Auth
3. User profile created with office_id: abc-123
4. User logged in automatically
```

**Owner 2: Create Second Office**
1. Log out from Sarah's account
2. Click "Create one now" on login page
3. Fill in details:
   - Name: `Mike Chen`
   - Email: `mike@office-b.com`
   - Password: `test123`
   - Role: **Office Owner**
   - Office Name: `Office B - San Diego`
4. Click "Create Account"
5. You'll be automatically logged in

**What happens behind the scenes:**
```
1. New office created: "Office B - San Diego" → officeId: xyz-789
2. User created in Supabase Auth
3. User profile created with office_id: xyz-789
4. User logged in automatically
```

### Step 3: Verify Data Isolation

**Test 1: Check Office ID**

Log in as Sarah and open browser console:
```
Office: Office A - Los Angeles
Office ID: abc-123
```

Log in as Mike and open browser console:
```
Office: Office B - San Diego
Office ID: xyz-789
```

✅ **Expected Result**: Different office IDs = Complete isolation

**Test 2: Check Empty Dashboard**

When you first log in as each owner:
- Dashboard shows 0 sales, 0 contacts, 0 revenue
- No reps in leaderboard
- No stores listed
- No goals set

✅ **Expected Result**: Clean slate for each new office

**Test 3: Add Data to Office A**

Log in as Sarah (Office A):
1. Create a goal: "100 Sales"
2. The goal appears on dashboard

Log in as Mike (Office B):
1. Check dashboard
2. No goals from Office A visible

✅ **Expected Result**: Office B cannot see Office A's goals

### Step 4: Test with Demo Accounts

The demo accounts (`owner@olympus.com` and `jake@olympus.com`) share a SINGLE demo office. This is intentional for testing purposes.

**Demo Office:**
- Owner: owner@olympus.com
- Rep: jake@olympus.com
- Shared office_id: (demo office)
- Has demo data for testing

**Your New Offices:**
- Office A: Sarah's account (isolated)
- Office B: Mike's account (isolated)
- Office C: Any other owner signup (isolated)

✅ **Expected Result**: Demo accounts work together, but new signups are isolated

## 🔍 Debugging Multi-Tenant Issues

### Issue: "I'm still seeing other office's data"

**Check 1: Verify Office ID**

Open browser console and check:
```javascript
// User's office ID
console.log(user.officeId);
```

If two users have the SAME officeId, they're in the same office.

**Check 2: Verify Database**

Run this SQL in Supabase:
```sql
-- Check all offices
SELECT * FROM offices;

-- Check which office each user belongs to
SELECT 
  up.name as user_name,
  up.email,
  up.role,
  o.name as office_name,
  o.id as office_id
FROM user_profiles up
LEFT JOIN offices o ON o.id = up.office_id
ORDER BY o.name, up.role;
```

**Check 3: Verify Data Isolation**

Run this SQL to check stores by office:
```sql
SELECT 
  o.name as office_name,
  s.name as store_name,
  s.location
FROM stores s
LEFT JOIN offices o ON o.id = s.office_id
ORDER BY o.name, s.name;
```

Each office should only see their own stores.

## 📊 Expected Database State After Testing

```
Offices:
┌─────────────────────────────────┬──────────────────────────┐
│ ID                              │ Name                     │
├─────────────────────────────────┼──────────────────────────┤
│ demo-office-id                  │ Demo Office (Olympus)    │
│ abc-123                         │ Office A - Los Angeles   │
│ xyz-789                         │ Office B - San Diego     │
└─────────────────────────────────┴──────────────────────────┘

User Profiles:
┌──────────────────────┬───────────────────────┬────────┬──────────────────────┐
│ Name                 │ Email                 │ Role   │ Office               │
├──────────────────────┼───────────────────────┼────────┼──────────────────────┤
│ Demo Owner           │ owner@olympus.com     │ owner  │ Demo Office          │
│ Jake (Demo Rep)      │ jake@olympus.com      │ rep    │ Demo Office          │
│ Sarah Johnson        │ sarah@office-a.com    │ owner  │ Office A - LA        │
│ Mike Chen            │ mike@office-b.com     │ owner  │ Office B - SD        │
└──────────────────────┴───────────────────────┴────────┴──────────────────────┘

Data Isolation:
- Demo Office: Has demo data (shared between owner@olympus.com and jake@olympus.com)
- Office A: Empty (only Sarah can see/add data)
- Office B: Empty (only Mike can see/add data)
```

## 🎯 Success Criteria

Your multi-tenant isolation is working correctly if:

✅ Sarah signs up → New office created automatically  
✅ Mike signs up → Different office created  
✅ Sarah sees empty dashboard (no demo data)  
✅ Mike sees empty dashboard (no demo data)  
✅ Sarah creates goal → Only visible in Office A  
✅ Mike creates goal → Only visible in Office B  
✅ Sarah adds store → Only visible in Office A  
✅ Mike cannot see Sarah's data  
✅ Demo accounts still work (share demo office)  
✅ No data leakage between offices  

## 🐛 Common Issues & Fixes

### Issue: "Second owner still sees demo data"

**Cause**: The second owner account was created manually in Supabase and assigned to the demo office_id.

**Fix**: 
1. Delete the manually created user profile from Supabase
2. Use the signup page to create the account
3. The signup endpoint will automatically create a new office

### Issue: "Signup fails with error"

**Cause**: Database tables don't exist yet.

**Fix**: Run `/database-setup.sql` in Supabase SQL Editor

### Issue: "Both owners have same office_id"

**Cause**: Signup endpoint not creating new office.

**Fix**: Check backend logs to ensure office creation is working:
```
✅ Created office: Office A - Los Angeles (abc-123)
✅ Created user: Sarah Johnson (owner) in office abc-123
```

## 🚀 Next Steps After Confirming Isolation

Once you've confirmed that each owner has their own isolated office:

1. **Add Store Management UI** - Let owners create/edit stores
2. **Add Rep Creation UI** - Let owners invite reps to their office
3. **Add Office Settings** - Let owners configure their office
4. **Test Rep Isolation** - Create reps in different offices and verify they only see their office's data

## 📝 Quick Test Script

Run this to verify multi-tenancy:

```bash
1. ✅ Signup as Owner A with "Office A"
2. ✅ Check dashboard shows empty data
3. ✅ Note your office ID from console
4. ✅ Log out
5. ✅ Signup as Owner B with "Office B"  
6. ✅ Check dashboard shows empty data
7. ✅ Note your office ID from console
8. ✅ Verify office IDs are different
9. ✅ Log in as Owner A again
10. ✅ Create a goal "100 sales"
11. ✅ Log out and log in as Owner B
12. ✅ Verify goal from Owner A is NOT visible
13. ✅ Success! Multi-tenancy is working 🎉
```

## 💡 Pro Tips

- **Use clear office names** during testing: "Test Office 1", "Test Office 2", etc.
- **Check browser console** for debug logs showing office_id
- **Use Supabase Dashboard** to verify database state
- **Keep demo accounts** for quick testing (they share demo office intentionally)
- **Document your test accounts** so you remember which belongs to which office
