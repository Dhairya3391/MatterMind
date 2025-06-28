import Matter from "matter-js";
const { Engine, World, Bodies, Body, Vector, Events, Runner } = Matter;
import type {
  ObjectConfig,
  PhysicsObject,
  MatterBody,
  MaterialPreset,
  MATERIAL_PRESETS,
} from "$lib/types/physics.types";

export class PhysicsEngine {
  private engine!: Matter.Engine;
  private runner: Matter.Runner | null = null;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private objects: Map<number, PhysicsObject> = new Map();
  private selectedObject: Matter.Body | null = null;
  private showVectors: boolean = false;
  private fps: number = 60;
  private lastTime: number = 0;
  private draggedBody: Matter.Body | null = null;
  private onObjectSelected?: (body: Matter.Body | null) => void;
  private previewObject: ObjectConfig | null = null;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d")!;

    if (!this.canvas) {
      console.error(`Canvas with id '${canvasId}' not found`);
      throw new Error(`Canvas with id '${canvasId}' not found`);
    }

    if (!this.ctx) {
      console.error("Could not get 2D context from canvas");
      throw new Error("Could not get 2D context from canvas");
    }

    // Initialize physics world
    this.engine = Engine.create({
      gravity: { x: 0, y: 1, scale: 0.001 },
    });

    this.setupEventListeners();
    this.resizeCanvas();
  }

  private setupEventListeners(): void {
    // Handle window resize
    window.addEventListener("resize", () => this.resizeCanvas());

    // Handle canvas click for object selection
    this.canvas.addEventListener("click", (e) => this.handleCanvasClick(e));

    // Handle mouse events for object dragging
    this.canvas.addEventListener("mousedown", (e) => this.handleMouseDown(e));
    this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    this.canvas.addEventListener("mouseup", () => this.handleMouseUp());
  }

  private resizeCanvas(): void {
    const container = this.canvas.parentElement;
    if (!container) return;

    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;
  }

  private handleCanvasClick(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedBody = this.findBodyAtPosition(x, y);
    this.selectObject(clickedBody);
  }

  private handleMouseDown(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const body = this.findBodyAtPosition(x, y);
    if (body && !body.isStatic) {
      this.draggedBody = body;
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    if (this.draggedBody) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      Body.setPosition(this.draggedBody, { x, y });
    }
  }

  private handleMouseUp(): void {
    this.draggedBody = null;
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

  private isPointInPolygon(
    x: number,
    y: number,
    vertices: Matter.Vector[],
  ): boolean {
    let inside = false;

    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const xi = vertices[i].x,
        yi = vertices[i].y;
      const xj = vertices[j].x,
        yj = vertices[j].y;

      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }

    return inside;
  }

  private selectObject(body: Matter.Body | null): void {
    // Deselect previous object
    if (this.selectedObject) {
      const prevObj = this.objects.get(this.selectedObject.id);
      if (prevObj) {
        prevObj.selected = false;
      }
    }

    // Select new object
    this.selectedObject = body;
    if (body) {
      const obj = this.objects.get(body.id);
      if (obj) {
        obj.selected = true;
      }
    }

    // Trigger selection event
    if (this.onObjectSelected) {
      this.onObjectSelected(body);
    }
  }

  public createObject(config: ObjectConfig): Matter.Body | null {
    // Ensure object is created within canvas bounds
    const bounds = this.getCanvasBounds();
    const x = Math.max(bounds.minX + 50, Math.min(bounds.maxX - 50, config.x));
    const y = Math.max(bounds.minY + 50, Math.min(bounds.maxY - 50, config.y));

    console.log("Creating object:", {
      originalPosition: { x: config.x, y: config.y },
      adjustedPosition: { x, y },
      canvasBounds: bounds,
      shape: config.shape,
    });

    let body: Matter.Body;
    const {
      shape,
      width,
      height,
      radius,
      mass,
      density,
      friction,
      restitution,
      isStatic,
      rotation,
      angularVelocity,
      airResistance,
      color,
      name,
      initialVelocityX,
      initialVelocityY,
      isHollow,
      material,
      tags,
    } = config;

    // Calculate density if not provided
    let calculatedDensity = density;
    if (!calculatedDensity) {
      const area = this.calculateArea(shape, width, height, radius);
      calculatedDensity = mass / area;
    }

    switch (shape) {
      case "rectangle":
        body = Bodies.rectangle(x, y, width!, height!, {
          isStatic,
          friction,
          restitution,
          density: calculatedDensity,
          angle: (rotation * Math.PI) / 180,
        });
        break;

      case "circle":
        body = Bodies.circle(x, y, radius!, {
          isStatic,
          friction,
          restitution,
          density: calculatedDensity,
          angle: (rotation * Math.PI) / 180,
        });
        break;

      case "polygon":
        // Create a simple hexagon using circle with custom rendering
        body = Bodies.circle(x, y, radius!, {
          isStatic,
          friction,
          restitution,
          density: calculatedDensity,
          angle: (rotation * Math.PI) / 180,
        });
        // Mark as polygon for custom rendering
        (body as any).isPolygon = true;
        (body as any).polygonRadius = radius;
        break;

      default:
        return null;
    }

    if (body) {
      // Set initial velocity
      if (initialVelocityX !== 0 || initialVelocityY !== 0) {
        Body.setVelocity(body, { x: initialVelocityX, y: initialVelocityY });
      }

      // Set angular velocity
      if (angularVelocity !== 0) {
        Body.setAngularVelocity(body, angularVelocity);
      }

      // Add custom properties
      (body as MatterBody).airResistance = airResistance || 0;
      (body as MatterBody).isHollow = isHollow || false;
      (body as MatterBody).material = material;
      (body as MatterBody).tags = tags || [];

      // Store object metadata
      const objectData: PhysicsObject = {
        id: body.id,
        name: name || `Object ${body.id}`,
        color: color || "#4CAF50",
        selected: false,
        config,
        material,
        tags,
      };

      this.objects.set(body.id, objectData);
      World.add(this.engine.world, body);

      return body;
    }

    return null;
  }

  private calculateArea(
    shape: string,
    width?: number,
    height?: number,
    radius?: number,
  ): number {
    switch (shape) {
      case "rectangle":
        return (width || 0) * (height || 0);
      case "circle":
        return Math.PI * (radius || 0) * (radius || 0);
      case "polygon":
        // Approximate hexagon area
        return ((3 * Math.sqrt(3)) / 2) * (radius || 0) * (radius || 0);
      default:
        return 1;
    }
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
      (body as MatterBody).airResistance = config.airResistance;
    }

    if (config.isHollow !== undefined) {
      (body as MatterBody).isHollow = config.isHollow;
    }

    if (config.material !== undefined) {
      (body as MatterBody).material = config.material;
    }

    if (config.tags !== undefined) {
      (body as MatterBody).tags = config.tags;
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
    if ((body as any).circleRadius) {
      return Math.PI * (body as any).circleRadius * (body as any).circleRadius;
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
    this.showVectors = show;
  }

  // Custom rendering to add colors and vectors
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

    // Render preview object if exists
    if (this.previewObject) {
      this.renderPreviewObject();
    }

    // Update FPS
    this.updateFPS();
  }

  private renderBody(body: Matter.Body): void {
    const obj = this.objects.get(body.id);
    if (!obj) return;

    this.ctx.save();

    // Set color and stroke - ensure valid hex color
    const color =
      obj.color && obj.color.startsWith("#") ? obj.color : "#4CAF50";
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = obj.selected ? "#FF5722" : "#333";
    this.ctx.lineWidth = obj.selected ? 3 : 1;

    // Transform to body position and rotation
    this.ctx.translate(body.position.x, body.position.y);
    this.ctx.rotate(body.angle);

    // Draw based on body type
    if ((body as any).isPolygon) {
      this.renderCustomPolygon(body);
    } else if ((body as any).circleRadius) {
      this.renderCircle(body as Matter.Body & { circleRadius: number });
    } else {
      this.renderRectangle(body);
    }

    // Draw label
    this.renderLabel(obj.name);

    this.ctx.restore();
  }

  private renderCircle(body: Matter.Body & { circleRadius: number }): void {
    const radius = body.circleRadius || 25;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
  }

  private renderCustomPolygon(body: Matter.Body): void {
    // Check if it's a custom polygon (hexagon)
    if ((body as any).isPolygon) {
      const radius = (body as any).polygonRadius || 25;
      const sides = 6; // Hexagon

      this.ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
    } else {
      // Regular polygon from vertices
      const vertices = body.vertices;
      this.ctx.beginPath();
      this.ctx.moveTo(
        vertices[0].x - body.position.x,
        vertices[0].y - body.position.y,
      );
      for (let i = 1; i < vertices.length; i++) {
        this.ctx.lineTo(
          vertices[i].x - body.position.x,
          vertices[i].y - body.position.y,
        );
      }
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
    }
  }

  private renderRectangle(body: Matter.Body): void {
    // Get bounds from the body
    const bounds = body.bounds;
    const width = bounds.max.x - bounds.min.x;
    const height = bounds.max.y - bounds.min.y;
    this.ctx.beginPath();
    this.ctx.rect(-width / 2, -height / 2, width, height);
    this.ctx.fill();
    this.ctx.stroke();
  }

  private renderLabel(name: string): void {
    this.ctx.fillStyle = "#333";
    this.ctx.font = "12px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(name, 0, 0);
  }

  private renderPreviewObject(): void {
    if (!this.previewObject) return;

    console.log("Rendering preview object:", this.previewObject);
    const bounds = this.getCanvasBounds();
    const center = { x: bounds.maxX / 2, y: bounds.maxY / 2 };
    const config = {
      ...this.previewObject,
      x: center.x,
      y: center.y,
    };

    this.ctx.save();

    // Set preview styling (semi-transparent)
    this.ctx.globalAlpha = 0.6;
    this.ctx.setLineDash([5, 5]); // Dashed outline for preview

    // Set color and stroke
    const color =
      config.color && config.color.startsWith("#") ? config.color : "#4CAF50";
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = "#666";
    this.ctx.lineWidth = 2;

    // Transform to center position and rotation
    this.ctx.translate(center.x, center.y);
    this.ctx.rotate((config.rotation * Math.PI) / 180);

    // Draw based on shape
    switch (config.shape) {
      case "rectangle":
        this.renderPreviewRectangle(config);
        break;
      case "circle":
        this.renderPreviewCircle(config);
        break;
      case "polygon":
        this.renderPreviewPolygon(config);
        break;
    }

    // Draw preview label
    this.ctx.fillStyle = "#666";
    this.ctx.font = "12px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText("Preview", 0, 0);

    this.ctx.restore();
  }

  private renderPreviewRectangle(config: ObjectConfig): void {
    const width = config.width || 50;
    const height = config.height || 50;

    this.ctx.beginPath();
    this.ctx.rect(-width / 2, -height / 2, width, height);
    this.ctx.fill();
    this.ctx.stroke();
  }

  private renderPreviewCircle(config: ObjectConfig): void {
    const radius = config.radius || 25;

    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
  }

  private renderPreviewPolygon(config: ObjectConfig): void {
    const radius = config.radius || 25;
    const sides = 6; // Hexagon

    this.ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }

  private renderVectors(): void {
    const bodies = this.engine.world.bodies;

    for (const body of bodies) {
      if (body.isStatic) continue;

      const velocity = body.velocity;
      const speed = Math.sqrt(
        velocity.x * velocity.x + velocity.y * velocity.y,
      );

      if (speed > 0.1) {
        this.renderVelocityVector(body, velocity, speed);
      }
    }
  }

  private renderVelocityVector(
    body: Matter.Body,
    velocity: Matter.Vector,
    speed: number,
  ): void {
    this.ctx.save();
    this.ctx.strokeStyle = "#FF0000";
    this.ctx.lineWidth = 2;

    // Draw velocity line
    this.ctx.beginPath();
    this.ctx.moveTo(body.position.x, body.position.y);
    this.ctx.lineTo(
      body.position.x + velocity.x * 10,
      body.position.y + velocity.y * 10,
    );
    this.ctx.stroke();

    // Draw arrow head
    this.drawArrowHead(
      body.position.x + velocity.x * 10,
      body.position.y + velocity.y * 10,
      velocity,
    );

    // Draw speed label
    this.ctx.fillStyle = "#FF0000";
    this.ctx.font = "10px Arial";
    this.ctx.fillText(
      `${speed.toFixed(1)} m/s`,
      body.position.x + velocity.x * 10 + 5,
      body.position.y + velocity.y * 10 - 5,
    );

    this.ctx.restore();
  }

  private drawArrowHead(x: number, y: number, velocity: Matter.Vector): void {
    const angle = Math.atan2(velocity.y, velocity.x);
    const arrowLength = 8;
    const arrowAngle = Math.PI / 6;

    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(
      x - arrowLength * Math.cos(angle - arrowAngle),
      y - arrowLength * Math.sin(angle - arrowAngle),
    );
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(
      x - arrowLength * Math.cos(angle + arrowAngle),
      y - arrowLength * Math.sin(angle + arrowAngle),
    );
    this.ctx.stroke();
  }

  private updateFPS(): void {
    const currentTime = performance.now();
    if (this.lastTime > 0) {
      this.fps = Math.round(1000 / (currentTime - this.lastTime));
    }
    this.lastTime = currentTime;
  }

  // Start the engine
  public start(): void {
    // Create runner
    this.runner = Runner.create();

    // Start the engine (but not the renderer to avoid conflicts)
    Runner.run(this.runner, this.engine);

    // Use custom render loop instead of built-in renderer
    const renderLoop = () => {
      this.customRender();
      requestAnimationFrame(renderLoop);
    };
    renderLoop();
  }

  // Public getters
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
    this.onObjectSelected = callback;
  }

  public setPreviewObject(config: ObjectConfig | null): void {
    console.log("setPreviewObject called with:", config);
    this.previewObject = config;
  }

  public getCanvasCenter(): { x: number; y: number } {
    return {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
    };
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

  // Cleanup
  public cleanup(): void {
    if (this.runner) {
      Runner.stop(this.runner);
    }
    World.clear(this.engine.world, false);
    this.objects.clear();
  }
}
