<script lang="ts">
  import { fly } from "svelte/transition";
  import { objectsStore, selectedObjectStore } from "$lib/stores/physics.store";
  import type { PhysicsObject } from "$lib/types/physics.types";

  function selectObject(object: PhysicsObject) {
    selectedObjectStore.set(object);
  }
</script>

<div class="card bg-base-100/10 backdrop-blur-md">
  <div class="card-body">
    <h2 class="card-title text-white">📦 Objects ({$objectsStore.length})</h2>
    <div class="space-y-2 max-h-96 overflow-y-auto">
      {#each $objectsStore as object (object.id)}
        <button
          in:fly={{ y: -10, duration: 300 }}
          out:fly={{ x: -20, duration: 200 }}
          class="btn btn-outline w-full justify-start {object.selected
            ? 'btn-primary'
            : ''}"
          on:click={() => selectObject(object)}
        >
          <div class="flex items-center gap-3">
            <div
              class="w-4 h-4 rounded-full border border-white/20"
              style="background-color: {object.color}"
            ></div>
            <div class="text-left">
              <div class="font-bold text-white">{object.name}</div>
              <div class="text-xs opacity-60">
                {object.config.shape} | {object.config.mass}kg
              </div>
            </div>
          </div>
        </button>
      {/each}
      {#if $objectsStore.length === 0}
        <div class="text-center py-8 text-white/60">
          <div class="text-4xl mb-2">📦</div>
          <p>No objects created yet</p>
          <p class="text-sm">Create your first object in the Create tab</p>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .card {
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .btn-outline {
    border-color: rgba(255, 255, 255, 0.2);
    color: white;
  }

  .btn-outline:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }
</style>
