# Adding ShareDataModule to Xcode Project

To complete the iOS Share Extension setup, you need to add the native module files to your Xcode project:

## Steps:

1. **Open your project in Xcode**
   - Open `ios/linklibrary_mobile.xcworkspace` (not .xcodeproj)

2. **Add ShareDataModule.swift**
   - In Xcode, right-click on the `linklibrary_mobile` folder (yellow folder)
   - Select "Add Files to 'linklibrary_mobile'"
   - Navigate to and select `ios/ShareDataModule.swift`
   - Make sure "Add to target" has `linklibrary_mobile` checked
   - Click "Add"

3. **Add ShareDataModule.m**
   - Repeat the same process for `ios/ShareDataModule.m`
   - Make sure "Add to target" has `linklibrary_mobile` checked

4. **Verify the files are added**
   - Both files should appear in the project navigator under the `linklibrary_mobile` target
   - The files should have a blue icon (indicating they're part of the target)

5. **Build and test**
   - Clean the project (Product → Clean Build Folder)
   - Build and run on your device
   - Try sharing from Safari to test the Share Extension

## What these files do:

- **ShareDataModule.swift**: Native Swift module that reads shared data from App Group UserDefaults
- **ShareDataModule.m**: Objective-C bridge that exposes the Swift module to React Native

The Share Extension will now be able to:
1. Save shared URLs/text to App Group UserDefaults
2. Open the main app via the `linklibrary://share` URL scheme
3. The main app will read the shared data and process it 