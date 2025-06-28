import Matter from "matter-js";
const { Engine, World, Body, Runner, Bodies, MouseConstraint, Mouse } = Matter;
import type { ObjectConfig, PhysicsObject } from "$lib/types/physics.types";
import { createObject } from "./object-factory";
import { Renderer } from "./renderer";
import { EventHandler } from "./event-handler";

export class PhysicsEngine {
  private engine!: Matter.Engine;
  private runner: Matter.Runner | null = null;
  private canvas: HTMLCanvasElement;
  private renderer: Renderer;
  private eventHandler: EventHandler;
  private objects: Map<number, PhysicsObject> = new Map();
  private selectedObject: Matter.Body | null = null;
  private fps: number = 60;
  private lastTime: number = 0;
  private mouseConstraint: Matter.MouseConstraint | null = null;
  private boundaries: Matter.Body[] = [];
  private showBounds: boolean = true;
  private showGrid: boolean = false;
  private isRunning: boolean = false;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) {
      throw new Error(`Canvas with id '${canvasId}' not found`);
    }

    this.engine = Engine.create({
      gravity: { x: 0, y: 1, scale: 0.001 },
      // Enhanced collision detection
      constraintIterations: 4,
      positionIterations: 6,
      velocityIterations: 4,
    });

    this.renderer = new Renderer(this.canvas, this.objects);
    this.eventHandler = new EventHandler(this.canvas, this.engine);
    this.eventHandler.setupEventListeners();
    this.eventHandler.setOnObjectSelected((body) => {
      this.selectObject(body);
    });

    // Setup mouse constraint for better object interaction
    this.setupMouseConstraint();

    // Create boundaries
    this.createBoundaries();
  }

  private setupMouseConstraint(): void {
    const mouse = Mouse.create(this.canvas);
    this.mouseConstraint = MouseConstraint.create(this.engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false,
        },
      },
    });

    World.add(this.engine.world, this.mouseConstraint);

    // Keep mouse in sync with canvas
    this.canvas.addEventListener("mousemove", (event) => {
      const rect = this.canvas.getBoundingClientRect();
      mouse.position.x = event.clientX - rect.left;
      mouse.position.y = event.clientY - rect.top;
    });
  }

  private createBoundaries(): void {
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    const wallThickness = 20;

    // Left wall
    const leftWall = Bodies.rectangle(
      wallThickness / 2,
      canvasHeight / 2,
      wallThickness,
      canvasHeight,
      { isStatic: true, friction: 0.3, restitution: 0.5 },
    );

    // Right wall
    const rightWall = Bodies.rectangle(
      canvasWidth - wallThickness / 2,
      canvasHeight / 2,
      wallThickness,
      canvasHeight,
      { isStatic: true, friction: 0.3, restitution: 0.5 },
    );

    // Bottom wall (ground)
    const ground = Bodies.rectangle(
      canvasWidth / 2,
      canvasHeight - wallThickness / 2,
      canvasWidth,
      wallThickness,
      { isStatic: true, friction: 0.3, restitution: 0.5 },
    );

    // Top wall (ceiling)
    const ceiling = Bodies.rectangle(
      canvasWidth / 2,
      wallThickness / 2,
      canvasWidth,
      wallThickness,
      { isStatic: true, friction: 0.3, restitution: 0.5 },
    );

    this.boundaries = [leftWall, rightWall, ground, ceiling];
    World.add(this.engine.world, this.boundaries);
  }

  private selectObject(body: Matter.Body | null): void {
    if (this.selectedObject) {
      const prevObj = this.objects.get(this.selectedObject.id);
      if (prevObj) {
        prevObj.selected = false;
      }
    }

    this.selectedObject = body;
    if (body) {
      const obj = this.objects.get(body.id);
      if (obj) {
        obj.selected = true;
      }
    }
  }

  public createObject(config: ObjectConfig): Matter.Body | null {
    const bounds = this.getCanvasBounds();
    const x = Math.max(bounds.minX + 50, Math.min(bounds.maxX - 50, config.x));
    const y = Math.max(bounds.minY + 50, Math.min(bounds.maxY - 50, config.y));

    const body = createObject({ ...config, x, y });

    if (body) {
      const objectData: PhysicsObject = {
        id: body.id,
        name: config.name || `Object ${body.id}`,
        color: config.color || "#4CAF50",
        selected: false,
        config,
        material: config.material,
        tags: config.tags,
      };

      this.objects.set(body.id, objectData);
      World.add(this.engine.world, body);

      return body;
    }

    return null;
  }

  public updateObject(bodyId: number, config: ObjectConfig): boolean {
    const body = this.engine.world.bodies.find((b) => b.id === bodyId);
    if (!body) return false;

    const obj = this.objects.get(bodyId);
    if (!obj) return false;

    // Update physics properties
    if (config.mass !== undefined || config.density !== undefined) {
      const area = this.calculateBodyArea(body);
      const newDensity =
        config.density || (config.mass || obj.config.mass) / area;
      body.density = newDensity;
    }

    if (config.friction !== undefined) {
      body.friction = config.friction;
    }

    if (config.restitution !== undefined) {
      body.restitution = config.restitution;
    }

    if (config.isStatic !== undefined) {
      body.isStatic = config.isStatic;
    }

    if (config.rotation !== undefined) {
      Body.setAngle(body, (config.rotation * Math.PI) / 180);
    }

    if (config.angularVelocity !== undefined) {
      Body.setAngularVelocity(body, config.angularVelocity);
    }

    if (
      config.initialVelocityX !== undefined ||
      config.initialVelocityY !== undefined
    ) {
      const currentVelocity = body.velocity;
      Body.setVelocity(body, {
        x:
          config.initialVelocityX !== undefined
            ? config.initialVelocityX
            : currentVelocity.x,
        y:
          config.initialVelocityY !== undefined
            ? config.initialVelocityY
            : currentVelocity.y,
      });
    }

    // Update custom properties
    if (config.airResistance !== undefined) {
      (body as any).airResistance = config.airResistance;
    }

    if (config.isHollow !== undefined) {
      (body as any).isHollow = config.isHollow;
    }

    if (config.material !== undefined) {
      (body as any).material = config.material;
    }

    if (config.tags !== undefined) {
      (body as any).tags = config.tags;
    }

    // Update metadata
    if (config.name !== undefined) {
      obj.name = config.name;
    }

    if (config.color !== undefined) {
      obj.color = config.color;
    }

    // Update the stored config
    obj.config = { ...obj.config, ...config };
    obj.material = config.material;
    obj.tags = config.tags;

    return true;
  }

  private calculateBodyArea(body: Matter.Body): number {
    const extendedBody = body as any;
    if (extendedBody.circleRadius) {
      return Math.PI * extendedBody.circleRadius * extendedBody.circleRadius;
    } else {
      // Approximate area for polygons
      const vertices = body.vertices;
      let area = 0;
      for (let i = 0; i < vertices.length; i++) {
        const j = (i + 1) % vertices.length;
        area += vertices[i].x * vertices[j].y;
        area -= vertices[j].x * vertices[i].y;
      }
      return Math.abs(area) / 2;
    }
  }

  public deleteObject(bodyId: number): boolean {
    const body = this.engine.world.bodies.find((b) => b.id === bodyId);
    if (body) {
      World.remove(this.engine.world, body);
      this.objects.delete(bodyId);

      if (this.selectedObject && this.selectedObject.id === bodyId) {
        this.selectedObject = null;
      }

      return true;
    }
    return false;
  }

  public clearAllObjects(): void {
    // Remove all objects except boundaries
    const bodiesToRemove = this.engine.world.bodies.filter(
      (body) =>
        !this.boundaries.includes(body) && body !== this.mouseConstraint?.body,
    );

    bodiesToRemove.forEach((body) => {
      World.remove(this.engine.world, body);
    });

    this.objects.clear();
    this.selectedObject = null;
  }

  public setGravity(enabled: boolean): void {
    if (enabled) {
      this.engine.world.gravity.y = 1;
      this.engine.world.gravity.scale = 0.001;
    } else {
      this.engine.world.gravity.y = 0;
      this.engine.world.gravity.scale = 0;
    }
  }

  public togglePause(): boolean {
    if (this.runner) {
      if (this.isRunning) {
        Runner.stop(this.runner);
        this.isRunning = false;
      } else {
        Runner.run(this.runner, this.engine);
        this.isRunning = true;
      }
    }
    return this.isRunning;
  }

  public setRunning(running: boolean): void {
    if (this.runner) {
      if (running && !this.isRunning) {
        Runner.run(this.runner, this.engine);
        this.isRunning = true;
      } else if (!running && this.isRunning) {
        Runner.stop(this.runner);
        this.isRunning = false;
      }
    }
  }

  public reset(): void {
    this.clearAllObjects();
    if (this.runner) {
      Runner.stop(this.runner);
      this.isRunning = false;
      Runner.run(this.runner, this.engine);
      this.isRunning = true;
    }
  }

  public setShowVectors(show: boolean): void {
    this.renderer.setShowVectors(show);
  }

  public setShowBounds(show: boolean): void {
    this.showBounds = show;
  }

  public toggleBounds(): void {
    this.showBounds = !this.showBounds;
    if (this.showBounds) {
      // Add boundaries back if they were removed
      if (this.boundaries.length > 0) {
        World.add(this.engine.world, this.boundaries);
      }
    } else {
      // Remove boundaries
      World.remove(this.engine.world, this.boundaries);
    }
  }

  public setShowGrid(show: boolean): void {
    this.showGrid = show;
  }

  private updateFPS(): void {
    const currentTime = performance.now();
    if (this.lastTime > 0) {
      this.fps = Math.round(1000 / (currentTime - this.lastTime));
    }
    this.lastTime = currentTime;
  }

  public start(): void {
    this.runner = Runner.create();
    Runner.run(this.runner, this.engine);
    this.isRunning = true;

    const renderLoop = () => {
      this.renderer.render(this.engine, {
        showBounds: this.showBounds,
        showGrid: this.showGrid,
        boundaries: this.boundaries,
      });
      this.updateFPS();
      requestAnimationFrame(renderLoop);
    };
    renderLoop();
  }

  public getObjectCount(): number {
    return this.objects.size;
  }

  public getFPS(): number {
    return this.fps;
  }

  public getAllObjects(): PhysicsObject[] {
    return Array.from(this.objects.values());
  }

  public getSelectedObject(): Matter.Body | null {
    return this.selectedObject;
  }

  public setOnObjectSelected(
    callback: (body: Matter.Body | null) => void,
  ): void {
    this.eventHandler.setOnObjectSelected(callback);
  }

  public setPreviewObject(config: ObjectConfig | null): void {
    this.renderer.setPreviewObject(config);
  }

  public getCanvasBounds(): {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  } {
    return {
      minX: 20, // Account for left wall
      minY: 20, // Account for top wall
      maxX: this.canvas.width - 20, // Account for right wall
      maxY: this.canvas.height - 20, // Account for bottom wall
    };
  }

  public cleanup(): void {
    if (this.runner) {
      Runner.stop(this.runner);
      this.isRunning = false;
    }
    this.clearAllObjects();
    if (this.mouseConstraint) {
      World.remove(this.engine.world, this.mouseConstraint);
    }
  }
}
