<script lang="ts">
  // Settings panel component
</script>

<div class="space-y-4">
  <div class="form-control">
    <label class="label" for="canvas-width">
      <span class="label-text">Canvas Size</span>
    </label>
    <div class="grid grid-cols-2 gap-2">
      <input id="canvas-width" type="number" placeholder="Width" class="input input-bordered" value="800" />
      <input type="number" placeholder="Height" class="input input-bordered" value="600" />
    </div>
  </div>

  <div class="form-control">
    <label class="label" for="physics-engine">
      <span class="label-text">Physics Engine</span>
    </label>
    <select id="physics-engine" class="select select-bordered">
      <option>Matter.js</option>
      <option disabled>Box2D (Coming Soon)</option>
      <option disabled>Planck.js (Coming Soon)</option>
    </select>
  </div>

  <div class="form-control">
    <label class="label cursor-pointer" for="auto-save">
      <span class="label-text">Auto-save</span>
      <input id="auto-save" type="checkbox" class="toggle toggle-primary" checked />
    </label>
  </div>

  <div class="form-control">
    <label class="label cursor-pointer" for="show-fps">
      <span class="label-text">Show FPS</span>
      <input id="show-fps" type="checkbox" class="toggle toggle-primary" checked />
    </label>
  </div>

  <div class="form-control">
    <label class="label cursor-pointer" for="show-grid">
      <span class="label-text">Show Grid</span>
      <input id="show-grid" type="checkbox" class="toggle toggle-primary" />
    </label>
  </div>
</div>
