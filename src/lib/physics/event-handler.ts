import Matter from "matter-js";

export class EventHandler {
  private canvas: HTMLCanvasElement;
  private engine: Matter.Engine;
  private onObjectSelected?: (body: Matter.Body | null) => void;
  private draggedBody: Matter.Body | null = null;

  constructor(canvas: HTMLCanvasElement, engine: Matter.Engine) {
    this.canvas = canvas;
    this.engine = engine;
  }

  public setupEventListeners(): void {
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
    if (this.onObjectSelected) {
      this.onObjectSelected(clickedBody);
    }
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

      Matter.Body.setPosition(this.draggedBody, { x, y });
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

  public setOnObjectSelected(
    callback: (body: Matter.Body | null) => void,
  ): void {
    this.onObjectSelected = callback;
  }
}
