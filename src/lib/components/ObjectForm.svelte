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

  function handleSubmit() {
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

    if (selectedObject) {
      dispatch("updateObject", { id: selectedObject.id, config });
    } else {
      dispatch("createObject", config);
    }
  }

  function handleDelete() {
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

<form on:submit|preventDefault={handleSubmit} class="space-y-6">
  <!-- Basic Properties -->
  <div class="space-y-4">
    <div class="flex items-center space-x-2">
      <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        />
      </svg>
      <h3
        class="text-sm font-semibold text-base-content/80 uppercase tracking-wide"
      >
        Basic Properties
      </h3>
    </div>

    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label
            class="block text-sm font-medium text-base-content mb-2"
            for="shape">Shape</label
          >
          <select
            id="shape"
            class="w-full px-3 py-2.5 bg-base-300/50 border border-base-300/50 rounded-lg text-base-content focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            bind:value={objectForm.shape}
          >
            <option value="rectangle">Rectangle</option>
            <option value="circle">Circle</option>
            <option value="polygon">Polygon</option>
          </select>
        </div>

        <div>
          <label
            class="block text-sm font-medium text-base-content mb-2"
            for="name">Name</label
          >
          <input
            id="name"
            type="text"
            placeholder="Object Name"
            class="w-full px-3 py-2.5 bg-base-300/50 border border-base-300/50 rounded-lg text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            bind:value={objectForm.name}
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label
            class="block text-sm font-medium text-base-content mb-2"
            for="color">Color</label
          >
          <input
            id="color"
            type="color"
            class="w-full h-12 bg-base-300/50 border border-base-300/50 rounded-lg cursor-pointer"
            bind:value={objectForm.color}
          />
        </div>
        <div>
          <label
            class="block text-sm font-medium text-base-content mb-2"
            for="material">Material</label
          >
          <select
            id="material"
            class="w-full px-3 py-2.5 bg-base-300/50 border border-base-300/50 rounded-lg text-base-content focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            on:change={handleMaterialPresetChange}
          >
            <option value="">Custom</option>
            {#each Object.entries(MATERIAL_PRESETS) as [key, preset]}
              <option value={key}>{preset.name}</option>
            {/each}
          </select>
        </div>
      </div>
    </div>
  </div>

  <!-- Dimensions -->
  <div class="space-y-4">
    <div class="flex items-center space-x-2">
      <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
        <path
          d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"
        />
      </svg>
      <h3
        class="text-sm font-semibold text-base-content/80 uppercase tracking-wide"
      >
        Dimensions
      </h3>
    </div>

    {#if objectForm.shape === "circle"}
      <div>
        <label
          class="block text-sm font-medium text-base-content mb-2"
          for="radius">Radius</label
        >
        <input
          id="radius"
          type="number"
          placeholder="Radius"
          class="w-full px-3 py-2.5 bg-base-300/50 border border-base-300/50 rounded-lg text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          bind:value={objectForm.radius}
        />
      </div>
    {:else}
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label
            class="block text-sm font-medium text-base-content mb-2"
            for="width">Width</label
          >
          <input
            id="width"
            type="number"
            placeholder="Width"
            class="w-full px-3 py-2.5 bg-base-300/50 border border-base-300/50 rounded-lg text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            bind:value={objectForm.width}
          />
        </div>
        <div>
          <label
            class="block text-sm font-medium text-base-content mb-2"
            for="height">Height</label
          >
          <input
            id="height"
            type="number"
            placeholder="Height"
            class="w-full px-3 py-2.5 bg-base-300/50 border border-base-300/50 rounded-lg text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            bind:value={objectForm.height}
          />
        </div>
      </div>
    {/if}
  </div>

  <!-- Physics Properties -->
  <div class="space-y-4">
    <div class="flex items-center space-x-2">
      <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        />
      </svg>
      <h3
        class="text-sm font-semibold text-base-content/80 uppercase tracking-wide"
      >
        Physics Properties
      </h3>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div>
        <label
          class="block text-sm font-medium text-base-content mb-2"
          for="mass">Mass (kg)</label
        >
        <input
          id="mass"
          type="number"
          placeholder="Mass"
          class="w-full px-3 py-2.5 bg-base-300/50 border border-base-300/50 rounded-lg text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          bind:value={objectForm.mass}
        />
      </div>
      <div>
        <label
          class="block text-sm font-medium text-base-content mb-2"
          for="density">Density</label
        >
        <input
          id="density"
          type="number"
          placeholder="Density"
          class="w-full px-3 py-2.5 bg-base-300/50 border border-base-300/50 rounded-lg text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          bind:value={objectForm.density}
        />
      </div>
    </div>

    <div class="space-y-4">
      <div>
        <label
          class="block text-sm font-medium text-base-content mb-2"
          for="friction-slider">Friction: {objectForm.friction}</label
        >
        <input
          id="friction-slider"
          type="range"
          min="0"
          max="1"
          step="0.1"
          class="w-full h-2 bg-base-300/50 rounded-lg appearance-none cursor-pointer slider"
          bind:value={objectForm.friction}
        />
      </div>

      <div>
        <label
          class="block text-sm font-medium text-base-content mb-2"
          for="elasticity-slider">Elasticity: {objectForm.restitution}</label
        >
        <input
          id="elasticity-slider"
          type="range"
          min="0"
          max="1"
          step="0.1"
          class="w-full h-2 bg-base-300/50 rounded-lg appearance-none cursor-pointer slider"
          bind:value={objectForm.restitution}
        />
      </div>

      <div>
        <label
          class="block text-sm font-medium text-base-content mb-2"
          for="air-resistance-slider"
          >Air Resistance: {objectForm.airResistance}</label
        >
        <input
          id="air-resistance-slider"
          type="range"
          min="0"
          max="0.1"
          step="0.01"
          class="w-full h-2 bg-base-300/50 rounded-lg appearance-none cursor-pointer slider"
          bind:value={objectForm.airResistance}
        />
      </div>
    </div>
  </div>

  <!-- Motion Properties -->
  <div class="space-y-4">
    <div class="flex items-center space-x-2">
      <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        />
      </svg>
      <h3
        class="text-sm font-semibold text-base-content/80 uppercase tracking-wide"
      >
        Motion Properties
      </h3>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div>
        <label
          class="block text-sm font-medium text-base-content mb-2"
          for="velocity-x">Velocity X</label
        >
        <input
          id="velocity-x"
          type="number"
          placeholder="VX"
          class="w-full px-3 py-2.5 bg-base-300/50 border border-base-300/50 rounded-lg text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          bind:value={objectForm.initialVelocityX}
        />
      </div>
      <div>
        <label
          class="block text-sm font-medium text-base-content mb-2"
          for="velocity-y">Velocity Y</label
        >
        <input
          id="velocity-y"
          type="number"
          placeholder="VY"
          class="w-full px-3 py-2.5 bg-base-300/50 border border-base-300/50 rounded-lg text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          bind:value={objectForm.initialVelocityY}
        />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div>
        <label
          class="block text-sm font-medium text-base-content mb-2"
          for="rotation">Rotation (°)</label
        >
        <input
          id="rotation"
          type="number"
          placeholder="Rotation"
          class="w-full px-3 py-2.5 bg-base-300/50 border border-base-300/50 rounded-lg text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          bind:value={objectForm.rotation}
        />
      </div>
      <div>
        <label
          class="block text-sm font-medium text-base-content mb-2"
          for="angular-velocity">Angular Vel.</label
        >
        <input
          id="angular-velocity"
          type="number"
          placeholder="Angular"
          class="w-full px-3 py-2.5 bg-base-300/50 border border-base-300/50 rounded-lg text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          bind:value={objectForm.angularVelocity}
        />
      </div>
    </div>
  </div>

  <!-- Object Properties -->
  <div class="space-y-4">
    <div class="flex items-center space-x-2">
      <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        />
      </svg>
      <h3
        class="text-sm font-semibold text-base-content/80 uppercase tracking-wide"
      >
        Object Properties
      </h3>
    </div>

    <div class="space-y-3">
      <div
        class="flex items-center justify-between p-4 bg-base-300/30 rounded-lg border border-base-300/20"
      >
        <span class="text-sm font-medium text-base-content">Static Object</span>
        <input
          id="is-static"
          type="checkbox"
          class="toggle toggle-primary"
          bind:checked={objectForm.isStatic}
        />
      </div>

      <div
        class="flex items-center justify-between p-4 bg-base-300/30 rounded-lg border border-base-300/20"
      >
        <span class="text-sm font-medium text-base-content">Hollow Object</span>
        <input
          id="is-hollow"
          type="checkbox"
          class="toggle toggle-primary"
          bind:checked={objectForm.isHollow}
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-base-content mb-2" for="tags"
        >Tags (comma-separated)</label
      >
      <input
        id="tags"
        type="text"
        placeholder="wood, heavy, bouncy"
        class="w-full px-3 py-2.5 bg-base-300/50 border border-base-300/50 rounded-lg text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        bind:value={objectForm.customTags}
        on:input={handleCustomTagsChange}
      />
    </div>
  </div>

  <!-- Action Buttons -->
  <div class="flex space-x-3 pt-4">
    {#if selectedObject}
      <button
        type="button"
        class="flex-1 px-4 py-3 bg-error text-error-content rounded-lg font-medium hover:opacity-90 transition-all shadow-sm hover:shadow-md"
        on:click={handleDelete}
      >
        Delete
      </button>
      <button
        type="submit"
        class="flex-1 px-4 py-3 bg-primary text-primary-content rounded-lg font-medium hover:opacity-90 transition-all shadow-sm hover:shadow-md"
      >
        Update
      </button>
    {:else}
      <button
        type="submit"
        class="w-full px-4 py-3 bg-primary text-primary-content rounded-lg font-medium hover:opacity-90 transition-all shadow-sm hover:shadow-md"
      >
        Create Object
      </button>
    {/if}
  </div>
</form>

<style>
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: hsl(32, 33%, 67%);
    cursor: pointer;
  }

  .slider::-moz-range-thumb {
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: hsl(32, 33%, 67%);
    cursor: pointer;
    border: none;
  }
</style>
