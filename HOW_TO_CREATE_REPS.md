# How to Create and Manage Reps in Veridex

## 🎯 Overview

As an owner, you have **full control** over creating and managing sales reps in your office. There are two ways to add reps:

1. **Direct Creation** (Recommended) - You create the rep account and share credentials
2. **Self-Signup** - Rep signs up themselves using your Office ID

---

## ✅ Method 1: Direct Creation (Recommended)

This is the **easiest and recommended method**. You create the rep account directly from your dashboard.

### Step-by-Step Guide:

#### 1. Navigate to Team Management

Log in as an owner, then:
1. Click **"Team Management"** in the left sidebar
2. You'll see your office information and current team members

#### 2. Click "Add Rep"

Click the **"Add Rep"** button in the top right corner.

#### 3. Fill in Rep Details

A modal will appear asking for:
- **Full Name**: Rep's full name (e.g., "Sarah Johnson")
- **Email**: Rep's email address (e.g., "sarah@company.com")
- **Password**: Create a password for the rep

**Pro Tip**: Click the **"Generate"** button to create a secure random password!

#### 4. Create the Rep

Click **"Create Rep"** and the account will be created instantly.

#### 5. Share Credentials

After creation, you'll see a modal with the rep's credentials:

```
Email: sarah@company.com
Password: Xy9mK2pQ8wLr
```

**Important:** 
- Copy both the email and password (use the copy buttons)
- Share these with your rep via text, email, or in person
- The password won't be shown again, so make sure to copy it!

#### 6. Rep Logs In

Your rep can now:
1. Go to the Veridex login page
2. Enter the email and password you provided
3. They're automatically assigned to YOUR office!

---

## 🔄 Method 2: Self-Signup with Office ID

If you prefer reps to sign up themselves, they can use your Office ID.

### Step-by-Step Guide:

#### 1. Get Your Office ID

From the **Team Management** page:
1. Look at the "Office Information" card
2. Copy your **Office ID** (it looks like: `11111111-1111-1111-1111-111111111111`)
3. Share this ID with your rep

#### 2. Rep Signs Up

Your rep:
1. Goes to Veridex login page
2. Clicks **"Create one now"**
3. Fills in their details:
   - Name
   - Email
   - Password
   - Selects **"Sales Rep"** as role
   - Enters YOUR **Office ID** in the "Office ID" field
4. Clicks "Create Account"

#### 3. Verification

The rep will be automatically assigned to your office and you'll see them in your Team Management view!

---

## 📊 What Data Do Reps See?

Once a rep is assigned to your office, they can:

✅ **See only YOUR office's data**:
- Stores from your office
- Their own daily entries
- Goals you've set for the office
- Their personal performance metrics

❌ **Cannot see**:
- Data from other offices
- Other owners' information
- Reps from other offices

**Complete data isolation!**

---

## 🏪 Assigning Reps to Stores

Reps will see all stores in your office when they create daily entries. To add stores:

1. Go to **"Stores"** in the sidebar (or create a store management UI)
2. Add stores with:
   - Store Name (e.g., "Best Buy Westwood")
   - Brand (e.g., "Best Buy")
   - Location (e.g., "Westwood, CA")

Reps can then select from these stores when logging their daily production.

---

## 🗑️ Removing Reps

To remove a rep from your team:

1. Go to **Team Management**
2. Find the rep in the list
3. Click the **trash icon** next to their name
4. Confirm the deletion

**Note:** This will:
- Remove the rep from your office
- Delete their account from the system
- Keep their historical data intact (for your records)

---

## 💡 Best Practices

### For Direct Creation:

✅ **DO:**
- Use strong passwords (or generate them)
- Copy credentials immediately and share securely
- Keep a record of which accounts you've created
- Tell reps they can change their password after first login (future feature)

❌ **DON'T:**
- Share passwords in plain text via insecure channels
- Reuse the same password for multiple reps
- Forget to copy the password before closing the modal

### For Office ID Method:

✅ **DO:**
- Keep your Office ID private (only share with your reps)
- Verify new reps in Team Management after they sign up
- Have a consistent onboarding process

❌ **DON'T:**
- Post your Office ID publicly
- Share it with reps from other offices

---

## 🎯 Complete Example Workflow

### Scenario: You're hiring "Mike Johnson" as a new rep

**Step 1:** Navigate to Team Management
- Click "Team Management" in sidebar
- Click "Add Rep" button

**Step 2:** Fill in details
- Name: `Mike Johnson`
- Email: `mike@yourcompany.com`
- Click "Generate" for password → `Kp8Xm2nQ9wLr`

**Step 3:** Create account
- Click "Create Rep"
- Modal shows credentials

**Step 4:** Share credentials
- Copy email and password
- Text Mike:
  ```
  Welcome to the team! 
  
  Login here: [Veridex URL]
  Email: mike@yourcompany.com
  Password: Kp8Xm2nQ9wLr
  
  Change your password after first login.
  ```

**Step 5:** Mike logs in
- Mike visits Veridex
- Logs in with credentials
- Automatically sees your office's stores and data
- Starts logging daily production!

**Step 6:** Verify
- Check Team Management
- See "Mike Johnson" in your reps list
- View his data in the Reps view

---

## 🔐 Security & Permissions

### What Owners Can Do:
- ✅ Create rep accounts
- ✅ View all reps in their office
- ✅ Remove reps from their office
- ✅ See all data from their office (all reps)
- ✅ Set goals for the office
- ✅ Create and manage stores

### What Reps Can Do:
- ✅ Log in to their account
- ✅ View stores in their office
- ✅ Submit daily entries
- ✅ View their own performance data
- ✅ See office-wide goals

### What Reps CANNOT Do:
- ❌ Create other rep accounts
- ❌ Delete stores
- ❌ Set goals
- ❌ See other offices' data
- ❌ Access admin functions

---

## 🐛 Troubleshooting

### "Failed to create rep"

**Possible causes:**
1. Email already exists in system
   - Solution: Use a different email address

2. Database tables not set up
   - Solution: Run the `database-setup.sql` script

3. Not logged in as owner
   - Solution: Make sure you're logged in with an owner account

### "Rep can't log in"

**Check:**
1. Did you share the correct email and password?
2. Did the rep type them correctly (case-sensitive)?
3. Is the rep account showing in your Team Management view?

### "Rep sees wrong office data"

This shouldn't happen if created through Team Management, but if it does:
1. Check the rep's `office_id` in Supabase dashboard
2. It should match your office_id
3. If not, manually update it in the database

---

## 📝 Quick Reference

| Task | Steps |
|------|-------|
| **Create Rep** | Team Management → Add Rep → Fill form → Create → Share credentials |
| **Remove Rep** | Team Management → Find rep → Click trash icon → Confirm |
| **Share Office ID** | Team Management → Copy Office ID → Share with rep |
| **View All Reps** | Team Management → See list of all reps |

---

## 🎉 Summary

**Creating reps is now easy!**

1. **Recommended Method**: Use **Team Management** to directly create rep accounts
2. **Alternative Method**: Share your **Office ID** for reps to self-signup
3. **All reps** are automatically assigned to YOUR office
4. **Complete isolation** - they only see your office's data
5. **You're in control** - create, view, and remove reps anytime

No more manual database configuration needed. Just click, create, and share credentials! 🚀
