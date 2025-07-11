<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { physicsStore } from "$lib/stores/physics.store";
  import { fade, fly } from "svelte/transition";

  const dispatch = createEventDispatcher();

  // Toolbar state
  let activeTool = "select";
  let showTooltip = "";

  // Available tools with enhanced icons and descriptions
  const tools = [
    { 
      id: "select", 
      name: "Select", 
      icon: "cursor", 
      shortcut: "Q",
      description: "Select and move objects"
    },
    { 
      id: "rectangle", 
      name: "Rectangle", 
      icon: "square", 
      shortcut: "R",
      description: "Create rectangular objects"
    },
    { 
      id: "circle", 
      name: "Circle", 
      icon: "circle", 
      shortcut: "C",
      description: "Create circular objects"
    },
    { 
      id: "polygon", 
      name: "Polygon", 
      icon: "hexagon", 
      shortcut: "P",
      description: "Create polygon objects"
    },
    { 
      id: "triangle", 
      name: "Triangle", 
      icon: "triangle", 
      shortcut: "T",
      description: "Create triangular objects"
    },
    { 
      id: "pentagon", 
      name: "Pentagon", 
      icon: "pentagon", 
      shortcut: "N",
      description: "Create pentagon objects"
    },
    { 
      id: "star", 
      name: "Star", 
      icon: "star", 
      shortcut: "S",
      description: "Create star-shaped objects"
    },
  ];

  const physicsControls = [
    {
      id: "gravity",
      name: "Gravity",
      icon: "gravity",
      shortcut: "G",
      active: () => $physicsStore.gravity,
      description: "Toggle gravitational force"
    },
    {
      id: "vectors",
      name: "Vectors",
      icon: "vectors",
      shortcut: "V", 
      active: () => $physicsStore.showVectors,
      description: "Show velocity vectors"
    },
    {
      id: "bounds",
      name: "Bounds",
      icon: "bounds",
      shortcut: "B",
      active: () => $physicsStore.showBounds,
      description: "Show boundary walls"
    }
  ];

  function handleToolSelect(toolId: string) {
    activeTool = toolId;
    if (toolId !== "select") {
      dispatch("createObject", { shape: toolId });
    }
    dispatch("toolChanged", { tool: toolId });
  }

  function handleKeydown(event: KeyboardEvent) {
    // Check for tool shortcuts first
    const tool = tools.find((t) => t.shortcut === event.key.toUpperCase());
    if (tool) {
      event.preventDefault();
      handleToolSelect(tool.id);
      return;
    }

    // Check for physics shortcuts
    switch (event.key.toLowerCase()) {
      case "g": // Gravity
        event.preventDefault();
        dispatch("toggleGravity");
        break;
      case "v": // Vectors
        event.preventDefault();
        dispatch("toggleVectors");
        break;
      case "b": // Bounds
        event.preventDefault();
        dispatch("toggleBounds");
        break;
      case " ": // Space - Play/Pause
        event.preventDefault();
        dispatch("togglePause");
        break;
      case "r": // Reset (with Ctrl/Cmd)
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          dispatch("reset");
        }
        break;
    }

    // Add sidebar toggle shortcut
    if (event.key === "Tab" && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      dispatch("toggleSidebar");
    }
  }

  function getIcon(iconName: string) {
    const icons = {
      cursor: "M13.64,21.97C13.14,22.21 12.54,22 12.31,21.5L10.13,16.76L7.62,18.78C7.45,18.92 7.24,19 7,19A1,1 0 0,1 6,18V3A1,1 0 0,1 7,2C7.24,2 7.47,2.09 7.64,2.23L7.65,2.22L19.14,11.86C19.57,12.22 19.62,12.85 19.27,13.27C19.12,13.45 18.91,13.57 18.7,13.61L15.54,14.23L17.74,18.96C18,19.46 17.76,20.05 17.26,20.28L13.64,21.97Z",
      square: "M3,3H21V21H3V3M5,5V19H19V5H5Z",
      circle: "M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",
      hexagon: "M17.5,3.5L22.5,12L17.5,20.5H6.5L1.5,12L6.5,3.5H17.5Z",
      triangle: "M12,2L2,19H22L12,2M12,6L17.5,17H6.5L12,6Z",
      pentagon: "M12,2L15.09,8.26L22,9.27L17,14.14L18.18,21.02L12,17.77L5.82,21.02L7,14.14L2,9.27L8.91,8.26L12,2Z",
      star: "M12,2L15.09,8.26L22,9.27L17,14.14L18.18,21.02L12,17.77L5.82,21.02L7,14.14L2,9.27L8.91,8.26L12,2Z",
      gravity: "M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z",
      vectors: "M12,2L13.09,8.26L22,9.27L16,14.14L17.18,21.02L12,17.77L6.82,21.02L8,14.14L2,9.27L10.91,8.26L12,2Z",
      bounds: "M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19Z",
      play: "M8,5V19L19,12L8,5Z",
      pause: "M6,4H10V20H6V4M14,4H18V20H14V4Z",
      reset: "M12,5V1L7,6L12,11V7A6,6 0 0,1 18,13A6,6 0 0,1 12,19A6,6 0 0,1 6,13H4A8,8 0 0,0 12,21A8,8 0 0,0 20,13A8,8 0 0,0 12,5Z",
      menu: "M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z",
      settings: "M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"
    };
    return icons[iconName] || icons.cursor;
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- Enhanced Floating Toolbar -->
<div 
  class="fixed top-6 left-1/2 transform -translate-x-1/2 z-50"
  in:fly={{ y: -20, duration: 400, delay: 100 }}
>
  <div class="toolbar-glass rounded-2xl shadow-glass p-2">
    <div class="flex items-center space-x-1">
      <!-- Tool Selection -->
      <div class="flex items-center space-x-1 pr-2">
        {#each tools as tool}
          <button
            class="relative p-3 rounded-xl transition-all duration-200 group hover:scale-105 active:scale-95"
            class:bg-primary={activeTool === tool.id}
            class:text-primary-content={activeTool === tool.id}
            class:shadow-lg={activeTool === tool.id}
            class:text-base-content={activeTool !== tool.id}
            class:hover:bg-base-200/30={activeTool !== tool.id}
            on:click={() => handleToolSelect(tool.id)}
            on:mouseenter={() => showTooltip = tool.id}
            on:mouseleave={() => showTooltip = ""}
            aria-label="{tool.name} ({tool.shortcut})"
          >
            <div class="w-5 h-5 flex items-center justify-center">
              <svg fill="currentColor" viewBox="0 0 24 24" class="transition-transform group-hover:scale-110">
                <path d={getIcon(tool.icon)} />
              </svg>
            </div>

            <!-- Enhanced Tooltip -->
            {#if showTooltip === tool.id}
              <div 
                class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-base-content text-base-100 text-xs rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-10"
                in:fade={{ duration: 150 }}
              >
                <div class="font-medium">{tool.name}</div>
                <div class="text-xs opacity-75">{tool.description}</div>
                <div class="text-xs opacity-60 mt-1">Press {tool.shortcut}</div>
                <!-- Arrow -->
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-base-content"></div>
              </div>
            {/if}
          </button>
        {/each}
      </div>

      <!-- Divider -->
      <div class="w-px h-8 bg-base-300/30"></div>

      <!-- Physics Controls -->
      <div class="flex items-center space-x-1 px-2">
        {#each physicsControls as control}
          <button
            class="relative p-3 rounded-xl transition-all duration-200 group hover:scale-105 active:scale-95"
            class:bg-success={control.active()}
            class:text-success-content={control.active()}
            class:shadow-lg={control.active()}
            class:text-base-content={!control.active()}
            class:hover:bg-base-200/30={!control.active()}
            on:click={() => dispatch(`toggle${control.id.charAt(0).toUpperCase() + control.id.slice(1)}`)}
            on:mouseenter={() => showTooltip = control.id}
            on:mouseleave={() => showTooltip = ""}
            aria-label="{control.name} ({control.shortcut})"
          >
            <div class="w-5 h-5 flex items-center justify-center">
              <svg fill="currentColor" viewBox="0 0 24 24" class="transition-transform group-hover:scale-110">
                <path d={getIcon(control.icon)} />
              </svg>
            </div>

            <!-- Status Indicator -->
            {#if control.active()}
              <div class="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse-slow shadow-[0_0_6px_theme(colors.success)]"></div>
            {/if}

            <!-- Enhanced Tooltip -->
            {#if showTooltip === control.id}
              <div 
                class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-base-content text-base-100 text-xs rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-10"
                in:fade={{ duration: 150 }}
              >
                <div class="font-medium">{control.name} {control.active() ? 'On' : 'Off'}</div>
                <div class="text-xs opacity-75">{control.description}</div>
                <div class="text-xs opacity-60 mt-1">Press {control.shortcut}</div>
                <!-- Arrow -->
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-base-content"></div>
              </div>
            {/if}
          </button>
        {/each}
      </div>

      <!-- Divider -->
      <div class="w-px h-8 bg-base-300/30"></div>

      <!-- Simulation Controls -->
      <div class="flex items-center space-x-1 px-2">
        <button
          class="relative p-3 rounded-xl transition-all duration-200 group hover:scale-105 active:scale-95"
          class:bg-success={$physicsStore.isRunning}
          class:text-success-content={$physicsStore.isRunning}
          class:bg-warning={!$physicsStore.isRunning}
          class:text-warning-content={!$physicsStore.isRunning}
          class:shadow-lg={true}
          on:click={() => dispatch("togglePause")}
          on:mouseenter={() => showTooltip = "playPause"}
          on:mouseleave={() => showTooltip = ""}
          aria-label="Play/Pause (Space)"
        >
          <div class="w-5 h-5 flex items-center justify-center">
            <svg fill="currentColor" viewBox="0 0 24 24" class="transition-transform group-hover:scale-110">
              <path d={getIcon($physicsStore.isRunning ? 'pause' : 'play')} />
            </svg>
          </div>

          <!-- Enhanced Tooltip -->
          {#if showTooltip === "playPause"}
            <div 
              class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-base-content text-base-100 text-xs rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-10"
              in:fade={{ duration: 150 }}
            >
              <div class="font-medium">{$physicsStore.isRunning ? 'Pause' : 'Play'} Simulation</div>
              <div class="text-xs opacity-75">Control physics simulation</div>
              <div class="text-xs opacity-60 mt-1">Press Space</div>
              <!-- Arrow -->
              <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-base-content"></div>
            </div>
          {/if}
        </button>

        <button
          class="relative p-3 rounded-xl transition-all duration-200 group hover:scale-105 active:scale-95 text-base-content hover:bg-base-200/30"
          on:click={() => dispatch("reset")}
          on:mouseenter={() => showTooltip = "reset"}
          on:mouseleave={() => showTooltip = ""}
          aria-label="Reset (Ctrl+R)"
        >
          <div class="w-5 h-5 flex items-center justify-center">
            <svg fill="currentColor" viewBox="0 0 24 24" class="transition-transform group-hover:scale-110 group-hover:rotate-180">
              <path d={getIcon('reset')} />
            </svg>
          </div>

          <!-- Enhanced Tooltip -->
          {#if showTooltip === "reset"}
            <div 
              class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-base-content text-base-100 text-xs rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-10"
              in:fade={{ duration: 150 }}
            >
              <div class="font-medium">Reset Simulation</div>
              <div class="text-xs opacity-75">Clear all objects and restart</div>
              <div class="text-xs opacity-60 mt-1">Press Ctrl+R</div>
              <!-- Arrow -->
              <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-base-content"></div>
            </div>
          {/if}
        </button>
      </div>

      <!-- Divider -->
      <div class="w-px h-8 bg-base-300/30"></div>

      <!-- Interface Controls -->
      <div class="flex items-center space-x-1 pl-2">
        <button
          class="relative p-3 rounded-xl transition-all duration-200 group hover:scale-105 active:scale-95 text-base-content hover:bg-base-200/30"
          on:click={() => dispatch("toggleSidebar")}
          on:mouseenter={() => showTooltip = "sidebar"}
          on:mouseleave={() => showTooltip = ""}
          aria-label="Toggle Sidebar (Tab)"
        >
          <div class="w-5 h-5 flex items-center justify-center">
            <svg fill="currentColor" viewBox="0 0 24 24" class="transition-transform group-hover:scale-110">
              <path d={getIcon('menu')} />
            </svg>
          </div>

          <!-- Enhanced Tooltip -->
          {#if showTooltip === "sidebar"}
            <div 
              class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-base-content text-base-100 text-xs rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-10"
              in:fade={{ duration: 150 }}
            >
              <div class="font-medium">Toggle Sidebar</div>
              <div class="text-xs opacity-75">Show/hide control panel</div>
              <div class="text-xs opacity-60 mt-1">Press Tab</div>
              <!-- Arrow -->
              <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-base-content"></div>
            </div>
          {/if}
        </button>

        <button
          class="relative p-3 rounded-xl transition-all duration-200 group hover:scale-105 active:scale-95 text-base-content hover:bg-base-200/30"
          on:click={() => dispatch("toggleSettings")}
          on:mouseenter={() => showTooltip = "settings"}
          on:mouseleave={() => showTooltip = ""}
          aria-label="Settings"
        >
          <div class="w-5 h-5 flex items-center justify-center">
            <svg fill="currentColor" viewBox="0 0 24 24" class="transition-transform group-hover:scale-110 group-hover:rotate-90">
              <path d={getIcon('settings')} />
            </svg>
          </div>

          <!-- Enhanced Tooltip -->
          {#if showTooltip === "settings"}
            <div 
              class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-base-content text-base-100 text-xs rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-10"
              in:fade={{ duration: 150 }}
            >
              <div class="font-medium">Settings</div>
              <div class="text-xs opacity-75">Configure simulation options</div>
              <!-- Arrow -->
              <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-base-content"></div>
            </div>
          {/if}
        </button>
      </div>
    </div>
  </div>
</div>