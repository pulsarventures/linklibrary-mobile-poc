# 🚨 CRITICAL DOCUMENTATION - DO NOT TOUCH SHARE FUNCTIONALITY 🚨

## iOS Share Extension - WORKING SETUP (DO NOT MODIFY)

The share functionality is **THE HEART OF THE APP** and is now working correctly. **NEVER** modify these components:

### ✅ WORKING FILES - DO NOT TOUCH:

1. **`ios/ShareExtension/ShareViewController.swift`** - Handles shared URLs from other apps
2. **`ios/AppGroupsModule.swift`** - React Native module for reading shared data  
3. **`ios/AppGroupsModule.m`** - Objective-C bridge for React Native registration
4. **`src/App.tsx`** - Contains share handling logic with `checkForSharedContent()`
5. **`src/screens/Add/AddLinkScreen.tsx`** - Receives and processes shared URLs

### ✅ CRITICAL CONFIGURATION - DO NOT MODIFY:

1. **App Groups ID**: `group.com.pulsarventures.linklibraryai`
   - Must be identical in both ShareViewController.swift and AppGroupsModule.swift
   - Must be configured in iOS App Groups capability
   
2. **Xcode Project Setup**:
   - `AppGroupsModule.m` MUST be included in main target build sources
   - `AppGroupsModule.swift` MUST be included in main target build sources
   - ShareExtension target properly configured

3. **Deep Link Scheme**: `linklibrarymobile://share`

### ✅ SHARE FLOW - DO NOT BREAK:

1. User shares URL from Safari/YouTube → ShareViewController.swift
2. ShareViewController saves data to App Groups UserDefaults
3. ShareViewController opens main app via deep link
4. App.tsx `checkForSharedContent()` reads shared data
5. Navigates to Add screen with `sharedUrl` parameter
6. AddLinkScreen shows toast and pre-fills form

### 🚨 CRITICAL RULES:

- **NEVER** delete or modify ShareExtension files
- **NEVER** remove AppGroupsModule files from Xcode project
- **NEVER** change the App Groups ID
- **NEVER** modify the share handling logic in App.tsx
- **NEVER** touch the navigation logic for shared URLs

### ⚠️ IF SHARE BREAKS:

1. Check App Groups capability is enabled
2. Verify `AppGroupsModule.m` is in Xcode project sources
3. Ensure App Groups ID matches in all files
4. Test with Xcode simulator logs to debug ShareViewController

### 📋 WORKING CONFIGURATION SUMMARY:

- **App Groups Capability**: ✅ Enabled with `group.com.pulsarventures.linklibraryai`
- **AppGroupsModule React Native Registration**: ✅ Working
- **ShareViewController**: ✅ Processing shared URLs
- **Deep Link Navigation**: ✅ Opening Add screen with shared URLs
- **Form Pre-filling**: ✅ URLs appear in Add form

**Last Working Date**: 2025-07-24
**Status**: ✅ FULLY FUNCTIONAL - DO NOT TOUCH

---

## HISTORICAL CONTEXT:

This share functionality was repeatedly broken during iOS build troubleshooting sessions. The following mistakes were made:

1. Accidentally removing AppGroupsModule.m from Xcode project
2. Breaking React Native module registration
3. Modifying Swift bridging headers
4. Breaking App Groups configuration

**These issues have been resolved. The share feature is now working perfectly. DO NOT TOUCH IT.**