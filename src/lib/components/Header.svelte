<script lang="ts">
  import { physicsStore } from "$lib/stores/physics.store";
</script>

<header class="h-14 bg-base-200 border-b border-base-300 shadow-sm">
  <div class="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
    <!-- Logo -->
    <div class="flex items-center space-x-4">
      <div
        class="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm"
      >
        <span class="text-primary-content font-bold text-lg">M</span>
      </div>
      <div>
        <h1 class="text-xl font-bold text-base-content">MatterMind</h1>
        <p class="text-xs text-base-content/50 font-medium">Physics Lab</p>
      </div>
    </div>

    <!-- Center Stats -->
    <div class="hidden lg:flex items-center space-x-4">
      <div
        class="flex items-center space-x-2 px-3 py-1.5 bg-base-300 rounded-lg"
      >
        <div class="w-2 h-2 rounded-full bg-success"></div>
        <span class="text-sm font-medium text-base-content/70"
          >{$physicsStore.objectCount} objects</span
        >
      </div>
      <div
        class="flex items-center space-x-2 px-3 py-1.5 bg-base-300 rounded-lg"
      >
        <div class="w-2 h-2 rounded-full bg-info"></div>
        <span class="text-sm font-medium text-base-content/70"
          >{$physicsStore.fps} FPS</span
        >
      </div>
      <div
        class="flex items-center space-x-2 px-3 py-1.5 bg-base-300 rounded-lg"
      >
        <div
          class="w-2 h-2 rounded-full"
          class:bg-success={$physicsStore.isRunning}
          class:bg-warning={!$physicsStore.isRunning}
        ></div>
        <span class="text-sm font-medium text-base-content/70"
          >{$physicsStore.isRunning ? "Running" : "Paused"}</span
        >
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center space-x-3">
      <a
        href="https://github.com/your-repo/mattermind-svelte"
        target="_blank"
        rel="noopener noreferrer"
        class="p-2 rounded-lg hover:bg-base-300 transition-colors"
        aria-label="GitHub Repository"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          class="fill-current text-base-content/60 hover:text-base-content transition-colors"
        >
          <path
            d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
          ></path>
        </svg>
      </a>
    </div>
  </div>
</header>
