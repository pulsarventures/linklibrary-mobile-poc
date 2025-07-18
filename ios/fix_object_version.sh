#!/bin/bash

# Fix CocoaPods object version compatibility issue
# This script ensures the project uses object version 56 instead of 70

PROJECT_FILE="linklibrary_mobile.xcodeproj/project.pbxproj"

if [ -f "$PROJECT_FILE" ]; then
    echo "🔧 Fixing object version in $PROJECT_FILE"
    
    # Replace objectVersion = 70 with objectVersion = 56
    sed -i '' 's/objectVersion = 70;/objectVersion = 56;/g' "$PROJECT_FILE"
    
    if grep -q "objectVersion = 56" "$PROJECT_FILE"; then
        echo "✅ Successfully set objectVersion to 56"
    else
        echo "❌ Failed to set objectVersion"
        exit 1
    fi
else
    echo "❌ Project file not found: $PROJECT_FILE"
    exit 1
fi