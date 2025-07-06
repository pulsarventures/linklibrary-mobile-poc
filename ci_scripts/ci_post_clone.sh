#!/bin/sh

set -e  # Exit on any error

echo "=== POST-CLONE SCRIPT STARTING ==="
echo "Current directory: $(pwd)"
echo "Contents of current directory:"
ls -la

# Check if we're in the right place
if [ ! -d "ios" ]; then
    echo "ERROR: ios directory not found!"
    echo "Available directories:"
    ls -la
    exit 1
fi

# Navigate to iOS directory
echo "Navigating to ios directory..."
cd ios

echo "Contents of ios directory:"
ls -la

# Check if Podfile exists
if [ ! -f "Podfile" ]; then
    echo "ERROR: Podfile not found in ios directory!"
    echo "Contents of ios directory:"
    ls -la
    exit 1
fi

echo "Podfile found. Contents:"
cat Podfile

# Check if CocoaPods is installed
if ! command -v pod &> /dev/null; then
    echo "CocoaPods not found. Installing..."
    gem install cocoapods
fi

# Install CocoaPods dependencies
echo "Installing CocoaPods dependencies..."
pod install --verbose --repo-update

# Verify installation
if [ -d "Pods" ]; then
    echo "SUCCESS: Pods directory created"
    echo "Contents of Pods directory:"
    ls -la Pods/
    
    # Check for specific files
    if [ -f "Pods/Target Support Files/Pods-linklibrary_mobile/Pods-linklibrary_mobile.release.xcconfig" ]; then
        echo "SUCCESS: Configuration files found"
    else
        echo "ERROR: Configuration files not found"
        ls -la "Pods/Target Support Files/Pods-linklibrary_mobile/" || echo "Target Support Files directory not found"
    fi
else
    echo "ERROR: Pods directory not created"
    exit 1
fi

echo "=== POST-CLONE SCRIPT COMPLETED ==="