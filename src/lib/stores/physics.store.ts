import { writable, derived } from "svelte/store";
import type {
  PhysicsState,
  PhysicsObject,
  ObjectConfig,
  SceneData,
} from "$lib/types/physics.types";

// Create the main physics state store
function createPhysicsStore() {
  const initialState: PhysicsState = {
    isRunning: false,
    gravity: true,
    showVectors: false,
    fps: 60,
    objectCount: 0,
  };

  const { subscribe, set, update } = writable<PhysicsState>(initialState);

  return {
    subscribe,
    set,
    update,

    // Actions
    toggleRunning: () =>
      update((state) => ({ ...state, isRunning: !state.isRunning })),
    setRunning: (isRunning: boolean) =>
      update((state) => ({ ...state, isRunning })),
    toggleGravity: () =>
      update((state) => ({ ...state, gravity: !state.gravity })),
    setGravity: (gravity: boolean) =>
      update((state) => ({ ...state, gravity })),
    toggleVectors: () =>
      update((state) => ({ ...state, showVectors: !state.showVectors })),
    setVectors: (showVectors: boolean) =>
      update((state) => ({ ...state, showVectors })),
    setFPS: (fps: number) => update((state) => ({ ...state, fps })),
    setObjectCount: (objectCount: number) =>
      update((state) => ({ ...state, objectCount })),
    reset: () => set(initialState),
  };
}

// Create the objects store
function createObjectsStore() {
  const { subscribe, set, update } = writable<PhysicsObject[]>([]);

  return {
    subscribe,
    set,
    update,

    // Actions
    addObject: (object: PhysicsObject) =>
      update((objects) => [...objects, object]),
    updateObject: (id: number, updates: Partial<PhysicsObject>) =>
      update((objects) =>
        objects.map((obj) => (obj.id === id ? { ...obj, ...updates } : obj)),
      ),
    removeObject: (id: number) =>
      update((objects) => objects.filter((obj) => obj.id !== id)),
    selectObject: (id: number | null) =>
      update((objects) =>
        objects.map((obj) => ({ ...obj, selected: obj.id === id })),
      ),
    clearObjects: () => set([]),
    getObject: (id: number) => {
      let result: PhysicsObject | undefined;
      subscribe((objects) => {
        result = objects.find((obj) => obj.id === id);
      })();
      return result;
    },
  };
}

// Create the selected object store
function createSelectedObjectStore() {
  const { subscribe, set } = writable<PhysicsObject | null>(null);

  return {
    subscribe,
    set,
    clear: () => set(null),
  };
}

// Create the scene store
function createSceneStore() {
  const { subscribe, set, update } = writable<SceneData | null>(null);

  return {
    subscribe,
    set,
    update,

    // Actions
    loadScene: (scene: SceneData) => set(scene),
    updateScene: (updates: Partial<SceneData>) =>
      update((scene) => (scene ? { ...scene, ...updates } : null)),
    clearScene: () => set(null),
  };
}

// Create store instances
export const physicsStore = createPhysicsStore();
export const objectsStore = createObjectsStore();
export const selectedObjectStore = createSelectedObjectStore();
export const sceneStore = createSceneStore();

// Derived stores
export const isRunning = derived(
  physicsStore,
  ($physics) => $physics.isRunning,
);
export const gravity = derived(physicsStore, ($physics) => $physics.gravity);
export const showVectors = derived(
  physicsStore,
  ($physics) => $physics.showVectors,
);
export const fps = derived(physicsStore, ($physics) => $physics.fps);
export const objectCount = derived(
  physicsStore,
  ($physics) => $physics.objectCount,
);

export const staticObjects = derived(objectsStore, ($objects) =>
  $objects.filter((obj) => obj.config.isStatic),
);

export const dynamicObjects = derived(objectsStore, ($objects) =>
  $objects.filter((obj) => !obj.config.isStatic),
);

export const selectedObject = derived(
  selectedObjectStore,
  ($selected) => $selected,
);

// Combined app state store
export const appState = derived(
  [physicsStore, objectsStore, selectedObjectStore, sceneStore],
  ([$physics, $objects, $selected, $scene]) => ({
    physics: $physics,
    objects: $objects,
    selectedObject: $selected,
    scene: $scene,
  }),
);
