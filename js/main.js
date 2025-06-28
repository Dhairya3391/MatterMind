// Main application entry point
class MatterMindApp {
  constructor() {
    this.physicsEngine = null;
    this.objectManager = null;
    this.uiController = null;
    this.sceneManager = null;

    this.isInitialized = false;
    this.isRunning = false;
  }

  async initialize() {
    try {
      console.log("🚀 Initializing MatterMind Physics Simulation...");

      // Wait for DOM to be ready
      if (document.readyState === "loading") {
        await new Promise((resolve) => {
          document.addEventListener("DOMContentLoaded", resolve);
        });
      }

      // Initialize modules
      this.initializeModules();

      // Set up event listeners
      this.setupGlobalEventListeners();

      // Start the application
      this.start();

      this.isInitialized = true;
      console.log("✅ MatterMind initialized successfully!");
    } catch (error) {
      console.error("❌ Failed to initialize MatterMind:", error);
      this.showError("Failed to initialize application: " + error.message);
    }
  }

  initializeModules() {
    // Initialize physics engine
    this.physicsEngine = new PhysicsEngine("physicsCanvas");

    // Initialize object manager
    this.objectManager = new ObjectManager();

    // Initialize scene manager
    this.sceneManager = new SceneManager(
      this.physicsEngine,
      this.objectManager
    );

    // Initialize UI controller
    this.uiController = new UIController(
      this.physicsEngine,
      this.objectManager
    );

    // Link modules together
    this.linkModules();
  }

  linkModules() {
    // Set up callbacks between modules
    this.physicsEngine.onObjectSelected = (body) => {
      this.uiController.onObjectSelected(body);
    };

    // Set up scene manager callbacks
    this.sceneManager.onSceneLoaded = () => {
      this.uiController.updateObjectList();
      this.uiController.updateInfoPanel();
    };
  }

  setupGlobalEventListeners() {
    // Handle window resize
    window.addEventListener("resize", () => {
      if (this.physicsEngine) {
        this.physicsEngine.resizeCanvas();
      }
    });

    // Handle keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      this.handleKeyboardShortcuts(e);
    });

    // Handle beforeunload to warn about unsaved changes
    window.addEventListener("beforeunload", (e) => {
      if (this.sceneManager && this.sceneManager.isSceneModified()) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    });

    // Handle visibility change for performance
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.pauseSimulation();
      } else {
        this.resumeSimulation();
      }
    });
  }

  handleKeyboardShortcuts(e) {
    // Only handle shortcuts when not typing in input fields
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      return;
    }

    switch (e.key.toLowerCase()) {
      case " ": // Spacebar - pause/play
        e.preventDefault();
        this.uiController.togglePause();
        break;

      case "r": // R - reset
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.uiController.resetSimulation();
        }
        break;

      case "g": // G - toggle gravity
        e.preventDefault();
        const gravityToggle = document.getElementById("gravityToggle");
        if (gravityToggle) {
          gravityToggle.checked = !gravityToggle.checked;
          this.uiController.toggleGravity(gravityToggle.checked);
        }
        break;

      case "v": // V - toggle vectors
        e.preventDefault();
        const showVectors = document.getElementById("showVectors");
        if (showVectors) {
          showVectors.checked = !showVectors.checked;
          this.physicsEngine.setShowVectors(showVectors.checked);
        }
        break;

      case "escape": // Escape - deselect object
        e.preventDefault();
        this.physicsEngine.selectObject(null);
        break;

      case "delete": // Delete - delete selected object
      case "backspace":
        e.preventDefault();
        const selectedObject = this.physicsEngine.getSelectedObject();
        if (selectedObject) {
          this.uiController.deleteObject(selectedObject.id);
        }
        break;
    }
  }

  start() {
    if (this.isRunning) return;

    try {
      // Start physics engine
      this.physicsEngine.start();

      // Start UI updates
      this.uiController.startInfoUpdates();

      // Load a demo scene
      this.loadDemoScene();

      this.isRunning = true;
      console.log("🎮 MatterMind simulation started!");
    } catch (error) {
      console.error("❌ Failed to start simulation:", error);
      this.showError("Failed to start simulation: " + error.message);
    }
  }

  loadDemoScene() {
    // Load a preset scene for demonstration
    const presets = this.sceneManager.getPresetScenes();
    const demoKey = "collision-demo";

    if (presets[demoKey]) {
      this.sceneManager.loadPresetScene(demoKey);
      console.log(`📋 Loaded demo scene: ${presets[demoKey].name}`);
    }
  }

  pauseSimulation() {
    if (this.physicsEngine && this.physicsEngine.engine.enabled) {
      this.physicsEngine.togglePause();
      console.log("⏸️ Simulation paused");
    }
  }

  resumeSimulation() {
    if (this.physicsEngine && !this.physicsEngine.engine.enabled) {
      this.physicsEngine.togglePause();
      console.log("▶️ Simulation resumed");
    }
  }

  showError(message) {
    // Create error notification
    const notification = document.createElement("div");
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
            font-family: Arial, sans-serif;
        `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }

  showSuccess(message) {
    // Create success notification
    const notification = document.createElement("div");
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
            font-family: Arial, sans-serif;
        `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  // Public API methods
  getPhysicsEngine() {
    return this.physicsEngine;
  }

  getObjectManager() {
    return this.objectManager;
  }

  getUIController() {
    return this.uiController;
  }

  getSceneManager() {
    return this.sceneManager;
  }

  // Utility methods
  getAppInfo() {
    return {
      name: "MatterMind",
      version: "1.0.0",
      description: "Interactive Physics Simulation Platform",
      isInitialized: this.isInitialized,
      isRunning: this.isRunning,
      objectCount: this.physicsEngine ? this.physicsEngine.getObjectCount() : 0,
      fps: this.physicsEngine ? this.physicsEngine.getFPS() : 0,
    };
  }

  // Debug methods
  debugInfo() {
    console.log("🔍 MatterMind Debug Info:", this.getAppInfo());

    if (this.physicsEngine) {
      console.log("📊 Physics Engine Stats:", {
        objectCount: this.physicsEngine.getObjectCount(),
        fps: this.physicsEngine.getFPS(),
        gravity: this.physicsEngine.engine.world.gravity,
        showVectors: this.physicsEngine.showVectors,
      });
    }

    if (this.objectManager) {
      console.log(
        "📦 Object Manager Stats:",
        this.objectManager.getStatistics()
      );
    }

    if (this.sceneManager) {
      console.log(
        "🎬 Scene Manager Stats:",
        this.sceneManager.getSceneStatistics()
      );
    }
  }
}

// Global app instance
let matterMindApp;

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  matterMindApp = new MatterMindApp();
  matterMindApp.initialize();
});

// Expose app globally for debugging
window.MatterMindApp = MatterMindApp;
window.matterMindApp = matterMindApp;

// Add some helpful console messages
console.log(`
🧠 MatterMind Physics Simulation
================================
Welcome to the interactive physics simulation platform!

🎮 Controls:
- Spacebar: Pause/Play simulation
- G: Toggle gravity
- V: Toggle velocity vectors
- R: Reset simulation
- Escape: Deselect object
- Delete: Delete selected object

📋 Features:
- Create objects with different shapes and properties
- Real-time physics simulation
- Object selection and editing
- Scene saving and loading
- Preset demonstrations

🔧 For debugging, use: matterMindApp.debugInfo()
`);

// Handle any unhandled errors
window.addEventListener("error", (event) => {
  console.error("❌ Unhandled error:", event.error);
  if (matterMindApp) {
    matterMindApp.showError(
      "An unexpected error occurred: " + event.error.message
    );
  }
});

// Handle unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  console.error("❌ Unhandled promise rejection:", event.reason);
  if (matterMindApp) {
    matterMindApp.showError("An unexpected error occurred: " + event.reason);
  }
});
