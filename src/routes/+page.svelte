<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import PhysicsCanvas from "$lib/components/PhysicsCanvas.svelte";
  import {
    physicsStore,
    objectsStore,
    selectedObjectStore,
  } from "$lib/stores/physics.store";
  import type { ObjectConfig, PhysicsObject } from "$lib/types/physics.types";
  import { MATERIAL_PRESETS } from "$lib/types/physics.types";
  import { PhysicsEngine } from "$lib/physics/physics-engine";

  // Component state
  let selectedObject: PhysicsObject | null = null;
  let physicsEngine: PhysicsEngine | null = null;
  let objectForm = {
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
    tags: [] as string[],
    customTags: "",
  };

  // Reactive statements
  $: selectedObject = $selectedObjectStore;

  // Update preview when form changes (only when not editing an existing object)
  $: if (!selectedObject && physicsEngine && objectForm) {
    // Use setTimeout to avoid infinite loops
    setTimeout(() => updatePreview(), 0);
  }

  onMount(() => {
    console.log("🧠 MatterMind Svelte initialized");
    // Get the physics engine from the global reference
    const checkForEngine = () => {
      if ((window as any).matterMindPhysicsEngine) {
        physicsEngine = (window as any).matterMindPhysicsEngine;
        console.log("✅ Physics engine connected to main page");
        setTimeout(() => updatePreview(), 100);
      } else {
        setTimeout(checkForEngine, 100);
      }
    };
    checkForEngine();
  });

  // Event handlers
  function handleObjectSelected(object: any): void {
    if (object) {
      // Find the object in our store
      const physicsObject = $objectsStore.find((obj) => obj.id === object.id);
      if (physicsObject) {
        selectedObjectStore.set(physicsObject);
        populateForm(physicsObject);
      }
    } else {
      selectedObjectStore.clear();
      clearForm();
      setTimeout(() => updatePreview(), 0);
    }
  }

  function handleCreateObject(): void {
    if (!physicsEngine) return;

    // Place objects in the visible area of the canvas
    const center = { x: 400, y: 200 }; // Fixed position in visible area
    const config: ObjectConfig = {
      shape: objectForm.shape as "rectangle" | "circle" | "polygon",
      name: objectForm.name || `Object ${Date.now()}`,
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

    console.log("Creating object with config:", config);
    // Create the physics object
    const body = physicsEngine.createObject(config);
    if (body) {
      console.log("Object created successfully:", body.id);
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
    } else {
      console.error("Failed to create object");
    }
  }

  function handleUpdateObject(): void {
    if (!selectedObject || !physicsEngine) return;

    const config: ObjectConfig = {
      ...selectedObject.config,
      name: objectForm.name,
      color: objectForm.color.startsWith("#") ? objectForm.color : "#4CAF50",
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
      ...(objectForm.shape === "circle"
        ? { radius: objectForm.radius }
        : {
            width: objectForm.width,
            height: objectForm.height,
          }),
    };

    // Update the physics object
    physicsEngine.updateObject(selectedObject.id, config);

    // Update the store
    objectsStore.updateObject(selectedObject.id, { config });
    clearForm();
  }

  function handleDeleteObject(): void {
    if (!selectedObject || !physicsEngine) return;

    if (confirm("Are you sure you want to delete this object?")) {
      physicsEngine.deleteObject(selectedObject.id);
      objectsStore.removeObject(selectedObject.id);
      selectedObjectStore.clear();
      clearForm();
    }
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

  function handleMaterialPresetChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const materialKey = select.value;

    if (materialKey && MATERIAL_PRESETS[materialKey]) {
      const preset = MATERIAL_PRESETS[materialKey];
      objectForm.material = materialKey;
      objectForm.density = preset.density;
      objectForm.friction = preset.friction;
      objectForm.restitution = preset.restitution;
      objectForm.color = preset.color;
      objectForm.tags = [...preset.tags];
    }
  }

  function handleCustomTagsChange(): void {
    objectForm.tags = objectForm.customTags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
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

  function onPhysicsEngineReady(engine: PhysicsEngine): void {
    physicsEngine = engine;
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

    console.log("Setting preview object:", previewConfig);
    physicsEngine.setPreviewObject(previewConfig);
  }

  function clearPreview(): void {
    if (physicsEngine) {
      physicsEngine.setPreviewObject(null);
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
</script>

<svelte:head>
  <title>MatterMind - Interactive Physics Simulation</title>
  <meta
    name="description"
    content="Interactive physics simulation platform built with Svelte and Matter.js"
  />
</svelte:head>

<div class="flex h-screen bg-gray-900 text-white" in:fade={{ duration: 500 }}>
  <!-- Sidebar -->
  <aside class="w-96 bg-gray-800 p-6 overflow-y-auto">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold">MatterMind</h1>
      <div class="flex items-center space-x-2">
        <button class="btn btn-ghost btn-circle" aria-label="Search">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            /></svg
          >
        </button>
        <button class="btn btn-ghost btn-circle" aria-label="Notifications">
          <div class="indicator">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              /></svg
            >
            <span class="badge badge-xs badge-primary indicator-item"></span>
          </div>
        </button>
      </div>
    </div>

    <!-- Simulation Controls -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4">Simulation</h2>
      <div class="grid grid-cols-2 gap-4">
        <button class="btn btn-primary" on:click={handleTogglePause}>
          {$physicsStore.isRunning ? "⏸️ Pause" : "▶️ Play"}
        </button>
        <button class="btn btn-secondary" on:click={handleReset}>
          🔄 Reset
        </button>
        <button class="btn btn-info col-span-2" on:click={createPresetObjects}>
          🎯 Create Preset Objects
        </button>
      </div>
      <div class="form-control mt-4">
        <label class="label cursor-pointer">
          <span class="label-text text-white">Gravity</span>
          <input
            type="checkbox"
            class="toggle toggle-primary"
            bind:checked={$physicsStore.gravity}
            on:change={handleToggleGravity}
          />
        </label>
      </div>
      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text text-white">Show Vectors</span>
          <input
            type="checkbox"
            class="toggle toggle-primary"
            bind:checked={$physicsStore.showVectors}
            on:change={handleToggleVectors}
          />
        </label>
      </div>
    </div>

    <!-- Object Creation/Editing -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4">
        {selectedObject ? "Edit Object" : "Create Object"}
      </h2>
      <div class="space-y-4">
        <select
          class="select select-bordered w-full"
          bind:value={objectForm.shape}
        >
          <option value="rectangle">Rectangle</option>
          <option value="circle">Circle</option>
          <option value="polygon">Polygon</option>
        </select>
        <input
          type="text"
          placeholder="Object Name"
          class="input input-bordered w-full"
          bind:value={objectForm.name}
        />
        <input
          type="color"
          class="input input-bordered w-full"
          bind:value={objectForm.color}
        />
        <select
          class="select select-bordered w-full"
          on:change={handleMaterialPresetChange}
        >
          <option value="">Custom</option>
          {#each Object.keys(MATERIAL_PRESETS) as materialKey}
            <option value={materialKey}
              >{MATERIAL_PRESETS[materialKey].name}</option
            >
          {/each}
        </select>

        {#if objectForm.shape === "circle"}
          <input
            type="number"
            placeholder="Radius"
            class="input input-bordered w-full"
            bind:value={objectForm.radius}
          />
        {:else}
          <div class="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Width"
              class="input input-bordered w-full"
              bind:value={objectForm.width}
            />
            <input
              type="number"
              placeholder="Height"
              class="input input-bordered w-full"
              bind:value={objectForm.height}
            />
          </div>
        {/if}

        <div class="grid grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Mass"
            class="input input-bordered w-full"
            bind:value={objectForm.mass}
          />
          <input
            type="number"
            placeholder="Density"
            class="input input-bordered w-full"
            bind:value={objectForm.density}
          />
        </div>

        <div>
          <label class="label" for="friction-range">
            <span class="label-text text-white">Friction</span>
          </label>
          <input
            id="friction-range"
            type="range"
            min="0"
            max="1"
            step="0.1"
            class="range range-primary"
            bind:value={objectForm.friction}
          />
        </div>
        <div>
          <label class="label" for="elasticity-range">
            <span class="label-text text-white">Elasticity</span>
          </label>
          <input
            id="elasticity-range"
            type="range"
            min="0"
            max="1"
            step="0.1"
            class="range range-primary"
            bind:value={objectForm.restitution}
          />
        </div>
        <div>
          <label class="label" for="air-resistance-range">
            <span class="label-text text-white">Air Resistance</span>
          </label>
          <input
            id="air-resistance-range"
            type="range"
            min="0"
            max="0.1"
            step="0.01"
            class="range range-primary"
            bind:value={objectForm.airResistance}
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Initial Velocity X"
            class="input input-bordered w-full"
            bind:value={objectForm.initialVelocityX}
          />
          <input
            type="number"
            placeholder="Initial Velocity Y"
            class="input input-bordered w-full"
            bind:value={objectForm.initialVelocityY}
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Rotation"
            class="input input-bordered w-full"
            bind:value={objectForm.rotation}
          />
          <input
            type="number"
            placeholder="Angular Velocity"
            class="input input-bordered w-full"
            bind:value={objectForm.angularVelocity}
          />
        </div>

        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text text-white">Static Object</span>
            <input
              type="checkbox"
              class="toggle toggle-primary"
              bind:checked={objectForm.isStatic}
            />
          </label>
        </div>
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text text-white">Hollow Object</span>
            <input
              type="checkbox"
              class="toggle toggle-primary"
              bind:checked={objectForm.isHollow}
            />
          </label>
        </div>

        <input
          type="text"
          placeholder="Custom Tags (comma-separated)"
          class="input input-bordered w-full"
          bind:value={objectForm.customTags}
          on:input={handleCustomTagsChange}
        />

        {#if selectedObject}
          <div class="grid grid-cols-2 gap-4">
            <button class="btn btn-success" on:click={handleUpdateObject}
              >💾 Update</button
            >
            <button class="btn btn-danger" on:click={handleDeleteObject}
              >🗑️ Delete</button
            >
          </div>
        {:else}
          <button class="btn btn-success w-full" on:click={handleCreateObject}
            >➕ Create</button
          >
        {/if}
      </div>
    </div>

    <!-- Object List -->
    <div>
      <h2 class="text-xl font-semibold mb-4">
        Objects ({$objectsStore.length})
      </h2>
      <div class="space-y-2">
        {#each $objectsStore as object (object.id)}
          <button
            in:fly={{ y: -10, duration: 300 }}
            out:fly={{ x: -20, duration: 200 }}
            class="btn btn-outline w-full justify-start {object.selected
              ? 'btn-primary'
              : ''}"
            on:click={() => selectedObjectStore.set(object)}
          >
            <div class="flex items-center space-x-4">
              <div
                class="w-4 h-4 rounded-full"
                style="background-color: {object.color}"
              ></div>
              <div>
                <div class="font-bold">{object.name}</div>
                <div class="text-xs opacity-60">
                  {object.config.shape} | Mass: {object.config.mass}kg
                </div>
              </div>
            </div>
          </button>
        {/each}
      </div>
    </div>
  </aside>

  <!-- Main Canvas Area -->
  <main class="flex-1 flex items-center justify-center p-6">
    <PhysicsCanvas
      width={800}
      height={600}
      showVectors={$physicsStore.showVectors}
      onObjectSelected={handleObjectSelected}
    />
  </main>
</div>

<style>
  /* Custom styles for specific components that can't be handled by Tailwind/DaisyUI */

  /* Custom scrollbar styling for the sidebar */
  aside::-webkit-scrollbar {
    width: 6px;
  }

  aside::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }

  aside::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 3px;
  }

  aside::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.5);
  }
</style>
