<script lang="ts">
  import { physicsStore } from "$lib/stores/physics.store";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
</script>

<div class="space-y-2">
  <div class="grid grid-cols-2 gap-2">
    <button class="btn btn-primary btn-sm" on:click={() => dispatch('togglePause')}>
      {$physicsStore.isRunning ? "Pause" : "Play"}
    </button>
    <button class="btn btn-secondary btn-sm" on:click={() => dispatch('reset')}>
      Reset
    </button>
  </div>
  <button class="btn btn-accent btn-sm btn-block" on:click={() => dispatch('createPresetObjects')}>
    Add Preset Objects
  </button>

  <div class="form-control">
    <label class="label cursor-pointer">
      <span class="label-text">Gravity</span>
      <input
        type="checkbox"
        class="toggle toggle-primary"
        bind:checked={$physicsStore.gravity}
        on:change={() => dispatch('toggleGravity')}
      />
    </label>
  </div>
  <div class="form-control">
    <label class="label cursor-pointer">
      <span class="label-text">Show Vectors</span>
      <input
        type="checkbox"
        class="toggle toggle-primary"
        bind:checked={$physicsStore.showVectors}
        on:change={() => dispatch('toggleVectors')}
      />
    </label>
  </div>
</div>
