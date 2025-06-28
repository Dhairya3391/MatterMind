<script lang="ts">
  import { physicsStore } from "$lib/stores/physics.store";
</script>

<header
  class="navbar bg-base-100/10 backdrop-blur-md border-b border-base-300/20"
>
  <div class="navbar-start">
    <div class="flex items-center gap-2">
      <div
        class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
      >
        <span class="text-white font-bold text-sm">M</span>
      </div>
      <h1 class="text-xl font-bold text-white">MatterMind</h1>
    </div>
  </div>
  <div class="navbar-end">
    <div class="flex items-center gap-2">
      <div class="stats shadow bg-base-100/10 backdrop-blur-md">
        <div class="stat">
          <div class="stat-title text-white/70">FPS</div>
          <div class="stat-value text-white">{$physicsStore.fps}</div>
        </div>
      </div>
      <div class="stats shadow bg-base-100/10 backdrop-blur-md">
        <div class="stat">
          <div class="stat-title text-white/70">Objects</div>
          <div class="stat-value text-white">{$physicsStore.objectCount}</div>
        </div>
      </div>
    </div>
  </div>
</header>

<style>
  .stats {
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .stat-title {
    color: rgba(255, 255, 255, 0.7) !important;
  }

  .stat-value {
    color: white !important;
  }
</style>
