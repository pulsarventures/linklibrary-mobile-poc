#!/bin/bash
set -e
echo "Current directory: $(pwd)"
echo "Repository contents:"
ls -la
echo "iOS directory contents:"
ls -la ios/
echo "Installing pods..."
cd ios
pod install
echo "Pods installed successfully"
echo "Pods directory contents:"
ls -la Pods/