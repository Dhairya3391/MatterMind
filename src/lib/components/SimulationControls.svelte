<script lang="ts">
  import { physicsStore } from "$lib/stores/physics.store";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
</script>

<div class="space-y-4">
  <!-- Control Buttons -->
  <div class="grid grid-cols-2 gap-3">
    <button
      class="px-4 py-3 bg-primary text-primary-content rounded-lg font-medium hover:opacity-90 transition-all shadow-sm hover:shadow-md"
      on:click={() => dispatch("togglePause")}
    >
      {#if $physicsStore.isRunning}
        <div class="flex items-center justify-center space-x-2">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
          <span>Pause</span>
        </div>
      {:else}
        <div class="flex items-center justify-center space-x-2">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span>Play</span>
        </div>
      {/if}
    </button>
    <button
      class="px-4 py-3 bg-base-300 text-base-content rounded-lg font-medium hover:bg-base-300/80 transition-all shadow-sm hover:shadow-md"
      on:click={() => dispatch("reset")}
    >
      <div class="flex items-center justify-center space-x-2">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path
            d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"
          />
        </svg>
        <span>Reset</span>
      </div>
    </button>
  </div>

  <button
    class="w-full px-4 py-3 bg-accent text-accent-content rounded-lg font-medium hover:opacity-90 transition-all shadow-sm hover:shadow-md"
    on:click={() => dispatch("createPresetObjects")}
  >
    <div class="flex items-center justify-center space-x-2">
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
      </svg>
      <span>Add Demo Objects</span>
    </div>
  </button>

  <!-- Toggle Controls -->
  <div class="space-y-3">
    <div
      class="flex items-center justify-between p-4 bg-base-300/30 rounded-lg border border-base-300/20"
    >
      <div class="flex items-center space-x-3">
        <svg
          class="w-4 h-4 text-base-content/60"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
        </svg>
        <span class="text-sm font-medium text-base-content">Gravity</span>
      </div>
      <input
        type="checkbox"
        class="toggle toggle-primary"
        bind:checked={$physicsStore.gravity}
        on:change={() => dispatch("toggleGravity")}
      />
    </div>

    <div
      class="flex items-center justify-between p-4 bg-base-300/30 rounded-lg border border-base-300/20"
    >
      <div class="flex items-center space-x-3">
        <svg
          class="w-4 h-4 text-base-content/60"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
          />
        </svg>
        <span class="text-sm font-medium text-base-content">Show Vectors</span>
      </div>
      <input
        type="checkbox"
        class="toggle toggle-primary"
        bind:checked={$physicsStore.showVectors}
        on:change={() => dispatch("toggleVectors")}
      />
    </div>
  </div>
</div>
