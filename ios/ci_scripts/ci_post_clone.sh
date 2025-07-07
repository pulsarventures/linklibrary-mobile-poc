#!/bin/sh
set -e

echo "===== Installing CocoaPods ====="
brew install cocoapods

echo "===== Installing Node.js ====="
brew install node

echo "===== Installing yarn ====="
brew install yarn

echo "===== Change to repository root ====="
cd /Volumes/workspace/repository

echo "===== Running yarn install ====="
yarn install

echo "===== Change to iOS directory ====="
cd ios

echo "===== Running pod install ====="
pod install --repo-update

echo "===== CocoaPods installation completed ====="
