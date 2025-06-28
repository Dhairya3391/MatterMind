<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import Header from "$lib/components/Header.svelte";
  import Sidebar from "$lib/components/Sidebar.svelte";
  import PhysicsCanvas from "$lib/components/PhysicsCanvas.svelte";
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
    shape: "rectangle" | "circle" | "polygon";
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

  // Reactive statements
  $: selectedObject = $selectedObjectStore;

  // Update preview when form changes (only when not editing an existing object)
  $: if (!selectedObject && physicsEngine && objectForm) {
    setTimeout(() => updatePreview(), 0);
  }

  onMount(() => {
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

    const config = event.detail;

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
      physicsEngine.setGravity(!currentGravity);
      physicsStore.setGravity(!currentGravity);
    }
  }

  function handleToggleVectors(): void {
    if (physicsEngine) {
      const currentVectors = $physicsStore.showVectors;
      physicsEngine.setShowVectors(!currentVectors);
      physicsStore.setVectors(!currentVectors);
    }
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
      width: 800,
      height: 20,
      x: 400,
      y: 550,
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
      x: 300,
      y: 150,
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
      x: 500,
      y: 100,
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
    const center = { x: 400, y: 200 }; // Fixed position in visible area
    const previewConfig: ObjectConfig = {
      shape: objectForm.shape as "rectangle" | "circle" | "polygon",
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
  class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
  in:fade={{ duration: 500 }}
>
  <Header />

  <div class="flex h-[calc(100vh-4rem)]">
    <Sidebar
      {activeTab}
      {selectedObject}
      {objectForm}
      on:togglePause={handleTogglePause}
      on:reset={handleReset}
      on:createPresetObjects={createPresetObjects}
      on:toggleGravity={handleToggleGravity}
      on:toggleVectors={handleToggleVectors}
      on:createObject={handleCreateObject}
      on:updateObject={handleUpdateObject}
      on:deleteObject={handleDeleteObject}
    />

    <!-- Main Canvas Area -->
    <main class="flex-1 flex items-center justify-center p-6">
      <div
        class="card bg-base-100/10 backdrop-blur-md border border-base-300/20"
      >
        <div class="card-body p-0">
          <PhysicsCanvas
            width={800}
            height={600}
            showVectors={$physicsStore.showVectors}
            onObjectSelected={handleObjectSelected}
          />
        </div>
      </div>
    </main>
  </div>
</div>

<style>
  /* Ensure proper backdrop blur support */
  .backdrop-blur-md {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  /* Card styling */
  .card {
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
</style>
