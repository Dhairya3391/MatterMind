<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { physicsStore } from "$lib/stores/physics.store";

  const dispatch = createEventDispatcher();

  // Toolbar state
  let activeTool = "select";

  // Available tools
  const tools = [
    { id: "select", name: "Select", icon: "cursor", shortcut: "V" },
    { id: "rectangle", name: "Rectangle", icon: "square", shortcut: "R" },
    { id: "circle", name: "Circle", icon: "circle", shortcut: "C" },
    { id: "polygon", name: "Polygon", icon: "hexagon", shortcut: "P" },
    { id: "triangle", name: "Triangle", icon: "triangle", shortcut: "T" },
    { id: "pentagon", name: "Pentagon", icon: "pentagon", shortcut: "G" },
    { id: "star", name: "Star", icon: "star", shortcut: "S" },
    { id: "rope", name: "Rope", icon: "rope", shortcut: "O" },
  ];

  function handleToolSelect(toolId: string) {
    activeTool = toolId;
    if (toolId !== "select") {
      dispatch("createObject", { shape: toolId });
    }
    dispatch("toolChanged", { tool: toolId });
  }

  function handleKeydown(event: KeyboardEvent) {
    const tool = tools.find((t) => t.shortcut === event.key.toUpperCase());
    if (tool) {
      event.preventDefault();
      handleToolSelect(tool.id);
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- Floating Toolbar -->
<div class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
  <div
    class="flex items-center space-x-1 p-1.5 bg-base-200-80 backdrop-blur-md rounded-2xl shadow-glass border border-base-300-50"
  >
    <!-- All Tools in Single Row -->
    <div class="flex items-center space-x-1">
      {#each tools as tool}
        <button
          class="p-2 rounded-xl transition-all duration-200 hover:bg-base-300-50 group relative"
          class:bg-primary={activeTool === tool.id}
          class:text-primary-content={activeTool === tool.id}
          class:text-base-content={activeTool !== tool.id}
          on:click={() => handleToolSelect(tool.id)}
          title="{tool.name} ({tool.shortcut})"
        >
          <div class="w-5 h-5 flex items-center justify-center">
            {#if tool.icon === "cursor"}
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M13.64,21.97C13.14,22.21 12.54,22 12.31,21.5L10.13,16.76L7.62,18.78C7.45,18.92 7.24,19 7,19A1,1 0 0,1 6,18V3A1,1 0 0,1 7,2C7.24,2 7.47,2.09 7.64,2.23L7.65,2.22L19.14,11.86C19.57,12.22 19.62,12.85 19.27,13.27C19.12,13.45 18.91,13.57 18.7,13.61L15.54,14.23L17.74,18.96C18,19.46 17.76,20.05 17.26,20.28L13.64,21.97Z"
                />
              </svg>
            {:else if tool.icon === "square"}
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M3,3H21V21H3V3M5,5V19H19V5H5Z" />
              </svg>
            {:else if tool.icon === "circle"}
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"
                />
              </svg>
            {:else if tool.icon === "hexagon"}
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12,2L15.09,8.26L22,9.27L17,14.14L18.18,21.02L12,17.77L5.82,21.02L7,14.14L2,9.27L8.91,8.26L12,2Z"
                />
              </svg>
            {:else if tool.icon === "triangle"}
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2L2,19H22L12,2M12,6L17.5,17H6.5L12,6Z" />
              </svg>
            {:else if tool.icon === "pentagon"}
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12,2L15.09,8.26L22,9.27L17,14.14L18.18,21.02L12,17.77L5.82,21.02L7,14.14L2,9.27L8.91,8.26L12,2Z"
                />
              </svg>
            {:else if tool.icon === "star"}
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12,2L15.09,8.26L22,9.27L17,14.14L18.18,21.02L12,17.77L5.82,21.02L7,14.14L2,9.27L8.91,8.26L12,2Z"
                />
              </svg>
            {:else if tool.icon === "rope"}
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12,2C13.1,2 14,2.9 14,4C14,5.1 13.1,6 12,6C10.9,6 10,5.1 10,4C10,2.9 10.9,2 12,2M21,9V7L15,13L11,9L7,13L3,9V7L7,11L11,7L15,11L21,7V9Z"
                />
              </svg>
            {/if}
          </div>

          <!-- Tooltip -->
          <div
            class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-base-content text-base-100 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap"
          >
            {tool.name} ({tool.shortcut})
          </div>
        </button>
      {/each}
    </div>

    <!-- Divider -->
    <div class="w-px h-6 bg-base-300-50"></div>

    <!-- Physics Toggles -->
    <div class="flex items-center space-x-1">
      <button
        class="p-2 rounded-xl transition-all duration-200 hover:bg-base-300-50 group relative"
        class:bg-success={$physicsStore.gravity}
        class:text-success-content={$physicsStore.gravity}
        on:click={() => dispatch("toggleGravity")}
        title="Toggle Gravity (G)"
      >
        <div class="w-5 h-5 flex items-center justify-center">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"
            />
          </svg>
        </div>

        <!-- Tooltip -->
        <div
          class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-base-content text-base-100 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap"
        >
          {$physicsStore.gravity ? "Gravity On" : "Gravity Off"} (G)
        </div>
      </button>

      <button
        class="p-2 rounded-xl transition-all duration-200 hover:bg-base-300-50 group relative"
        class:bg-info={$physicsStore.showVectors}
        class:text-info-content={$physicsStore.showVectors}
        on:click={() => dispatch("toggleVectors")}
        title="Toggle Velocity Vectors (V)"
      >
        <div class="w-5 h-5 flex items-center justify-center">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M12,2L13.09,8.26L22,9.27L16,14.14L17.18,21.02L12,17.77L6.82,21.02L8,14.14L2,9.27L10.91,8.26L12,2Z"
            />
          </svg>
        </div>

        <!-- Tooltip -->
        <div
          class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-base-content text-base-100 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap"
        >
          {$physicsStore.showVectors ? "Vectors On" : "Vectors Off"} (V)
        </div>
      </button>

      <button
        class="p-2 rounded-xl transition-all duration-200 hover:bg-base-300-50 group relative"
        class:bg-warning={$physicsStore.showBounds}
        class:text-warning-content={$physicsStore.showBounds}
        on:click={() => dispatch("toggleBounds")}
        title="Toggle Boundaries (B)"
      >
        <div class="w-5 h-5 flex items-center justify-center">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19Z"
            />
          </svg>
        </div>

        <!-- Tooltip -->
        <div
          class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-base-content text-base-100 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap"
        >
          {$physicsStore.showBounds ? "Bounds On" : "Bounds Off"} (B)
        </div>
      </button>
    </div>

    <!-- Divider -->
    <div class="w-px h-6 bg-base-300-50"></div>

    <!-- Simulation Controls -->
    <div class="flex items-center space-x-1">
      <button
        class="p-2 rounded-xl transition-all duration-200 hover:bg-base-300-50 group relative"
        class:bg-success={$physicsStore.isRunning}
        class:text-success-content={$physicsStore.isRunning}
        on:click={() => dispatch("togglePause")}
        title="Play/Pause (Space)"
      >
        <div class="w-5 h-5 flex items-center justify-center">
          {#if $physicsStore.isRunning}
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M6,4H10V20H6V4M14,4H18V20H14V4Z" />
            </svg>
          {:else}
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M8,5V19L19,12L8,5Z" />
            </svg>
          {/if}
        </div>

        <!-- Tooltip -->
        <div
          class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-base-content text-base-100 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap"
        >
          {$physicsStore.isRunning ? "Pause" : "Play"} (Space)
        </div>
      </button>

      <button
        class="p-2 rounded-xl transition-all duration-200 hover:bg-base-300-50 group relative"
        on:click={() => dispatch("reset")}
        title="Reset (Ctrl+R)"
      >
        <div class="w-5 h-5 flex items-center justify-center">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M12,5V1L7,6L12,11V7A6,6 0 0,1 18,13A6,6 0 0,1 12,19A6,6 0 0,1 6,13H4A8,8 0 0,0 12,21A8,8 0 0,0 20,13A8,8 0 0,0 12,5Z"
            />
          </svg>
        </div>

        <!-- Tooltip -->
        <div
          class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-base-content text-base-100 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap"
        >
          Reset (Ctrl+R)
        </div>
      </button>
    </div>

    <!-- Divider -->
    <div class="w-px h-6 bg-base-300-50"></div>

    <!-- Settings Menu -->
    <div class="relative">
      <button
        class="p-2 rounded-xl transition-all duration-200 hover:bg-base-300-50 group relative"
        on:click={() => dispatch("toggleSettings")}
        title="Settings"
        aria-label="Settings"
      >
        <div class="w-5 h-5 flex items-center justify-center">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"
            />
          </svg>
        </div>
      </button>
    </div>
  </div>
</div>
