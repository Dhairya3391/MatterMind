import type { Body } from 'matter-js';

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
  shape: 'rectangle' | 'circle' | 'polygon';
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
}

export interface PhysicsState {
  isRunning: boolean;
  gravity: boolean;
  showVectors: boolean;
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

// Matter.js type extensions
export interface MatterBody extends Body {
  airResistance?: number;
  isHollow?: boolean;
  material?: string;
  tags?: string[];
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
    name: 'Wood',
    density: 600,
    friction: 0.3,
    restitution: 0.2,
    color: '#8B4513',
    tags: ['wood', 'natural']
  },
  metal: {
    name: 'Metal',
    density: 7800,
    friction: 0.1,
    restitution: 0.8,
    color: '#C0C0C0',
    tags: ['metal', 'conductive']
  },
  rubber: {
    name: 'Rubber',
    density: 1200,
    friction: 0.8,
    restitution: 0.9,
    color: '#000000',
    tags: ['rubber', 'elastic']
  },
  plastic: {
    name: 'Plastic',
    density: 900,
    friction: 0.2,
    restitution: 0.5,
    color: '#FF6B6B',
    tags: ['plastic', 'synthetic']
  },
  stone: {
    name: 'Stone',
    density: 2700,
    friction: 0.6,
    restitution: 0.1,
    color: '#696969',
    tags: ['stone', 'natural']
  }
}; 