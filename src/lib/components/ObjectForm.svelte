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

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
  <div class="form-control">
    <label class="label" for="shape">
      <span class="label-text">Shape</span>
    </label>
    <select id="shape" class="select select-bordered" bind:value={objectForm.shape}>
      <option value="rectangle">Rectangle</option>
      <option value="circle">Circle</option>
      <option value="polygon">Polygon</option>
    </select>
  </div>

  <div class="form-control">
    <label class="label" for="name">
      <span class="label-text">Name</span>
    </label>
    <input
      id="name"
      type="text"
      placeholder="Object Name"
      class="input input-bordered"
      bind:value={objectForm.name}
    />
  </div>

  <div class="grid grid-cols-2 gap-4">
    <div class="form-control">
      <label class="label" for="color">
        <span class="label-text">Color</span>
      </label>
      <input id="color" type="color" class="input input-bordered" bind:value={objectForm.color} />
    </div>
    <div class="form-control">
      <label class="label" for="material">
        <span class="label-text">Material</span>
      </label>
      <select id="material" class="select select-bordered" on:change={handleMaterialPresetChange}>
        <option value="">Custom</option>
        {#each Object.entries(MATERIAL_PRESETS) as [key, preset]}
          <option value={key}>{preset.name}</option>
        {/each}
      </select>
    </div>
  </div>

  {#if objectForm.shape === 'circle'}
    <div class="form-control">
      <label class="label" for="radius">
        <span class="label-text">Radius</span>
      </label>
      <input
        id="radius"
        type="number"
        placeholder="Radius"
        class="input input-bordered"
        bind:value={objectForm.radius}
      />
    </div>
  {:else}
    <div class="grid grid-cols-2 gap-4">
      <div class="form-control">
        <label class="label" for="width">
          <span class="label-text">Width</span>
        </label>
        <input
          id="width"
          type="number"
          placeholder="Width"
          class="input input-bordered"
          bind:value={objectForm.width}
        />
      </div>
      <div class="form-control">
        <label class="label" for="height">
          <span class="label-text">Height</span>
        </label>
        <input
          id="height"
          type="number"
          placeholder="Height"
          class="input input-bordered"
          bind:value={objectForm.height}
        />
      </div>
    </div>
  {/if}

  <div class="grid grid-cols-2 gap-4">
    <div class="form-control">
      <label class="label" for="mass">
        <span class="label-text">Mass (kg)</span>
      </label>
      <input
        id="mass"
        type="number"
        placeholder="Mass"
        class="input input-bordered"
        bind:value={objectForm.mass}
      />
    </div>
    <div class="form-control">
      <label class="label" for="density">
        <span class="label-text">Density</span>
      </label>
      <input
        id="density"
        type="number"
        placeholder="Density"
        class="input input-bordered"
        bind:value={objectForm.density}
      />
    </div>
  </div>

  <div class="form-control">
    <label class="label" for="friction">
      <span class="label-text">Friction: {objectForm.friction}</span>
    </label>
    <input
      id="friction"
      type="range"
      min="0"
      max="1"
      step="0.1"
      class="range range-primary"
      bind:value={objectForm.friction}
    />
  </div>

  <div class="form-control">
    <label class="label" for="restitution">
      <span class="label-text">Elasticity: {objectForm.restitution}</span>
    </label>
    <input
      id="restitution"
      type="range"
      min="0"
      max="1"
      step="0.1"
      class="range range-primary"
      bind:value={objectForm.restitution}
    />
  </div>

  <div class="form-control">
    <label class="label" for="air-resistance">
      <span class="label-text">Air Resistance: {objectForm.airResistance}</span>
    </label>
    <input
      id="air-resistance"
      type="range"
      min="0"
      max="0.1"
      step="0.01"
      class="range range-primary"
      bind:value={objectForm.airResistance}
    />
  </div>

  <div class="grid grid-cols-2 gap-4">
    <div class="form-control">
      <label class="label" for="velocity-x">
        <span class="label-text">Velocity X</span>
      </label>
      <input
        id="velocity-x"
        type="number"
        placeholder="VX"
        class="input input-bordered"
        bind:value={objectForm.initialVelocityX}
      />
    </div>
    <div class="form-control">
      <label class="label" for="velocity-y">
        <span class="label-text">Velocity Y</span>
      </label>
      <input
        id="velocity-y"
        type="number"
        placeholder="VY"
        class="input input-bordered"
        bind:value={objectForm.initialVelocityY}
      />
    </div>
  </div>

  <div class="grid grid-cols-2 gap-4">
    <div class="form-control">
      <label class="label" for="rotation">
        <span class="label-text">Rotation (°)</span>
      </label>
      <input
        id="rotation"
        type="number"
        placeholder="Rotation"
        class="input input-bordered"
        bind:value={objectForm.rotation}
      />
    </div>
    <div class="form-control">
      <label class="label" for="angular-velocity">
        <span class="label-text">Angular Vel.</span>
      </label>
      <input
        id="angular-velocity"
        type="number"
        placeholder="Angular"
        class="input input-bordered"
        bind:value={objectForm.angularVelocity}
      />
    </div>
  </div>

  <div class="form-control">
    <label class="label cursor-pointer" for="is-static">
      <span class="label-text">Static Object</span>
      <input id="is-static" type="checkbox" class="toggle toggle-primary" bind:checked={objectForm.isStatic} />
    </label>
  </div>
  <div class="form-control">
    <label class="label cursor-pointer" for="is-hollow">
      <span class="label-text">Hollow Object</span>
      <input id="is-hollow" type="checkbox" class="toggle toggle-primary" bind:checked={objectForm.isHollow} />
    </label>
  </div>

  <div class="form-control">
    <label class="label" for="tags">
      <span class="label-text">Tags (comma-separated)</span>
    </label>
    <input
      id="tags"
      type="text"
      placeholder="wood, heavy, bouncy"
      class="input input-bordered"
      bind:value={objectForm.customTags}
      on:input={handleCustomTagsChange}
    />
  </div>

  <div class="card-actions justify-end">
    {#if selectedObject}
      <button type="button" class="btn btn-error" on:click={handleDelete}>Delete</button>
      <button type="submit" class="btn btn-primary">Update</button>
    {:else}
      <button type="submit" class="btn btn-primary">Create</button>
    {/if}
  </div>
</form>
