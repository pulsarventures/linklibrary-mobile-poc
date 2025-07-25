# Troubleshooting Guide

## iOS Build Issues

### Issue: RCTAppDependencyProvider.h: No such file or directory

**Error Message:**
```
/Users/[user]/Documents/LinkLibraryAI/linklibrary_mobile/ios/build/generated/ios/RCTAppDependencyProvider.h: No such file or directory
```

**Root Cause:**
This error occurs when React Native's CodeGen process fails to generate required iOS dependency files. Usually happens after:
- Dependency updates
- Node modules corruption
- CocoaPods cache issues
- Incomplete build processes

**Solution:**

1. **Clean and reinstall Node modules**
   ```bash
   # Remove node_modules and reinstall with legacy peer deps
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps
   ```

2. **Clean iOS build artifacts**
   ```bash
   # Remove iOS build directories
   rm -rf ios/build ios/DerivedData
   ```

3. **Deintegrate and reinstall CocoaPods**
   ```bash
   cd ios
   pod deintegrate
   pod install
   cd ..
   ```

4. **Verify generated files exist**
   ```bash
   ls -la ios/build/generated/ios/RCTAppDependencyProvider.*
   ```

**Expected Output:**
After successful fix, you should see:
```
-rw-r--r--@ 1 user  staff   644 Jul 24 22:12 ios/build/generated/ios/RCTAppDependencyProvider.h
-rw-r--r--@ 1 user  staff  1857 Jul 24 22:12 ios/build/generated/ios/RCTAppDependencyProvider.mm
```

**Prevention:**
- Always run `pod install` after major dependency changes
- Keep `node_modules` and `Podfile.lock` in sync
- Use `--legacy-peer-deps` for React Native projects with peer dependency conflicts
- Run full clean builds after switching branches or major updates

**Alternative Quick Fix:**
If the above doesn't work, try:
```bash
# Force React Native clean and rebuild
npx react-native clean
# Select all caches when prompted
```

### Common Related Errors

**GoogleSignIn Version Conflicts:**
```
CocoaPods could not find compatible versions for pod "GoogleSignIn"
```
This is usually a warning that doesn't prevent builds. The CodeGen process is more critical.

**GTMSessionFetcher/Core Conflicts:**
Similar to GoogleSignIn, usually resolved by the pod deintegrate/install process.

---

## Development Workflow

### After Dependency Updates
1. `npm install --legacy-peer-deps`
2. `cd ios && pod install`
3. Clean build artifacts if needed
4. Test build before committing

### Before Major Deployments
1. Clean all caches: `npx react-native clean`
2. Fresh pod install: `cd ios && pod deintegrate && pod install`
3. Test on device/simulator
4. Verify all generated files exist

---

## Notes

- This issue typically takes 3+ hours to resolve if not following this guide
- The `--legacy-peer-deps` flag is necessary due to TypeScript ESLint version conflicts in React Native 0.78.x
- Always check that CodeGen successfully generates all required files in `ios/build/generated/ios/`