#!/bin/bash

# Fix for CocoaPods Xcode object version 70 compatibility issue
# This script downgrades the project object version to be compatible with CocoaPods

echo "🔧 Fixing Xcode project object version for CocoaPods compatibility..."

PROJECT_FILE="ios/linklibrary_mobile.xcodeproj/project.pbxproj"

if [ ! -f "$PROJECT_FILE" ]; then
    echo "❌ Project file not found: $PROJECT_FILE"
    exit 1
fi

# Backup the original file
cp "$PROJECT_FILE" "$PROJECT_FILE.backup"

# Replace object version 70 with 60 (compatible with CocoaPods)
sed -i '' 's/objectVersion = 70;/objectVersion = 60;/g' "$PROJECT_FILE"

# Replace compatibility version if needed
sed -i '' 's/compatibilityVersion = "Xcode 16.0";/compatibilityVersion = "Xcode 15.0";/g' "$PROJECT_FILE"

echo "✅ Fixed Xcode project object version"
echo "📝 Backup created at: $PROJECT_FILE.backup"

# Verify the change
if grep -q "objectVersion = 60;" "$PROJECT_FILE"; then
    echo "✅ Object version successfully changed to 60"
else
    echo "⚠️  Warning: Object version may not have been changed"
fi