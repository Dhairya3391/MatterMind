<script lang="ts">
  // Settings panel component
</script>

<div class="space-y-6">
  <!-- Canvas Settings -->
  <div class="space-y-4">
    <div class="flex items-center space-x-2">
      <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
        <path
          d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"
        />
      </svg>
      <h3
        class="text-sm font-semibold text-base-content/80 uppercase tracking-wide"
      >
        Canvas Settings
      </h3>
    </div>

    <div class="space-y-3">
      <div>
        <label
          class="block text-sm font-medium text-base-content mb-2"
          for="canvas-width">Canvas Size</label
        >
        <div class="grid grid-cols-2 gap-3">
          <input
            id="canvas-width"
            type="number"
            placeholder="Width"
            class="w-full px-3 py-2.5 bg-base-300/50 border border-base-300/50 rounded-lg text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            value="800"
          />
          <input
            type="number"
            placeholder="Height"
            class="w-full px-3 py-2.5 bg-base-300/50 border border-base-300/50 rounded-lg text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            value="600"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Physics Engine Settings -->
  <div class="space-y-4">
    <div class="flex items-center space-x-2">
      <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        />
      </svg>
      <h3
        class="text-sm font-semibold text-base-content/80 uppercase tracking-wide"
      >
        Physics Engine
      </h3>
    </div>

    <div>
      <label
        class="block text-sm font-medium text-base-content mb-2"
        for="physics-engine">Engine Type</label
      >
      <select
        id="physics-engine"
        class="w-full px-3 py-2.5 bg-base-300/50 border border-base-300/50 rounded-lg text-base-content focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
      >
        <option>Matter.js</option>
        <option disabled>Box2D (Coming Soon)</option>
        <option disabled>Planck.js (Coming Soon)</option>
      </select>
    </div>
  </div>

  <!-- Display Settings -->
  <div class="space-y-4">
    <div class="flex items-center space-x-2">
      <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        />
      </svg>
      <h3
        class="text-sm font-semibold text-base-content/80 uppercase tracking-wide"
      >
        Display Settings
      </h3>
    </div>

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
          <span class="text-sm font-medium text-base-content">Show FPS</span>
        </div>
        <input
          id="show-fps"
          type="checkbox"
          class="toggle toggle-primary"
          checked
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
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
          <span class="text-sm font-medium text-base-content">Show Grid</span>
        </div>
        <input id="show-grid" type="checkbox" class="toggle toggle-primary" />
      </div>
    </div>
  </div>

  <!-- Application Settings -->
  <div class="space-y-4">
    <div class="flex items-center space-x-2">
      <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        />
      </svg>
      <h3
        class="text-sm font-semibold text-base-content/80 uppercase tracking-wide"
      >
        Application
      </h3>
    </div>

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
          <span class="text-sm font-medium text-base-content">Auto-save</span>
        </div>
        <input
          id="auto-save"
          type="checkbox"
          class="toggle toggle-primary"
          checked
        />
      </div>
    </div>
  </div>
</div>
