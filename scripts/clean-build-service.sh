#!/bin/bash

# Script to clean Xcode build service and prevent PIF transfer errors
echo "🧹 Cleaning Xcode build service..."

# Kill build service processes
killall -9 com.apple.dt.XCBuildService 2>/dev/null || true
killall -9 xcodebuild 2>/dev/null || true

# Clear derived data
echo "🗑️  Clearing derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/* 2>/dev/null || true

# Clear module cache
echo "🧹 Clearing module cache..."
rm -rf ~/Library/Developer/Xcode/ModuleCache/* 2>/dev/null || true

# Clear build service cache
echo "🧹 Clearing build service cache..."
rm -rf ~/Library/Developer/CoreSimulator/Caches/dyld 2>/dev/null || true

echo "✅ Build service cleaned successfully"