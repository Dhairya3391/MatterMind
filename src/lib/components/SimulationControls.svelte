<script lang="ts">
  import { physicsStore } from "$lib/stores/physics.store";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher<{
    togglePause: void;
    reset: void;
    createPresetObjects: void;
    toggleGravity: void;
    toggleVectors: void;
  }>();

  function handleTogglePause() {
    dispatch("togglePause");
  }

  function handleReset() {
    dispatch("reset");
  }

  function handleCreatePresetObjects() {
    dispatch("createPresetObjects");
  }

  function handleToggleGravity() {
    dispatch("toggleGravity");
  }

  function handleToggleVectors() {
    dispatch("toggleVectors");
  }
</script>

<div class="card bg-base-100/10 backdrop-blur-md">
  <div class="card-body">
    <h2 class="card-title text-white">🎮 Simulation Controls</h2>
    <div class="grid grid-cols-2 gap-2">
      <button class="btn btn-primary btn-sm" on:click={handleTogglePause}>
        {$physicsStore.isRunning ? "⏸️ Pause" : "▶️ Play"}
      </button>
      <button class="btn btn-secondary btn-sm" on:click={handleReset}>
        🔄 Reset
      </button>
    </div>
    <button
      class="btn btn-info btn-sm w-full mt-2"
      on:click={handleCreatePresetObjects}
    >
      🎯 Create Preset Objects
    </button>

    <div class="form-control mt-4">
      <label class="label cursor-pointer">
        <span class="label-text text-white">🌍 Gravity</span>
        <input
          type="checkbox"
          class="toggle toggle-primary"
          bind:checked={$physicsStore.gravity}
          on:change={handleToggleGravity}
        />
      </label>
    </div>
    <div class="form-control">
      <label class="label cursor-pointer">
        <span class="label-text text-white">📐 Show Vectors</span>
        <input
          type="checkbox"
          class="toggle toggle-primary"
          bind:checked={$physicsStore.showVectors}
          on:change={handleToggleVectors}
        />
      </label>
    </div>
  </div>
</div>

<style>
  .card {
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .form-control .label-text {
    color: rgba(255, 255, 255, 0.9);
  }
</style>
