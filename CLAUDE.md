# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
A React Native mobile application for managing links and collections, built with TypeScript and modern state management.

## Development Commands
```bash
# Development
npm start                 # Start Metro bundler
npm run ios              # Run on iOS simulator
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
```

## Architecture Overview

### Core Structure
- **React Native 0.80.1** with TypeScript and React 19.1.0
- **React Navigation** for routing (Stack + Tab navigators)
- **Zustand** for state management
- **TanStack Query** for server state and API caching
- **React Hook Form** with Zod validation
- **Keychain/MMKV** for secure storage

### Key Directories
- `src/screens/` - Main app screens (Login, Links, Collections, Tags, Add)
- `src/navigation/` - Navigation configuration and types
- `src/hooks/domain/` - Business logic hooks organized by domain
- `src/services/` - API clients and external service integrations
- `src/components/` - Reusable UI components (atoms/molecules/organisms)
- `src/theme/` - Theming system and design tokens
- `src/share/` - iOS Share Extension integration

### State Management Pattern
The app uses domain-specific Zustand stores:
- `useAuthStore` - Authentication state and user management
- `useLinksStore` - Links CRUD operations and state
- `useCollectionsStore` - Collections management
- `useTagsStore` - Tags management

All stores follow the same pattern with actions like `fetch*`, `create*`, `update*`, `delete*` and maintain loading/error states.

### Authentication Flow
1. App initializes with `useAuth` hook checking stored credentials
2. Uses React Navigation conditional rendering based on auth state
3. Supports Google OAuth and traditional email/password
4. Implements automatic token refresh with interceptors
5. Secure storage via Keychain (iOS) and encrypted preferences

### API Integration
- Base API client in `src/services/api/client.ts` using axios
- Domain-specific API services (auth, links, collections, tags)
- TanStack Query for caching, background sync, and optimistic updates
- Automatic retry logic and error handling

### iOS Share Extension
- Native iOS Share Extension for receiving shared URLs
- Bridge between native Swift code and React Native
- Handles sharing intent when app is closed/backgrounded
- Queues shared URLs until navigation is ready

## Development Guidelines

### File Organization
- Use absolute imports with `@/` prefix (configured in babel.config.js)
- Follow atomic design pattern for components
- Group related files in domain folders under `hooks/domain/`
- Keep API types separate from component types

### State Management
- Use Zustand stores for domain state, never local component state for business logic  
- TanStack Query for all server state - don't duplicate in Zustand
- Follow existing store patterns for consistency
- Use TypeScript interfaces for all store state and actions

### Navigation
- Use typed navigation with proper TypeScript definitions
- Screen params defined in `navigation/types.ts`
- Use `navigationRef` for programmatic navigation from outside components

### Testing
- Jest configuration with React Native Testing Library
- Test utilities in `tests/` directory
- Mock implementations for native modules
- Run `npm run test:report` for coverage analysis

### Code Quality
- ESLint with React Native and TypeScript rules
- Prettier for consistent formatting
- TypeScript strict mode enabled
- Run all quality checks before committing: `npm run lint`