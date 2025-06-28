<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { MATERIAL_PRESETS } from "$lib/types/physics.types";
  import type { ObjectConfig, PhysicsObject } from "$lib/types/physics.types";

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

  // Props
  export let selectedObject: PhysicsObject | null = null;
  export let objectForm: ObjectFormData;

  const dispatch = createEventDispatcher<{
    createObject: ObjectConfig;
    updateObject: { id: number; config: ObjectConfig };
    deleteObject: number;
  }>();

  function handleCreateObject() {
    const config: ObjectConfig = {
      shape: objectForm.shape as "rectangle" | "circle" | "polygon",
      name: objectForm.name || `Object ${Date.now()}`,
      color: objectForm.color.startsWith("#") ? objectForm.color : "#4CAF50",
      x: 400,
      y: 200,
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
    };

    dispatch("createObject", config);
  }

  function handleUpdateObject() {
    if (!selectedObject) return;

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

    dispatch("updateObject", { id: selectedObject.id, config });
  }

  function handleDeleteObject() {
    if (!selectedObject) return;
    if (confirm("Are you sure you want to delete this object?")) {
      dispatch("deleteObject", selectedObject.id);
    }
  }

  function handleMaterialPresetChange(event: Event) {
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

  function handleCustomTagsChange() {
    objectForm.tags = objectForm.customTags
      .split(",")
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0);
  }
</script>

<div class="card bg-base-100/10 backdrop-blur-md">
  <div class="card-body">
    <h2 class="card-title text-white">
      {selectedObject ? "✏️ Edit Object" : "✨ Create Object"}
    </h2>

    <div class="space-y-4">
      <!-- Basic Properties -->
      <div class="form-control">
        <label for="shape-select" class="label">
          <span class="label-text text-white">Shape</span>
        </label>
        <select
          id="shape-select"
          class="select select-bordered w-full"
          bind:value={objectForm.shape}
        >
          <option value="rectangle">📦 Rectangle</option>
          <option value="circle">⭕ Circle</option>
          <option value="polygon">🔷 Polygon</option>
        </select>
      </div>

      <div class="form-control">
        <label for="name-input" class="label">
          <span class="label-text text-white">Name</span>
        </label>
        <input
          id="name-input"
          type="text"
          placeholder="Object Name"
          class="input input-bordered w-full"
          bind:value={objectForm.name}
        />
      </div>

      <div class="form-control">
        <label for="color-input" class="label">
          <span class="label-text text-white">Color</span>
        </label>
        <input
          id="color-input"
          type="color"
          class="input input-bordered w-full h-12"
          bind:value={objectForm.color}
        />
      </div>

      <div class="form-control">
        <label for="material-select" class="label">
          <span class="label-text text-white">Material Preset</span>
        </label>
        <select
          id="material-select"
          class="select select-bordered w-full"
          on:change={handleMaterialPresetChange}
        >
          <option value="">🎨 Custom</option>
          {#each Object.keys(MATERIAL_PRESETS) as materialKey}
            <option value={materialKey}
              >{MATERIAL_PRESETS[materialKey].name}</option
            >
          {/each}
        </select>
      </div>

      <!-- Shape-specific dimensions -->
      {#if objectForm.shape === "circle"}
        <div class="form-control">
          <label for="radius-input" class="label">
            <span class="label-text text-white">Radius</span>
          </label>
          <input
            id="radius-input"
            type="number"
            placeholder="Radius"
            class="input input-bordered w-full"
            bind:value={objectForm.radius}
          />
        </div>
      {:else}
        <div class="grid grid-cols-2 gap-4">
          <div class="form-control">
            <label for="width-input" class="label">
              <span class="label-text text-white">Width</span>
            </label>
            <input
              id="width-input"
              type="number"
              placeholder="Width"
              class="input input-bordered w-full"
              bind:value={objectForm.width}
            />
          </div>
          <div class="form-control">
            <label for="height-input" class="label">
              <span class="label-text text-white">Height</span>
            </label>
            <input
              id="height-input"
              type="number"
              placeholder="Height"
              class="input input-bordered w-full"
              bind:value={objectForm.height}
            />
          </div>
        </div>
      {/if}

      <!-- Physics Properties -->
      <div class="grid grid-cols-2 gap-4">
        <div class="form-control">
          <label for="mass-input" class="label">
            <span class="label-text text-white">Mass (kg)</span>
          </label>
          <input
            id="mass-input"
            type="number"
            placeholder="Mass"
            class="input input-bordered w-full"
            bind:value={objectForm.mass}
          />
        </div>
        <div class="form-control">
          <label for="density-input" class="label">
            <span class="label-text text-white">Density</span>
          </label>
          <input
            id="density-input"
            type="number"
            placeholder="Density"
            class="input input-bordered w-full"
            bind:value={objectForm.density}
          />
        </div>
      </div>

      <!-- Sliders -->
      <div class="form-control">
        <label for="friction-range" class="label">
          <span class="label-text text-white"
            >Friction: {objectForm.friction}</span
          >
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

      <div class="form-control">
        <label for="restitution-range" class="label">
          <span class="label-text text-white"
            >Elasticity: {objectForm.restitution}</span
          >
        </label>
        <input
          id="restitution-range"
          type="range"
          min="0"
          max="1"
          step="0.1"
          class="range range-primary"
          bind:value={objectForm.restitution}
        />
      </div>

      <div class="form-control">
        <label for="air-resistance-range" class="label">
          <span class="label-text text-white"
            >Air Resistance: {objectForm.airResistance}</span
          >
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

      <!-- Velocity -->
      <div class="grid grid-cols-2 gap-4">
        <div class="form-control">
          <label for="velocity-x-input" class="label">
            <span class="label-text text-white">Velocity X</span>
          </label>
          <input
            id="velocity-x-input"
            type="number"
            placeholder="VX"
            class="input input-bordered w-full"
            bind:value={objectForm.initialVelocityX}
          />
        </div>
        <div class="form-control">
          <label for="velocity-y-input" class="label">
            <span class="label-text text-white">Velocity Y</span>
          </label>
          <input
            id="velocity-y-input"
            type="number"
            placeholder="VY"
            class="input input-bordered w-full"
            bind:value={objectForm.initialVelocityY}
          />
        </div>
      </div>

      <!-- Rotation -->
      <div class="grid grid-cols-2 gap-4">
        <div class="form-control">
          <label for="rotation-input" class="label">
            <span class="label-text text-white">Rotation (°)</span>
          </label>
          <input
            id="rotation-input"
            type="number"
            placeholder="Rotation"
            class="input input-bordered w-full"
            bind:value={objectForm.rotation}
          />
        </div>
        <div class="form-control">
          <label for="angular-velocity-input" class="label">
            <span class="label-text text-white">Angular Vel.</span>
          </label>
          <input
            id="angular-velocity-input"
            type="number"
            placeholder="Angular"
            class="input input-bordered w-full"
            bind:value={objectForm.angularVelocity}
          />
        </div>
      </div>

      <!-- Checkboxes -->
      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text text-white">🏔️ Static Object</span>
          <input
            type="checkbox"
            class="toggle toggle-primary"
            bind:checked={objectForm.isStatic}
          />
        </label>
      </div>
      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text text-white">🕳️ Hollow Object</span>
          <input
            type="checkbox"
            class="toggle toggle-primary"
            bind:checked={objectForm.isHollow}
          />
        </label>
      </div>

      <!-- Tags -->
      <div class="form-control">
        <label for="tags-input" class="label">
          <span class="label-text text-white">🏷️ Tags (comma-separated)</span>
        </label>
        <input
          id="tags-input"
          type="text"
          placeholder="wood, heavy, bouncy"
          class="input input-bordered w-full"
          bind:value={objectForm.customTags}
          on:input={handleCustomTagsChange}
        />
      </div>

      <!-- Action Buttons -->
      {#if selectedObject}
        <div class="grid grid-cols-2 gap-2">
          <button class="btn btn-success btn-sm" on:click={handleUpdateObject}>
            💾 Update
          </button>
          <button class="btn btn-error btn-sm" on:click={handleDeleteObject}>
            🗑️ Delete
          </button>
        </div>
      {:else}
        <button class="btn btn-success w-full" on:click={handleCreateObject}>
          ➕ Create Object
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .card {
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .form-control .label-text {
    color: rgba(255, 255, 255, 0.9);
  }
</style>
