<script lang="ts">
  import { physicsStore } from "$lib/stores/physics.store";
  import { fade, fly } from "svelte/transition";
</script>

<header class="h-16 bg-glass-dark border-b border-base-300/20 shadow-glass-sm sticky top-0 z-30">
  <div class="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
    <!-- Logo Section -->
    <div class="flex items-center space-x-4" in:fly={{ x: -20, duration: 300 }}>
      <div class="relative">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <span class="text-primary-content font-bold text-xl text-shadow">M</span>
        </div>
        <div class="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full animate-pulse-slow shadow-[0_0_8px_theme(colors.success)]"></div>
      </div>
      <div>
        <h1 class="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          MatterMind
        </h1>
        <p class="text-xs text-base-content/60 font-medium tracking-wide uppercase">
          Physics Laboratory
        </p>
      </div>
    </div>

    <!-- Center Status -->
    <div class="hidden lg:flex items-center space-x-6" in:fade={{ delay: 200, duration: 300 }}>
      <div class="flex items-center space-x-3 px-4 py-2 bg-base-200/30 rounded-xl border border-base-300/20">
        <div class="status-dot" class:running={$physicsStore.isRunning} class:paused={!$physicsStore.isRunning}></div>
        <span class="text-sm font-medium text-base-content/80">
          {$physicsStore.isRunning ? "Simulation Running" : "Simulation Paused"}
        </span>
      </div>
      
      <div class="flex items-center space-x-2 px-3 py-2 bg-base-200/20 rounded-lg">
        <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z"/>
        </svg>
        <span class="text-sm font-semibold text-base-content">
          {$physicsStore.objectCount}
        </span>
        <span class="text-xs text-base-content/60">objects</span>
      </div>
    </div>

    <!-- Right Actions -->
    <div class="flex items-center space-x-4" in:fly={{ x: 20, duration: 300 }}>
      <!-- Performance Stats -->
      <div class="hidden md:flex items-center space-x-3">
        <div class="flex items-center space-x-2 px-3 py-2 bg-base-200/20 rounded-lg hover:bg-base-200/30 transition-colors">
          <div class="w-2 h-2 rounded-full bg-info animate-pulse-slow"></div>
          <span class="text-sm font-semibold text-base-content">
            {$physicsStore.fps}
          </span>
          <span class="text-xs text-base-content/60">FPS</span>
        </div>
        
        <div class="flex items-center space-x-2 px-3 py-2 bg-base-200/20 rounded-lg hover:bg-base-200/30 transition-colors">
          <svg class="w-3 h-3 text-success" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,6V14L17.25,10.5L11,6Z"/>
          </svg>
          <span class="text-xs text-base-content/60 font-medium">
            {$physicsStore.gravity ? 'Gravity' : 'Zero-G'}
          </span>
        </div>
      </div>

      <!-- Divider -->
      <div class="w-px h-8 bg-base-300/30"></div>

      <!-- GitHub Link -->
      <a
        href="https://github.com/Dhairya3391/mattermind"
        target="_blank"
        rel="noopener noreferrer"
        class="p-3 rounded-xl hover:bg-base-200/30 transition-all duration-200 hover:scale-105 group"
        aria-label="GitHub Repository"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          class="fill-current text-base-content/60 group-hover:text-base-content transition-colors"
        >
          <path
            d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
          />
        </svg>
      </a>

      <!-- Settings Button -->
      <button
        class="p-3 rounded-xl hover:bg-base-200/30 transition-all duration-200 hover:scale-105 group"
        aria-label="Settings"
      >
        <svg
          class="w-5 h-5 text-base-content/60 group-hover:text-base-content transition-colors group-hover:rotate-90"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"
          />
        </svg>
      </button>
    </div>
  </div>
</header>