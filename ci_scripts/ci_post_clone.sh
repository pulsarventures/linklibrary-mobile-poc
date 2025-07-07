#!/bin/sh
echo "Running post-clone script"
cd ios
pod install --repo-update
echo "Pods installed"
