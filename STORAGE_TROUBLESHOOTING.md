# Storage Troubleshooting Guide for Veridex

## How Data is Saved in Live Tracker

Veridex uses **two layers of protection** to ensure your LOA tracking data is never lost:

### Layer 1: Instant Local Saves (Browser Storage)
- Every time you tap a counter (+/-), your data is **instantly saved** to your browser's localStorage
- This works **offline** and requires no internet connection
- Data persists even if you refresh the page
- **Storage Key**: `veridex_live_tracker_[TODAY'S DATE]`

### Layer 2: Cloud Database (Every 5 Minutes + Manual Save)
- Every **5 minutes**, your progress is automatically synced to the database
- You can also click **"Save Progress"** button anytime to manually sync
- This ensures your manager can see your progress and it's backed up in the cloud

---

## Why Did My Data Disappear?

If your rep reported losing data when closing the tab, here are the most common reasons:

### 1. **Private/Incognito Mode** ❌
**Problem**: Private browsing modes delete ALL data when the tab/window closes.

**Solution**:
- Use **normal browsing mode** (not incognito/private)
- On Mobile Safari: Ensure "Private Browsing" is OFF
- On Chrome Mobile: Use regular tabs, not Incognito tabs

### 2. **Browser Settings Clearing Data on Exit** ⚙️
**Problem**: Some browsers have settings that clear storage when closing tabs.

**Solution**:
- **Chrome**: Settings → Privacy → "Clear browsing data" → Ensure "Cookies and site data" is NOT set to clear on exit
- **Safari**: Settings → Safari → "Block All Cookies" should be OFF
- **Firefox**: Settings → Privacy → "Delete cookies and site data when Firefox is closed" should be OFF

### 3. **Different Browser or Device** 📱
**Problem**: localStorage is **device-specific** and **browser-specific**.

**Example Issues**:
- Started session on Chrome mobile, switched to Safari mobile ❌
- Started on work phone, switched to personal phone ❌
- Started in Chrome, continued in Firefox ❌

**Solution**:
- Always use the **same browser** throughout the day
- Use the **same device** throughout the day
- Click "Save Progress" before switching devices

### 4. **Storage Quota Exceeded** 💾
**Problem**: Browser ran out of storage space.

**Solution**:
- Clear browser cache/history
- Delete old browser data
- The app auto-cleans data older than 7 days

### 5. **iOS "Prevent Cross-Site Tracking"** 🍎
**Problem**: Some iOS settings can interfere with localStorage.

**Solution**:
- Settings → Safari → Toggle OFF "Prevent Cross-Site Tracking" (optional)
- Settings → Safari → Toggle OFF "Block All Cookies"

---

## How to Test if Storage is Working

When you first open Live Tracker, the app **automatically tests** your browser's storage:

✅ **If storage works**: You'll see "✓ Auto-saving" in the top right
❌ **If storage fails**: You'll see a warning toast message

---

## Best Practices for Reps in the Field

### ✅ DO:
1. Use the **same browser** all day (stick to Chrome, Safari, or Firefox)
2. Use **normal browsing mode** (not private/incognito)
3. Let the page **finish loading** before tapping counters
4. Click **"Save Progress"** button every hour or when taking a break
5. Keep the tab **open in the background** if possible
6. Check for the **"✓ Auto-saving"** indicator in the top right

### ❌ DON'T:
1. Use private/incognito mode
2. Switch between different browsers
3. Switch between different devices
4. Clear browser data mid-day
5. Force-close the browser without clicking "Save Progress"

---

## Emergency Recovery Steps

If a rep closes the tab and reopens it:

1. **Open Veridex in the EXACT SAME BROWSER**
2. Navigate to **Live Tracker**
3. The app will **automatically restore** the last saved state
4. You should see a toast: "Progress restored - Your previous session was recovered"

If data is still missing:
1. Check the browser console (F12) for localStorage errors
2. Click "Save Progress" to sync whatever is recovered
3. Go to **Daily Entry** view to manually enter the correct numbers

---

## Technical Details for Debugging

### Storage Keys Used:
- `veridex_live_tracker_2026-02-02` (today's tracker data)
- `veridex_selected_store` (currently selected store)
- `veridex-auth-token` (authentication session)

### Console Logging:
The app logs all storage operations to the browser console:
- `✅ Tracker saved to localStorage` = Save successful
- `❌ localStorage save verification failed!` = Save failed
- Check browser DevTools (F12) → Console tab for details

### Manual Recovery (Developer):
```javascript
// In browser console, view today's data:
const today = new Date().toISOString().split('T')[0];
console.log(JSON.parse(localStorage.getItem(`veridex_live_tracker_${today}`)));

// View all Veridex storage:
Object.keys(localStorage).filter(k => k.startsWith('veridex')).forEach(k => {
  console.log(k, localStorage.getItem(k));
});
```

---

## Contact Support

If the problem persists:
1. Take a screenshot of any error messages
2. Note the browser name and version
3. Note the device type (iPhone, Android, Desktop)
4. Report to your manager with these details
