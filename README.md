# MatterMind - Interactive Physics Simulation

A modern, interactive physics simulation platform built with **SvelteKit** and **Matter.js**. Create, customize, and experiment with realistic 2D physical objects in a beautiful, responsive interface.

## ✨ Features

- **🎮 Interactive Physics Engine**: Real-time physics simulation with Matter.js
- **🎨 Beautiful UI**: Modern design with DaisyUI and Tailwind CSS
- **📦 Object Management**: Create, edit, and delete physics objects
- **🎯 Material Presets**: Pre-configured materials (wood, metal, rubber, plastic, stone)
- **📐 Vector Visualization**: Toggle velocity vectors for better understanding
- **🌍 Gravity Control**: Enable/disable gravity simulation
- **🎪 Multiple Shapes**: Rectangle, circle, and polygon objects
- **🏷️ Custom Properties**: Mass, density, friction, elasticity, air resistance
- **⚡ Real-time Preview**: See objects before creating them
- **📱 Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd MatterMind

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Architecture

### Component Structure

The application follows a modular component architecture:

```
src/lib/components/
├── Header.svelte           # Application header with stats
├── Sidebar.svelte          # Main sidebar with tabs
├── PhysicsCanvas.svelte    # Physics simulation canvas
├── SimulationControls.svelte # Simulation control buttons
├── ObjectForm.svelte       # Object creation/editing form
├── ObjectsList.svelte      # List of created objects
└── FloatingToolbar.svelte  # Floating toolbar with tools and controls
```

### State Management

Uses Svelte stores for reactive state management:

- `physicsStore`: Simulation state (running, gravity, vectors, FPS)
- `objectsStore`: List of physics objects
- `selectedObjectStore`: Currently selected object
- `sceneStore`: Scene data and presets

### Physics Engine

Custom physics engine wrapper around Matter.js with:

- Object creation and management
- Custom rendering with colors and labels
- Vector visualization
- Object selection and interaction
- Performance monitoring

## 🎮 Usage

### Creating Objects

1. **Select Shape**: Choose from rectangle, circle, or polygon
2. **Set Properties**: Configure mass, friction, elasticity, etc.
3. **Choose Material**: Use presets or create custom materials
4. **Preview**: See the object before creating it
5. **Create**: Click "Create Object" to add to simulation

### Simulation Controls

- **Play/Pause**: Toggle simulation running state
- **Reset**: Clear all objects and restart
- **Gravity**: Enable/disable gravity
- **Vectors**: Show/hide velocity vectors
- **Preset Objects**: Create demo objects automatically

### Object Interaction

- **Click**: Select objects to edit their properties
- **Drag**: Move objects around the canvas
- **Edit**: Modify properties in the sidebar
- **Delete**: Remove objects from simulation

## 🎨 Customization

### Material Presets

The application includes pre-configured materials:

- **Wood**: Natural, moderate friction
- **Metal**: Dense, low friction, high elasticity
- **Rubber**: Elastic, high friction
- **Plastic**: Lightweight, moderate properties
- **Stone**: Heavy, high friction, low elasticity

### Custom Materials

Create custom materials by setting:

- Density (kg/m²)
- Friction coefficient (0-1)
- Elasticity/restitution (0-1)
- Color and tags

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm run dev          # Start development server
pnpm run build        # Build for production
pnpm run preview      # Preview production build

# Code Quality
pnpm run check        # TypeScript and Svelte checking
pnpm run lint         # Lint code
pnpm run format       # Format code with Prettier
```

### Tech Stack

- **Frontend**: SvelteKit 2.0
- **Styling**: Tailwind CSS 4.0 + DaisyUI
- **Physics**: Matter.js
- **Language**: TypeScript
- **Package Manager**: pnpm
- **Build Tool**: Vite

### Project Structure

```
MatterMind/
├── src/
│   ├── lib/
│   │   ├── components/     # Svelte components
│   │   ├── physics/        # Physics engine
│   │   ├── stores/         # State management
│   │   └── types/          # TypeScript types
│   ├── routes/             # SvelteKit routes
│   └── app.html            # HTML template
├── static/                 # Static assets
└── package.json           # Dependencies and scripts
```

## 🎯 Physics Concepts

The simulation demonstrates various physics concepts:

- **Gravity**: Objects fall under gravitational force
- **Collisions**: Realistic collision detection and response
- **Friction**: Objects slow down due to surface friction
- **Elasticity**: Objects bounce based on material properties
- **Momentum**: Conservation of momentum in collisions
- **Air Resistance**: Optional drag forces

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Matter.js](https://brm.io/matter-js/) - 2D physics engine
- [SvelteKit](https://kit.svelte.dev/) - Full-stack web framework
- [DaisyUI](https://daisyui.com/) - Component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

---

**Built with ❤️ using modern web technologies**

### Keyboard Shortcuts

The application supports various keyboard shortcuts for quick access:

#### Tool Selection

- **Q** - Select tool
- **R** - Rectangle tool
- **C** - Circle tool
- **P** - Polygon tool
- **T** - Triangle tool
- **N** - Pentagon tool
- **S** - Star tool
- **O** - Rope tool

#### Physics Controls

- **Space** - Play/Pause simulation
- **G** - Toggle gravity
- **V** - Toggle velocity vectors
- **B** - Toggle boundaries
- **Ctrl+R** - Reset simulation

#### Interface

- **Tab** - Toggle sidebar
- **Escape** - Deselect object
- **Delete/Backspace** - Delete selected object

#### Object Interaction

- **Click** - Select objects
- **Drag** - Move objects
- **Ctrl+Click** - Multi-select (coming soon)
