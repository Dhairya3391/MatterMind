<script lang="ts">
  import { physicsStore } from "$lib/stores/physics.store";
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";

  const dispatch = createEventDispatcher();

  const controls = [
    {
      id: "playPause",
      action: "togglePause",
      primary: true,
      getLabel: () => $physicsStore.isRunning ? "Pause" : "Play",
      getIcon: () => $physicsStore.isRunning ? 
        "M6,4H10V20H6V4M14,4H18V20H14V4Z" : 
        "M8,5V19L19,12L8,5Z",
      getClass: () => $physicsStore.isRunning ? 
        "bg-warning text-warning-content hover:bg-warning/90" : 
        "bg-success text-success-content hover:bg-success/90"
    },
    {
      id: "reset",
      action: "reset",
      label: "Reset",
      icon: "M12,5V1L7,6L12,11V7A6,6 0 0,1 18,13A6,6 0 0,1 12,19A6,6 0 0,1 6,13H4A8,8 0 0,0 12,21A8,8 0 0,0 20,13A8,8 0 0,0 12,5Z",
      class: "btn-secondary-enhanced hover:bg-error hover:text-error-content"
    },
    {
      id: "demo",
      action: "createPresetObjects", 
      label: "Add Demo",
      icon: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
      class: "bg-accent text-accent-content hover:bg-accent/90"
    }
  ];

  const toggles = [
    {
      id: "gravity",
      action: "toggleGravity",
      label: "Gravity",
      icon: "M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z",
      getValue: () => $physicsStore.gravity,
      description: "Enable gravitational force"
    },
    {
      id: "vectors",
      action: "toggleVectors",
      label: "Vectors",
      icon: "M12,2L13.09,8.26L22,9.27L16,14.14L17.18,21.02L12,17.77L6.82,21.02L8,14.14L2,9.27L10.91,8.26L12,2Z",
      getValue: () => $physicsStore.showVectors,
      description: "Show velocity vectors"
    }
  ];
</script>

<div class="space-y-6">
  <!-- Primary Controls -->
  <div class="space-y-3">
    {#each controls as control}
      <button
        class="w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 focus-ring {control.primary ? (control.getClass ? control.getClass() : 'btn-primary-enhanced') : (control.class || 'btn-secondary-enhanced')}"
        on:click={() => dispatch(control.action)}
      >
        <div class="flex items-center justify-center space-x-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d={control.getIcon ? control.getIcon() : control.icon} />
          </svg>
          <span>{control.getLabel ? control.getLabel() : control.label}</span>
        </div>
      </button>
    {/each}
  </div>

  <!-- Divider -->
  <div class="relative">
    <div class="absolute inset-0 flex items-center">
      <div class="w-full border-t border-base-300/30"></div>
    </div>
    <div class="relative flex justify-center">
      <span class="px-3 text-xs text-base-content/60 bg-base-200 rounded-full">Physics Settings</span>
    </div>
  </div>

  <!-- Toggle Controls -->
  <div class="space-y-3">
    {#each toggles as toggle}
      <div 
        class="flex items-center justify-between p-4 bg-base-200/30 rounded-xl border border-base-300/20 hover:bg-base-200/40 transition-all duration-200"
        in:fade={{ duration: 200 }}
      >
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d={toggle.icon} />
            </svg>
          </div>
          <div>
            <span class="text-sm font-medium text-base-content">{toggle.label}</span>
            <p class="text-xs text-base-content/60">{toggle.description}</p>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <!-- Status Indicator -->
          <div class="w-2 h-2 rounded-full transition-colors" class:bg-success={toggle.getValue()} class:bg-base-300={!toggle.getValue()}></div>
          
          <!-- Toggle Switch -->
          <input
            type="checkbox"
            class="toggle toggle-primary toggle-sm"
            checked={toggle.getValue()}
            on:change={() => dispatch(toggle.action)}
          />
        </div>
      </div>
    {/each}
  </div>

  <!-- Status Info -->
  <div class="p-4 bg-base-300/20 rounded-xl border border-base-300/20">
    <div class="flex items-center justify-between text-xs text-base-content/60">
      <div class="flex items-center space-x-2">
        <div class="status-dot" class:running={$physicsStore.isRunning} class:paused={!$physicsStore.isRunning}></div>
        <span>Simulation {$physicsStore.isRunning ? 'Running' : 'Paused'}</span>
      </div>
      <div class="flex items-center space-x-3">
        <span>{$physicsStore.fps} FPS</span>
        <span>•</span>
        <span>{$physicsStore.objectCount} objects</span>
      </div>
    </div>
  </div>
</div>