<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
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
  let sidebarOpen = false; // Start with sidebar closed for Excalidraw-like experience
  let settingsOpen = false; // New state for settings panel
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
        setTimeout(() => updatePreview(), 100);
      } else {
        setTimeout(checkForEngine, 100);
      }
    };
    checkForEngine();
  });

  function updateCanvasDimensions() {
    const container = document.querySelector(".canvas-container");
    if (container) {
      const rect = container.getBoundingClientRect();
      canvasWidth = Math.max(800, rect.width - 32); // Account for padding
      canvasHeight = Math.max(600, rect.height - 32); // Account for padding
    }
  }

  // Event handlers
  function handleObjectSelected(object: PhysicsObject | null): void {
    if (object) {
      // Find the object in our store
      const physicsObject = $objectsStore.find((obj) => obj.id === object.id);
      if (physicsObject) {
        selectedObjectStore.set(physicsObject);
        populateForm(physicsObject);
        activeTab = "create"; // Switch to create tab when object is selected
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

    // Create a default config for the selected shape
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
      // Add shape-specific properties
      ...(shape === "circle" && { radius: 25 }),
      ...(shape === "rectangle" && { width: 50, height: 50 }),
      ...(shape === "polygon" && { radius: 25 }),
      ...(shape === "triangle" && { radius: 25 }),
      ...(shape === "pentagon" && { radius: 25 }),
      ...(shape === "star" && { radius: 25 }),
      ...(shape === "rope" && { radius: 8 }),
    };

    // Create the physics object
    const body = physicsEngine.createObject(config);
    if (body) {
      // Add to store
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
      // Show preview again after creation
      setTimeout(() => updatePreview(), 100);
    }
  }

  function handleUpdateObject(event: CustomEvent): void {
    if (!physicsEngine) return;

    const { id, config } = event.detail;

    // Update the physics object
    physicsEngine.updateObject(id, config);

    // Update the store
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
      name: "Ground",
      color: "#8B4513",
      width: canvasWidth,
      height: 20,
      x: canvasWidth / 2,
      y: canvasHeight - 10,
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
      const groundObject: PhysicsObject = {
        id: groundBody.id,
        name: groundConfig.name!,
        color: groundConfig.color || "#8B4513",
        config: groundConfig,
        selected: false,
        material: groundConfig.material,
        tags: groundConfig.tags,
      };
      objectsStore.addObject(groundObject);
    }

    // Create a bouncing ball
    const ballConfig: ObjectConfig = {
      shape: "circle",
      name: "Bouncy Ball",
      color: "#FF6B6B",
      radius: 25,
      x: canvasWidth / 3,
      y: canvasHeight / 3,
      mass: 1,
      friction: 0.1,
      restitution: 0.9,
      airResistance: 0.01,
      rotation: 0,
      angularVelocity: 0,
      isStatic: false,
      isHollow: false,
      initialVelocityX: 5,
      initialVelocityY: 0,
      material: "rubber",
      tags: ["ball", "rubber", "bouncy"],
    };

    const ballBody = physicsEngine.createObject(ballConfig);
    if (ballBody) {
      const ballObject: PhysicsObject = {
        id: ballBody.id,
        name: ballConfig.name!,
        color: ballConfig.color || "#FF6B6B",
        config: ballConfig,
        selected: false,
        material: ballConfig.material,
        tags: ballConfig.tags,
      };
      objectsStore.addObject(ballObject);
    }

    // Create a heavy block
    const blockConfig: ObjectConfig = {
      shape: "rectangle",
      name: "Heavy Block",
      color: "#C0C0C0",
      width: 60,
      height: 60,
      x: (canvasWidth * 2) / 3,
      y: canvasHeight / 3,
      mass: 10,
      friction: 0.2,
      restitution: 0.3,
      airResistance: 0,
      rotation: 0,
      angularVelocity: 0,
      isStatic: false,
      isHollow: false,
      initialVelocityX: 0,
      initialVelocityY: 0,
      material: "metal",
      tags: ["block", "metal", "heavy"],
    };

    const blockBody = physicsEngine.createObject(blockConfig);
    if (blockBody) {
      const blockObject: PhysicsObject = {
        id: blockBody.id,
        name: blockConfig.name!,
        color: blockConfig.color || "#C0C0C0",
        config: blockConfig,
        selected: false,
        material: blockConfig.material,
        tags: blockConfig.tags,
      };
      objectsStore.addObject(blockObject);
    }
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

    // Show preview in the visible area of the canvas
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
      // Add shape-specific properties
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

<div
  class="min-h-screen bg-base-100 text-base-content"
  in:fade={{ duration: 300 }}
>
  <!-- Header -->
  <Header />

  <!-- Main Content -->
  <div
    class="grid h-[calc(100vh-3.5rem)] relative transition-all duration-300 ease-out"
    class:grid-cols-[320px_1fr]={sidebarOpen}
    class:grid-cols-[0_1fr]={!sidebarOpen}
  >
    <!-- Sidebar -->
    <div
      class="h-full bg-base-200/90 backdrop-blur-md border-r border-base-300/50 shadow-glass overflow-hidden"
    >
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
    </div>

    <!-- Canvas Area -->
    <div class="flex flex-col relative">
      <!-- Canvas Container -->
      <div class="flex-1 p-4 canvas-container">
        <div
          class="w-full h-full bg-base-200/30 backdrop-blur-sm rounded-xl shadow-glass border border-base-300/30 overflow-hidden"
        >
          <PhysicsCanvas
            width={canvasWidth}
            height={canvasHeight}
            showVectors={$physicsStore.showVectors}
            onObjectSelected={handleObjectSelected}
          />
        </div>
      </div>
    </div>

    <!-- Floating Toolbar -->
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

    <!-- Floating Settings Panel -->
    {#if settingsOpen}
      <div
        class="fixed top-20 right-4 z-40 w-80 bg-base-200/95 backdrop-blur-md rounded-2xl shadow-glass border border-base-300/50 p-6"
        in:fade={{ duration: 200 }}
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-base-content">Settings</h3>
          <button
            class="p-2 rounded-lg hover:bg-base-300/50 transition-colors"
            on:click={() => (settingsOpen = false)}
            aria-label="Close settings"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <!-- Physics Settings -->
          <div class="space-y-3">
            <h4
              class="text-sm font-medium text-base-content/70 uppercase tracking-wide"
            >
              Physics
            </h4>

            <div
              class="flex items-center justify-between p-3 bg-base-300/50 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <svg
                  class="w-4 h-4 text-base-content/60"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"
                  />
                </svg>
                <span class="text-sm font-medium text-base-content"
                  >Gravity</span
                >
              </div>
              <input
                type="checkbox"
                class="toggle toggle-primary"
                bind:checked={$physicsStore.gravity}
                on:change={handleToggleGravity}
              />
            </div>

            <div
              class="flex items-center justify-between p-3 bg-base-300/50 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <svg
                  class="w-4 h-4 text-base-content/60"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12,2L13.09,8.26L22,9.27L16,14.14L17.18,21.02L12,17.77L6.82,21.02L8,14.14L2,9.27L10.91,8.26L12,2Z"
                  />
                </svg>
                <span class="text-sm font-medium text-base-content"
                  >Show Vectors</span
                >
              </div>
              <input
                type="checkbox"
                class="toggle toggle-primary"
                bind:checked={$physicsStore.showVectors}
                on:change={handleToggleVectors}
              />
            </div>
          </div>

          <!-- Display Settings -->
          <div class="space-y-3">
            <h4
              class="text-sm font-medium text-base-content/70 uppercase tracking-wide"
            >
              Display
            </h4>

            <div
              class="flex items-center justify-between p-3 bg-base-300/50 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <svg
                  class="w-4 h-4 text-base-content/60"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M3,3H11V11H3V3M3,13H11V21H3V13M13,3H21V11H13V3M13,13H21V21H13V13Z"
                  />
                </svg>
                <span class="text-sm font-medium text-base-content"
                  >Show Grid</span
                >
              </div>
              <input
                type="checkbox"
                class="toggle toggle-primary"
                bind:checked={$physicsStore.showGrid}
                on:change={handleToggleGrid}
              />
            </div>

            <div
              class="flex items-center justify-between p-3 bg-base-300/50 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <svg
                  class="w-4 h-4 text-base-content/60"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19Z"
                  />
                </svg>
                <span class="text-sm font-medium text-base-content"
                  >Show Bounds</span
                >
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
