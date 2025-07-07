#!/bin/bash
set -e

echo "=== Xcode Cloud Pre-build Script ==="
echo "Current working directory: $(pwd)"
echo "Repository structure:"
ls -la

echo "=== Installing CocoaPods ==="
cd ios
echo "Now in ios directory: $(pwd)"
echo "Podfile contents:"
cat Podfile

echo "Running pod install..."
pod install

echo "=== Pod install completed ==="
echo "Checking Pods directory:"
ls -la Pods/

echo "=== Script completed successfully ==="