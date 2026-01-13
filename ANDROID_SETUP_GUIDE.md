# Android Development Setup Guide

## Quick Setup for Android Development

### 1. Install Android Studio
1. Download from: https://developer.android.com/studio
2. Install with default settings
3. Open Android Studio and complete setup wizard

### 2. Install Android SDK
In Android Studio:
1. Go to **Tools** → **SDK Manager**
2. Install **Android SDK Platform-Tools**
3. Install **Android SDK Build-Tools**
4. Install at least one **Android API level** (recommend API 34)

### 3. Set Environment Variables
Add to your system PATH:
- `ANDROID_HOME` = path to Android SDK
- `JAVA_HOME` = path to JDK (usually bundled with Android Studio)

### 4. Test Setup
```bash
# Check if Android SDK is found
npx cap doctor

# If successful, try running on Android
npm run mobile:run-android
```

## Alternative: Use Android Studio Directly

1. **Open Project**:
   ```bash
   npm run mobile:android
   ```

2. **In Android Studio**:
   - Click **Run** button
   - Select device/emulator
   - App will build and install

## Don't Want Native Development?

**No problem!** Your app works perfectly as:
- **Web app** (current)
- **PWA** (Progressive Web App)
- **Mobile-optimized website**

The mobile optimizations are already working in your browser!