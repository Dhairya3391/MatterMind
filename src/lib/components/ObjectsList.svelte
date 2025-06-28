<script lang="ts">
  import { objectsStore, selectedObjectStore } from "$lib/stores/physics.store";
  import type { PhysicsObject } from "$lib/types/physics.types";

  function selectObject(object: PhysicsObject) {
    selectedObjectStore.set(object);
  }

  function getShapeIcon(shape: string) {
    switch (shape) {
      case "circle":
        return "●";
      case "polygon":
        return "⬡";
      default:
        return "■";
    }
  }

  function handleKeydown(event: KeyboardEvent, object: PhysicsObject) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectObject(object);
    }
  }
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <div class="flex items-center space-x-2">
      <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        />
      </svg>
      <h3
        class="text-sm font-semibold text-base-content/80 uppercase tracking-wide"
      >
        Objects ({$objectsStore.length})
      </h3>
    </div>
    {#if $objectsStore.length > 0}
      <button
        class="text-xs text-base-content/60 hover:text-base-content transition-colors px-2 py-1 rounded hover:bg-base-300/30"
        on:click={() => selectedObjectStore.clear()}
      >
        Clear Selection
      </button>
    {/if}
  </div>

  {#if $objectsStore.length === 0}
    <div class="text-center py-12">
      <div
        class="w-16 h-16 mx-auto mb-4 rounded-full bg-base-300/50 flex items-center justify-center"
      >
        <span class="text-3xl text-base-content/30">●</span>
      </div>
      <p class="text-sm text-base-content/60 font-medium">
        No objects created yet
      </p>
      <p class="text-xs text-base-content/40 mt-1">
        Create your first object in the Create tab
      </p>
    </div>
  {:else}
    <div class="space-y-3 max-h-96 overflow-y-auto">
      {#each $objectsStore as object (object.id)}
        <button
          class="w-full p-4 rounded-xl cursor-pointer transition-all border text-left group"
          class:bg-primary={object.selected}
          class:bg-opacity-20={object.selected}
          class:border-primary={object.selected}
          class:bg-base-300={!object.selected}
          class:bg-opacity-30={!object.selected}
          class:border-base-300={!object.selected}
          class:border-opacity-30={!object.selected}
          class:hover:bg-base-300={!object.selected}
          class:hover:bg-opacity-50={!object.selected}
          class:hover:border-base-300={!object.selected}
          class:hover:border-opacity-50={!object.selected}
          class:hover:shadow-md={!object.selected}
          on:click={() => selectObject(object)}
          on:keydown={(e) => handleKeydown(e, object)}
          aria-label="Select {object.name}"
        >
          <div class="flex items-center space-x-4">
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm"
              style="background-color: {object.color}"
            >
              <span class="text-white">{getShapeIcon(object.config.shape)}</span
              >
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-base-content truncate">
                {object.name}
              </p>
              <div class="flex items-center space-x-2 mt-1">
                <span
                  class="text-xs text-base-content/60 capitalize font-medium"
                  >{object.config.shape}</span
                >
                {#if object.config.isStatic}
                  <span
                    class="text-xs bg-warning bg-opacity-20 text-warning px-2 py-0.5 rounded-full font-medium"
                    >Static</span
                  >
                {/if}
                {#if object.material}
                  <span
                    class="text-xs bg-info bg-opacity-20 text-info px-2 py-0.5 rounded-full font-medium"
                    >{object.material}</span
                  >
                {/if}
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-base-content/80">
                {object.config.mass}kg
              </p>
              <p class="text-xs text-base-content/50 font-medium">
                {object.config.friction.toFixed(1)}f
              </p>
            </div>
          </div>
        </button>
      {/each}
    </div>
  {/if}
</div>
