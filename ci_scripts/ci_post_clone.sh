#!/bin/bash
set -e

echo "🔧 [Post-Clone] Starting post-clone setup..."

# Navigate to iOS directory if needed (e.g., if in a monorepo)
# cd ios

# 1. Install CocoaPods dependencies
if [ -f "Podfile" ]; then
    echo "📦 Installing CocoaPods dependencies..."
    pod install --repo-update
else
    echo "⚠️ No Podfile found. Skipping pod install."
fi

# 2. Unlock keychain and import code signing certificates (if applicable)
# These steps only apply if you're using manual signing (optional)
if [ -n "$CERTIFICATE_PATH" ] && [ -n "$CERTIFICATE_PASSWORD" ]; then
    echo "🔐 Importing signing certificate..."
    security create-keychain -p "" build.keychain
    security import "$CERTIFICATE_PATH" -k build.keychain -P "$CERTIFICATE_PASSWORD" -T /usr/bin/codesign
    security list-keychains -s build.keychain
    security unlock-keychain -p "" build.keychain
    security set-keychain-settings
else
    echo "📝 No signing certificate provided. Skipping code signing import."
fi

# 3. Install provisioning profiles (if any)
if [ -d "provisioning_profiles" ]; then
    echo "📲 Installing provisioning profiles..."
    mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles
    cp provisioning_profiles/*.mobileprovision ~/Library/MobileDevice/Provisioning\ Profiles/
else
    echo "📂 No provisioning profiles found. Skipping."
fi

echo "✅ [Post-Clone] Finished setup."
