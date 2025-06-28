class SceneManager {
  constructor(physicsEngine, objectManager) {
    this.physicsEngine = physicsEngine;
    this.objectManager = objectManager;
    this.currentScene = null;
  }

  // Create a new scene
  createScene(name, description = "") {
    const scene = {
      id: this.generateSceneId(),
      name: name,
      description: description,
      objects: [],
      settings: {
        gravity: true,
        showVectors: false,
      },
      metadata: {
        createdAt: new Date().toISOString(),
        version: "1.0",
      },
    };

    this.currentScene = scene;
    return scene;
  }

  // Save current scene
  saveCurrentScene() {
    if (!this.currentScene) {
      this.currentScene = this.createScene("Untitled Scene");
    }

    // Get all objects from physics engine
    const objects = this.physicsEngine.getAllObjects();

    this.currentScene.objects = objects.map((obj) => ({
      ...obj.config,
      name: obj.name,
      color: obj.color,
    }));

    this.currentScene.settings.gravity =
      this.physicsEngine.engine.world.gravity.y !== 0;
    this.currentScene.settings.showVectors = this.physicsEngine.showVectors;
    this.currentScene.metadata.lastModified = new Date().toISOString();

    return this.currentScene;
  }

  // Load scene
  loadScene(sceneData) {
    // Clear current scene
    this.physicsEngine.clearAllObjects();
    this.objectManager.clearObjects();

    // Set current scene
    this.currentScene = sceneData;

    // Load objects
    if (sceneData.objects) {
      sceneData.objects.forEach((objConfig) => {
        const body = this.physicsEngine.createObject(objConfig);
        if (body) {
          this.objectManager.addObject(body, objConfig);
        }
      });
    }

    // Load settings
    if (sceneData.settings) {
      this.physicsEngine.setGravity(sceneData.settings.gravity);
      this.physicsEngine.setShowVectors(sceneData.settings.showVectors);
    }

    return true;
  }

  // Export scene to JSON
  exportSceneToJSON(scene = null) {
    const sceneToExport = scene || this.saveCurrentScene();
    return JSON.stringify(sceneToExport, null, 2);
  }

  // Import scene from JSON
  importSceneFromJSON(jsonString) {
    try {
      const sceneData = JSON.parse(jsonString);
      return this.loadScene(sceneData);
    } catch (error) {
      console.error("Error importing scene:", error);
      return false;
    }
  }

  // Get preset scenes
  getPresetScenes() {
    return {
      "collision-demo": {
        name: "Collision Demo",
        description:
          "Demonstrates basic collision physics with different materials",
        objects: [
          {
            shape: "rectangle",
            name: "Floor",
            color: "#8D6E63",
            width: 800,
            height: 20,
            x: 400,
            y: 580,
            mass: 1,
            friction: 0.3,
            restitution: 0.2,
            airResistance: 0,
            rotation: 0,
            angularVelocity: 0,
            isStatic: true,
          },
          {
            shape: "circle",
            name: "Bouncy Ball",
            color: "#F44336",
            radius: 20,
            x: 200,
            y: 100,
            mass: 1,
            friction: 0.1,
            restitution: 0.9,
            airResistance: 0.01,
            rotation: 0,
            angularVelocity: 0,
            isStatic: false,
          },
          {
            shape: "rectangle",
            name: "Heavy Block",
            color: "#3F51B5",
            width: 60,
            height: 60,
            x: 300,
            y: 100,
            mass: 5,
            friction: 0.4,
            restitution: 0.3,
            airResistance: 0,
            rotation: 0,
            angularVelocity: 0,
            isStatic: false,
          },
          {
            shape: "polygon",
            name: "Rolling Hexagon",
            color: "#FF9800",
            width: 40,
            height: 40,
            x: 500,
            y: 100,
            mass: 2,
            friction: 0.2,
            restitution: 0.6,
            airResistance: 0.005,
            rotation: 0,
            angularVelocity: 2,
            isStatic: false,
          },
        ],
        settings: {
          gravity: true,
          showVectors: true,
        },
      },

      "pendulum-demo": {
        name: "Pendulum Demo",
        description: "Simple pendulum demonstration with gravity",
        objects: [
          {
            shape: "circle",
            name: "Pendulum Bob",
            color: "#9C27B0",
            radius: 15,
            x: 400,
            y: 200,
            mass: 2,
            friction: 0.1,
            restitution: 0.8,
            airResistance: 0.02,
            rotation: 0,
            angularVelocity: 0,
            isStatic: false,
          },
          {
            shape: "rectangle",
            name: "Pivot",
            color: "#607D8B",
            width: 10,
            height: 10,
            x: 400,
            y: 100,
            mass: 1,
            friction: 0.1,
            restitution: 0.5,
            airResistance: 0,
            rotation: 0,
            angularVelocity: 0,
            isStatic: true,
          },
        ],
        settings: {
          gravity: true,
          showVectors: true,
        },
      },

      "stacking-demo": {
        name: "Stacking Demo",
        description: "Demonstrates object stacking and stability",
        objects: [
          {
            shape: "rectangle",
            name: "Base",
            color: "#795548",
            width: 200,
            height: 20,
            x: 400,
            y: 550,
            mass: 10,
            friction: 0.5,
            restitution: 0.1,
            airResistance: 0,
            rotation: 0,
            angularVelocity: 0,
            isStatic: true,
          },
          {
            shape: "rectangle",
            name: "Block 1",
            color: "#4CAF50",
            width: 50,
            height: 50,
            x: 350,
            y: 450,
            mass: 2,
            friction: 0.3,
            restitution: 0.2,
            airResistance: 0,
            rotation: 0,
            angularVelocity: 0,
            isStatic: false,
          },
          {
            shape: "rectangle",
            name: "Block 2",
            color: "#2196F3",
            width: 50,
            height: 50,
            x: 400,
            y: 450,
            mass: 2,
            friction: 0.3,
            restitution: 0.2,
            airResistance: 0,
            rotation: 0,
            angularVelocity: 0,
            isStatic: false,
          },
          {
            shape: "rectangle",
            name: "Block 3",
            color: "#FF9800",
            width: 50,
            height: 50,
            x: 450,
            y: 450,
            mass: 2,
            friction: 0.3,
            restitution: 0.2,
            airResistance: 0,
            rotation: 0,
            angularVelocity: 0,
            isStatic: false,
          },
          {
            shape: "rectangle",
            name: "Top Block",
            color: "#F44336",
            width: 50,
            height: 50,
            x: 400,
            y: 350,
            mass: 1,
            friction: 0.3,
            restitution: 0.2,
            airResistance: 0,
            rotation: 0,
            angularVelocity: 0,
            isStatic: false,
          },
        ],
        settings: {
          gravity: true,
          showVectors: false,
        },
      },

      "zero-gravity": {
        name: "Zero Gravity",
        description: "Objects floating in zero gravity environment",
        objects: [
          {
            shape: "circle",
            name: "Floating Ball 1",
            color: "#E91E63",
            radius: 25,
            x: 200,
            y: 200,
            mass: 1,
            friction: 0.1,
            restitution: 0.9,
            airResistance: 0.01,
            rotation: 0,
            angularVelocity: 1,
            isStatic: false,
          },
          {
            shape: "rectangle",
            name: "Floating Block",
            color: "#00BCD4",
            width: 60,
            height: 40,
            x: 400,
            y: 300,
            mass: 2,
            friction: 0.1,
            restitution: 0.8,
            airResistance: 0.005,
            rotation: 45,
            angularVelocity: 0.5,
            isStatic: false,
          },
          {
            shape: "polygon",
            name: "Spinning Hexagon",
            color: "#8BC34A",
            width: 50,
            height: 50,
            x: 600,
            y: 250,
            mass: 1.5,
            friction: 0.1,
            restitution: 0.7,
            airResistance: 0.002,
            rotation: 0,
            angularVelocity: 3,
            isStatic: false,
          },
        ],
        settings: {
          gravity: false,
          showVectors: true,
        },
      },
    };
  }

  // Load preset scene
  loadPresetScene(presetKey) {
    const presets = this.getPresetScenes();
    const preset = presets[presetKey];

    if (preset) {
      const scene = {
        id: presetKey,
        name: preset.name,
        description: preset.description,
        objects: preset.objects,
        settings: preset.settings,
        metadata: {
          createdAt: new Date().toISOString(),
          version: "1.0",
          isPreset: true,
        },
      };

      return this.loadScene(scene);
    }

    return false;
  }

  // Get scene statistics
  getSceneStatistics() {
    if (!this.currentScene) {
      return null;
    }

    const stats = this.objectManager.getStatistics();

    return {
      sceneName: this.currentScene.name,
      totalObjects: stats.total,
      objectTypes: stats.byType,
      staticObjects: stats.staticCount,
      dynamicObjects: stats.dynamicCount,
      averageMass: stats.averageMass,
      averageFriction: stats.averageFriction,
      averageElasticity: stats.averageElasticity,
      gravity: this.physicsEngine.engine.world.gravity.y !== 0,
      showVectors: this.physicsEngine.showVectors,
    };
  }

  // Validate scene data
  validateSceneData(sceneData) {
    const errors = [];

    if (!sceneData.name) {
      errors.push("Scene name is required");
    }

    if (!Array.isArray(sceneData.objects)) {
      errors.push("Scene must have an objects array");
    } else {
      sceneData.objects.forEach((obj, index) => {
        const validation = this.objectManager.validateConfig(obj);
        if (!validation.isValid) {
          errors.push(`Object ${index + 1}: ${validation.errors.join(", ")}`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }

  // Generate unique scene ID
  generateSceneId() {
    return (
      "scene_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
    );
  }

  // Get current scene
  getCurrentScene() {
    return this.currentScene;
  }

  // Check if current scene is modified
  isSceneModified() {
    if (!this.currentScene) {
      return false;
    }

    const currentObjects = this.physicsEngine.getAllObjects();
    const savedObjects = this.currentScene.objects || [];

    if (currentObjects.length !== savedObjects.length) {
      return true;
    }

    // Compare object properties
    for (let i = 0; i < currentObjects.length; i++) {
      const current = currentObjects[i];
      const saved = savedObjects[i];

      if (
        current.name !== saved.name ||
        current.color !== saved.color ||
        JSON.stringify(current.config) !== JSON.stringify(saved)
      ) {
        return true;
      }
    }

    return false;
  }

  // Auto-save scene (for future implementation)
  autoSave() {
    if (this.isSceneModified()) {
      this.saveCurrentScene();
      // Could save to localStorage or send to server
      console.log("Scene auto-saved");
    }
  }

  // Get scene history (for future implementation)
  getSceneHistory() {
    // This could be implemented to track scene changes over time
    return [];
  }
}
