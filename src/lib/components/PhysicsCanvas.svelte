<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { PhysicsEngine } from "$lib/physics/physics-engine";
  import {
    physicsStore,
    objectsStore,
    selectedObjectStore,
  } from "$lib/stores/physics.store";
  import type { PhysicsObject } from "$lib/types/physics.types";
  import type { Body } from "matter-js";
  import "$lib/types/global.types";

  // Props
  export let width: number = 800;
  export let height: number = 600;
  export let showVectors: boolean = false;
  export let onObjectSelected: (object: PhysicsObject | null) => void;

  // Component state
  let canvas: HTMLCanvasElement;
  let physicsEngine: PhysicsEngine;

  // Reactive statements
  $: if (physicsEngine && showVectors !== undefined) {
    physicsEngine.setShowVectors(showVectors);
  }

  // Lifecycle
  onMount(() => {
    physicsEngine = new PhysicsEngine("physicsCanvas");

    physicsEngine.setOnObjectSelected((body: Body | null) => {
      if (onObjectSelected) {
        const physicsObject = body
          ? $objectsStore.find((obj) => obj.id === body.id)
          : null;
        onObjectSelected(physicsObject || null);
      }
    });

    physicsEngine.start();
    physicsStore.setRunning(true);
    physicsStore.setVectors(showVectors);

    window.matterMindPhysicsEngine = physicsEngine;

    const intervalId = setInterval(() => {
      if (physicsEngine) {
        physicsStore.setFPS(physicsEngine.getFPS());
        physicsStore.setObjectCount(physicsEngine.getObjectCount());
      }
    }, 1000);

    onDestroy(() => {
      clearInterval(intervalId);
      physicsEngine.cleanup();
      delete window.matterMindPhysicsEngine;
    });
  });

  // Handle keyboard shortcuts
  function handleKeydown(event: KeyboardEvent): void {
    if (!physicsEngine) return;

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

<svelte:window on:keydown={handleKeydown} />

<div class="w-full h-full bg-base-200 rounded-2xl overflow-hidden">
  <canvas bind:this={canvas} id="physicsCanvas" {width} {height}></canvas>
</div>
