import Matter from "matter-js";
const { Engine, World, Body, Runner } = Matter;
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

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) {
      throw new Error(`Canvas with id '${canvasId}' not found`);
    }

    this.engine = Engine.create({
      gravity: { x: 0, y: 1, scale: 0.001 },
    });

    this.renderer = new Renderer(this.canvas, this.objects);
    this.eventHandler = new EventHandler(this.canvas, this.engine);
    this.eventHandler.setupEventListeners();
    this.eventHandler.setOnObjectSelected((body) => {
      this.selectObject(body);
    });
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
    World.clear(this.engine.world, false);
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
    if (this.runner && this.runner.enabled) {
      Runner.stop(this.runner);
    } else if (this.runner) {
      Runner.run(this.runner, this.engine);
    }
    return this.runner ? this.runner.enabled : false;
  }

  public reset(): void {
    this.clearAllObjects();
    if (this.runner) {
      Runner.stop(this.runner);
      Runner.run(this.runner, this.engine);
    }
  }

  public setShowVectors(show: boolean): void {
    this.renderer.setShowVectors(show);
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

    const renderLoop = () => {
      this.renderer.render(this.engine);
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
      minX: 0,
      minY: 0,
      maxX: this.canvas.width,
      maxY: this.canvas.height,
    };
  }

  public cleanup(): void {
    if (this.runner) {
      Runner.stop(this.runner);
    }
    World.clear(this.engine.world, false);
    this.objects.clear();
  }
}
