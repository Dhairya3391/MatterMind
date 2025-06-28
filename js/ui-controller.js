class UIController {
  constructor(physicsEngine, objectManager) {
    this.physicsEngine = physicsEngine;
    this.objectManager = objectManager;

    // UI Elements
    this.elements = {
      // Simulation controls
      playPauseBtn: document.getElementById("playPauseBtn"),
      resetBtn: document.getElementById("resetBtn"),
      gravityToggle: document.getElementById("gravityToggle"),

      // Object creation
      shapeSelect: document.getElementById("shapeSelect"),
      objectName: document.getElementById("objectName"),
      objectColor: document.getElementById("objectColor"),
      objectWidth: document.getElementById("objectWidth"),
      objectHeight: document.getElementById("objectHeight"),
      objectRadius: document.getElementById("objectRadius"),
      objectMass: document.getElementById("objectMass"),
      objectFriction: document.getElementById("objectFriction"),
      objectElasticity: document.getElementById("objectElasticity"),
      objectAirResistance: document.getElementById("objectAirResistance"),
      objectRotation: document.getElementById("objectRotation"),
      objectAngularVelocity: document.getElementById("objectAngularVelocity"),
      objectStatic: document.getElementById("objectStatic"),
      showVectors: document.getElementById("showVectors"),
      createObjectBtn: document.getElementById("createObjectBtn"),

      // Display values
      frictionValue: document.getElementById("frictionValue"),
      elasticityValue: document.getElementById("elasticityValue"),
      airResistanceValue: document.getElementById("airResistanceValue"),

      // Object list
      objectList: document.getElementById("objectList"),

      // Scene management
      saveSceneBtn: document.getElementById("saveSceneBtn"),
      loadSceneBtn: document.getElementById("loadSceneBtn"),
      clearSceneBtn: document.getElementById("clearSceneBtn"),
      fileInput: document.getElementById("fileInput"),

      // Info panel
      objectCount: document.getElementById("objectCount"),
      fps: document.getElementById("fps"),
    };

    this.setupEventListeners();
    this.updateInfoPanel();
  }

  setupEventListeners() {
    // Simulation controls
    this.elements.playPauseBtn.addEventListener("click", () =>
      this.togglePause()
    );
    this.elements.resetBtn.addEventListener("click", () =>
      this.resetSimulation()
    );
    this.elements.gravityToggle.addEventListener("change", (e) =>
      this.toggleGravity(e.target.checked)
    );

    // Shape selection
    this.elements.shapeSelect.addEventListener("change", () =>
      this.updateShapeFields()
    );

    // Range input displays
    this.elements.objectFriction.addEventListener("input", (e) => {
      this.elements.frictionValue.textContent = e.target.value;
    });

    this.elements.objectElasticity.addEventListener("input", (e) => {
      this.elements.elasticityValue.textContent = e.target.value;
    });

    this.elements.objectAirResistance.addEventListener("input", (e) => {
      this.elements.airResistanceValue.textContent = e.target.value;
    });

    // Object creation
    this.elements.createObjectBtn.addEventListener("click", () =>
      this.createObject()
    );

    // Vector display
    this.elements.showVectors.addEventListener("change", (e) => {
      this.physicsEngine.setShowVectors(e.target.checked);
    });

    // Scene management
    this.elements.saveSceneBtn.addEventListener("click", () =>
      this.saveScene()
    );
    this.elements.loadSceneBtn.addEventListener("click", () =>
      this.loadScene()
    );
    this.elements.clearSceneBtn.addEventListener("click", () =>
      this.clearScene()
    );
    this.elements.fileInput.addEventListener("change", (e) =>
      this.handleFileLoad(e)
    );

    // Object selection from physics engine
    this.physicsEngine.onObjectSelected = (body) => {
      this.onObjectSelected(body);
    };

    // Initialize shape fields
    this.updateShapeFields();
  }

  updateShapeFields() {
    const shape = this.elements.shapeSelect.value;
    const dimensionsGroup = document.querySelector(".dimensions-group");
    const radiusGroup = document.querySelector(".radius-group");

    if (shape === "circle") {
      dimensionsGroup.style.display = "none";
      radiusGroup.style.display = "block";
    } else {
      dimensionsGroup.style.display = "block";
      radiusGroup.style.display = "none";
    }
  }

  togglePause() {
    const isRunning = this.physicsEngine.togglePause();
    this.elements.playPauseBtn.textContent = isRunning ? "⏸️ Pause" : "▶️ Play";
  }

  resetSimulation() {
    this.physicsEngine.reset();
    this.objectManager.clearObjects();
    this.updateObjectList();
    this.updateInfoPanel();
  }

  toggleGravity(enabled) {
    this.physicsEngine.setGravity(enabled);
  }

  createObject() {
    const config = this.getObjectConfig();

    // Set default position to center of canvas
    const canvas = this.physicsEngine.canvas;
    config.x = canvas.width / 2;
    config.y = canvas.height / 2;

    const body = this.physicsEngine.createObject(config);

    if (body) {
      this.objectManager.addObject(body, config);
      this.updateObjectList();
      this.updateInfoPanel();
      this.clearForm();
    }
  }

  getObjectConfig() {
    const shape = this.elements.shapeSelect.value;
    const config = {
      shape: shape,
      name: this.elements.objectName.value || `Object ${Date.now()}`,
      color: this.elements.objectColor.value,
      mass: parseFloat(this.elements.objectMass.value),
      friction: parseFloat(this.elements.objectFriction.value),
      restitution: parseFloat(this.elements.objectElasticity.value),
      airResistance: parseFloat(this.elements.objectAirResistance.value),
      rotation: parseFloat(this.elements.objectRotation.value),
      angularVelocity: parseFloat(this.elements.objectAngularVelocity.value),
      isStatic: this.elements.objectStatic.checked,
    };

    if (shape === "circle") {
      config.radius = parseFloat(this.elements.objectRadius.value);
    } else {
      config.width = parseFloat(this.elements.objectWidth.value);
      config.height = parseFloat(this.elements.objectHeight.value);
    }

    return config;
  }

  clearForm() {
    this.elements.objectName.value = "";
    this.elements.objectColor.value = "#4CAF50";
    this.elements.objectWidth.value = "50";
    this.elements.objectHeight.value = "50";
    this.elements.objectRadius.value = "25";
    this.elements.objectMass.value = "1";
    this.elements.objectFriction.value = "0.1";
    this.elements.objectElasticity.value = "0.5";
    this.elements.objectAirResistance.value = "0";
    this.elements.objectRotation.value = "0";
    this.elements.objectAngularVelocity.value = "0";
    this.elements.objectStatic.checked = false;

    // Update display values
    this.elements.frictionValue.textContent = "0.1";
    this.elements.elasticityValue.textContent = "0.5";
    this.elements.airResistanceValue.textContent = "0";
  }

  onObjectSelected(body) {
    if (body) {
      const obj = this.physicsEngine.objects.get(body.id);
      if (obj) {
        this.populateFormWithObject(obj);
        this.updateObjectList();
      }
    } else {
      this.clearForm();
      this.updateObjectList();
    }
  }

  populateFormWithObject(obj) {
    const config = obj.config;

    this.elements.shapeSelect.value = config.shape;
    this.elements.objectName.value = obj.name;
    this.elements.objectColor.value = obj.color;
    this.elements.objectMass.value = config.mass;
    this.elements.objectFriction.value = config.friction;
    this.elements.objectElasticity.value = config.restitution;
    this.elements.objectAirResistance.value = config.airResistance;
    this.elements.objectRotation.value = config.rotation;
    this.elements.objectAngularVelocity.value = config.angularVelocity;
    this.elements.objectStatic.checked = config.isStatic;

    if (config.shape === "circle") {
      this.elements.objectRadius.value = config.radius;
    } else {
      this.elements.objectWidth.value = config.width;
      this.elements.objectHeight.value = config.height;
    }

    // Update display values
    this.elements.frictionValue.textContent = config.friction;
    this.elements.elasticityValue.textContent = config.restitution;
    this.elements.airResistanceValue.textContent = config.airResistance;

    this.updateShapeFields();
  }

  updateObjectList() {
    const objects = this.physicsEngine.getAllObjects();
    this.elements.objectList.innerHTML = "";

    objects.forEach((obj) => {
      const objectItem = this.createObjectListItem(obj);
      this.elements.objectList.appendChild(objectItem);
    });
  }

  createObjectListItem(obj) {
    const item = document.createElement("div");
    item.className = `object-item ${obj.selected ? "selected" : ""}`;
    item.dataset.objectId = obj.id;

    const info = document.createElement("div");
    info.className = "object-info";

    const name = document.createElement("div");
    name.className = "object-name";
    name.textContent = obj.name;

    const details = document.createElement("div");
    details.className = "object-details";
    details.textContent = `${obj.config.shape} | Mass: ${obj.config.mass}kg`;

    info.appendChild(name);
    info.appendChild(details);

    const actions = document.createElement("div");
    actions.className = "object-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "edit-btn";
    editBtn.textContent = "Edit";
    editBtn.onclick = () => this.editObject(obj.id);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => this.deleteObject(obj.id);

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    item.appendChild(info);
    item.appendChild(actions);

    // Click to select
    item.addEventListener("click", (e) => {
      if (
        !e.target.classList.contains("edit-btn") &&
        !e.target.classList.contains("delete-btn")
      ) {
        const body = this.physicsEngine.World.bodies(
          this.physicsEngine.engine.world
        ).find((b) => b.id === obj.id);
        this.physicsEngine.selectObject(body);
      }
    });

    return item;
  }

  editObject(objectId) {
    const obj = this.physicsEngine.objects.get(objectId);
    if (obj) {
      this.populateFormWithObject(obj);
      this.elements.createObjectBtn.textContent = "💾 Update Object";
      this.elements.createObjectBtn.onclick = () => this.updateObject(objectId);
    }
  }

  updateObject(objectId) {
    const config = this.getObjectConfig();
    const success = this.physicsEngine.updateObject(objectId, config);

    if (success) {
      this.objectManager.updateObject(objectId, config);
      this.updateObjectList();
      this.updateInfoPanel();

      // Reset form
      this.elements.createObjectBtn.textContent = "➕ Create Object";
      this.elements.createObjectBtn.onclick = () => this.createObject();
      this.clearForm();
    }
  }

  deleteObject(objectId) {
    if (confirm("Are you sure you want to delete this object?")) {
      const success = this.physicsEngine.deleteObject(objectId);
      if (success) {
        this.objectManager.removeObject(objectId);
        this.updateObjectList();
        this.updateInfoPanel();

        // Clear form if this was the selected object
        if (this.physicsEngine.getSelectedObject() === null) {
          this.clearForm();
          this.elements.createObjectBtn.textContent = "➕ Create Object";
          this.elements.createObjectBtn.onclick = () => this.createObject();
        }
      }
    }
  }

  saveScene() {
    const scene = {
      objects: this.physicsEngine.getAllObjects().map((obj) => ({
        ...obj.config,
        name: obj.name,
        color: obj.color,
      })),
      gravity: this.elements.gravityToggle.checked,
      showVectors: this.elements.showVectors.checked,
      timestamp: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(scene, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = `mattermind-scene-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, "-")}.json`;
    link.click();
  }

  loadScene() {
    this.elements.fileInput.click();
  }

  handleFileLoad(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const scene = JSON.parse(e.target.result);
        this.loadSceneData(scene);
      } catch (error) {
        alert("Error loading scene file: " + error.message);
      }
    };
    reader.readAsText(file);

    // Clear file input
    event.target.value = "";
  }

  loadSceneData(scene) {
    // Clear current scene
    this.physicsEngine.clearAllObjects();
    this.objectManager.clearObjects();

    // Load objects
    if (scene.objects) {
      scene.objects.forEach((objConfig) => {
        const body = this.physicsEngine.createObject(objConfig);
        if (body) {
          this.objectManager.addObject(body, objConfig);
        }
      });
    }

    // Load settings
    if (scene.gravity !== undefined) {
      this.elements.gravityToggle.checked = scene.gravity;
      this.physicsEngine.setGravity(scene.gravity);
    }

    if (scene.showVectors !== undefined) {
      this.elements.showVectors.checked = scene.showVectors;
      this.physicsEngine.setShowVectors(scene.showVectors);
    }

    this.updateObjectList();
    this.updateInfoPanel();
  }

  clearScene() {
    if (confirm("Are you sure you want to clear all objects?")) {
      this.physicsEngine.clearAllObjects();
      this.objectManager.clearObjects();
      this.updateObjectList();
      this.updateInfoPanel();
      this.clearForm();
    }
  }

  updateInfoPanel() {
    this.elements.objectCount.textContent = `Objects: ${this.physicsEngine.getObjectCount()}`;
    this.elements.fps.textContent = `FPS: ${this.physicsEngine.getFPS()}`;
  }

  // Update info panel periodically
  startInfoUpdates() {
    setInterval(() => {
      this.updateInfoPanel();
    }, 1000);
  }
}
