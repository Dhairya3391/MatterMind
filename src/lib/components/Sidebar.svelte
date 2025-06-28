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
    shape: "rectangle" | "circle" | "polygon" | "triangle" | "pentagon";
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

<div class="h-full flex flex-col bg-base-200">
  <!-- Tab Navigation -->
  <div class="p-6 border-b border-base-300">
    <div class="flex bg-base-300 rounded-lg p-1">
      <button
        class="flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all {activeTab ===
        'create'
          ? 'bg-base-200 text-base-content shadow-sm'
          : 'text-base-content/70 hover:text-base-content hover:bg-base-300/50'}"
        on:click={() => (activeTab = "create")}
      >
        Create
      </button>
      <button
        class="flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all {activeTab ===
        'objects'
          ? 'bg-base-200 text-base-content shadow-sm'
          : 'text-base-content/70 hover:text-base-content hover:bg-base-300/50'}"
        on:click={() => (activeTab = "objects")}
      >
        Objects ({$objectsStore.length})
      </button>
      <button
        class="flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all {activeTab ===
        'settings'
          ? 'bg-base-200 text-base-content shadow-sm'
          : 'text-base-content/70 hover:text-base-content hover:bg-base-300/50'}"
        on:click={() => (activeTab = "settings")}
      >
        Settings
      </button>
    </div>
  </div>

  <!-- Tab Content -->
  <div class="flex-1 overflow-y-auto">
    {#if activeTab === "create"}
      <div class="p-6 space-y-6" in:fade={{ duration: 200 }}>
        <!-- Simulation Controls Card -->
        <div class="bg-base-300 rounded-xl p-4 border border-base-300/50">
          <h3
            class="text-sm font-semibold text-base-content mb-4 uppercase tracking-wide"
          >
            Simulation Controls
          </h3>
          <SimulationControls
            on:togglePause
            on:reset
            on:createPresetObjects
            on:toggleGravity
            on:toggleVectors
          />
        </div>

        <!-- Object Form Card -->
        <div class="bg-base-300 rounded-xl p-4 border border-base-300/50">
          <h3
            class="text-sm font-semibold text-base-content mb-4 uppercase tracking-wide"
          >
            {selectedObject ? "Edit Object" : "Create New Object"}
          </h3>
          <ObjectForm
            bind:objectForm
            {selectedObject}
            on:createObject
            on:updateObject
            on:deleteObject
          />
        </div>
      </div>
    {:else if activeTab === "objects"}
      <div class="p-6" in:fade={{ duration: 200 }}>
        <div class="bg-base-300 rounded-xl p-4 border border-base-300/50">
          <ObjectsList />
        </div>
      </div>
    {:else if activeTab === "settings"}
      <div class="p-6" in:fade={{ duration: 200 }}>
        <div class="bg-base-300 rounded-xl p-4 border border-base-300/50">
          <h3
            class="text-sm font-semibold text-base-content mb-4 uppercase tracking-wide"
          >
            Application Settings
          </h3>
          <SettingsPanel />
        </div>
      </div>
    {/if}
  </div>
</div>
