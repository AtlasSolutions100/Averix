# Veridex Multi-Tenant Setup Guide

## 🎯 Current Issue

You created a second owner account and both owners are seeing the same demo data. This is happening because:

1. The demo accounts (`demo@owner.com`, `demo@rep.com`) are sharing the same `office_id`
2. When new owners sign up, they may be assigned to the same demo office
3. The backend properly isolates data by `office_id`, but we need each owner to have their OWN office

## ✅ The Fix: Each Owner Gets Their Own Office

### Option 1: Quick Fix - Use the Signup Flow Properly

When creating a new owner account, you need to create a NEW office for them:

1. **Modify the signup process** to create a new office when an owner signs up
2. **Assign that owner** to their newly created office
3. **When reps sign up**, they should be assigned to their owner's office

### Option 2: Database Setup - Create Isolated Demo Data

Run the SQL setup script to create properly isolated demo offices:

```bash
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of database-setup.sql
3. Run the script
4. This creates two demo offices: LA HQ and SD Branch
```

## 🚀 Implementation Steps

### Step 1: Update Backend to Create Office on Owner Signup

The signup endpoint needs to be modified to create a new office when an owner signs up:

**Current Flow:**
```
Owner signs up → Gets assigned to existing office_id → Sees shared data ❌
```

**New Flow:**
```
Owner signs up → New office created → Owner assigned to new office → Isolated data ✅
```

### Step 2: Allow Owners to Create Their Own Reps

Owners need an interface to:
- Create new rep accounts in THEIR office
- Assign reps to stores
- Set goals for their reps

### Step 3: Allow Owners to Manage Their Own Stores

Owners need an interface to:
- Add new stores to their office
- Edit store information
- Deactivate stores

## 📊 Data Structure Summary

```
Office 1 (LA HQ)
├── Owner: Maria Garcia
├── Reps:
│   ├── John Smith
│   └── Sarah Johnson
├── Stores:
│   ├── Best Buy Westwood
│   ├── Target Santa Monica
│   └── Costco Marina Del Rey
├── Daily Entries: (filtered by office_id)
└── Goals: (stored in KV store with office_id key)

Office 2 (SD Branch)  
├── Owner: Mike Chen
├── Reps:
│   └── Lisa Martinez
├── Stores:
│   ├── Costco Mission Valley
│   └── Walmart Chula Vista
├── Daily Entries: (filtered by office_id)
└── Goals: (stored in KV store with office_id key)
```

**Key Point:** Each office is completely isolated. LA owners can ONLY see LA data. SD owners can ONLY see SD data.

## 🔧 Required Backend Changes

### 1. Update Signup Endpoint

Modify `/supabase/functions/server/index.tsx` signup endpoint:

```typescript
app.post("/make-server-45dc47a9/auth/signup", async (c) => {
  const { email, password, name, role, officeName } = await c.req.json();
  
  const supabase = getSupabaseClient();
  
  let officeId;
  
  // If owner, create a new office
  if (role === 'owner') {
    const { data: office } = await supabase
      .from('offices')
      .insert({ name: officeName || `${name}'s Office` })
      .select()
      .single();
    
    officeId = office.id;
  } else {
    // If rep, they need to provide an office code or be invited
    // For now, require officeId to be passed
    officeId = await c.req.json().officeId;
  }
  
  // Create auth user
  const { data: authData } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true
  });
  
  // Create profile with proper office_id
  await supabase.from('user_profiles').insert({
    id: authData.user.id,
    email, name, role,
    office_id: officeId
  });
  
  return c.json({ success: true });
});
```

### 2. Add Office Management Endpoints

```typescript
// Create store (owner only)
app.post("/make-server-45dc47a9/stores", requireAuth, async (c) => {
  // Verify user is owner
  // Create store with user's office_id
});

// Create rep account (owner only)  
app.post("/make-server-45dc47a9/users", requireAuth, async (c) => {
  // Verify user is owner
  // Create rep with owner's office_id
});
```

## 🎨 Required Frontend Changes

### 1. Update Signup Page

Add a field for office name when role is "owner":

```typescript
{role === 'owner' && (
  <Input
    label="Office Name"
    value={officeName}
    onChange={(e) => setOfficeName(e.target.value)}
    placeholder="Los Angeles HQ"
  />
)}
```

### 2. Add Office Management Views (Owner Only)

Create new views for owners:
- **Manage Reps**: Create, edit, deactivate reps
- **Manage Stores**: Create, edit, deactivate stores  
- **Office Settings**: Edit office name, settings

## 🧪 Testing Multi-Tenant Isolation

### Test Case 1: Create Two Owners

```bash
1. Sign up as "owner1@test.com" with office "Office A"
2. Sign up as "owner2@test.com" with office "Office B"
3. Log in as owner1 → Should see ONLY Office A data
4. Log in as owner2 → Should see ONLY Office B data
```

### Test Case 2: Reps in Different Offices

```bash
1. Owner1 creates rep "rep1@test.com" in Office A
2. Owner2 creates rep "rep2@test.com" in Office B
3. Rep1 logs in → Sees only Office A stores and data
4. Rep2 logs in → Sees only Office B stores and data
```

### Test Case 3: Goals Isolation

```bash
1. Owner1 sets goal "100 sales" for Office A
2. Owner2 sets goal "50 sales" for Office B
3. Rep1 sees Office A goal (100)
4. Rep2 sees Office B goal (50)
```

## 📝 Next Steps

1. ✅ Run `database-setup.sql` to create proper table structure
2. ⏳ Update signup endpoint to create office for new owners
3. ⏳ Add office management UI for owners
4. ⏳ Add rep creation UI for owners
5. ⏳ Add store management UI for owners
6. ⏳ Test multi-tenant isolation thoroughly

## 💡 Pro Tips

- **Office Codes**: Consider generating invite codes for reps to join offices
- **Demo Mode**: Keep demo accounts for testing, but in a separate "Demo Office"
- **Data Export**: Allow owners to export their office's data
- **Audit Logs**: Track who created/modified what in each office
