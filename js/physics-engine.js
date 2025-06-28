class PhysicsEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");

    // Matter.js modules
    this.Engine = Matter.Engine;
    this.Render = Matter.Render;
    this.World = Matter.World;
    this.Bodies = Matter.Bodies;
    this.Body = Matter.Body;
    this.Vector = Matter.Vector;
    this.Events = Matter.Events;
    this.Runner = Matter.Runner;

    // Initialize physics world
    this.engine = this.Engine.create({
      gravity: { x: 0, y: 1, scale: 0.001 },
    });

    // Create renderer
    this.renderer = this.Render.create({
      canvas: this.canvas,
      engine: this.engine,
      options: {
        width: this.canvas.width,
        height: this.canvas.height,
        wireframes: false,
        background: "transparent",
      },
    });

    // Store objects with metadata
    this.objects = new Map();
    this.selectedObject = null;
    this.showVectors = false;

    // Performance tracking
    this.lastTime = 0;
    this.fps = 60;

    // Runner for the engine
    this.runner = null;

    this.setupEventListeners();
    this.resizeCanvas();
  }

  setupEventListeners() {
    // Handle window resize
    window.addEventListener("resize", () => this.resizeCanvas());

    // Handle canvas click for object selection
    this.canvas.addEventListener("click", (e) => this.handleCanvasClick(e));

    // Handle mouse events for object dragging
    this.canvas.addEventListener("mousedown", (e) => this.handleMouseDown(e));
    this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    this.canvas.addEventListener("mouseup", (e) => this.handleMouseUp(e));
  }

  resizeCanvas() {
    const container = this.canvas.parentElement;
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;

    this.renderer.options.width = this.canvas.width;
    this.renderer.options.height = this.canvas.height;
  }

  handleCanvasClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked object
    const clickedBody = this.findBodyAtPosition(x, y);
    this.selectObject(clickedBody);
  }

  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const body = this.findBodyAtPosition(x, y);
    if (body && !body.isStatic) {
      this.draggedBody = body;
    }
  }

  handleMouseMove(e) {
    if (this.draggedBody) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      this.Body.setPosition(this.draggedBody, { x, y });
    }
  }

  handleMouseUp(e) {
    this.draggedBody = null;
  }

  findBodyAtPosition(x, y) {
    const bodies = this.World.allBodies(this.engine.world);
    for (let body of bodies) {
      const vertices = body.vertices;
      if (this.isPointInPolygon(x, y, vertices)) {
        return body;
      }
    }
    return null;
  }

  isPointInPolygon(x, y, vertices) {
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

  selectObject(body) {
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
    this.onObjectSelected && this.onObjectSelected(body);
  }

  createObject(config) {
    let body;
    const {
      shape,
      width,
      height,
      radius,
      x,
      y,
      mass,
      friction,
      restitution,
      isStatic,
      rotation,
      angularVelocity,
      airResistance,
      color,
      name,
    } = config;

    switch (shape) {
      case "rectangle":
        body = this.Bodies.rectangle(x, y, width, height, {
          isStatic: isStatic,
          friction: friction,
          restitution: restitution,
          density: mass / (width * height),
          angle: (rotation * Math.PI) / 180,
        });
        break;

      case "circle":
        body = this.Bodies.circle(x, y, radius, {
          isStatic: isStatic,
          friction: friction,
          restitution: restitution,
          density: mass / (Math.PI * radius * radius),
          angle: (rotation * Math.PI) / 180,
        });
        break;

      case "polygon":
        const sides = 6; // Hexagon
        const vertices = [];
        for (let i = 0; i < sides; i++) {
          const angle = (i * 2 * Math.PI) / sides + (rotation * Math.PI) / 180;
          vertices.push({
            x: x + radius * Math.cos(angle),
            y: y + radius * Math.sin(angle),
          });
        }
        body = this.Bodies.fromVertices(x, y, [vertices], {
          isStatic: isStatic,
          friction: friction,
          restitution: restitution,
          density: mass / (Math.PI * radius * radius),
        });
        break;
    }

    if (body) {
      // Set angular velocity
      if (angularVelocity !== 0) {
        this.Body.setAngularVelocity(body, angularVelocity);
      }

      // Add air resistance
      if (airResistance > 0) {
        body.airResistance = airResistance;
      }

      // Store object metadata
      const objectData = {
        id: body.id,
        name: name || `Object ${body.id}`,
        color: color || "#4CAF50",
        selected: false,
        config: config,
      };

      this.objects.set(body.id, objectData);
      this.World.add(this.engine.world, body);

      return body;
    }

    return null;
  }

  updateObject(bodyId, config) {
    const body = this.World.allBodies(this.engine.world).find(
      (b) => b.id === bodyId
    );
    if (!body) return false;

    const obj = this.objects.get(bodyId);
    if (!obj) return false;

    // Update physics properties
    if (config.mass !== undefined) {
      const area = this.calculateBodyArea(body);
      body.density = config.mass / area;
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
      this.Body.setAngle(body, (config.rotation * Math.PI) / 180);
    }

    if (config.angularVelocity !== undefined) {
      this.Body.setAngularVelocity(body, config.angularVelocity);
    }

    if (config.airResistance !== undefined) {
      body.airResistance = config.airResistance;
    }

    // Update metadata
    if (config.name !== undefined) {
      obj.name = config.name;
    }

    if (config.color !== undefined) {
      obj.color = config.color;
    }

    return true;
  }

  calculateBodyArea(body) {
    if (body.circleRadius) {
      return Math.PI * body.circleRadius * body.circleRadius;
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

  deleteObject(bodyId) {
    const body = this.World.allBodies(this.engine.world).find(
      (b) => b.id === bodyId
    );
    if (body) {
      this.World.remove(this.engine.world, body);
      this.objects.delete(bodyId);

      if (this.selectedObject && this.selectedObject.id === bodyId) {
        this.selectedObject = null;
      }

      return true;
    }
    return false;
  }

  clearAllObjects() {
    this.World.clear(this.engine.world, false);
    this.objects.clear();
    this.selectedObject = null;
  }

  setGravity(enabled) {
    if (enabled) {
      this.engine.world.gravity.y = 1;
      this.engine.world.gravity.scale = 0.001;
    } else {
      this.engine.world.gravity.y = 0;
      this.engine.world.gravity.scale = 0;
    }
  }

  togglePause() {
    if (this.runner && this.runner.enabled) {
      this.Runner.stop(this.runner);
    } else {
      this.Runner.run(this.runner);
    }
    return this.runner && this.runner.enabled;
  }

  reset() {
    this.clearAllObjects();
    if (this.runner) {
      this.Runner.stop(this.runner);
    }
    this.Runner.run(this.runner);
  }

  setShowVectors(show) {
    this.showVectors = show;
  }

  // Custom rendering to add colors and vectors
  customRender() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Render all bodies with custom colors
    const bodies = this.World.allBodies(this.engine.world);
    for (let body of bodies) {
      this.renderBody(body);
    }

    // Render vectors if enabled
    if (this.showVectors) {
      this.renderVectors();
    }

    // Update FPS
    const currentTime = performance.now();
    if (this.lastTime > 0) {
      this.fps = Math.round(1000 / (currentTime - this.lastTime));
    }
    this.lastTime = currentTime;
  }

  renderBody(body) {
    const obj = this.objects.get(body.id);
    if (!obj) return;

    this.ctx.save();

    // Set color
    this.ctx.fillStyle = obj.color;
    this.ctx.strokeStyle = obj.selected ? "#FF5722" : "#333";
    this.ctx.lineWidth = obj.selected ? 3 : 1;

    // Transform to body position and rotation
    this.ctx.translate(body.position.x, body.position.y);
    this.ctx.rotate(body.angle);

    // Draw based on body type
    if (body.circleRadius) {
      // Circle
      this.ctx.beginPath();
      this.ctx.arc(0, 0, body.circleRadius, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.stroke();
    } else {
      // Polygon
      const vertices = body.vertices;
      this.ctx.beginPath();
      this.ctx.moveTo(
        vertices[0].x - body.position.x,
        vertices[0].y - body.position.y
      );
      for (let i = 1; i < vertices.length; i++) {
        this.ctx.lineTo(
          vertices[i].x - body.position.x,
          vertices[i].y - body.position.y
        );
      }
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
    }

    // Draw label
    this.ctx.fillStyle = "#333";
    this.ctx.font = "12px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(obj.name, 0, 0);

    this.ctx.restore();
  }

  renderVectors() {
    const bodies = this.World.allBodies(this.engine.world);
    for (let body of bodies) {
      if (body.isStatic) continue;

      // Velocity vector
      const velocity = body.velocity;
      const speed = Math.sqrt(
        velocity.x * velocity.x + velocity.y * velocity.y
      );

      if (speed > 0.1) {
        this.ctx.save();
        this.ctx.strokeStyle = "#FF0000";
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(body.position.x, body.position.y);
        this.ctx.lineTo(
          body.position.x + velocity.x * 10,
          body.position.y + velocity.y * 10
        );
        this.ctx.stroke();

        // Arrow head
        const angle = Math.atan2(velocity.y, velocity.x);
        const arrowLength = 8;
        const arrowAngle = Math.PI / 6;

        this.ctx.beginPath();
        this.ctx.moveTo(
          body.position.x + velocity.x * 10,
          body.position.y + velocity.y * 10
        );
        this.ctx.lineTo(
          body.position.x +
            velocity.x * 10 -
            arrowLength * Math.cos(angle - arrowAngle),
          body.position.y +
            velocity.y * 10 -
            arrowLength * Math.sin(angle - arrowAngle)
        );
        this.ctx.moveTo(
          body.position.x + velocity.x * 10,
          body.position.y + velocity.y * 10
        );
        this.ctx.lineTo(
          body.position.x +
            velocity.x * 10 -
            arrowLength * Math.cos(angle + arrowAngle),
          body.position.y +
            velocity.y * 10 -
            arrowLength * Math.sin(angle + arrowAngle)
        );
        this.ctx.stroke();

        // Speed label
        this.ctx.fillStyle = "#FF0000";
        this.ctx.font = "10px Arial";
        this.ctx.fillText(
          `${speed.toFixed(1)} m/s`,
          body.position.x + velocity.x * 10 + 5,
          body.position.y + velocity.y * 10 - 5
        );

        this.ctx.restore();
      }
    }
  }

  // Start the engine
  start() {
    // Create runner
    this.runner = this.Runner.create();

    // Start the engine and renderer
    this.Runner.run(this.runner, this.engine);
    this.Render.run(this.renderer);

    // Custom render loop for additional features
    const renderLoop = () => {
      this.customRender();
      requestAnimationFrame(renderLoop);
    };
    renderLoop();
  }

  // Get object count
  getObjectCount() {
    return this.objects.size;
  }

  // Get FPS
  getFPS() {
    return this.fps;
  }

  // Get all objects
  getAllObjects() {
    return Array.from(this.objects.values());
  }

  // Get selected object
  getSelectedObject() {
    return this.selectedObject;
  }
}
