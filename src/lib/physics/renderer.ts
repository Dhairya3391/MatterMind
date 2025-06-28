import type { ObjectConfig, PhysicsObject } from "$lib/types/physics.types";
import type Matter from "matter-js";

// Extended Matter.js body interface
interface ExtendedMatterBody extends Matter.Body {
  isPolygon?: boolean;
  polygonRadius?: number;
  circleRadius?: number;
  polygonSides?: number;
  isStar?: boolean;
  isRope?: boolean;
  ropeSegments?: Matter.Body[];
}

interface RenderOptions {
  showBounds?: boolean;
  showGrid?: boolean;
  boundaries?: Matter.Body[];
}

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private objects: Map<number, PhysicsObject>;
  private showVectors: boolean = false;
  private previewObject: ObjectConfig | null = null;

  constructor(canvas: HTMLCanvasElement, objects: Map<number, PhysicsObject>) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.objects = objects;
  }

  public render(engine: Matter.Engine, options: RenderOptions = {}): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Render grid if enabled
    if (options.showGrid) {
      this.renderGrid();
    }

    // Render boundaries if enabled
    if (options.showBounds && options.boundaries) {
      this.renderBoundaries(options.boundaries);
    }

    // Render all bodies with custom colors
    const bodies = engine.world.bodies;
    for (const body of bodies) {
      // Skip boundaries and mouse constraint
      if (options.boundaries?.includes(body) || body.id === -1) continue;

      this.renderBody(body);
    }

    // Render vectors if enabled
    if (this.showVectors) {
      this.renderVectors(engine);
    }

    // Render preview object if exists
    if (this.previewObject) {
      this.renderPreviewObject();
    }
  }

  private renderGrid(): void {
    const gridSize = 20;
    this.ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
    this.ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= this.canvas.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= this.canvas.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  private renderBoundaries(boundaries: Matter.Body[]): void {
    this.ctx.save();
    this.ctx.strokeStyle = "rgba(59, 130, 246, 0.3)";
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);

    for (const boundary of boundaries) {
      const vertices = boundary.vertices;
      this.ctx.beginPath();
      this.ctx.moveTo(vertices[0].x, vertices[0].y);

      for (let i = 1; i < vertices.length; i++) {
        this.ctx.lineTo(vertices[i].x, vertices[i].y);
      }

      this.ctx.closePath();
      this.ctx.stroke();
    }

    this.ctx.restore();
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
    const extendedBody = body as ExtendedMatterBody;
    if (extendedBody.isStar) {
      this.renderStar(body);
    } else if (extendedBody.isRope) {
      this.renderRope(body);
    } else if (extendedBody.isPolygon) {
      this.renderCustomPolygon(body);
    } else if (extendedBody.circleRadius) {
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
    // Check if it's a custom polygon
    const extendedBody = body as ExtendedMatterBody;
    if (extendedBody.isPolygon) {
      const radius = extendedBody.polygonRadius || 25;
      const sides = extendedBody.polygonSides || 6;

      this.ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2; // Start from top
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

    const bounds = this.canvas.getBoundingClientRect();
    const center = { x: bounds.width / 2, y: bounds.height / 2 };
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
      case "triangle":
        this.renderPreviewTriangle(config);
        break;
      case "pentagon":
        this.renderPreviewPentagon(config);
        break;
      case "star":
        this.renderPreviewStar(config);
        break;
      case "rope":
        this.renderPreviewRope(config);
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

  private renderPreviewTriangle(config: ObjectConfig): void {
    const sideLength = config.width || 50;

    this.ctx.beginPath();
    this.ctx.moveTo(0, -sideLength / 2);
    this.ctx.lineTo(sideLength / 2, sideLength / 2);
    this.ctx.lineTo(-sideLength / 2, sideLength / 2);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }

  private renderPreviewPentagon(config: ObjectConfig): void {
    const radius = config.radius || 25;
    const sides = 5; // Pentagon

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

  private renderPreviewStar(config: ObjectConfig): void {
    const radius = config.radius || 25;
    const starPoints = 5;
    const innerRadius = radius * 0.4;

    this.ctx.beginPath();
    for (let i = 0; i < starPoints * 2; i++) {
      const angle = (i * Math.PI) / starPoints - Math.PI / 2;
      const currentRadius = i % 2 === 0 ? radius : innerRadius;
      const x = currentRadius * Math.cos(angle);
      const y = currentRadius * Math.sin(angle);

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

  private renderPreviewRope(config: ObjectConfig): void {
    const radius = config.radius || 8;

    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
  }

  private renderVectors(engine: Matter.Engine): void {
    const bodies = engine.world.bodies;

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

  public setShowVectors(show: boolean): void {
    this.showVectors = show;
  }

  public setPreviewObject(config: ObjectConfig | null): void {
    this.previewObject = config;
  }

  private renderStar(body: Matter.Body): void {
    const extendedBody = body as ExtendedMatterBody;
    const radius = extendedBody.polygonRadius || 25;
    const starPoints = 5;
    const innerRadius = radius * 0.4;

    this.ctx.beginPath();
    for (let i = 0; i < starPoints * 2; i++) {
      const angle = (i * Math.PI) / starPoints - Math.PI / 2;
      const currentRadius = i % 2 === 0 ? radius : innerRadius;
      const x = currentRadius * Math.cos(angle);
      const y = currentRadius * Math.sin(angle);

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

  private renderRope(body: Matter.Body): void {
    const extendedBody = body as ExtendedMatterBody;
    const radius = extendedBody.polygonRadius || 8;

    // Render as a simple circle for now
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
  }
}
