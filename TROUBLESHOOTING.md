# Troubleshooting Guide
## Fixing "TypeError: Importing a module script failed"

---

## ✅ FIXES APPLIED

The following fixes have been applied to resolve module import errors:

### 1. Fixed API Service Import Path
**File:** `/src/services/api.ts`
**Issue:** Incorrect import path for Supabase info
**Fix:** Changed from `/utils/supabase/info` to `../utils/supabase/info`

### 2. Fixed React Hook Usage
**File:** `/src/app/components/DailyEntryView.tsx`
**Issue:** Used `useState()` instead of `useEffect()` for async data loading
**Fix:** Changed to `useEffect()` with proper cleanup

### 3. Updated Import Statements
All components now use correct relative or alias imports

---

## 🔧 IF STILL SEEING ERRORS

### Step 1: Clear Browser Cache

**Option A - Hard Refresh:**
- **Chrome/Edge:** Ctrl + Shift + R (Windows) or Cmd + Shift + R (Mac)
- **Firefox:** Ctrl + F5 (Windows) or Cmd + Shift + R (Mac)
- **Safari:** Cmd + Option + R (Mac)

**Option B - Clear Cache:**
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Step 2: Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Look for the exact error message
4. Check which file is failing to import

### Step 3: Verify File Structure

Ensure these files exist:
```
/
├── src/
│   ├── services/
│   │   └── api.ts              ✅ Must exist
│   └── app/
│       ├── App.tsx
│       └── components/
│           ├── LoginPage.tsx
│           └── DailyEntryView.tsx
└── utils/
    └── supabase/
        └── info.tsx             ✅ Must exist
```

### Step 4: Check for TypeScript Errors

Run in terminal (if available):
```bash
# Check for TypeScript errors
tsc --noEmit

# Or check in your IDE
# Look for red squiggly lines
```

---

## 🐛 COMMON ERRORS & SOLUTIONS

### Error: "Cannot find module '@/services/api'"

**Cause:** Vite alias not configured correctly

**Solution:** The alias is pre-configured. Try:
1. Clear browser cache
2. Restart dev server
3. Check vite.config.ts has alias configured

### Error: "Importing a module script failed"

**Cause 1:** Syntax error in the imported file

**Solution:**
1. Check `/src/services/api.ts` for syntax errors
2. Ensure all imports have correct paths
3. Verify no circular dependencies

**Cause 2:** Browser cached old version

**Solution:**
1. Hard refresh (Ctrl + Shift + R)
2. Clear all browser cache
3. Try incognito/private window

**Cause 3:** File extension missing/incorrect

**Solution:**
1. All imports should NOT include `.ts` extension
2. Correct: `import { authAPI } from '@/services/api'`
3. Wrong: `import { authAPI } from '@/services/api.ts'`

### Error: "Failed to fetch dynamically imported module"

**Cause:** Build or bundler issue

**Solution:**
1. Restart the development server
2. Clear browser cache
3. Check network tab for 404 errors

### Error: "Unexpected token '<'"

**Cause:** Server returning HTML instead of JavaScript (usually 404)

**Solution:**
1. Check file paths are correct
2. Verify file exists in file system
3. Check Vite config for correct base path

---

## 🔍 DEBUGGING STEPS

### Step 1: Verify API File

Check if `/src/services/api.ts` loads correctly:

1. Open `/src/services/api.ts` in your editor
2. Look for any red syntax errors
3. Ensure all imports at the top are correct:
   ```typescript
   import { createClient } from '@supabase/supabase-js';
   import { projectId, publicAnonKey } from '../utils/supabase/info';
   ```

### Step 2: Test Import in Console

1. Open browser DevTools (F12)
2. Go to Console
3. Try importing:
   ```javascript
   import('/src/services/api.ts').then(module => console.log(module))
   ```
4. Check if it resolves or throws error

### Step 3: Check Network Tab

1. Open DevTools → Network tab
2. Filter by "JS"
3. Look for failed requests (red)
4. Check if api.ts is loading
5. Verify status code is 200

### Step 4: Verify Supabase Package

The `@supabase/supabase-js` package must be installed:

1. Check package.json contains:
   ```json
   "@supabase/supabase-js": "^2.93.1"
   ```
2. If missing, it was installed earlier - try clearing cache

---

## ✅ VERIFICATION CHECKLIST

After fixes, verify:

- [ ] No red errors in browser console
- [ ] Login page loads without errors
- [ ] Can type in email/password fields
- [ ] Browser DevTools → Network shows no 404s
- [ ] `/src/services/api.ts` visible in Sources tab
- [ ] No TypeScript errors in editor

---

## 🚀 WORKING STATE

When everything is working:

1. ✅ Login page appears
2. ✅ No console errors
3. ✅ Can enter credentials
4. ✅ Login button is clickable
5. ✅ Form submission works (even if no users exist yet)

---

## 📞 STILL STUCK?

If you're still seeing errors after trying all steps:

1. **Share the exact error message** - Copy full error from console
2. **Check which file is failing** - Look at stack trace
3. **Verify file exists** - Check file system for the failing file
4. **Try incognito mode** - Rules out cache issues

---

## 🎯 EXPECTED BEHAVIOR

After all fixes:

**WITHOUT DATABASE SETUP:**
- ✅ Login page loads
- ✅ Can enter credentials
- ⚠️ Login fails with "user not found" (expected - users not created yet)

**WITH DATABASE SETUP:**
- ✅ Login page loads
- ✅ Can enter credentials
- ✅ Login succeeds
- ✅ Dashboard loads with real data

---

## 📝 NEXT STEPS

Once module errors are fixed:

1. **Verify login page loads** - Should see Averix logo and form
2. **Set up database** - Follow `/SETUP_GUIDE.md`
3. **Create users** - Follow `/CREATE_DEMO_USERS.sql`
4. **Test login** - Use created credentials
5. **Submit data** - Test daily entry form

---

Last Updated: January 2026
