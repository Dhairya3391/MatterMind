<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { MATERIAL_PRESETS } from "$lib/types/physics.types";
  import type { ObjectConfig, PhysicsObject } from "$lib/types/physics.types";
  import { fade, fly } from "svelte/transition";

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

  // Props
  export let selectedObject: PhysicsObject | null = null;
  export let objectForm: ObjectFormData;

  const dispatch = createEventDispatcher<{
    createObject: ObjectConfig;
    updateObject: { id: number; config: ObjectConfig };
    deleteObject: number;
  }>();

  // Form sections for better organization
  const sections = [
    {
      id: "basic",
      title: "Basic Properties",
      icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
      expanded: true
    },
    {
      id: "dimensions",
      title: "Dimensions",
      icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z",
      expanded: true
    },
    {
      id: "physics",
      title: "Physics Properties",
      icon: "M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z",
      expanded: true
    },
    {
      id: "motion",
      title: "Motion Properties",
      icon: "M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z",
      expanded: false
    },
    {
      id: "advanced",
      title: "Advanced Options",
      icon: "M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5Z",
      expanded: false
    }
  ];

  let expandedSections = sections.reduce((acc, section) => {
    acc[section.id] = section.expanded;
    return acc;
  }, {} as Record<string, boolean>);

  function toggleSection(sectionId: string) {
    expandedSections[sectionId] = !expandedSections[sectionId];
  }

  function handleSubmit() {
    const config: ObjectConfig = {
      shape: objectForm.shape as
        | "rectangle"
        | "circle"
        | "polygon"
        | "triangle"
        | "pentagon",
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

  // Shape options with icons
  const shapeOptions = [
    { value: "rectangle", label: "Rectangle", icon: "M3,3H21V21H3V3M5,5V19H19V5H5Z" },
    { value: "circle", label: "Circle", icon: "M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" },
    { value: "polygon", label: "Polygon", icon: "M17.5,3.5L22.5,12L17.5,20.5H6.5L1.5,12L6.5,3.5H17.5Z" },
    { value: "triangle", label: "Triangle", icon: "M12,2L2,19H22L12,2M12,6L17.5,17H6.5L12,6Z" },
    { value: "pentagon", label: "Pentagon", icon: "M12,2L15.09,8.26L22,9.27L17,14.14L18.18,21.02L12,17.77L5.82,21.02L7,14.14L2,9.27L8.91,8.26L12,2Z" },
    { value: "star", label: "Star", icon: "M12,2L15.09,8.26L22,9.27L17,14.14L18.18,21.02L12,17.77L5.82,21.02L7,14.14L2,9.27L8.91,8.26L12,2Z" }
  ];
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-6">
  <!-- Basic Properties Section -->
  {#if expandedSections.basic}
    <div class="space-y-4" in:fade={{ duration: 200 }}>
      <button
        type="button"
        class="w-full flex items-center justify-between p-3 bg-base-300/20 rounded-lg hover:bg-base-300/30 transition-colors"
        on:click={() => toggleSection('basic')}
      >
        <div class="flex items-center space-x-3">
          <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d={sections[0].icon} />
          </svg>
          <span class="text-sm font-semibold text-base-content">Basic Properties</span>
        </div>
        <svg class="w-4 h-4 text-base-content/60 transition-transform" class:rotate-180={!expandedSections.basic} fill="currentColor" viewBox="0 0 24 24">
          <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
        </svg>
      </button>

      <div class="space-y-4 pl-4">
        <!-- Shape Selection with Visual Icons -->
        <div>
          <label class="block text-sm font-medium text-base-content mb-3">Shape</label>
          <div class="grid grid-cols-3 gap-2">
            {#each shapeOptions as option}
              <button
                type="button"
                class="p-3 rounded-lg border transition-all duration-200 hover:scale-105"
                class:bg-primary={objectForm.shape === option.value}
                class:text-primary-content={objectForm.shape === option.value}
                class:border-primary={objectForm.shape === option.value}
                class:bg-base-200={objectForm.shape !== option.value}
                class:border-base-300={objectForm.shape !== option.value}
                class:hover:bg-base-300={objectForm.shape !== option.value}
                on:click={() => objectForm.shape = option.value}
              >
                <div class="flex flex-col items-center space-y-1">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d={option.icon} />
                  </svg>
                  <span class="text-xs font-medium">{option.label}</span>
                </div>
              </button>
            {/each}
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-base-content mb-2">Name</label>
            <input
              type="text"
              placeholder="Object Name"
              class="input-enhanced w-full"
              bind:value={objectForm.name}
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-base-content mb-2">Material</label>
            <select
              class="input-enhanced w-full"
              on:change={handleMaterialPresetChange}
            >
              <option value="">Custom</option>
              {#each Object.entries(MATERIAL_PRESETS) as [key, preset]}
                <option value={key}>{preset.name}</option>
              {/each}
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-base-content mb-2">Color</label>
          <div class="flex items-center space-x-3">
            <input
              type="color"
              class="w-12 h-12 rounded-lg border border-base-300/30 cursor-pointer"
              bind:value={objectForm.color}
            />
            <input
              type="text"
              placeholder="#4CAF50"
              class="input-enhanced flex-1"
              bind:value={objectForm.color}
            />
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Dimensions Section -->
  {#if expandedSections.dimensions}
    <div class="space-y-4" in:fade={{ duration: 200 }}>
      <button
        type="button"
        class="w-full flex items-center justify-between p-3 bg-base-300/20 rounded-lg hover:bg-base-300/30 transition-colors"
        on:click={() => toggleSection('dimensions')}
      >
        <div class="flex items-center space-x-3">
          <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d={sections[1].icon} />
          </svg>
          <span class="text-sm font-semibold text-base-content">Dimensions</span>
        </div>
        <svg class="w-4 h-4 text-base-content/60 transition-transform" class:rotate-180={!expandedSections.dimensions} fill="currentColor" viewBox="0 0 24 24">
          <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
        </svg>
      </button>

      <div class="space-y-4 pl-4">
        {#if objectForm.shape === "circle"}
          <div>
            <label class="block text-sm font-medium text-base-content mb-2">Radius</label>
            <input
              type="number"
              placeholder="25"
              class="input-enhanced w-full"
              bind:value={objectForm.radius}
            />
          </div>
        {:else}
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-base-content mb-2">Width</label>
              <input
                type="number"
                placeholder="50"
                class="input-enhanced w-full"
                bind:value={objectForm.width}
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-base-content mb-2">Height</label>
              <input
                type="number"
                placeholder="50"
                class="input-enhanced w-full"
                bind:value={objectForm.height}
              />
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Physics Properties Section -->
  {#if expandedSections.physics}
    <div class="space-y-4" in:fade={{ duration: 200 }}>
      <button
        type="button"
        class="w-full flex items-center justify-between p-3 bg-base-300/20 rounded-lg hover:bg-base-300/30 transition-colors"
        on:click={() => toggleSection('physics')}
      >
        <div class="flex items-center space-x-3">
          <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d={sections[2].icon} />
          </svg>
          <span class="text-sm font-semibold text-base-content">Physics Properties</span>
        </div>
        <svg class="w-4 h-4 text-base-content/60 transition-transform" class:rotate-180={!expandedSections.physics} fill="currentColor" viewBox="0 0 24 24">
          <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
        </svg>
      </button>

      <div class="space-y-4 pl-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-base-content mb-2">Mass (kg)</label>
            <input
              type="number"
              step="0.1"
              placeholder="1"
              class="input-enhanced w-full"
              bind:value={objectForm.mass}
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-base-content mb-2">Density</label>
            <input
              type="number"
              step="0.1"
              placeholder="Auto"
              class="input-enhanced w-full"
              bind:value={objectForm.density}
            />
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-base-content mb-3">
              Friction: <span class="text-primary font-semibold">{objectForm.friction.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              class="slider-enhanced w-full"
              bind:value={objectForm.friction}
            />
            <div class="flex justify-between text-xs text-base-content/60 mt-1">
              <span>Slippery</span>
              <span>Grippy</span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-base-content mb-3">
              Elasticity: <span class="text-primary font-semibold">{objectForm.restitution.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              class="slider-enhanced w-full"
              bind:value={objectForm.restitution}
            />
            <div class="flex justify-between text-xs text-base-content/60 mt-1">
              <span>Absorbs</span>
              <span>Bouncy</span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-base-content mb-3">
              Air Resistance: <span class="text-primary font-semibold">{objectForm.airResistance.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="0.1"
              step="0.01"
              class="slider-enhanced w-full"
              bind:value={objectForm.airResistance}
            />
            <div class="flex justify-between text-xs text-base-content/60 mt-1">
              <span>None</span>
              <span>High Drag</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Motion Properties Section -->
  <div class="space-y-4">
    <button
      type="button"
      class="w-full flex items-center justify-between p-3 bg-base-300/20 rounded-lg hover:bg-base-300/30 transition-colors"
      on:click={() => toggleSection('motion')}
    >
      <div class="flex items-center space-x-3">
        <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
          <path d={sections[3].icon} />
        </svg>
        <span class="text-sm font-semibold text-base-content">Motion Properties</span>
      </div>
      <svg class="w-4 h-4 text-base-content/60 transition-transform" class:rotate-180={!expandedSections.motion} fill="currentColor" viewBox="0 0 24 24">
        <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
      </svg>
    </button>

    {#if expandedSections.motion}
      <div class="space-y-4 pl-4" in:fade={{ duration: 200 }}>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-base-content mb-2">Velocity X</label>
            <input
              type="number"
              step="0.1"
              placeholder="0"
              class="input-enhanced w-full"
              bind:value={objectForm.initialVelocityX}
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-base-content mb-2">Velocity Y</label>
            <input
              type="number"
              step="0.1"
              placeholder="0"
              class="input-enhanced w-full"
              bind:value={objectForm.initialVelocityY}
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-base-content mb-2">Rotation (°)</label>
            <input
              type="number"
              placeholder="0"
              class="input-enhanced w-full"
              bind:value={objectForm.rotation}
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-base-content mb-2">Angular Velocity</label>
            <input
              type="number"
              step="0.1"
              placeholder="0"
              class="input-enhanced w-full"
              bind:value={objectForm.angularVelocity}
            />
          </div>
        </div>
      </div>
    {/if}
  </div>

  <!-- Advanced Options Section -->
  <div class="space-y-4">
    <button
      type="button"
      class="w-full flex items-center justify-between p-3 bg-base-300/20 rounded-lg hover:bg-base-300/30 transition-colors"
      on:click={() => toggleSection('advanced')}
    >
      <div class="flex items-center space-x-3">
        <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
          <path d={sections[4].icon} />
        </svg>
        <span class="text-sm font-semibold text-base-content">Advanced Options</span>
      </div>
      <svg class="w-4 h-4 text-base-content/60 transition-transform" class:rotate-180={!expandedSections.advanced} fill="currentColor" viewBox="0 0 24 24">
        <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
      </svg>
    </button>

    {#if expandedSections.advanced}
      <div class="space-y-4 pl-4" in:fade={{ duration: 200 }}>
        <div class="space-y-3">
          <div class="flex items-center justify-between p-4 bg-base-200/30 rounded-lg border border-base-300/20">
            <div class="flex items-center space-x-3">
              <svg class="w-4 h-4 text-base-content/60" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z"/>
              </svg>
              <div>
                <span class="text-sm font-medium text-base-content">Static Object</span>
                <p class="text-xs text-base-content/60">Object won't move or rotate</p>
              </div>
            </div>
            <input
              type="checkbox"
              class="toggle toggle-primary"
              bind:checked={objectForm.isStatic}
            />
          </div>

          <div class="flex items-center justify-between p-4 bg-base-200/30 rounded-lg border border-base-300/20">
            <div class="flex items-center space-x-3">
              <svg class="w-4 h-4 text-base-content/60" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z"/>
              </svg>
              <div>
                <span class="text-sm font-medium text-base-content">Hollow Object</span>
                <p class="text-xs text-base-content/60">Reduced mass distribution</p>
              </div>
            </div>
            <input
              type="checkbox"
              class="toggle toggle-primary"
              bind:checked={objectForm.isHollow}
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-base-content mb-2">Tags (comma-separated)</label>
          <input
            type="text"
            placeholder="wood, heavy, bouncy"
            class="input-enhanced w-full"
            bind:value={objectForm.customTags}
            on:input={handleCustomTagsChange}
          />
        </div>
      </div>
    {/if}
  </div>

  <!-- Enhanced Action Buttons -->
  <div class="flex space-x-3 pt-6 border-t border-base-300/20">
    {#if selectedObject}
      <button
        type="button"
        class="flex-1 btn-secondary-enhanced hover:bg-error hover:text-error-content hover:border-error"
        on:click={handleDelete}
      >
        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
        </svg>
        Delete Object
      </button>
      <button
        type="submit"
        class="flex-1 btn-primary-enhanced"
      >
        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
        </svg>
        Update Object
      </button>
    {:else}
      <button
        type="submit"
        class="w-full btn-primary-enhanced"
      >
        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
        Create Object
      </button>
    {/if}
  </div>
</form>