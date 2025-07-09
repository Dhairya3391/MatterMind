<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import { createEventDispatcher } from "svelte";
  import { objectsStore } from "$lib/stores/physics.store";
  import SimulationControls from "./SimulationControls.svelte";
  import ObjectForm from "./ObjectForm.svelte";
  import ObjectsList from "./ObjectsList.svelte";
  import type { ObjectConfig, PhysicsObject } from "$lib/types/physics.types";

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

  const tabs = [
    { 
      id: "create", 
      name: "Create", 
      icon: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
      description: "Create and edit objects"
    },
    { 
      id: "objects", 
      name: "Objects", 
      icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
      description: "Manage existing objects",
      count: $objectsStore.length
    }
  ];
</script>

<div class="h-full flex flex-col sidebar-glass" in:fly={{ x: -320, duration: 300 }}>
  <!-- Enhanced Tab Navigation -->
  <div class="p-6 border-b border-base-300/20">
    <div class="bg-base-300/30 rounded-xl p-1.5 backdrop-blur-sm">
      {#each tabs as tab}
        <button
          class="relative flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group"
          class="{activeTab === tab.id 
            ? 'bg-primary text-primary-content shadow-lg' 
            : 'text-base-content hover:bg-base-200/30'}"
          on:click={() => (activeTab = tab.id)}
        >
          <div class="flex items-center justify-center space-x-2">
            <svg class="w-4 h-4 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
              <path d={tab.icon} />
            </svg>
            <span>{tab.name}</span>
            {#if tab.count !== undefined && tab.count > 0}
              <span class="ml-1 px-2 py-0.5 text-xs bg-base-content/20 rounded-full">
                {tab.count}
              </span>
            {/if}
          </div>
          
          <!-- Active indicator -->
          {#if activeTab === tab.id}
            <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary-content rounded-full"></div>
          {/if}
        </button>
      {/each}
    </div>
  </div>

  <!-- Enhanced Tab Content -->
  <div class="flex-1 overflow-y-auto">
    {#if activeTab === "create"}
      <div class="p-6 space-y-6" in:fade={{ duration: 200 }}>
        <!-- Quick Actions Card -->
        <div class="card-enhanced p-5">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,6V14L17.25,10.5L11,6Z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-base-content">Quick Actions</h3>
              <p class="text-xs text-base-content/60">Control simulation</p>
            </div>
          </div>
          <SimulationControls
            on:togglePause
            on:reset
            on:createPresetObjects
            on:toggleGravity
            on:toggleVectors
          />
        </div>

        <!-- Object Creation Card -->
        <div class="card-enhanced p-5">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
              <svg class="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-base-content">
                {selectedObject ? "Edit Object" : "Create Object"}
              </h3>
              <p class="text-xs text-base-content/60">
                {selectedObject ? "Modify selected object" : "Add new physics object"}
              </p>
            </div>
          </div>
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
        <div class="card-enhanced p-5">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-8 h-8 rounded-lg bg-info/20 flex items-center justify-center">
              <svg class="w-4 h-4 text-info" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-base-content">Scene Objects</h3>
              <p class="text-xs text-base-content/60">Manage physics objects</p>
            </div>
          </div>
          <ObjectsList />
        </div>
      </div>
    {/if}
  </div>

  <!-- Enhanced Footer -->
  <div class="p-4 border-t border-base-300/20 bg-base-200/20">
    <div class="flex items-center justify-between text-xs text-base-content/60">
      <div class="flex items-center space-x-2">
        <div class="w-2 h-2 rounded-full bg-success animate-pulse-slow"></div>
        <span>Physics Engine Active</span>
      </div>
      <div class="flex items-center space-x-1">
        <kbd class="px-2 py-1 bg-base-300/50 rounded text-xs">Tab</kbd>
        <span>to toggle</span>
      </div>
    </div>
  </div>
</div>