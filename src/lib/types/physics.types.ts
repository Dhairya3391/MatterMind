import type { Body } from "matter-js";

// Physics object types
export interface PhysicsObject {
  id: number;
  name: string;
  color: string;
  config: ObjectConfig;
  selected: boolean;
  tags?: string[];
  material?: string;
}

export interface ObjectConfig {
  shape:
    | "rectangle"
    | "circle"
    | "polygon"
    | "triangle"
    | "pentagon"
    | "star"
    | "rope";
  width?: number;
  height?: number;
  radius?: number;
  x: number;
  y: number;
  mass: number;
  density?: number; // kg/m²
  friction: number;
  restitution: number;
  airResistance: number;
  rotation: number;
  angularVelocity: number;
  isStatic: boolean;
  isHollow?: boolean;
  // Initial velocity
  initialVelocityX: number;
  initialVelocityY: number;
  // Material properties
  material?: string;
  tags?: string[];
  // Visual properties
  name?: string;
  color?: string;
}

export interface PhysicsState {
  isRunning: boolean;
  gravity: boolean;
  showVectors: boolean;
  showGrid: boolean;
  showBounds: boolean;
  fps: number;
  objectCount: number;
}

// Scene management types
export interface SceneData {
  id: string;
  name: string;
  description: string;
  objects: ObjectConfig[];
  settings: {
    gravity: boolean;
    showVectors: boolean;
  };
  metadata: {
    createdAt: string;
    version: string;
    isPreset?: boolean;
  };
}

// UI component props
export interface PhysicsCanvasProps {
  width?: number;
  height?: number;
  showVectors?: boolean;
  onObjectSelected?: (object: PhysicsObject | null) => void;
}

export interface ObjectFormProps {
  object?: PhysicsObject;
  onSave?: (config: ObjectConfig) => void;
  onCancel?: () => void;
}

export interface SidebarProps {
  onObjectCreate?: (config: ObjectConfig) => void;
  onObjectUpdate?: (id: number, config: ObjectConfig) => void;
  onObjectDelete?: (id: number) => void;
  onSceneSave?: () => void;
  onSceneLoad?: (scene: SceneData) => void;
  onSceneClear?: () => void;
}

// Event types
export interface ObjectSelectedEvent {
  object: PhysicsObject | null;
}

export interface SceneLoadedEvent {
  scene: SceneData;
}

// Store types
export interface AppState {
  physics: PhysicsState;
  objects: PhysicsObject[];
  selectedObject: PhysicsObject | null;
  scene: SceneData | null;
}

// Material presets
export interface MaterialPreset {
  name: string;
  density: number;
  friction: number;
  restitution: number;
  color: string;
  tags: string[];
}

export const MATERIAL_PRESETS: Record<string, MaterialPreset> = {
  wood: {
    name: "Wood",
    density: 0.6,
    friction: 0.4,
    restitution: 0.2,
    color: "#8B4513",
    tags: ["wood", "natural"],
  },
  steel: {
    name: "Steel",
    density: 7.85,
    friction: 0.2,
    restitution: 0.8,
    color: "#A9A9A9",
    tags: ["metal", "strong"],
  },
  rubber: {
    name: "Rubber",
    density: 1.2,
    friction: 0.8,
    restitution: 0.9,
    color: "#333333",
    tags: ["rubber", "bouncy"],
  },
  ice: {
    name: "Ice",
    density: 0.92,
    friction: 0.02,
    restitution: 0.3,
    color: "#F0FFFF",
    tags: ["ice", "slippery"],
  },
  concrete: {
    name: "Concrete",
    density: 2.4,
    friction: 0.7,
    restitution: 0.1,
    color: "#808080",
    tags: ["concrete", "hard"],
  },
};
