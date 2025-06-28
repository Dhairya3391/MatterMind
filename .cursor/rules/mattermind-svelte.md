# MatterMind Svelte Project Rules

## 🎯 Project Overview

MatterMind is an interactive physics simulation platform built with SvelteKit and Matter.js. This project converts the existing vanilla JavaScript physics simulation to a modern Svelte-based architecture.

## 🏗️ Architecture Guidelines

### Project Structure

```
mattermind-svelte/
├── src/
│   ├── lib/
│   │   ├── components/          # Reusable Svelte components
│   │   ├── stores/              # Svelte stores for state management
│   │   ├── physics/             # Physics engine and utilities
│   │   ├── types/               # TypeScript type definitions
│   │   └── utils/               # Utility functions
│   ├── routes/                  # SvelteKit routes
│   └── app.html                 # Main HTML template
├── static/                      # Static assets
└── tests/                       # Test files
```

### Component Architecture

- **Atomic Design**: Use atomic design principles (atoms, molecules, organisms, templates, pages)
- **Single Responsibility**: Each component should have one clear purpose
- **Composition over Inheritance**: Prefer composition for component relationships
- **Props Interface**: Always define TypeScript interfaces for component props

## 💻 Coding Standards

### TypeScript

- **Strict Mode**: Always use strict TypeScript configuration
- **Type Definitions**: Define interfaces for all data structures
- **Generic Types**: Use generics for reusable components
- **No Any**: Avoid `any` type, use `unknown` or proper typing

### Svelte Best Practices

- **Reactive Statements**: Use `$:` for reactive statements, not `$: () => {}`
- **Store Usage**: Use Svelte stores for global state management
- **Event Handling**: Use Svelte event modifiers (`on:click|preventDefault`)
- **Component Props**: Use `export let` for component props
- **Lifecycle**: Use `onMount`, `onDestroy` for lifecycle management

### Code Style

- **Indentation**: 2 spaces for indentation
- **Quotes**: Use single quotes for strings
- **Semicolons**: Always use semicolons
- **Line Length**: Maximum 100 characters per line
- **Naming**: Use camelCase for variables, PascalCase for components

## 📦 Package Management

### Package Manager

- **pnpm**: Use pnpm as the primary package manager
- **Lock File**: Always commit `pnpm-lock.yaml`
- **Installation**: Use `pnpm install` for dependencies
- **Scripts**: Use `pnpm run <script>` for running scripts
- **Add Dependencies**: Use `pnpm add <package>` for production dependencies
- **Add Dev Dependencies**: Use `pnpm add -D <package>` for development dependencies

### Package Manager Commands

```bash
# Install dependencies
pnpm install

# Add production dependency
pnpm add matter-js

# Add development dependency
pnpm add -D @types/matter-js

# Run development server
pnpm run dev

# Build for production
pnpm run build

# Run tests
pnpm run test
```

## 🧠 Physics Engine Integration

### Matter.js Integration

- **Module Imports**: Import specific Matter.js modules, not the entire library
- **Type Safety**: Create TypeScript interfaces for Matter.js objects
- **Performance**: Use efficient rendering loops and avoid memory leaks
- **Error Handling**: Implement proper error handling for physics calculations

### Physics Components

- **PhysicsEngine**: Core physics simulation class
- **ObjectManager**: Manages physics objects and their properties
- **SceneManager**: Handles scene saving/loading and presets
- **UIController**: Manages user interface interactions

## 🎨 UI/UX Guidelines

### Design System

- **Consistent Colors**: Use a defined color palette
- **Typography**: Use consistent font families and sizes
- **Spacing**: Use consistent spacing scale (8px base unit)
- **Responsive**: Design for mobile-first approach

### Component Design

- **Accessibility**: Follow WCAG 2.1 AA guidelines
- **Keyboard Navigation**: Support keyboard-only navigation
- **Screen Readers**: Include proper ARIA labels and roles
- **Focus Management**: Implement proper focus management

## 📦 State Management

### Svelte Stores

- **Writable Stores**: For mutable state
- **Readable Stores**: For derived state
- **Custom Stores**: For complex state logic
- **Store Composition**: Compose stores for complex state

### State Structure

```typescript
// Example store structure
interface AppState {
  physics: {
    isRunning: boolean;
    gravity: boolean;
    showVectors: boolean;
  };
  objects: PhysicsObject[];
  selectedObject: PhysicsObject | null;
  scene: SceneData;
}
```

## 🔧 Development Workflow

### File Naming

- **Components**: PascalCase (e.g., `PhysicsCanvas.svelte`)
- **Stores**: camelCase with `.store.ts` suffix (e.g., `physics.store.ts`)
- **Types**: camelCase with `.types.ts` suffix (e.g., `physics.types.ts`)
- **Utils**: camelCase with `.utils.ts` suffix (e.g., `physics.utils.ts`)

### Import Organization

```typescript
// 1. External libraries
import { onMount } from "svelte";
import * as Matter from "matter-js";

// 2. Internal stores
import { physicsStore } from "$lib/stores/physics.store";

// 3. Internal components
import PhysicsCanvas from "$lib/components/PhysicsCanvas.svelte";

// 4. Internal utilities
import { createPhysicsObject } from "$lib/utils/physics.utils";

// 5. Types
import type { PhysicsObject } from "$lib/types/physics.types";
```

## 🧪 Testing Guidelines

### Test Structure

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows
- **Physics Tests**: Test physics calculations and behaviors

### Testing Tools

- **Vitest**: For unit and integration tests
- **Playwright**: For E2E tests
- **Testing Library**: For component testing

## 📚 Documentation

### Code Documentation

- **JSDoc**: Use JSDoc for function documentation
- **Component Props**: Document all component props
- **Complex Logic**: Add comments for complex algorithms
- **API Documentation**: Document public APIs

### README Structure

- **Project Overview**: Clear description of the project
- **Installation**: Step-by-step setup instructions
- **Usage**: How to use the application
- **API Reference**: Documentation of public APIs
- **Contributing**: Guidelines for contributors

## 🔒 Security Guidelines

### Input Validation

- **Sanitize Inputs**: Validate and sanitize all user inputs
- **File Uploads**: Validate file types and sizes
- **XSS Prevention**: Use proper escaping for user content

### Data Handling

- **Sensitive Data**: Never expose sensitive data in client-side code
- **API Keys**: Use environment variables for API keys
- **Error Messages**: Don't expose internal error details

## 🚀 Performance Guidelines

### Optimization

- **Bundle Size**: Keep bundle size minimal
- **Lazy Loading**: Use lazy loading for routes and components
- **Memoization**: Use reactive statements efficiently
- **Rendering**: Optimize physics rendering loops

### Monitoring

- **FPS Monitoring**: Track and display FPS
- **Memory Usage**: Monitor memory usage
- **Performance Metrics**: Track key performance indicators

## 🐛 Error Handling

### Error Boundaries

- **Graceful Degradation**: Handle errors gracefully
- **User Feedback**: Provide clear error messages
- **Logging**: Log errors for debugging
- **Recovery**: Implement error recovery mechanisms

### Validation

- **Input Validation**: Validate all user inputs
- **Physics Validation**: Validate physics parameters
- **Scene Validation**: Validate scene data integrity

## 🔄 Migration from Vanilla JS

### Conversion Strategy

- **Incremental Migration**: Convert components one by one
- **Feature Parity**: Ensure all features work in Svelte
- **Performance**: Maintain or improve performance
- **Testing**: Test thoroughly after each conversion

### Legacy Code

- **Gradual Removal**: Remove vanilla JS code as Svelte components are created
- **Documentation**: Document any temporary workarounds
- **Cleanup**: Clean up unused files and code

## 📋 Code Review Checklist

### Before Submitting

- [ ] Code follows TypeScript strict mode
- [ ] All components have proper TypeScript interfaces
- [ ] No console.log statements in production code
- [ ] Proper error handling implemented
- [ ] Accessibility guidelines followed
- [ ] Performance considerations addressed
- [ ] Tests written and passing
- [ ] Documentation updated

### Review Process

- [ ] Code style consistency
- [ ] Logic correctness
- [ ] Performance impact
- [ ] Security considerations
- [ ] Accessibility compliance
- [ ] Test coverage
- [ ] Documentation quality

## 🎯 Success Metrics

### Technical Metrics

- **Bundle Size**: < 500KB gzipped
- **Lighthouse Score**: > 90 for all categories
- **Test Coverage**: > 80%
- **TypeScript Coverage**: 100%

### User Experience Metrics

- **FPS**: Maintain 60 FPS during physics simulation
- **Load Time**: < 3 seconds initial load
- **Responsiveness**: < 100ms for user interactions
- **Accessibility**: WCAG 2.1 AA compliance

---

**Remember**: These rules are living guidelines. Update them as the project evolves and new patterns emerge.
