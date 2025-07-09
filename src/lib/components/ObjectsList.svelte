<script lang="ts">
  import { objectsStore, selectedObjectStore } from "$lib/stores/physics.store";
  import type { PhysicsObject } from "$lib/types/physics.types";
  import { fade, fly } from "svelte/transition";

  function selectObject(object: PhysicsObject) {
    selectedObjectStore.set(object);
  }

  function getShapeIcon(shape: string) {
    const icons = {
      rectangle: "M3,3H21V21H3V3M5,5V19H19V5H5Z",
      circle: "M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",
      polygon: "M17.5,3.5L22.5,12L17.5,20.5H6.5L1.5,12L6.5,3.5H17.5Z",
      triangle: "M12,2L2,19H22L12,2M12,6L17.5,17H6.5L12,6Z",
      pentagon: "M12,2L15.09,8.26L22,9.27L17,14.14L18.18,21.02L12,17.77L5.82,21.02L7,14.14L2,9.27L8.91,8.26L12,2Z",
      star: "M12,2L15.09,8.26L22,9.27L17,14.14L18.18,21.02L12,17.77L5.82,21.02L7,14.14L2,9.27L8.91,8.26L12,2Z"
    };
    return icons[shape] || icons.rectangle;
  }

  function handleKeydown(event: KeyboardEvent, object: PhysicsObject) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectObject(object);
    }
  }

  function getMaterialColor(material: string) {
    const colors = {
      wood: "#8B4513",
      steel: "#A9A9A9", 
      rubber: "#333333",
      ice: "#F0FFFF",
      concrete: "#808080"
    };
    return colors[material] || "#4CAF50";
  }
</script>

<div class="space-y-4">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div class="flex items-center space-x-3">
      <div class="w-8 h-8 rounded-lg bg-info/20 flex items-center justify-center">
        <svg class="w-4 h-4 text-info" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </div>
      <div>
        <h3 class="text-sm font-semibold text-base-content">
          Objects ({$objectsStore.length})
        </h3>
        <p class="text-xs text-base-content/60">Click to select and edit</p>
      </div>
    </div>
    
    {#if $objectsStore.length > 0}
      <button
        class="text-xs text-base-content/60 hover:text-base-content transition-colors px-3 py-1.5 rounded-lg hover:bg-base-200/30"
        on:click={() => selectedObjectStore.clear()}
      >
        Clear Selection
      </button>
    {/if}
  </div>

  <!-- Objects List -->
  {#if $objectsStore.length === 0}
    <div class="text-center py-12" in:fade={{ duration: 300 }}>
      <div class="w-20 h-20 mx-auto mb-4 rounded-2xl bg-base-200/50 flex items-center justify-center">
        <svg class="w-8 h-8 text-base-content/30" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
        </svg>
      </div>
      <h4 class="text-sm font-medium text-base-content mb-2">No objects created yet</h4>
      <p class="text-xs text-base-content/60 mb-4">
        Create your first physics object using the toolbar or Create tab
      </p>
      <div class="flex items-center justify-center space-x-2 text-xs text-base-content/40">
        <kbd class="px-2 py-1 bg-base-300/50 rounded">R</kbd>
        <span>Rectangle</span>
        <kbd class="px-2 py-1 bg-base-300/50 rounded">C</kbd>
        <span>Circle</span>
      </div>
    </div>
  {:else}
    <div class="space-y-2 max-h-96 overflow-y-auto pr-2">
      {#each $objectsStore as object, index (object.id)}
        <div
          in:fly={{ x: -20, duration: 200, delay: index * 50 }}
          out:fly={{ x: 20, duration: 150 }}
        >
          <button
            class="w-full p-4 rounded-xl cursor-pointer transition-all duration-200 text-left group hover:scale-[1.02] focus-ring"
            class:bg-primary={object.selected}
            class:bg-opacity-20={object.selected}
            class:border-primary={object.selected}
            class:shadow-lg={object.selected}
            class:bg-base-200/30={!object.selected}
            class:border-base-300/20={!object.selected}
            class:hover:bg-base-200/50={!object.selected}
            class:hover:border-base-300/30={!object.selected}
            class:hover:shadow-md={!object.selected}
            on:click={() => selectObject(object)}
            on:keydown={(e) => handleKeydown(e, object)}
            aria-label="Select {object.name}"
          >
            <div class="flex items-center space-x-4">
              <!-- Object Icon -->
              <div class="relative">
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110"
                  style="background: linear-gradient(135deg, {object.color}, {object.color}80)"
                >
                  <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d={getShapeIcon(object.config.shape)} />
                  </svg>
                </div>
                
                <!-- Status Indicators -->
                {#if object.config.isStatic}
                  <div class="absolute -top-1 -right-1 w-4 h-4 bg-warning rounded-full flex items-center justify-center">
                    <svg class="w-2 h-2 text-warning-content" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z"/>
                    </svg>
                  </div>
                {/if}
              </div>

              <!-- Object Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2 mb-1">
                  <p class="text-sm font-semibold text-base-content truncate">
                    {object.name}
                  </p>
                  {#if object.selected}
                    <div class="w-2 h-2 bg-primary rounded-full animate-pulse-slow"></div>
                  {/if}
                </div>
                
                <div class="flex items-center space-x-2 mb-2">
                  <span class="text-xs text-base-content/60 capitalize font-medium px-2 py-0.5 bg-base-300/30 rounded-full">
                    {object.config.shape}
                  </span>
                  
                  {#if object.material}
                    <span 
                      class="text-xs font-medium px-2 py-0.5 rounded-full text-white"
                      style="background-color: {getMaterialColor(object.material)};"
                    >
                      {object.material}
                    </span>
                  {/if}
                </div>

                <!-- Properties -->
                <div class="flex items-center space-x-3 text-xs text-base-content/50">
                  <div class="flex items-center space-x-1">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                    </svg>
                    <span>{object.config.mass}kg</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                    </svg>
                    <span>{object.config.friction.toFixed(1)}f</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                    </svg>
                    <span>{object.config.restitution.toFixed(1)}e</span>
                  </div>
                </div>
              </div>

              <!-- Selection Indicator -->
              <div class="flex flex-col items-end space-y-2">
                {#if object.selected}
                  <div class="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <svg class="w-3 h-3 text-primary-content" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                    </svg>
                  </div>
                {:else}
                  <div class="w-6 h-6 border-2 border-base-300/50 rounded-full group-hover:border-base-300 transition-colors"></div>
                {/if}
                
                <!-- Quick Actions -->
                <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    class="p-1 rounded hover:bg-base-300/50 transition-colors"
                    on:click|stopPropagation={() => {/* Quick edit action */}}
                    aria-label="Quick edit"
                  >
                    <svg class="w-3 h-3 text-base-content/60" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>