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

  function handleTabClick(tab: string) {
    activeTab = tab;
  }

  function handleTabKeydown(event: KeyboardEvent, tab: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activeTab = tab;
    }
  }
</script>

<aside
  class="w-80 bg-base-100/10 backdrop-blur-md border-r border-base-300/20 overflow-y-auto"
>
  <!-- Tab Navigation -->
  <div class="tabs tabs-boxed bg-base-100/10 m-4" role="tablist">
    <button
      type="button"
      class="tab {activeTab === 'create' ? 'tab-active' : ''}"
      role="tab"
      aria-selected={activeTab === "create"}
      aria-controls="create-panel"
      on:click={() => handleTabClick("create")}
      on:keydown={(e) => handleTabKeydown(e, "create")}
    >
      ✨ Create
    </button>
    <button
      type="button"
      class="tab {activeTab === 'objects' ? 'tab-active' : ''}"
      role="tab"
      aria-selected={activeTab === "objects"}
      aria-controls="objects-panel"
      on:click={() => handleTabClick("objects")}
      on:keydown={(e) => handleTabKeydown(e, "objects")}
    >
      📦 Objects ({$objectsStore.length})
    </button>
    <button
      type="button"
      class="tab {activeTab === 'settings' ? 'tab-active' : ''}"
      role="tab"
      aria-selected={activeTab === "settings"}
      aria-controls="settings-panel"
      on:click={() => handleTabClick("settings")}
      on:keydown={(e) => handleTabKeydown(e, "settings")}
    >
      ⚙️ Settings
    </button>
  </div>

  <!-- Tab Content -->
  <div class="p-4 space-y-6">
    {#if activeTab === "create"}
      <div
        in:fade={{ duration: 200 }}
        id="create-panel"
        role="tabpanel"
        aria-labelledby="create-tab"
      >
        <SimulationControls
          on:togglePause={handleSimulationEvent}
          on:reset={handleSimulationEvent}
          on:createPresetObjects={handleSimulationEvent}
          on:toggleGravity={handleSimulationEvent}
          on:toggleVectors={handleSimulationEvent}
        />
        <ObjectForm
          {selectedObject}
          {objectForm}
          on:createObject={handleObjectFormEvent}
          on:updateObject={handleObjectFormEvent}
          on:deleteObject={handleObjectFormEvent}
        />
      </div>
    {:else if activeTab === "objects"}
      <div
        in:fade={{ duration: 200 }}
        id="objects-panel"
        role="tabpanel"
        aria-labelledby="objects-tab"
      >
        <ObjectsList />
      </div>
    {:else if activeTab === "settings"}
      <div
        in:fade={{ duration: 200 }}
        id="settings-panel"
        role="tabpanel"
        aria-labelledby="settings-tab"
      >
        <SettingsPanel />
      </div>
    {/if}
  </div>
</aside>

<style>
  /* Custom scrollbar styling */
  aside::-webkit-scrollbar {
    width: 6px;
  }

  aside::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  aside::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }

  aside::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }

  /* Custom tab styling */
  .tabs-boxed .tab {
    color: rgba(255, 255, 255, 0.7);
    transition: all 0.3s ease;
  }

  .tabs-boxed .tab:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }

  .tabs-boxed .tab-active {
    color: white;
    background: rgba(59, 130, 246, 0.5);
  }
</style>
