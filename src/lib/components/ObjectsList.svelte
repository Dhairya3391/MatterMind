<script lang="ts">
  import { fly } from "svelte/transition";
  import { objectsStore, selectedObjectStore } from "$lib/stores/physics.store";
  import type { PhysicsObject } from "$lib/types/physics.types";

  function selectObject(object: PhysicsObject) {
    selectedObjectStore.set(object);
  }
</script>

<div class="space-y-2">
  {#each $objectsStore as object (object.id)}
    <button
      in:fly={{ y: -10, duration: 300 }}
      class="btn btn-block justify-start"
      class:btn-primary={object.selected}
      on:click={() => selectObject(object)}
    >
      <div
        class="w-4 h-4 rounded-full border border-base-content/20"
        style="background-color: {object.color}"
      ></div>
      <div class="text-left">
        <div class="font-bold">{object.name}</div>
        <div class="text-xs opacity-60">
          {object.config.shape} | {object.config.mass}kg
        </div>
      </div>
    </button>
  {/each}

  {#if $objectsStore.length === 0}
    <div class="text-center py-8 text-base-content/60">
      <p>No objects created yet.</p>
    </div>
  {/if}
</div>
