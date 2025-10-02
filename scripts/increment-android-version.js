#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Path to build.gradle
const buildGradlePath = path.join(__dirname, '../android/app/build.gradle');

// Read the build.gradle file
let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');

// Find current versionCode and versionName
const versionCodeMatch = buildGradle.match(/versionCode\s+(\d+)/);
const versionNameMatch = buildGradle.match(/versionName\s+"([^"]+)"/);

if (!versionCodeMatch || !versionNameMatch) {
  console.error('❌ Could not find versionCode or versionName in build.gradle');
  process.exit(1);
}

const currentVersionCode = parseInt(versionCodeMatch[1]);
const currentVersionName = versionNameMatch[1];

// Increment version code (build number)
const newVersionCode = currentVersionCode + 1;

// Parse and increment version name (e.g., "1.0.35" -> "1.0.36")
const versionParts = currentVersionName.split('.');
if (versionParts.length === 3) {
  // Increment patch version (third number)
  versionParts[2] = String(parseInt(versionParts[2]) + 1);
} else if (versionParts.length === 2) {
  // Add patch version if it doesn't exist
  versionParts.push('1');
} else {
  console.error('❌ Unexpected version format:', currentVersionName);
  process.exit(1);
}
const newVersionName = versionParts.join('.');

// Replace version in build.gradle
buildGradle = buildGradle.replace(
  /versionCode\s+\d+/,
  `versionCode ${newVersionCode}`
);
buildGradle = buildGradle.replace(
  /versionName\s+"[^"]+"/,
  `versionName "${newVersionName}"`
);

// Write the updated build.gradle
fs.writeFileSync(buildGradlePath, buildGradle);

console.log('✅ Android build version incremented successfully!');
console.log(`   📱 Version Code (Build Number): ${currentVersionCode} → ${newVersionCode}`);
console.log(`   📋 Version Name (Display Version): ${currentVersionName} → ${newVersionName}`);
console.log('');
console.log('   These changes will be included in the next release build.');
console.log('   Run "yarn android:release" to build with the new version.');