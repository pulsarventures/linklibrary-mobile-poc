# 🛡️ iOS & Android Setup Protection Guide

## 🚨 CRITICAL: NEVER BREAK THESE CONFIGURATIONS

This document outlines the exact setup and versions that make the app work. **DO NOT CHANGE** any of these unless absolutely necessary and with extreme caution.

---

## 📱 iOS Configuration - WORKING SETUP

### ✅ React Native & iOS Versions (LOCKED)
```json
{
  "react-native": "0.78.2",
  "ios-deployment-target": "12.0",
  "xcode": "15.x",
  "cocoapods": "1.x"
}
```

### ✅ iOS Share Extension - CRITICAL SETUP

#### App Groups Configuration
- **App Group ID**: `group.com.pulsarventures.linklibraryai`
- **MUST** be configured in:
  1. Main app target capabilities
  2. ShareExtension target capabilities  
  3. Both have identical App Group ID

#### Required Files (DO NOT DELETE):
```
ios/ShareExtension/
├── ShareViewController.swift     # Handles incoming shares
├── Info.plist                   # Extension configuration
└── ShareExtension.entitlements  # App Groups entitlement

ios/
├── AppGroupsModule.swift         # React Native module implementation
├── AppGroupsModule.m            # React Native bridge (CRITICAL)
└── linklibrary_mobile-Bridging-Header.h
```

#### Xcode Project Setup (CRITICAL):
- **AppGroupsModule.m** MUST be in main target sources
- **AppGroupsModule.swift** MUST be in main target sources
- Both files MUST be compiled into the main app

### ✅ App Groups Entitlements
```xml
<!-- ios/linklibrary_mobile/linklibrary_mobile.entitlements -->
<key>com.apple.security.application-groups</key>
<array>
    <string>group.com.pulsarventures.linklibraryai</string>
</array>

<!-- ios/ShareExtension/ShareExtension.entitlements -->
<key>com.apple.security.application-groups</key>
<array>
    <string>group.com.pulsarventures.linklibraryai</string>
</array>
```

### ✅ Deep Link Configuration
```xml
<!-- Info.plist URL Schemes -->
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>com.pulsarventures.linklibraryai</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>linklibrarymobile</string>
        </array>
    </dict>
</array>
```

---

## 🤖 Android Configuration - WORKING SETUP

### ✅ Android Versions (LOCKED)
```gradle
// android/app/build.gradle
android {
    compileSdkVersion 34
    targetSdkVersion 34
    minSdkVersion 21
}

// android/build.gradle
buildscript {
    ext {
        buildToolsVersion = "34.0.0"
        minSdkVersion = 21
        compileSdkVersion = 34
        targetSdkVersion = 34
    }
}
```

### ✅ Required Dependencies
```gradle
dependencies {
    implementation 'androidx.core:core:1.10.1'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    // ... other dependencies
}
```

---

## 🔧 Build Tool Versions - LOCKED

### Node.js & Package Managers
```json
{
  "node": "18.x or 20.x",
  "npm": "9.x or 10.x", 
  "yarn": "1.22.x"
}
```

### iOS Development Tools
```
Xcode: 15.x
iOS Simulator: iOS 16+ 
CocoaPods: 1.x
```

### Android Development Tools
```
Android Studio: 2023.x
Android SDK: 34
Build Tools: 34.0.0
Gradle: 7.x
```

---

## 🚨 DANGER ZONES - NEVER TOUCH

### iOS Share Extension Files
❌ **NEVER modify these files:**
- `ios/ShareExtension/ShareViewController.swift`
- `ios/AppGroupsModule.swift`
- `ios/AppGroupsModule.m`
- App Groups capability settings
- URL scheme configuration

### React Native Configuration
❌ **NEVER modify these without extreme caution:**
- `react-native` version in package.json
- `ios-deployment-target` in Podfile
- `compileSdkVersion` and `targetSdkVersion` in Android
- Metro bundler configuration

### Build Configuration
❌ **NEVER change these:**
- Xcode project file references to AppGroupsModule files
- Android manifest permissions
- Build tool versions
- Gradle wrapper version

---

## ⚠️ If You MUST Make Changes

### Before Making ANY Changes:
1. **Create a full backup** of the working project
2. **Document current working state** with screenshots
3. **Test share functionality** works perfectly before changes
4. **Commit current working state** to git

### After Making Changes:
1. **Test iOS share extension** from Safari/YouTube
2. **Test Android functionality** 
3. **Test on both simulator and physical device**
4. **Verify all build scripts still work**

### If Something Breaks:
1. **Immediately revert** to last working commit
2. **DO NOT** try to "fix" multiple things at once
3. **Test ONE change at a time**
4. **Refer to this documentation**

---

## 🎯 Share Extension Test Checklist

Before and after ANY changes, verify this workflow:

### iOS Share Extension Test:
1. ✅ Open Safari and navigate to any webpage
2. ✅ Tap Share button
3. ✅ Select LinkLibrary app from share sheet  
4. ✅ App opens and navigates to Add screen
5. ✅ URL is pre-filled in the form
6. ✅ Toast notification appears
7. ✅ Form can be saved successfully
8. ✅ New share while form is open clears form and loads new URL

### Android Share Test:
1. ✅ Share functionality works on Android
2. ✅ Deep links work properly
3. ✅ App opens from other apps

---

## 📋 Emergency Recovery Steps

If the share extension breaks:

### Step 1: Check AppGroupsModule Registration
```bash
# In React Native console, check if module is available
console.log(Object.keys(NativeModules).includes('AppGroupsModule'));
```

### Step 2: Verify Xcode Project  
1. Open `ios/linklibrary_mobile.xcworkspace`
2. Check `AppGroupsModule.m` is in main target sources
3. Check `AppGroupsModule.swift` is in main target sources
4. Verify App Groups capability is enabled

### Step 3: Check App Groups ID
1. Verify ID in ShareViewController.swift: `group.com.pulsarventures.linklibraryai`
2. Verify ID in AppGroupsModule.swift: same ID
3. Verify entitlements files have same ID

### Step 4: Clean Rebuild
```bash
# iOS
cd ios && pod install --repo-update
cd .. && npx react-native run-ios

# Android  
cd android && ./gradlew clean
cd .. && npx react-native run-android
```

---

## 📞 Last Resort: Project Reset

If everything is broken beyond repair:

1. **Restore from last working git commit**
2. **Copy this documentation** to safe location
3. **Start over with working baseline**
4. **Apply changes ONE AT A TIME**
5. **Test after each change**

---

**Remember: The share extension is THE HEART OF THE APP. Protect it at all costs.**

Last Updated: 2025-07-24  
Status: ✅ FULLY FUNCTIONAL