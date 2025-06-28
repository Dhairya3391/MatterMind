# Physics Engine Rules for MatterMind

## 🧠 Matter.js Integration

### Import Strategy

```typescript
// ✅ Good: Import specific modules
import {
  Engine,
  Render,
  World,
  Bodies,
  Body,
  Vector,
  Events,
  Runner,
} from "matter-js";

// ❌ Bad: Import entire library
import * as Matter from "matter-js";
```

### Type Definitions

```typescript
// physics.types.ts
export interface PhysicsObject {
  id: number;
  name: string;
  color: string;
  config: ObjectConfig;
  selected: boolean;
}

export interface ObjectConfig {
  shape: "rectangle" | "circle" | "polygon";
  width?: number;
  height?: number;
  radius?: number;
  x: number;
  y: number;
  mass: number;
  friction: number;
  restitution: number;
  airResistance: number;
  rotation: number;
  angularVelocity: number;
  isStatic: boolean;
}

export interface PhysicsState {
  isRunning: boolean;
  gravity: boolean;
  showVectors: boolean;
  fps: number;
  objectCount: number;
}
```

## 🏗️ Physics Engine Architecture

### Core Engine Class

```typescript
// physics-engine.ts
export class PhysicsEngine {
  private engine: Matter.Engine;
  private renderer: Matter.Render;
  private runner: Matter.Runner;
  private objects: Map<number, PhysicsObject>;
  private selectedObject: Matter.Body | null;
  private showVectors: boolean;
  private fps: number;
  private lastTime: number;

  constructor(canvasId: string) {
    this.engine = Engine.create({
      gravity: { x: 0, y: 1, scale: 0.001 },
    });

    this.objects = new Map();
    this.selectedObject = null;
    this.showVectors = false;
    this.fps = 60;
    this.lastTime = 0;

    this.initializeRenderer(canvasId);
    this.setupEventListeners();
  }

  // Public methods...
}
```

### Object Creation

```typescript
createObject(config: ObjectConfig): Matter.Body | null {
  let body: Matter.Body;

  switch (config.shape) {
    case 'rectangle':
      body = Bodies.rectangle(config.x, config.y, config.width!, config.height!, {
        isStatic: config.isStatic,
        friction: config.friction,
        restitution: config.restitution,
        density: config.mass / (config.width! * config.height!),
        angle: (config.rotation * Math.PI) / 180
      });
      break;

    case 'circle':
      body = Bodies.circle(config.x, config.y, config.radius!, {
        isStatic: config.isStatic,
        friction: config.friction,
        restitution: config.restitution,
        density: config.mass / (Math.PI * config.radius! * config.radius!),
        angle: (config.rotation * Math.PI) / 180
      });
      break;

    case 'polygon':
      const vertices = this.createPolygonVertices(config);
      body = Bodies.fromVertices(config.x, config.y, [vertices], {
        isStatic: config.isStatic,
        friction: config.friction,
        restitution: config.restitution,
        density: config.mass / (Math.PI * config.radius! * config.radius!)
      });
      break;

    default:
      return null;
  }

  // Set angular velocity
  if (config.angularVelocity !== 0) {
    Body.setAngularVelocity(body, config.angularVelocity);
  }

  // Add air resistance
  if (config.airResistance > 0) {
    (body as any).airResistance = config.airResistance;
  }

  return body;
}
```

## 🎨 Rendering and Visualization

### Custom Rendering

```typescript
private customRender(): void {
  // Clear canvas
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  // Render all bodies with custom colors
  const bodies = this.engine.world.bodies;
  for (const body of bodies) {
    this.renderBody(body);
  }

  // Render vectors if enabled
  if (this.showVectors) {
    this.renderVectors();
  }

  // Update FPS
  this.updateFPS();
}

private renderBody(body: Matter.Body): void {
  const obj = this.objects.get(body.id);
  if (!obj) return;

  this.ctx.save();

  // Set color and stroke
  this.ctx.fillStyle = obj.color;
  this.ctx.strokeStyle = obj.selected ? '#FF5722' : '#333';
  this.ctx.lineWidth = obj.selected ? 3 : 1;

  // Transform to body position and rotation
  this.ctx.translate(body.position.x, body.position.y);
  this.ctx.rotate(body.angle);

  // Draw based on body type
  if ((body as any).circleRadius) {
    this.renderCircle(body as Matter.Body & { circleRadius: number });
  } else {
    this.renderPolygon(body);
  }

  // Draw label
  this.renderLabel(obj.name);

  this.ctx.restore();
}
```

### Vector Visualization

```typescript
private renderVectors(): void {
  const bodies = this.engine.world.bodies;

  for (const body of bodies) {
    if (body.isStatic) continue;

    const velocity = body.velocity;
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);

    if (speed > 0.1) {
      this.renderVelocityVector(body, velocity, speed);
    }
  }
}

private renderVelocityVector(body: Matter.Body, velocity: Matter.Vector, speed: number): void {
  this.ctx.save();
  this.ctx.strokeStyle = '#FF0000';
  this.ctx.lineWidth = 2;

  // Draw velocity line
  this.ctx.beginPath();
  this.ctx.moveTo(body.position.x, body.position.y);
  this.ctx.lineTo(
    body.position.x + velocity.x * 10,
    body.position.y + velocity.y * 10
  );
  this.ctx.stroke();

  // Draw arrow head
  this.drawArrowHead(body.position.x + velocity.x * 10, body.position.y + velocity.y * 10, velocity);

  // Draw speed label
  this.ctx.fillStyle = '#FF0000';
  this.ctx.font = '10px Arial';
  this.ctx.fillText(
    `${speed.toFixed(1)} m/s`,
    body.position.x + velocity.x * 10 + 5,
    body.position.y + velocity.y * 10 - 5
  );

  this.ctx.restore();
}
```

## 🎮 User Interaction

### Object Selection

```typescript
private handleCanvasClick(event: MouseEvent): void {
  const rect = this.canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const clickedBody = this.findBodyAtPosition(x, y);
  this.selectObject(clickedBody);
}

private findBodyAtPosition(x: number, y: number): Matter.Body | null {
  const bodies = this.engine.world.bodies;

  for (const body of bodies) {
    const vertices = body.vertices;
    if (this.isPointInPolygon(x, y, vertices)) {
      return body;
    }
  }

  return null;
}

private isPointInPolygon(x: number, y: number, vertices: Matter.Vector[]): boolean {
  let inside = false;

  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].x, yi = vertices[i].y;
    const xj = vertices[j].x, yj = vertices[j].y;

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }

  return inside;
}
```

### Object Dragging

```typescript
private handleMouseDown(event: MouseEvent): void {
  const rect = this.canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const body = this.findBodyAtPosition(x, y);
  if (body && !body.isStatic) {
    this.draggedBody = body;
  }
}

private handleMouseMove(event: MouseEvent): void {
  if (this.draggedBody) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    Body.setPosition(this.draggedBody, { x, y });
  }
}

private handleMouseUp(): void {
  this.draggedBody = null;
}
```

## 📊 Performance Optimization

### FPS Monitoring

```typescript
private updateFPS(): void {
  const currentTime = performance.now();
  if (this.lastTime > 0) {
    this.fps = Math.round(1000 / (currentTime - this.lastTime));
  }
  this.lastTime = currentTime;
}

getFPS(): number {
  return this.fps;
}
```

### Memory Management

```typescript
private cleanup(): void {
  // Stop the runner
  if (this.runner) {
    Runner.stop(this.runner);
  }

  // Clear all objects
  World.clear(this.engine.world, false);
  this.objects.clear();

  // Remove event listeners
  this.removeEventListeners();
}

private removeEventListeners(): void {
  // Remove canvas event listeners
  this.canvas.removeEventListener('click', this.handleCanvasClick);
  this.canvas.removeEventListener('mousedown', this.handleMouseDown);
  this.canvas.removeEventListener('mousemove', this.handleMouseMove);
  this.canvas.removeEventListener('mouseup', this.handleMouseUp);
}
```

## 🔧 Physics Configuration

### Gravity Control

```typescript
setGravity(enabled: boolean): void {
  if (enabled) {
    this.engine.world.gravity.y = 1;
    this.engine.world.gravity.scale = 0.001;
  } else {
    this.engine.world.gravity.y = 0;
    this.engine.world.gravity.scale = 0;
  }
}
```

### Simulation Control

```typescript
togglePause(): boolean {
  if (this.runner && this.runner.enabled) {
    Runner.stop(this.runner);
  } else {
    Runner.run(this.runner);
  }
  return this.runner ? this.runner.enabled : false;
}

reset(): void {
  this.clearAllObjects();
  if (this.runner) {
    Runner.stop(this.runner);
  }
  Runner.run(this.runner);
}
```

## 🧪 Testing Physics

### Physics Tests

```typescript
// physics-engine.test.ts
describe("PhysicsEngine", () => {
  let engine: PhysicsEngine;

  beforeEach(() => {
    engine = new PhysicsEngine("test-canvas");
  });

  afterEach(() => {
    engine.cleanup();
  });

  it("creates rectangle objects correctly", () => {
    const config: ObjectConfig = {
      shape: "rectangle",
      width: 50,
      height: 50,
      x: 100,
      y: 100,
      mass: 1,
      friction: 0.1,
      restitution: 0.5,
      airResistance: 0,
      rotation: 0,
      angularVelocity: 0,
      isStatic: false,
    };

    const body = engine.createObject(config);
    expect(body).toBeTruthy();
    expect(body!.position.x).toBe(100);
    expect(body!.position.y).toBe(100);
  });

  it("handles gravity toggle correctly", () => {
    engine.setGravity(false);
    expect(engine.engine.world.gravity.y).toBe(0);

    engine.setGravity(true);
    expect(engine.engine.world.gravity.y).toBe(1);
  });
});
```

## 🚫 Anti-Patterns

### What to Avoid

```typescript
// ❌ Don't create new Matter.js objects in render loop
private render(): void {
  const body = Bodies.rectangle(0, 0, 10, 10); // Creates new object every frame
}

// ❌ Don't access Matter.js internals directly
private badAccess(): void {
  this.engine.world.bodies.forEach(body => {
    body.position.x = 0; // Direct mutation
  });
}

// ❌ Don't use global Matter namespace
import * as Matter from 'matter-js';
Matter.Engine.create(); // Use specific imports instead
```

### What to Do Instead

```typescript
// ✅ Use proper object creation
private createObjects(): void {
  const body = Bodies.rectangle(0, 0, 10, 10);
  World.add(this.engine.world, body);
}

// ✅ Use Matter.js API methods
private goodAccess(): void {
  this.engine.world.bodies.forEach(body => {
    Body.setPosition(body, { x: 0, y: 0 }); // Use API method
  });
}

// ✅ Use specific imports
import { Engine, Bodies, World, Body } from 'matter-js';
Engine.create();
```

## 📋 Physics Engine Checklist

### Before Implementation

- [ ] Define clear physics object interfaces
- [ ] Plan rendering strategy
- [ ] Design user interaction model
- [ ] Plan performance optimization

### During Development

- [ ] Use TypeScript for type safety
- [ ] Implement proper error handling
- [ ] Add performance monitoring
- [ ] Test physics calculations
- [ ] Optimize rendering loops

### Before Submission

- [ ] Remove debug code
- [ ] Check for memory leaks
- [ ] Verify physics accuracy
- [ ] Test performance under load
- [ ] Update documentation
