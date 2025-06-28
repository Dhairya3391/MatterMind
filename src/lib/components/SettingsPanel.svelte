<script lang="ts">
  // Settings panel component
</script>

<div class="card bg-base-100/10 backdrop-blur-md">
  <div class="card-body">
    <h2 class="card-title text-white">⚙️ Settings</h2>
    <div class="space-y-4">
      <div class="form-control">
        <label for="canvas-width" class="label">
          <span class="label-text text-white">Canvas Size</span>
        </label>
        <div class="grid grid-cols-2 gap-2">
          <input
            id="canvas-width"
            type="number"
            placeholder="Width"
            class="input input-bordered"
            value="800"
          />
          <input
            id="canvas-height"
            type="number"
            placeholder="Height"
            class="input input-bordered"
            value="600"
          />
        </div>
      </div>

      <div class="form-control">
        <label for="physics-engine" class="label">
          <span class="label-text text-white">Physics Engine</span>
        </label>
        <select id="physics-engine" class="select select-bordered w-full">
          <option>Matter.js</option>
          <option disabled>Box2D (Coming Soon)</option>
          <option disabled>Planck.js (Coming Soon)</option>
        </select>
      </div>

      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text text-white">Auto-save</span>
          <input type="checkbox" class="toggle toggle-primary" checked />
        </label>
      </div>

      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text text-white">Show FPS</span>
          <input type="checkbox" class="toggle toggle-primary" checked />
        </label>
      </div>

      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text text-white">Show Grid</span>
          <input type="checkbox" class="toggle toggle-primary" />
        </label>
      </div>
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
