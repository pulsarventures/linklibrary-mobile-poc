# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
React Native mobile application for managing links and collections with modern state management, authentication, and iOS Share Extension for saving URLs from other apps.

## Development Commands
```bash
# Development
npm start                 # Start Metro bundler
npm run ios              # Run on iOS simulator (includes build service cleanup)
npm run ios:clean        # Run iOS with cache reset
npm run android          # Run on Android emulator

# Code Quality
npm run lint             # Run all linting (rules, format, type-check)
npm run lint:fix         # Fix all linting issues
npm run lint:rules       # ESLint rules only
npm run lint:code-format # Prettier format check
npm run lint:type-check  # TypeScript type checking

# Testing
npm test                 # Run Jest tests
npm run test:report      # Run tests with coverage report

# iOS Specific
npm run pod-install      # Install iOS CocoaPods dependencies
npm run clean:build      # Clean Xcode build service (fixes PIF transfer errors)

# Troubleshooting iOS Builds
./scripts/clean-build-service.sh  # Clean Xcode build service manually
```

## Architecture Overview

### Core Stack
- **React Native 0.78.2** with TypeScript and React 19.0.0
- **React Navigation 7.x** (Stack + Tab navigators)
- **Zustand 5.x** for state management with persistence
- **TanStack Query 5.x** for server state and API caching
- **React Hook Form** with Zod validation
- **Keychain/MMKV** for secure storage
- **iOS Share Extension** for receiving URLs from other apps

### Project Structure
```
src/
├── screens/          # Main app screens (Login, Links, Collections, Tags, Add)
├── navigation/       # Navigation configuration with TypeScript types
├── hooks/domain/     # Business logic hooks organized by domain
│   ├── user/        # Auth store, auth interceptor, user management
│   ├── links/       # Links CRUD operations store
│   ├── collections/ # Collections management store
│   └── tags/        # Tags management store
├── services/        # API clients and external services
│   ├── api/client.ts        # Singleton API client with interceptors
│   ├── auth-api.service.ts  # Auth endpoints
│   ├── links-api.service.ts # Links CRUD endpoints
│   └── storage.ts           # Secure storage abstraction
├── components/      # Atomic design components
│   ├── atoms/      # Basic UI elements
│   ├── molecules/  # Compound components
│   └── organisms/  # Complex components
└── theme/          # Theming system and design tokens
```

### State Management Architecture
Domain-specific Zustand stores with consistent patterns:
- **useAuthStore** - Authentication state, user management, token handling
- **useLinksStore** - Links CRUD with optimistic updates
- **useCollectionsStore** - Collections with persistence
- **useTagsStore** - Tags management

Store pattern:
```typescript
{
  // State
  items: Item[]
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchItems: () => Promise<void>
  createItem: (data) => Promise<Item>
  updateItem: (id, data) => Promise<Item>
  deleteItem: (id) => Promise<void>
  
  // Utilities
  clearError: () => void
  resetStore: () => void
}
```

### Authentication & Security
- Google OAuth + email/password authentication
- Automatic token refresh with request queue management
- Secure token storage via Keychain (iOS) and encrypted preferences (Android)
- Auth interceptor pattern in `src/services/api/client.ts`
- Session persistence across app restarts

### API Integration
- Singleton API client with automatic retry and error handling
- Domain-specific service classes (AuthApiService, LinksApiService, etc.)
- TanStack Query for caching, background refetch, and optimistic updates
- Request/response interceptors for token management
- Consistent error handling patterns

### iOS Share Extension
Critical feature for receiving shared URLs from other apps:
- **App Groups**: `group.com.pulsarventures.linklibraryai`
- **Native Module**: `AppGroupsModule` bridges Swift and React Native
- **Share flow**: Other app → Share Extension → App Groups storage → Main app
- **Navigation**: Automatically routes to Add screen with shared URL

### Navigation Structure
```
RootStackParamList
├── Landing
├── Login/SignUp
└── Main (TabNavigator)
    ├── Links
    ├── Collections
    ├── Tags
    ├── Settings
    └── Add (hidden from tabs, used for sharing)
```

## Critical Files - DO NOT MODIFY
These files are essential for app functionality:
- `ios/ShareExtension/ShareViewController.swift` - Share Extension logic
- `ios/AppGroupsModule.swift` & `.m` - Native module for App Groups
- `ios/linklibrary_mobile/linklibrary_mobile.entitlements` - App Groups capability
- `src/App.tsx` - Share handling and navigation logic
- React Native version in `package.json` (0.78.2)

## Development Best Practices

### TypeScript
- Strict mode enabled
- Use interfaces for object shapes, types for unions
- Proper typing for all function parameters and returns
- Generic types for reusable API functions

### Component Development
- Functional components with hooks only
- Atomic design pattern (atoms → molecules → organisms)
- StyleSheet.create for performance
- React.memo for expensive components
- Proper loading and error states

### State Management
- Zustand for client state only
- TanStack Query for all server state
- Never duplicate server state in Zustand
- Use persist middleware for data that should survive restarts

### Error Handling
- Try/catch blocks for all async operations
- Meaningful error messages for users
- Context logging for debugging
- Network failure retry logic

### Performance Optimization
- FlatList optimization for large lists
- TanStack Query caching strategies
- Background data loading with `useBackgroundDataLoader`
- Avoid unnecessary re-renders

## Troubleshooting

### iOS Build Issues
If you encounter "RCTAppDependencyProvider.h not found" or PIF transfer errors:
```bash
# Clean everything
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
cd ios && pod deintegrate && pod install
npm run clean:build
```

### Share Extension Not Working
1. Verify App Groups entitlement is enabled in main app
2. Check App Groups ID matches: `group.com.pulsarventures.linklibraryai`
3. Test with `AppGroupsModule.testSaveSharedContent()`
4. Verify navigation to Add screen with shared URL

### Authentication Issues
- Check token storage in Keychain (iOS)
- Verify API_BASE_URL in config
- Test token refresh logic
- Check network interceptors

## Important Notes
- Always use `--legacy-peer-deps` with npm install (TypeScript ESLint peer dependency conflicts)
- Run `npm run lint` before committing
- Test on both iOS and Android before pushing
- Share Extension is iOS-only feature
- Keep React Native at 0.78.2 (newer versions may break Share Extension)