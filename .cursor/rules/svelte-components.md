# Svelte Component Rules for MatterMind

## 🧩 Component Structure

### Basic Component Template

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { ComponentProps } from './Component.types';

  // Props
  export let prop1: string = 'default';
  export let prop2: number = 0;
  export let prop3: boolean = false;

  // Reactive variables
  $: computedValue = prop1 + prop2;

  // Lifecycle
  onMount(() => {
    // Component mounted logic
  });

  onDestroy(() => {
    // Cleanup logic
  });

  // Event handlers
  function handleClick(event: MouseEvent) {
    // Handle click
  }
</script>

<!-- Template -->
<div class="component" class:active={prop3}>
  <slot />
</div>

<style>
  .component {
    /* Styles */
  }

  .active {
    /* Active state styles */
  }
</style>
```

## 📝 Component Naming

### File Naming

- **Components**: `PascalCase.svelte` (e.g., `PhysicsCanvas.svelte`)
- **Types**: `ComponentName.types.ts` (e.g., `PhysicsCanvas.types.ts`)
- **Stores**: `componentName.store.ts` (e.g., `physicsCanvas.store.ts`)

### Component Naming

- **Atomic**: `Button.svelte`, `Input.svelte`, `Icon.svelte`
- **Molecular**: `ObjectForm.svelte`, `ControlPanel.svelte`
- **Organism**: `Sidebar.svelte`, `PhysicsSimulation.svelte`
- **Template**: `MainLayout.svelte`, `SimulationLayout.svelte`

## 🎯 Props and Types

### Props Interface

```typescript
// ComponentName.types.ts
export interface ComponentProps {
  // Required props
  requiredProp: string;

  // Optional props with defaults
  optionalProp?: number;

  // Boolean props
  isActive?: boolean;

  // Function props
  onEvent?: (data: EventData) => void;

  // Complex object props
  config?: {
    key: string;
    value: number;
  };
}
```

### Props Usage

```svelte
<script lang="ts">
  import type { ComponentProps } from './Component.types';

  // Define props with interface
  interface $$Props extends ComponentProps {}

  // Export props with defaults
  export let requiredProp: string;
  export let optionalProp: number = 0;
  export let isActive: boolean = false;
  export let onEvent: ((data: EventData) => void) | undefined = undefined;
</script>
```

## 🔄 Reactive Statements

### Best Practices

```svelte
<script lang="ts">
  // ✅ Good: Simple reactive statement
  $: doubled = count * 2;

  // ✅ Good: Reactive statement with condition
  $: if (count > 10) {
    console.log('Count is high');
  }

  // ✅ Good: Reactive statement with multiple dependencies
  $: {
    console.log('Count or name changed');
    console.log(count, name);
  }

  // ❌ Bad: Avoid function calls in reactive statements
  $: result = expensiveCalculation(count);

  // ✅ Good: Use reactive statement to trigger function
  $: if (count) {
    result = expensiveCalculation(count);
  }
</script>
```

## 🎨 Styling Guidelines

### CSS Organization

```svelte
<style>
  /* 1. Layout styles */
  .container {
    display: flex;
    flex-direction: column;
  }

  /* 2. Component styles */
  .button {
    padding: 8px 16px;
    border-radius: 4px;
  }

  /* 3. State styles */
  .button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* 4. Modifier styles */
  .button.primary {
    background-color: var(--color-primary);
  }

  /* 5. Responsive styles */
  @media (max-width: 768px) {
    .container {
      flex-direction: row;
    }
  }
</style>
```

### CSS Variables

```svelte
<style>
  /* Use CSS custom properties for theming */
  .component {
    --component-padding: 16px;
    --component-border-radius: 8px;
    --component-background: var(--color-surface);

    padding: var(--component-padding);
    border-radius: var(--component-border-radius);
    background: var(--component-background);
  }
</style>
```

## 🎭 Event Handling

### Event Modifiers

```svelte
<!-- Use Svelte event modifiers -->
<button on:click|preventDefault|stopPropagation={handleClick}>
  Click me
</button>

<input on:input|debounce={300} on:keydown|preventDefault={handleKeydown} />
```

### Custom Events

```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    click: { x: number; y: number };
    change: string;
    submit: FormData;
  }>();

  function handleClick(event: MouseEvent) {
    dispatch('click', {
      x: event.clientX,
      y: event.clientY
    });
  }
</script>

<button on:click={handleClick}>Click</button>
```

## 🔧 Lifecycle Management

### onMount

```svelte
<script lang="ts">
  import { onMount } from 'svelte';

  onMount(() => {
    // Initialize third-party libraries
    // Set up event listeners
    // Load data

    return () => {
      // Cleanup function (optional)
      // Remove event listeners
      // Dispose resources
    };
  });
</script>
```

### onDestroy

```svelte
<script lang="ts">
  import { onDestroy } from 'svelte';

  onDestroy(() => {
    // Cleanup subscriptions
    // Dispose resources
    // Cancel timers
  });
</script>
```

## 📦 Store Integration

### Store Usage

```svelte
<script lang="ts">
  import { physicsStore } from '$lib/stores/physics.store';
  import { derived } from 'svelte/store';

  // Subscribe to store
  $: physicsState = $physicsStore;

  // Derived store
  const isRunning = derived(physicsStore, ($store) => $store.isRunning);

  // Update store
  function togglePhysics() {
    physicsStore.update(state => ({
      ...state,
      isRunning: !state.isRunning
    }));
  }
</script>
```

## 🧪 Testing Components

### Component Test Structure

```typescript
// ComponentName.test.ts
import { render, fireEvent } from "@testing-library/svelte";
import Component from "./Component.svelte";

describe("Component", () => {
  it("renders correctly", () => {
    const { getByText } = render(Component, {
      props: { title: "Test" },
    });

    expect(getByText("Test")).toBeInTheDocument();
  });

  it("handles events", async () => {
    const { getByRole } = render(Component);
    const button = getByRole("button");

    await fireEvent.click(button);
    // Assert expected behavior
  });
});
```

## 🚫 Anti-Patterns

### What to Avoid

```svelte
<!-- ❌ Don't mutate props directly -->
<script>
  export let count = 0;
  count++; // This will cause an error
</script>

<!-- ❌ Don't use inline styles -->
<div style="color: red; font-size: 16px;">Text</div>

<!-- ❌ Don't use global CSS classes without scoping -->
<div class="global-class">Content</div>

<!-- ❌ Don't use complex logic in templates -->
{#if complexCalculation(data) && anotherCalculation(data)}
  Content
{/if}
```

### What to Do Instead

```svelte
<!-- ✅ Use reactive statements for derived values -->
<script>
  export let count = 0;
  $: doubledCount = count * 2;
</script>

<!-- ✅ Use CSS classes -->
<div class="error-text">Text</div>

<!-- ✅ Use scoped styles -->
<div class="component">Content</div>

<!-- ✅ Move complex logic to reactive statements -->
<script>
  $: shouldShow = complexCalculation(data) && anotherCalculation(data);
</script>
{#if shouldShow}
  Content
{/if}
```

## 📋 Component Checklist

### Before Creating a Component

- [ ] Define clear purpose and responsibility
- [ ] Plan component interface (props, events)
- [ ] Consider reusability and composition
- [ ] Plan state management strategy

### During Development

- [ ] Use TypeScript interfaces for props
- [ ] Implement proper event handling
- [ ] Add accessibility attributes
- [ ] Write component tests
- [ ] Use consistent naming conventions

### Before Submission

- [ ] Remove console.log statements
- [ ] Check for memory leaks
- [ ] Verify responsive behavior
- [ ] Test with different prop combinations
- [ ] Update documentation
