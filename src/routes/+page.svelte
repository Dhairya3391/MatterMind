<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import Header from "$lib/components/Header.svelte";
  import Sidebar from "$lib/components/Sidebar.svelte";
  import PhysicsCanvas from "$lib/components/PhysicsCanvas.svelte";
  import FloatingToolbar from "$lib/components/FloatingToolbar.svelte";
  import {
    physicsStore,
    objectsStore,
    selectedObjectStore,
  } from "$lib/stores/physics.store";
  import type { ObjectConfig, PhysicsObject } from "$lib/types/physics.types";
  import { PhysicsEngine } from "$lib/physics/physics-engine";
  import type { Body } from "matter-js";
  import "$lib/types/global.types";

  // Define the form interface
  interface ObjectFormData {
    shape:
      | "rectangle"
      | "circle"
      | "polygon"
      | "triangle"
      | "pentagon"
      | "star"
      | "rope";
    name: string;
    color: string;
    width: number;
    height: number;
    radius: number;
    mass: number;
    density: number;
    friction: number;
    restitution: number;
    airResistance: number;
    rotation: number;
    angularVelocity: number;
    isStatic: boolean;
    isHollow: boolean;
    initialVelocityX: number;
    initialVelocityY: number;
    material: string;
    tags: string[];
    customTags: string;
  }

  // Component state
  let selectedObject: PhysicsObject | null = null;
  let physicsEngine: PhysicsEngine | null = null;
  let activeTab = "create";
  let sidebarOpen = true; // Start with sidebar open for better UX
  let settingsOpen = false;
  let isLoading = true;
  let objectForm: ObjectFormData = {
    shape: "rectangle",
    name: "",
    color: "#4CAF50",
    width: 50,
    height: 50,
    radius: 25,
    mass: 1,
    density: 0,
    friction: 0.1,
    restitution: 0.5,
    airResistance: 0,
    rotation: 0,
    angularVelocity: 0,
    isStatic: false,
    isHollow: false,
    initialVelocityX: 0,
    initialVelocityY: 0,
    material: "",
    tags: [],
    customTags: "",
  };

  // Canvas dimensions - responsive
  let canvasWidth = 1400;
  let canvasHeight = 720;
  let canvasContainer: HTMLElement;

  // Reactive statements
  $: selectedObject = $selectedObjectStore;

  // Update preview when form changes (only when not editing an existing object)
  $: if (!selectedObject && physicsEngine && objectForm) {
    setTimeout(() => updatePreview(), 0);
  }

  onMount(() => {
    // Set responsive canvas dimensions
    updateCanvasDimensions();
    window.addEventListener("resize", updateCanvasDimensions);

    // Get the physics engine from the global reference
    const checkForEngine = () => {
      if (window.matterMindPhysicsEngine) {
        physicsEngine = window.matterMindPhysicsEngine;
        isLoading = false;
        setTimeout(() => updatePreview(), 100);
      } else {
        setTimeout(checkForEngine, 100);
      }
    };
    checkForEngine();

    return () => {
      window.removeEventListener("resize", updateCanvasDimensions);
    };
  });

  function updateCanvasDimensions() {
    if (canvasContainer) {
      const rect = canvasContainer.getBoundingClientRect();
      canvasWidth = Math.max(800, rect.width - 32);
      canvasHeight = Math.max(600, rect.height - 32);
    }
  }

  // Event handlers
  function handleObjectSelected(object: PhysicsObject | null): void {
    if (object) {
      const physicsObject = $objectsStore.find((obj) => obj.id === object.id);
      if (physicsObject) {
        selectedObjectStore.set(physicsObject);
        populateForm(physicsObject);
        activeTab = "create";
        if (!sidebarOpen) sidebarOpen = true; // Auto-open sidebar when selecting
      }
    } else {
      selectedObjectStore.clear();
      clearForm();
      setTimeout(() => updatePreview(), 0);
    }
  }

  function handleCreateObject(event: CustomEvent): void {
    if (!physicsEngine) return;

    const { shape } = event.detail;

    const config: ObjectConfig = {
      shape: shape as
        | "rectangle"
        | "circle"
        | "polygon"
        | "triangle"
        | "pentagon"
        | "star"
        | "rope",
      name: `${shape.charAt(0).toUpperCase() + shape.slice(1)} ${Date.now()}`,
      color: "#4CAF50",
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      mass: 1,
      friction: 0.1,
      restitution: 0.5,
      airResistance: 0,
      rotation: 0,
      angularVelocity: 0,
      isStatic: false,
      isHollow: false,
      initialVelocityX: 0,
      initialVelocityY: 0,
      material: "",
      tags: [],
      ...(shape === "circle" && { radius: 25 }),
      ...(shape === "rectangle" && { width: 50, height: 50 }),
      ...(shape === "polygon" && { radius: 25 }),
      ...(shape === "triangle" && { radius: 25 }),
      ...(shape === "pentagon" && { radius: 25 }),
      ...(shape === "star" && { radius: 25 }),
      ...(shape === "rope" && { radius: 8 }),
    };

    const body = physicsEngine.createObject(config);
    if (body) {
      const newObject: PhysicsObject = {
        id: body.id,
        name: config.name || `Object ${body.id}`,
        color: config.color || "#4CAF50",
        config,
        selected: false,
        material: config.material,
        tags: config.tags,
      };

      objectsStore.addObject(newObject);
      clearForm();
      clearPreview();
      setTimeout(() => updatePreview(), 100);
    }
  }

  function handleUpdateObject(event: CustomEvent): void {
    if (!physicsEngine) return;

    const { id, config } = event.detail;
    physicsEngine.updateObject(id, config);
    objectsStore.updateObject(id, { config });
    clearForm();
  }

  function handleDeleteObject(event: CustomEvent): void {
    if (!physicsEngine) return;

    const objectId = event.detail;
    physicsEngine.deleteObject(objectId);
    objectsStore.removeObject(objectId);
    selectedObjectStore.clear();
    clearForm();
  }

  function handleTogglePause(): void {
    if (physicsEngine) {
      const isRunning = physicsEngine.togglePause();
      physicsStore.setRunning(isRunning);
    }
  }

  function handleToggleGravity(): void {
    if (physicsEngine) {
      const currentGravity = $physicsStore.gravity;
      const newGravity = !currentGravity;
      physicsEngine.setGravity(newGravity);
      physicsStore.setGravity(newGravity);
    }
  }

  function handleToggleVectors(): void {
    if (physicsEngine) {
      const currentVectors = $physicsStore.showVectors;
      const newVectors = !currentVectors;
      physicsEngine.setShowVectors(newVectors);
      physicsStore.setVectors(newVectors);
    }
  }

  function handleToggleGrid(): void {
    if (physicsEngine) {
      const currentGrid = $physicsStore.showGrid;
      const newGrid = !currentGrid;
      physicsEngine.setShowGrid(newGrid);
      physicsStore.setGrid(newGrid);
    }
  }

  function handleToggleBounds(): void {
    if (physicsEngine) {
      const currentBounds = $physicsStore.showBounds;
      const newBounds = !currentBounds;
      physicsEngine.setShowBounds(newBounds);
      physicsStore.setBounds(newBounds);
    }
  }

  function handleToggleSettings(): void {
    settingsOpen = !settingsOpen;
  }

  function handleToggleSidebar(): void {
    sidebarOpen = !sidebarOpen;
  }

  function handleReset(): void {
    if (confirm("Are you sure you want to reset the simulation?")) {
      if (physicsEngine) {
        physicsEngine.reset();
      }
      physicsStore.reset();
      objectsStore.clearObjects();
      selectedObjectStore.clear();
      clearForm();
    }
  }

  function createPresetObjects(): void {
    if (!physicsEngine) return;

    // Create a ground platform
    const groundConfig: ObjectConfig = {
      shape: "rectangle",
      name: "Ground Platform",
      color: "#8B4513",
      width: canvasWidth * 0.8,
      height: 20,
      x: canvasWidth / 2,
      y: canvasHeight - 40,
      mass: 1000,
      friction: 0.3,
      restitution: 0.2,
      airResistance: 0,
      rotation: 0,
      angularVelocity: 0,
      isStatic: true,
      isHollow: false,
      initialVelocityX: 0,
      initialVelocityY: 0,
      material: "wood",
      tags: ["ground", "wood"],
    };

    const groundBody = physicsEngine.createObject(groundConfig);
    if (groundBody) {
      objectsStore.addObject({
        id: groundBody.id,
        name: groundConfig.name!,
        color: groundConfig.color || "#8B4513",
        config: groundConfig,
        selected: false,
        material: groundConfig.material,
        tags: groundConfig.tags,
      });
    }

    // Create multiple demo objects
    const demoObjects = [
      {
        shape: "circle",
        name: "Bouncy Ball",
        color: "#FF6B6B",
        radius: 25,
        x: canvasWidth / 4,
        y: canvasHeight / 4,
        mass: 1,
        friction: 0.1,
        restitution: 0.9,
        material: "rubber",
        tags: ["ball", "rubber", "bouncy"],
        initialVelocityX: 3,
      },
      {
        shape: "rectangle",
        name: "Steel Block",
        color: "#A9A9A9",
        width: 60,
        height: 60,
        x: (canvasWidth * 2) / 3,
        y: canvasHeight / 3,
        mass: 10,
        friction: 0.2,
        restitution: 0.3,
        material: "steel",
        tags: ["block", "metal", "heavy"],
      },
      {
        shape: "triangle",
        name: "Ice Wedge",
        color: "#F0FFFF",
        radius: 30,
        x: canvasWidth / 2,
        y: canvasHeight / 2,
        mass: 2,
        friction: 0.02,
        restitution: 0.3,
        material: "ice",
        tags: ["wedge", "ice", "slippery"],
      }
    ];

    demoObjects.forEach((objConfig, index) => {
      setTimeout(() => {
        const config: ObjectConfig = {
          ...objConfig,
          airResistance: 0,
          rotation: 0,
          angularVelocity: 0,
          isStatic: false,
          isHollow: false,
          initialVelocityY: 0,
          ...objConfig
        };

        const body = physicsEngine!.createObject(config);
        if (body) {
          objectsStore.addObject({
            id: body.id,
            name: config.name!,
            color: config.color || "#4CAF50",
            config,
            selected: false,
            material: config.material,
            tags: config.tags,
          });
        }
      }, index * 200); // Stagger creation for visual effect
    });
  }

  function populateForm(object: PhysicsObject): void {
    clearPreview();
    objectForm = {
      shape: object.config.shape,
      name: object.name,
      color: object.color,
      width: object.config.width || 50,
      height: object.config.height || 50,
      radius: object.config.radius || 25,
      mass: object.config.mass,
      density: object.config.density || 0,
      friction: object.config.friction,
      restitution: object.config.restitution,
      airResistance: object.config.airResistance,
      rotation: object.config.rotation,
      angularVelocity: object.config.angularVelocity,
      isStatic: object.config.isStatic,
      isHollow: object.config.isHollow || false,
      initialVelocityX: object.config.initialVelocityX,
      initialVelocityY: object.config.initialVelocityY,
      material: object.material || "",
      tags: object.tags || [],
      customTags: (object.tags || []).join(", "),
    };
  }

  function clearForm(): void {
    clearPreview();
    objectForm = {
      shape: "rectangle",
      name: "",
      color: "#4CAF50",
      width: 50,
      height: 50,
      radius: 25,
      mass: 1,
      density: 0,
      friction: 0.1,
      restitution: 0.5,
      airResistance: 0,
      rotation: 0,
      angularVelocity: 0,
      isStatic: false,
      isHollow: false,
      initialVelocityX: 0,
      initialVelocityY: 0,
      material: "",
      tags: [],
      customTags: "",
    };
  }

  function updatePreview(): void {
    if (!physicsEngine) return;

    const center = { x: canvasWidth / 2, y: canvasHeight / 2 };
    const previewConfig: ObjectConfig = {
      shape: objectForm.shape as
        | "rectangle"
        | "circle"
        | "polygon"
        | "triangle"
        | "pentagon"
        | "star"
        | "rope",
      name: objectForm.name || "Preview Object",
      color: objectForm.color.startsWith("#") ? objectForm.color : "#4CAF50",
      x: center.x,
      y: center.y,
      mass: objectForm.mass,
      density: objectForm.density || undefined,
      friction: objectForm.friction,
      restitution: objectForm.restitution,
      airResistance: objectForm.airResistance,
      rotation: objectForm.rotation,
      angularVelocity: objectForm.angularVelocity,
      isStatic: objectForm.isStatic,
      isHollow: objectForm.isHollow,
      initialVelocityX: objectForm.initialVelocityX,
      initialVelocityY: objectForm.initialVelocityY,
      material: objectForm.material || undefined,
      tags: objectForm.tags,
      ...(objectForm.shape === "circle" && { radius: objectForm.radius }),
      ...(objectForm.shape === "rectangle" && {
        width: objectForm.width,
        height: objectForm.height,
      }),
      ...(objectForm.shape === "polygon" && { radius: objectForm.radius }),
      ...(objectForm.shape === "triangle" && { radius: objectForm.radius }),
      ...(objectForm.shape === "pentagon" && { radius: objectForm.radius }),
      ...(objectForm.shape === "star" && { radius: objectForm.radius }),
      ...(objectForm.shape === "rope" && { radius: objectForm.radius }),
    };

    physicsEngine.setPreviewObject(previewConfig);
  }

  function clearPreview(): void {
    if (physicsEngine) {
      physicsEngine.setPreviewObject(null);
    }
  }
</script>

<svelte:head>
  <title>MatterMind - Interactive Physics Simulation</title>
  <meta
    name="description"
    content="Interactive physics simulation platform built with Svelte and Matter.js"
  />
</svelte:head>

<!-- Loading Screen -->
{#if isLoading}
  <div class="fixed inset-0 bg-base-100 flex items-center justify-center z-50" in:fade={{ duration: 300 }}>
    <div class="text-center">
      <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center animate-float">
        <span class="text-primary-content font-bold text-2xl text-shadow">M</span>
      </div>
      <div class="loading-spinner mb-4"></div>
      <h2 class="text-xl font-bold text-base-content mb-2">Initializing Physics Engine</h2>
      <p class="text-sm text-base-content/60">Setting up the simulation environment...</p>
    </div>
  </div>
{/if}

<div
  class="min-h-screen bg-base-100 text-base-content"
  in:fade={{ duration: 300, delay: isLoading ? 500 : 0 }}
>
  <!-- Header -->
  <Header />

  <!-- Main Content -->
  <div
    class="grid h-[calc(100vh-4rem)] relative transition-all duration-300 ease-out"
    class:grid-cols-[380px_1fr]={sidebarOpen}
    class:grid-cols-[0_1fr]={!sidebarOpen}
  >
    <!-- Enhanced Sidebar -->
    <div
      class="h-full sidebar-glass overflow-hidden"
      class:translate-x-0={sidebarOpen}
      class:translate-x-full={!sidebarOpen}
    >
      {#if sidebarOpen}
        <Sidebar
          bind:activeTab
          bind:objectForm
          {selectedObject}
          on:togglePause={handleTogglePause}
          on:reset={handleReset}
          on:createPresetObjects={createPresetObjects}
          on:toggleGravity={handleToggleGravity}
          on:toggleVectors={handleToggleVectors}
          on:createObject={handleCreateObject}
          on:updateObject={handleUpdateObject}
          on:deleteObject={handleDeleteObject}
        />
      {/if}
    </div>

    <!-- Canvas Area -->
    <div class="flex flex-col relative overflow-hidden">
      <!-- Canvas Container -->
      <div class="flex-1 p-6" bind:this={canvasContainer}>
        <div class="w-full h-full physics-canvas rounded-2xl shadow-glass border border-base-300/20 overflow-hidden relative">
          <PhysicsCanvas
            width={canvasWidth}
            height={canvasHeight}
            showVectors={$physicsStore.showVectors}
            onObjectSelected={handleObjectSelected}
          />
          
          <!-- Canvas Overlay Info -->
          <div class="absolute top-4 right-4 flex flex-col space-y-2">
            {#if $physicsStore.showVectors}
              <div class="px-3 py-1.5 bg-glass rounded-lg text-xs text-base-content/80" in:fade>
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-error rounded-full"></div>
                  <span>Velocity Vectors</span>
                </div>
              </div>
            {/if}
            
            {#if !$physicsStore.gravity}
              <div class="px-3 py-1.5 bg-glass rounded-lg text-xs text-base-content/80" in:fade>
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-warning rounded-full animate-pulse-slow"></div>
                  <span>Zero Gravity Mode</span>
                </div>
              </div>
            {/if}
          </div>

          <!-- Canvas Instructions -->
          {#if $objectsStore.length === 0}
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none" in:fade={{ delay: 1000 }}>
              <div class="text-center max-w-md">
                <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-base-200/30 flex items-center justify-center">
                  <svg class="w-10 h-10 text-base-content/30" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-base-content/80 mb-2">Welcome to MatterMind</h3>
                <p class="text-sm text-base-content/60 mb-4">
                  Create physics objects using the toolbar above or the sidebar controls
                </p>
                <div class="flex items-center justify-center space-x-4 text-xs text-base-content/40">
                  <div class="flex items-center space-x-1">
                    <kbd class="px-2 py-1 bg-base-300/30 rounded">R</kbd>
                    <span>Rectangle</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <kbd class="px-2 py-1 bg-base-300/30 rounded">C</kbd>
                    <span>Circle</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <kbd class="px-2 py-1 bg-base-300/30 rounded">Space</kbd>
                    <span>Play/Pause</span>
                  </div>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Enhanced Floating Toolbar -->
    <FloatingToolbar
      on:createObject={handleCreateObject}
      on:togglePause={handleTogglePause}
      on:reset={handleReset}
      on:toggleGravity={handleToggleGravity}
      on:toggleVectors={handleToggleVectors}
      on:toggleGrid={handleToggleGrid}
      on:toggleBounds={handleToggleBounds}
      on:toggleSettings={handleToggleSettings}
      on:toggleSidebar={handleToggleSidebar}
    />

    <!-- Enhanced Settings Panel -->
    {#if settingsOpen}
      <div
        class="fixed top-20 right-6 z-40 w-96 bg-glass-dark rounded-2xl shadow-glass border border-base-300/20 p-6"
        in:fly={{ x: 20, duration: 300 }}
        out:fly={{ x: 20, duration: 200 }}
      >
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5Z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-base-content">Settings</h3>
              <p class="text-xs text-base-content/60">Configure simulation</p>
            </div>
          </div>
          <button
            class="p-2 rounded-lg hover:bg-base-300/30 transition-colors"
            on:click={() => (settingsOpen = false)}
            aria-label="Close settings"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="space-y-6">
          <!-- Physics Settings -->
          <div class="space-y-4">
            <h4 class="text-sm font-medium text-base-content/80 uppercase tracking-wide flex items-center space-x-2">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
              </svg>
              <span>Physics</span>
            </h4>

            <div class="space-y-3">
              <div class="flex items-center justify-between p-4 bg-base-200/20 rounded-xl border border-base-300/20">
                <div class="flex items-center space-x-3">
                  <div class="w-6 h-6 rounded-lg bg-success/20 flex items-center justify-center">
                    <svg class="w-3 h-3 text-success" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                    </svg>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-base-content">Gravity</span>
                    <p class="text-xs text-base-content/60">Gravitational force</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  class="toggle toggle-primary"
                  bind:checked={$physicsStore.gravity}
                  on:change={handleToggleGravity}
                />
              </div>

              <div class="flex items-center justify-between p-4 bg-base-200/20 rounded-xl border border-base-300/20">
                <div class="flex items-center space-x-3">
                  <div class="w-6 h-6 rounded-lg bg-info/20 flex items-center justify-center">
                    <svg class="w-3 h-3 text-info" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,2L13.09,8.26L22,9.27L16,14.14L17.18,21.02L12,17.77L6.82,21.02L8,14.14L2,9.27L10.91,8.26L12,2Z"/>
                    </svg>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-base-content">Show Vectors</span>
                    <p class="text-xs text-base-content/60">Velocity indicators</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  class="toggle toggle-primary"
                  bind:checked={$physicsStore.showVectors}
                  on:change={handleToggleVectors}
                />
              </div>
            </div>
          </div>

          <!-- Display Settings -->
          <div class="space-y-4">
            <h4 class="text-sm font-medium text-base-content/80 uppercase tracking-wide flex items-center space-x-2">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3,3H11V11H3V3M3,13H11V21H3V13M13,3H21V11H13V3M13,13H21V21H13V13Z"/>
              </svg>
              <span>Display</span>
            </h4>

            <div class="space-y-3">
              <div class="flex items-center justify-between p-4 bg-base-200/20 rounded-xl border border-base-300/20">
                <div class="flex items-center space-x-3">
                  <div class="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center">
                    <svg class="w-3 h-3 text-accent" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3,3H11V11H3V3M3,13H11V21H3V13M13,3H21V11H13V3M13,13H21V21H13V13Z"/>
                    </svg>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-base-content">Show Grid</span>
                    <p class="text-xs text-base-content/60">Background grid</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  class="toggle toggle-primary"
                  bind:checked={$physicsStore.showGrid}
                  on:change={handleToggleGrid}
                />
              </div>

              <div class="flex items-center justify-between p-4 bg-base-200/20 rounded-xl border border-base-300/20">
                <div class="flex items-center space-x-3">
                  <div class="w-6 h-6 rounded-lg bg-warning/20 flex items-center justify-center">
                    <svg class="w-3 h-3 text-warning" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19Z"/>
                    </svg>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-base-content">Show Bounds</span>
                    <p class="text-xs text-base-content/60">Boundary walls</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  class="toggle toggle-primary"
                  bind:checked={$physicsStore.showBounds}
                  on:change={handleToggleBounds}
                />
              </div>
            </div>
          </div>

          <!-- Performance Info -->
          <div class="p-4 bg-base-300/20 rounded-xl border border-base-300/20">
            <h4 class="text-sm font-medium text-base-content/80 mb-3">Performance</h4>
            <div class="grid grid-cols-2 gap-4 text-xs">
              <div class="text-center">
                <div class="text-lg font-bold text-primary">{$physicsStore.fps}</div>
                <div class="text-base-content/60">FPS</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-info">{$physicsStore.objectCount}</div>
                <div class="text-base-content/60">Objects</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Click outside to close settings -->
      <button
        class="fixed inset-0 z-30 bg-transparent"
        on:click={() => (settingsOpen = false)}
        aria-label="Close settings"
      ></button>
    {/if}
  </div>
</div>