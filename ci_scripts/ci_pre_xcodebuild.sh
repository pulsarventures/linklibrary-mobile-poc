#!/bin/sh
echo "Running pre-xcodebuild script"
cd ios
pod install
echo "Pods ready"
