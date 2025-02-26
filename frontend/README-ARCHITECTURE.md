# SoraGo Frontend Architecture

## Project Structure

```
/frontend
├── public/               # Static files
│   ├── images/           # Image assets
│   ├── fonts/            # Font files
│   └── favicon.ico       # Favicon
├── src/
│   ├── components/       # Shared components
│   │   ├── common/       # Very reusable components (buttons, inputs, etc)
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   └── index.ts
│   │   │   └── ...
│   │   ├── layout/       # Layout components
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   └── ...
│   │   └── sections/     # Page sections (can be reused across pages)
│   │       ├── Hero/
│   │       ├── Features/
│   │       └── ...
│   ├── features/         # Feature-based modules
│   │   ├── authentication/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types.ts
│   │   ├── subscription/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types.ts
│   │   └── ...
│   ├── hooks/            # Shared custom hooks
│   ├── lib/              # External library wrappers
│   ├── pages/            # Next.js pages
│   │   ├── api/          # API routes
│   │   ├── _app.tsx
│   │   ├── index.tsx
│   │   └── ...
│   ├── services/         # API services
│   │   ├── api.ts        # Base API setup
│   │   ├── types.ts      # Shared API types
│   │   └── endpoints/    # API endpoints organized by domain
│   │       ├── auth.ts
│   │       ├── subscription.ts
│   │       └── ...
│   ├── store/            # State management
│   │   ├── index.ts      # Store configuration
│   │   └── slices/       # Store slices (if using Redux)
│   ├── styles/           # Global styles
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
├── jest.config.js        # Test configuration
└── package.json          # Dependencies and scripts
```

## Key Architectural Decisions

### 1. Feature-Based Organization

We organize code by features rather than technical types. Each feature folder contains everything related to that feature: components, hooks, services, and types.

### 2. Component Structure

- **Common Components**: Highly reusable UI elements
- **Layout Components**: Structural elements like headers, footers, and layouts
- **Section Components**: Larger page sections that could be reused across pages
- **Feature Components**: Components tied to specific features

### 3. State Management

For a large application, consider using:

- **React Context API** for simple shared state
- **Redux Toolkit** for complex global state management
- **React Query** for server state management

### 4. API Integration

- Centralized API service with axios or fetch
- Use React Query for data fetching, caching, and synchronization
- Organize API endpoints by domain in separate files

### 5. TypeScript Best Practices

- Strong typing for all components and functions
- Shared type definitions in dedicated files
- Interface prefixes with 'I' (e.g., IUser)

### 6. Code Quality and Testing

- Jest and React Testing Library for component testing
- Cypress for end-to-end testing
- ESLint and Prettier for code formatting

### 7. Performance Considerations

- Use Next.js Image component for optimized images
- Implement code splitting with dynamic imports
- Use React.memo for expensive components

## Component Design Pattern

For consistent component creation, follow this pattern:

```tsx
// Component folder structure
/ComponentName
  ├── ComponentName.tsx    // Main component
  ├── ComponentName.test.tsx // Tests
  ├── types.ts            // Component-specific types
  └── index.ts            // Export file

// Component code structure
import React from 'react';
import { IComponentProps } from './types';

export const ComponentName: React.FC<IComponentProps> = ({ prop1, prop2 }) => {
  // Component logic

  return (
    // JSX
  );
};

export default ComponentName;
```
