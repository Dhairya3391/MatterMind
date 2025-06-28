<script lang="ts">
  import { fade } from "svelte/transition";
  import { createEventDispatcher } from "svelte";
  import { objectsStore } from "$lib/stores/physics.store";
  import SimulationControls from "./SimulationControls.svelte";
  import ObjectForm from "./ObjectForm.svelte";
  import ObjectsList from "./ObjectsList.svelte";
  import SettingsPanel from "./SettingsPanel.svelte";
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
  export let activeTab = "create";
  export let selectedObject: PhysicsObject | null = null;
  export let objectForm: ObjectFormData;

  // Event dispatchers
  const dispatch = createEventDispatcher<{
    togglePause: void;
    reset: void;
    createPresetObjects: void;
    toggleGravity: void;
    toggleVectors: void;
    createObject: ObjectConfig;
    updateObject: { id: number; config: ObjectConfig };
    deleteObject: number;
  }>();

  function handleSimulationEvent(event: CustomEvent) {
    const { type } = event;
    if (
      type === "togglePause" ||
      type === "reset" ||
      type === "createPresetObjects" ||
      type === "toggleGravity" ||
      type === "toggleVectors"
    ) {
      dispatch(type, event.detail);
    }
  }

  function handleObjectFormEvent(event: CustomEvent) {
    const { type } = event;
    if (
      type === "createObject" ||
      type === "updateObject" ||
      type === "deleteObject"
    ) {
      dispatch(type, event.detail);
    }
  }
</script>

<aside class="w-96 bg-base-200 p-4 overflow-y-auto">
  <div role="tablist" class="tabs tabs-boxed grid grid-cols-3">
    <button
      role="tab"
      class="tab"
      class:tab-active={activeTab === 'create'}
      on:click={() => (activeTab = 'create')}
      tabindex="0"
    >
      Create
    </button>
    <button
      role="tab"
      class="tab"
      class:tab-active={activeTab === 'objects'}
      on:click={() => (activeTab = 'objects')}
      tabindex="0"
    >
      Objects ({$objectsStore.length})
    </button>
    <button
      role="tab"
      class="tab"
      class:tab-active={activeTab === 'settings'}
      on:click={() => (activeTab = 'settings')}
      tabindex="0"
    >
      Settings
    </button>
  </div>

  <div class="mt-4">
    {#if activeTab === "create"}
      <div in:fade={{ duration: 200 }}>
        <SimulationControls
          on:togglePause
          on:reset
          on:createPresetObjects
          on:toggleGravity
          on:toggleVectors
        />
        <div class="divider"></div>
        <ObjectForm
          bind:objectForm
          {selectedObject}
          on:createObject
          on:updateObject
          on:deleteObject
        />
      </div>
    {:else if activeTab === "objects"}
      <div in:fade={{ duration: 200 }}>
        <ObjectsList />
      </div>
    {:else if activeTab === "settings"}
      <div in:fade={{ duration: 200 }}>
        <SettingsPanel />
      </div>
    {/if}
  </div>
</aside>
