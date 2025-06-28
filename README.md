# 🧠 MatterMind - Interactive Physics Simulation

A browser-based interactive physics simulation platform where users can create, customize, and experiment with realistic 2D physical objects using the Matter.js physics engine.

## ✨ Features

### 🎮 Core Physics Simulation

- **Real-time 2D physics** using Matter.js engine
- **Multiple object shapes**: Rectangle, Circle, Polygon (hexagon)
- **Configurable properties**: Mass, density, friction, elasticity, air resistance
- **Gravity simulation** with toggle on/off
- **Collision detection** and realistic physics responses
- **Object rotation** and angular velocity support

### 🎨 User Interface

- **Modern, responsive sidebar** with intuitive controls
- **Real-time object creation** with live property editing
- **Object selection** by clicking on canvas or sidebar
- **Visual feedback** with colored objects and selection highlighting
- **Velocity vector visualization** with speed indicators
- **Performance monitoring** with FPS and object count display

### 🔧 Object Management

- **Create objects** with customizable properties:

  - Shape (rectangle, circle, polygon)
  - Dimensions (width, height, radius)
  - Mass and density
  - Friction coefficient (0-1)
  - Elasticity/restitution (0-1)
  - Air resistance
  - Static/dynamic behavior
  - Initial rotation and angular velocity
  - Custom colors and labels

- **Edit existing objects** with real-time property updates
- **Delete objects** with confirmation
- **Object list** with search and filtering capabilities

### 💾 Scene Management

- **Save scenes** as JSON files
- **Load scenes** from JSON files
- **Preset demonstrations**:
  - Collision Demo: Shows different material properties
  - Pendulum Demo: Simple pendulum physics
  - Stacking Demo: Object stacking and stability
  - Zero Gravity: Objects in space-like environment
- **Scene validation** and error handling

### ⌨️ Keyboard Shortcuts

- **Spacebar**: Pause/Play simulation
- **G**: Toggle gravity on/off
- **V**: Toggle velocity vectors
- **R** (Ctrl/Cmd): Reset simulation
- **Escape**: Deselect object
- **Delete/Backspace**: Delete selected object

## 🚀 Getting Started

### Prerequisites

- Modern web browser with HTML5 Canvas support
- No additional software installation required

### Installation

1. Clone or download the repository
2. Open `index.html` in your web browser
3. The application will automatically load with a demo scene

### Quick Start Guide

1. **Create Objects**: Use the sidebar to configure and create objects
2. **Experiment**: Adjust properties and observe physics behavior
3. **Save/Load**: Use scene management to save your experiments
4. **Explore Presets**: Try the built-in demonstration scenes

## 🏗️ Architecture

The application is built with a modular architecture:

### Core Modules

- **`PhysicsEngine`**: Handles Matter.js physics simulation and rendering
- **`UIController`**: Manages user interface and interactions
- **`ObjectManager`**: Handles object data and metadata
- **`SceneManager`**: Manages scene saving/loading and presets

### File Structure

```
MatterMind/
├── index.html          # Main HTML file
├── styles.css          # Application styling
├── js/
│   ├── main.js         # Application entry point
│   ├── physics-engine.js    # Physics simulation engine
│   ├── ui-controller.js     # User interface controller
│   ├── object-manager.js    # Object data management
│   └── scene-manager.js     # Scene management
├── definition.txt      # Project requirements
├── LICENSE            # MIT License
└── README.md          # This file
```

## 🎯 Physics Concepts Implemented

### Core Physics

- **Gravity**: Configurable gravitational force
- **Collision Mechanics**: Realistic collision detection and response
- **Friction**: Surface friction affecting object movement
- **Elasticity**: Bounce behavior based on restitution coefficient
- **Mass-Density Relationship**: Objects with different masses and densities
- **Angular Momentum**: Rotation and angular velocity support

### Advanced Features

- **Air Resistance**: Drag forces affecting object movement
- **Static Objects**: Immovable objects (walls, floors)
- **Vector Visualization**: Real-time velocity and force display
- **Performance Optimization**: Efficient rendering and physics calculations

## 🎨 Customization

### Object Properties

Each object can be configured with:

- **Physical Properties**: Mass, friction, elasticity, air resistance
- **Visual Properties**: Color, shape, size
- **Behavioral Properties**: Static/dynamic, rotation, angular velocity
- **Metadata**: Name, creation time, modification history

### Scene Configuration

- **Gravity Settings**: Enable/disable and configure gravity
- **Visual Settings**: Toggle vector display, object labels
- **Performance Settings**: FPS monitoring and optimization

## 🔧 Technical Details

### Technologies Used

- **HTML5 Canvas**: For rendering the physics simulation
- **Matter.js**: 2D physics engine for realistic physics simulation
- **Vanilla JavaScript**: ES6+ features for modern development
- **CSS3**: Modern styling with animations and responsive design

### Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Performance

- **60 FPS** target for smooth simulation
- **Efficient rendering** with custom canvas drawing
- **Optimized physics calculations** using Matter.js
- **Responsive design** for different screen sizes

## 📚 API Reference

### PhysicsEngine Class

```javascript
// Create physics engine
const engine = new PhysicsEngine("canvasId");

// Create object
const body = engine.createObject({
  shape: "rectangle",
  width: 50,
  height: 50,
  mass: 1,
  friction: 0.1,
  restitution: 0.5,
});

// Control simulation
engine.setGravity(true);
engine.togglePause();
engine.setShowVectors(true);
```

### ObjectManager Class

```javascript
// Add object
objectManager.addObject(body, config);

// Get statistics
const stats = objectManager.getStatistics();

// Query objects
const heavyObjects = objectManager.getObjectsByMassRange(5, 10);
```

### SceneManager Class

```javascript
// Save scene
const scene = sceneManager.saveCurrentScene();

// Load scene
sceneManager.loadScene(sceneData);

// Load preset
sceneManager.loadPresetScene("collision-demo");
```

## 🎓 Educational Use

This application is perfect for:

- **Physics Education**: Demonstrating concepts like gravity, momentum, collisions
- **Interactive Learning**: Hands-on experimentation with physics principles
- **Research**: Prototyping physics-based simulations
- **Entertainment**: Creating fun physics-based games and demonstrations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Matter.js** team for the excellent physics engine
- **HTML5 Canvas** for powerful rendering capabilities
- **Open source community** for inspiration and tools

## 📞 Support

For questions, issues, or feature requests:

- Open an issue on GitHub
- Check the console for debugging information
- Use `matterMindApp.debugInfo()` in browser console for detailed stats

---

**Happy Physics Experimenting! 🧠⚡**
