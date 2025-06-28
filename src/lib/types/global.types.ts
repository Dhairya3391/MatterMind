import type { PhysicsEngine } from "$lib/physics/physics-engine";

declare global {
  interface Window {
    matterMindPhysicsEngine?: PhysicsEngine;
  }
}

export {};
