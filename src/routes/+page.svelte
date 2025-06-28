<script lang="ts">
  import { onMount } from "svelte";
  import PhysicsCanvas from "$lib/components/PhysicsCanvas.svelte";
  import {
    physicsStore,
    objectsStore,
    selectedObjectStore,
  } from "$lib/stores/physics.store";
  import type { ObjectConfig, PhysicsObject } from "$lib/types/physics.types";

  // Component state
  let selectedObject: PhysicsObject | null = null;
  let objectForm = {
    shape: "rectangle",
    name: "",
    color: "#4CAF50",
    width: 50,
    height: 50,
    radius: 25,
    mass: 1,
    friction: 0.1,
    restitution: 0.5,
    airResistance: 0,
    rotation: 0,
    angularVelocity: 0,
    isStatic: false,
  };

  // Reactive statements
  $: selectedObject = $selectedObjectStore;

  onMount(() => {
    console.log("🧠 MatterMind Svelte initialized");
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
    }
  }

  function handleCreateObject(): void {
    const config: ObjectConfig = {
      shape: objectForm.shape as "rectangle" | "circle" | "polygon",
      name: objectForm.name || `Object ${Date.now()}`,
      color: objectForm.color,
      x: 400, // Center of canvas
      y: 100,
      mass: objectForm.mass,
      friction: objectForm.friction,
      restitution: objectForm.restitution,
      airResistance: objectForm.airResistance,
      rotation: objectForm.rotation,
      angularVelocity: objectForm.angularVelocity,
      isStatic: objectForm.isStatic,
      ...(objectForm.shape === "circle"
        ? { radius: objectForm.radius }
        : {
            width: objectForm.width,
            height: objectForm.height,
          }),
    };

    // Add to store (in a real app, this would create the physics object)
    const newObject: PhysicsObject = {
      id: Date.now(),
      name: config.name,
      color: config.color,
      config,
      selected: false,
    };

    objectsStore.addObject(newObject);
    clearForm();
  }

  function handleUpdateObject(): void {
    if (!selectedObject) return;

    const config: ObjectConfig = {
      ...selectedObject.config,
      name: objectForm.name,
      color: objectForm.color,
      mass: objectForm.mass,
      friction: objectForm.friction,
      restitution: objectForm.restitution,
      airResistance: objectForm.airResistance,
      rotation: objectForm.rotation,
      angularVelocity: objectForm.angularVelocity,
      isStatic: objectForm.isStatic,
      ...(objectForm.shape === "circle"
        ? { radius: objectForm.radius }
        : {
            width: objectForm.width,
            height: objectForm.height,
          }),
    };

    objectsStore.updateObject(selectedObject.id, { config });
    clearForm();
  }

  function handleDeleteObject(): void {
    if (!selectedObject) return;

    if (confirm("Are you sure you want to delete this object?")) {
      objectsStore.removeObject(selectedObject.id);
      selectedObjectStore.clear();
      clearForm();
    }
  }

  function handleTogglePause(): void {
    physicsStore.toggleRunning();
  }

  function handleToggleGravity(): void {
    physicsStore.toggleGravity();
  }

  function handleToggleVectors(): void {
    physicsStore.toggleVectors();
  }

  function handleReset(): void {
    if (confirm("Are you sure you want to reset the simulation?")) {
      physicsStore.reset();
      objectsStore.clearObjects();
      selectedObjectStore.clear();
      clearForm();
    }
  }

  function populateForm(object: PhysicsObject): void {
    objectForm = {
      shape: object.config.shape,
      name: object.name,
      color: object.color,
      width: object.config.width || 50,
      height: object.config.height || 50,
      radius: object.config.radius || 25,
      mass: object.config.mass,
      friction: object.config.friction,
      restitution: object.config.restitution,
      airResistance: object.config.airResistance,
      rotation: object.config.rotation,
      angularVelocity: object.config.angularVelocity,
      isStatic: object.config.isStatic,
    };
  }

  function clearForm(): void {
    objectForm = {
      shape: "rectangle",
      name: "",
      color: "#4CAF50",
      width: 50,
      height: 50,
      radius: 25,
      mass: 1,
      friction: 0.1,
      restitution: 0.5,
      airResistance: 0,
      rotation: 0,
      angularVelocity: 0,
      isStatic: false,
    };
  }
</script>

<svelte:head>
  <title>MatterMind - Interactive Physics Simulation</title>
  <meta
    name="description"
    content="Interactive physics simulation platform built with Svelte and Matter.js"
  />
</svelte:head>

<div class="app-container">
  <!-- Sidebar -->
  <div class="sidebar">
    <div class="sidebar-header">
      <h2>MatterMind</h2>
      <p>Interactive Physics Simulation</p>
    </div>

    <!-- Simulation Controls -->
    <div class="control-section">
      <h3>Simulation</h3>
      <div class="control-group">
        <button class="btn btn-primary" on:click={handleTogglePause}>
          {$physicsStore.isRunning ? "⏸️ Pause" : "▶️ Play"}
        </button>
        <button class="btn btn-secondary" on:click={handleReset}>
          🔄 Reset
        </button>
      </div>
      <div class="control-group">
        <label>
          <input
            type="checkbox"
            bind:checked={$physicsStore.gravity}
            on:change={handleToggleGravity}
          />
          Gravity
        </label>
      </div>
      <div class="control-group">
        <label>
          <input
            type="checkbox"
            bind:checked={$physicsStore.showVectors}
            on:change={handleToggleVectors}
          />
          Show Vectors
        </label>
      </div>
    </div>

    <!-- Object Creation/Editing -->
    <div class="control-section">
      <h3>{selectedObject ? "Edit Object" : "Create Object"}</h3>

      <div class="control-group">
        <label for="shapeSelect">Shape:</label>
        <select id="shapeSelect" bind:value={objectForm.shape}>
          <option value="rectangle">Rectangle</option>
          <option value="circle">Circle</option>
          <option value="polygon">Polygon</option>
        </select>
      </div>

      <div class="control-group">
        <label for="objectName">Name:</label>
        <input
          type="text"
          id="objectName"
          bind:value={objectForm.name}
          placeholder="Object name"
        />
      </div>

      <div class="control-group">
        <label for="objectColor">Color:</label>
        <input type="color" id="objectColor" bind:value={objectForm.color} />
      </div>

      {#if objectForm.shape === "circle"}
        <div class="control-group">
          <label for="objectRadius">Radius:</label>
          <input
            type="number"
            id="objectRadius"
            bind:value={objectForm.radius}
            min="5"
            max="100"
          />
        </div>
      {:else}
        <div class="control-group">
          <label for="objectWidth">Width:</label>
          <input
            type="number"
            id="objectWidth"
            bind:value={objectForm.width}
            min="10"
            max="200"
          />
        </div>
        <div class="control-group">
          <label for="objectHeight">Height:</label>
          <input
            type="number"
            id="objectHeight"
            bind:value={objectForm.height}
            min="10"
            max="200"
          />
        </div>
      {/if}

      <div class="control-group">
        <label for="objectMass">Mass (kg):</label>
        <input
          type="number"
          id="objectMass"
          bind:value={objectForm.mass}
          min="0.1"
          max="100"
          step="0.1"
        />
      </div>

      <div class="control-group">
        <label for="objectFriction">Friction:</label>
        <input
          type="range"
          id="objectFriction"
          bind:value={objectForm.friction}
          min="0"
          max="1"
          step="0.1"
        />
        <span>{objectForm.friction}</span>
      </div>

      <div class="control-group">
        <label for="objectElasticity">Elasticity:</label>
        <input
          type="range"
          id="objectElasticity"
          bind:value={objectForm.restitution}
          min="0"
          max="1"
          step="0.1"
        />
        <span>{objectForm.restitution}</span>
      </div>

      <div class="control-group">
        <label for="objectAirResistance">Air Resistance:</label>
        <input
          type="range"
          id="objectAirResistance"
          bind:value={objectForm.airResistance}
          min="0"
          max="0.1"
          step="0.01"
        />
        <span>{objectForm.airResistance}</span>
      </div>

      <div class="control-group">
        <label for="objectRotation">Rotation (deg):</label>
        <input
          type="number"
          id="objectRotation"
          bind:value={objectForm.rotation}
          min="0"
          max="360"
        />
      </div>

      <div class="control-group">
        <label for="objectAngularVelocity">Angular Velocity:</label>
        <input
          type="number"
          id="objectAngularVelocity"
          bind:value={objectForm.angularVelocity}
          step="0.1"
        />
      </div>

      <div class="control-group">
        <label>
          <input type="checkbox" bind:checked={objectForm.isStatic} />
          Static Object
        </label>
      </div>

      {#if selectedObject}
        <div class="control-group">
          <button class="btn btn-success" on:click={handleUpdateObject}>
            💾 Update Object
          </button>
          <button class="btn btn-danger" on:click={handleDeleteObject}>
            🗑️ Delete Object
          </button>
        </div>
      {:else}
        <button class="btn btn-success" on:click={handleCreateObject}>
          ➕ Create Object
        </button>
      {/if}
    </div>

    <!-- Object List -->
    <div class="control-section">
      <h3>Objects ({$objectsStore.length})</h3>
      <div class="object-list">
        {#each $objectsStore as object (object.id)}
          <div
            class="object-item {object.selected ? 'selected' : ''}"
            on:click={() => selectedObjectStore.set(object)}
          >
            <div class="object-info">
              <div class="object-name">{object.name}</div>
              <div class="object-details">
                {object.config.shape} | Mass: {object.config.mass}kg
              </div>
            </div>
            <div
              class="object-color"
              style="background-color: {object.color}"
            ></div>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Main Canvas Area -->
  <div class="canvas-container">
    <PhysicsCanvas
      width={800}
      height={600}
      showVectors={$physicsStore.showVectors}
      onObjectSelected={handleObjectSelected}
    />
  </div>
</div>

<style>
  .app-container {
    display: flex;
    height: 100vh;
    width: 100vw;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .sidebar {
    width: 350px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-right: 1px solid rgba(0, 0, 0, 0.1);
    overflow-y: auto;
    padding: 20px;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  }

  .sidebar-header {
    text-align: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid #e0e0e0;
  }

  .sidebar-header h2 {
    color: #333;
    font-size: 24px;
    margin-bottom: 5px;
  }

  .sidebar-header p {
    color: #666;
    font-size: 14px;
  }

  .control-section {
    margin-bottom: 30px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .control-section h3 {
    color: #333;
    margin-bottom: 15px;
    font-size: 16px;
    font-weight: 600;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 8px;
  }

  .control-group {
    margin-bottom: 15px;
  }

  .control-group label {
    display: block;
    margin-bottom: 5px;
    color: #555;
    font-size: 14px;
    font-weight: 500;
  }

  .control-group input[type="text"],
  .control-group input[type="number"],
  .control-group select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    background: white;
    transition: border-color 0.3s ease;
  }

  .control-group input[type="text"]:focus,
  .control-group input[type="number"]:focus,
  .control-group select:focus {
    outline: none;
    border-color: #4caf50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  }

  .control-group input[type="range"] {
    width: 70%;
    margin-right: 10px;
  }

  .control-group input[type="color"] {
    width: 50px;
    height: 35px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  .control-group input[type="checkbox"] {
    margin-right: 8px;
  }

  .control-group span {
    font-size: 12px;
    color: #666;
    font-weight: 500;
  }

  .btn {
    padding: 10px 16px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-right: 8px;
    margin-bottom: 8px;
  }

  .btn-primary {
    background: #2196f3;
    color: white;
  }

  .btn-primary:hover {
    background: #1976d2;
    transform: translateY(-1px);
  }

  .btn-secondary {
    background: #757575;
    color: white;
  }

  .btn-secondary:hover {
    background: #616161;
    transform: translateY(-1px);
  }

  .btn-success {
    background: #4caf50;
    color: white;
    width: 100%;
    margin-top: 10px;
  }

  .btn-success:hover {
    background: #388e3c;
    transform: translateY(-1px);
  }

  .btn-danger {
    background: #f44336;
    color: white;
    width: 100%;
    margin-top: 10px;
  }

  .btn-danger:hover {
    background: #d32f2f;
    transform: translateY(-1px);
  }

  .object-list {
    max-height: 200px;
    overflow-y: auto;
  }

  .object-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    margin-bottom: 8px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 6px;
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .object-item:hover {
    background: rgba(255, 255, 255, 0.95);
    transform: translateX(2px);
  }

  .object-item.selected {
    background: rgba(76, 175, 80, 0.1);
    border-color: #4caf50;
  }

  .object-info {
    flex: 1;
  }

  .object-name {
    font-weight: 600;
    color: #333;
    font-size: 14px;
  }

  .object-details {
    font-size: 12px;
    color: #666;
    margin-top: 2px;
  }

  .object-color {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 1px solid #ddd;
  }

  .canvas-container {
    flex: 1;
    padding: 20px;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .app-container {
      flex-direction: column;
    }

    .sidebar {
      width: 100%;
      height: 40vh;
      overflow-y: auto;
    }

    .canvas-container {
      height: 60vh;
      padding: 10px;
    }
  }

  /* Scrollbar Styling */
  .sidebar::-webkit-scrollbar,
  .object-list::-webkit-scrollbar {
    width: 6px;
  }

  .sidebar::-webkit-scrollbar-track,
  .object-list::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }

  .sidebar::-webkit-scrollbar-thumb,
  .object-list::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 3px;
  }

  .sidebar::-webkit-scrollbar-thumb:hover,
  .object-list::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.5);
  }
</style>
