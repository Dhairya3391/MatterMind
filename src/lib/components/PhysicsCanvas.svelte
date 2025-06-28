<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { PhysicsEngine } from "$lib/physics/physics-engine";
  import {
    physicsStore,
    objectsStore,
    selectedObjectStore,
  } from "$lib/stores/physics.store";
  import type {
    PhysicsCanvasProps,
    PhysicsObject,
  } from "$lib/types/physics.types";
  import type { Body } from "matter-js";
  import "$lib/types/global.types";

  // Props
  export let width: number = 800;
  export let height: number = 600;
  export let showVectors: boolean = false;
  export let onObjectSelected:
    | ((object: PhysicsObject | null) => void)
    | undefined = undefined;

  // Component state
  let canvas: HTMLCanvasElement;
  let physicsEngine: PhysicsEngine;
  let animationFrameId: number | null = null;

  // Reactive statements
  $: if (physicsEngine && showVectors !== undefined) {
    physicsEngine.setShowVectors(showVectors);
  }

  // Lifecycle
  onMount(() => {
    initializePhysicsEngine();
    startInfoUpdates();
  });

  onDestroy(() => {
    cleanup();
  });

  function initializePhysicsEngine(): void {
    try {
      // Create physics engine
      physicsEngine = new PhysicsEngine("physicsCanvas");

      // Set up object selection callback
      physicsEngine.setOnObjectSelected((body: Body | null) => {
        if (onObjectSelected && body) {
          // Find the corresponding PhysicsObject from the store
          const physicsObject = $objectsStore.find((obj) => obj.id === body.id);
          onObjectSelected(physicsObject || null);
        } else if (onObjectSelected) {
          onObjectSelected(null);
        }
      });

      // Start the physics simulation
      physicsEngine.start();

      // Update stores
      physicsStore.setRunning(true);
      physicsStore.setVectors(showVectors);

      // Expose the physics engine globally for the parent component
      if (typeof window !== "undefined") {
        window.matterMindPhysicsEngine = physicsEngine;
      }

      console.log("✅ Physics engine initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize physics engine:", error);
    }
  }

  function startInfoUpdates(): void {
    // Update FPS and object count every second
    const updateInfo = () => {
      if (physicsEngine) {
        physicsStore.setFPS(physicsEngine.getFPS());
        physicsStore.setObjectCount(physicsEngine.getObjectCount());
      }
    };

    const intervalId = setInterval(updateInfo, 1000);

    // Cleanup interval on destroy
    onDestroy(() => {
      clearInterval(intervalId);
    });
  }

  function cleanup(): void {
    if (physicsEngine) {
      physicsEngine.cleanup();
    }
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    // Clean up global reference
    if (typeof window !== "undefined") {
      delete window.matterMindPhysicsEngine;
    }
  }

  // Handle canvas resize
  function handleResize(): void {
    if (physicsEngine) {
      // The physics engine will handle its own resize
      // This is just for the component
    }
  }

  // Handle keyboard shortcuts
  function handleKeydown(event: KeyboardEvent): void {
    if (!physicsEngine) return;

    // Only handle shortcuts when not typing in input fields
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    switch (event.key.toLowerCase()) {
      case " ": // Spacebar - pause/play
        event.preventDefault();
        const isRunning = physicsEngine.togglePause();
        physicsStore.setRunning(isRunning);
        break;

      case "g": // G - toggle gravity
        event.preventDefault();
        const currentGravity = $physicsStore.gravity;
        physicsEngine.setGravity(!currentGravity);
        physicsStore.setGravity(!currentGravity);
        break;

      case "v": // V - toggle vectors
        event.preventDefault();
        const currentVectors = $physicsStore.showVectors;
        physicsEngine.setShowVectors(!currentVectors);
        physicsStore.setVectors(!currentVectors);
        break;

      case "r": // R - reset (with Ctrl/Cmd)
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          physicsEngine.reset();
          physicsStore.reset();
          objectsStore.clearObjects();
          selectedObjectStore.clear();
        }
        break;

      case "escape": // Escape - deselect object
        event.preventDefault();
        selectedObjectStore.clear();
        break;

      case "delete": // Delete - delete selected object
      case "backspace":
        event.preventDefault();
        const selectedObject = physicsEngine.getSelectedObject();
        if (selectedObject) {
          physicsEngine.deleteObject(selectedObject.id);
          objectsStore.removeObject(selectedObject.id);
          selectedObjectStore.clear();
        }
        break;
    }
  }
</script>

<svelte:window on:resize={handleResize} on:keydown={handleKeydown} />

<div class="canvas-container" style="width: {width}px; height: {height}px;">
  <canvas
    bind:this={canvas}
    id="physicsCanvas"
    {width}
    {height}
    class="physics-canvas"
  ></canvas>

  <div class="canvas-overlay">
    <div class="info-panel">
      <span>Objects: {$physicsStore.objectCount}</span>
      <span>FPS: {$physicsStore.fps}</span>
    </div>
  </div>
</div>

<style>
  .canvas-container {
    position: relative;
    background: #f5f5f5;
    overflow: hidden;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .physics-canvas {
    width: 100%;
    height: 100%;
    display: block;
    background:
      linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
      linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
      linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
    background-size: 20px 20px;
    background-position:
      0 0,
      0 10px,
      10px -10px,
      -10px 0px;
  }

  .canvas-overlay {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 10;
  }

  .info-panel {
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 10px 15px;
    border-radius: 6px;
    font-size: 12px;
    display: flex;
    gap: 20px;
    backdrop-filter: blur(10px);
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .canvas-container {
      width: 100% !important;
      height: 60vh !important;
    }
  }
</style>
