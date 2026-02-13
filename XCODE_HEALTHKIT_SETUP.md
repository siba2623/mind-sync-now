# Xcode HealthKit Setup Guide

Complete step-by-step guide to open your MindSync project in Xcode and enable HealthKit.

---

## Part 1: Opening the Project in Xcode

### Step 1: Locate the Workspace File
Navigate to: `mind-sync-now/ios/App/`

You'll see two files:
- `App.xcodeproj` ❌ (Don't open this)
- `App.xcworkspace` ✅ (Open this one!)

**Why .xcworkspace?** Because your project uses CocoaPods/dependencies. The workspace includes everything.

### Step 2: Open in Xcode

**Option A: From File Explorer (Easiest)**
1. Navigate to `mind-sync-now/ios/App/` in Windows File Explorer
2. Double-click `App.xcworkspace`
3. Xcode will launch automatically

**Option B: From Xcode**
1. Open Xcode application
2. Click "File" → "Open"
3. Navigate to `mind-sync-now/ios/App/`
4. Select `App.xcworkspace`
5. Click "Open"

**Option C: From Terminal/Command Line**
```bash
cd mind-sync-now/ios/App
open App.xcworkspace
```

### Step 3: Wait for Indexing
- Xcode will index your project (first time takes 1-2 minutes)
- You'll see "Indexing..." in the top bar
- Wait until it completes before proceeding

---

## Part 2: Adding HealthKit Capability

### Step 1: Select Your Project
1. In the left sidebar (Project Navigator), click on the **blue "App" icon** at the very top
2. This opens the project settings

**Visual Guide:**
```
📁 App (workspace)
  └─ 📘 App  ← Click this blue icon
      └─ 📁 App (folder)
```

### Step 2: Select the App Target
1. In the main editor area, you'll see two columns:
   - Left: PROJECT and TARGETS
   - Right: Settings tabs
2. Under **TARGETS**, click on **"App"**

**Visual Guide:**
```
PROJECT               TARGETS
└─ App                └─ App  ← Click here
```

### Step 3: Go to Signing & Capabilities Tab
1. At the top of the main editor, you'll see tabs:
   - General | Signing & Capabilities | Resource Tags | Info | Build Settings | Build Phases | Build Rules
2. Click **"Signing & Capabilities"**

### Step 4: Add HealthKit Capability
1. Click the **"+ Capability"** button (top-left of the capabilities section)
2. A popup window appears with all available capabilities
3. Type "HealthKit" in the search box
4. Double-click **"HealthKit"** from the list

**What you'll see:**
```
+ Capability  [Library]

Search: HealthKit

Results:
  ✚ HealthKit  ← Double-click this
  ✚ HealthKit UI
```

### Step 5: Verify HealthKit is Added
After adding, you should see a new section in Signing & Capabilities:

```
┌─────────────────────────────────────┐
│ HealthKit                           │
│                                     │
│ ☑ Clinical Health Records          │
│ ☐ Background Delivery               │
│                                     │
└─────────────────────────────────────┘
```

**Optional Settings:**
- ☑ **Clinical Health Records** - Check this if you want access to medical records
- ☐ **Background Delivery** - Leave unchecked (we're using UIBackgroundModes instead)

---

## Part 3: Configure Signing (Important!)

### Step 1: Set Your Team
Still in the **Signing & Capabilities** tab:

1. Under **"Signing (Debug)"** section
2. Find **"Team"** dropdown
3. Select your Apple Developer account

**If you don't see your team:**
- Click "Add Account..."
- Sign in with your Apple ID
- If you don't have a paid developer account, select "Personal Team" (for testing only)

### Step 2: Set Bundle Identifier
1. Under **"Signing"**, find **"Bundle Identifier"**
2. Change it to something unique: `com.yourname.mindsync`
3. Example: `com.sibabalwe.mindsync`

**Why?** Each app needs a unique identifier. The default might conflict.

---

## Part 4: Verify Info.plist Permissions

### Step 1: Check Info.plist in Xcode
1. In the Project Navigator (left sidebar)
2. Navigate to: `App` → `App` → `Info.plist`
3. Click on `Info.plist`

### Step 2: Verify HealthKit Keys
You should see these entries (we already added them):

```
NSHealthShareUsageDescription
  └─ "MindSync needs access to your health data..."

NSHealthUpdateUsageDescription
  └─ "MindSync will write wellness data..."

NSHealthClinicalHealthRecordsShareUsageDescription
  └─ "MindSync uses your health records..."

UIBackgroundModes
  └─ Item 0: fetch
  └─ Item 1: processing
```

✅ If you see these, you're good to go!

---

## Part 5: Build and Test

### Step 1: Select a Device
1. At the top of Xcode, you'll see a device selector
2. Click it and choose:
   - **Your physical iPhone** (connected via USB) - Recommended
   - **iPhone Simulator** - Won't work for HealthKit (simulators don't have Health app)

**Important:** HealthKit ONLY works on physical devices, not simulators!

### Step 2: Build the Project
1. Click the **Play button** (▶️) at the top-left
2. Or press `Cmd + R`
3. Xcode will build and install the app on your device

### Step 3: First Launch - Grant Permissions
When the app launches for the first time:

1. You'll see a popup: **"MindSync Would Like to Access Health Data"**
2. It will show the description we added in Info.plist
3. Click **"Allow"**
4. Select which health data to share:
   - ✅ Sleep Analysis
   - ✅ Heart Rate
   - ✅ Heart Rate Variability
   - ✅ Steps
   - ✅ Active Energy
   - ✅ Exercise Minutes

---

## Troubleshooting

### Issue 1: "No accounts with App Store Connect access"
**Solution:** 
- You need an Apple Developer account ($99/year)
- OR use "Personal Team" for testing (free, but limited)

### Issue 2: "Signing for 'App' requires a development team"
**Solution:**
1. Go to Signing & Capabilities
2. Check "Automatically manage signing"
3. Select your team from dropdown

### Issue 3: "HealthKit is not available on this device"
**Solution:**
- HealthKit only works on physical iOS devices
- Connect your iPhone via USB
- Select it as the build target

### Issue 4: "Failed to register bundle identifier"
**Solution:**
- Change the Bundle Identifier to something unique
- Format: `com.yourname.mindsync`

### Issue 5: Can't find App.xcworkspace
**Solution:**
- Make sure you're in `mind-sync-now/ios/App/` directory
- If it doesn't exist, run: `npx cap sync ios`

---

## Quick Checklist

Before testing HealthKit integration:

- [ ] Opened `App.xcworkspace` (not .xcodeproj)
- [ ] Added HealthKit capability in Signing & Capabilities
- [ ] Set your Apple Developer Team
- [ ] Changed Bundle Identifier to unique value
- [ ] Verified Info.plist has all 3 HealthKit permission keys
- [ ] Connected physical iPhone via USB
- [ ] Selected iPhone as build target (not simulator)
- [ ] Built and ran the app (▶️ button)
- [ ] Granted HealthKit permissions on first launch

---

## Next Steps

After Xcode setup is complete:

1. **Run Database Migration** - See `HEALTHKIT_SETUP_GUIDE.md` for SQL
2. **Test HealthKit Service** - Open MindSync app and check Mental Health Twin
3. **Verify Data Sync** - Check if Apple Watch data appears in the app
4. **Monitor Background Sync** - Leave app running overnight to test sleep tracking

---

## Need Help?

**Common Questions:**

**Q: Do I need a Mac?**
A: Yes, Xcode only runs on macOS. You need a Mac to build iOS apps.

**Q: Can I test on Android instead?**
A: Yes! Android uses Google Fit. See `WEARABLE_INTEGRATION_GUIDE.md` for Android setup.

**Q: Do I need an Apple Watch?**
A: No, but recommended. iPhone alone can track steps, heart rate (with camera), and sleep (with motion sensors).

**Q: How much does Apple Developer Program cost?**
A: $99/year. But you can test on your own device for free with "Personal Team".

---

## Visual Summary

```
1. Open Xcode
   └─ File → Open → App.xcworkspace

2. Select Project
   └─ Click blue "App" icon in sidebar

3. Select Target
   └─ Under TARGETS, click "App"

4. Add Capability
   └─ Signing & Capabilities tab
   └─ + Capability button
   └─ Search "HealthKit"
   └─ Double-click to add

5. Configure Signing
   └─ Select your Team
   └─ Set unique Bundle Identifier

6. Build & Run
   └─ Connect iPhone
   └─ Click ▶️ button
   └─ Grant permissions on device
```

---

**You're all set!** Once you complete these steps, your MindSync app will have full HealthKit access and can sync Apple Watch data for Mental Health Twin predictions. 🎉
