import Matter from "matter-js";
const { Bodies, Body } = Matter;
import type { ObjectConfig, PhysicsObject } from "$lib/types/physics.types";

// Extended Matter.js body interface
interface ExtendedMatterBody extends Matter.Body {
  airResistance?: number;
  isHollow?: boolean;
  material?: string;
  tags?: string[];
  isPolygon?: boolean;
  polygonRadius?: number;
}

export function createObject(config: ObjectConfig): Matter.Body | null {
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
    initialVelocityX,
    initialVelocityY,
    isHollow,
    material,
    tags,
    x,
    y,
  } = config;

  // Calculate density if not provided
  let calculatedDensity = density;
  if (!calculatedDensity) {
    const area = calculateArea(shape, width, height, radius);
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
      (body as ExtendedMatterBody).isPolygon = true;
      (body as ExtendedMatterBody).polygonRadius = radius;
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
    (body as ExtendedMatterBody).airResistance = airResistance || 0;
    (body as ExtendedMatterBody).isHollow = isHollow || false;
    (body as ExtendedMatterBody).material = material;
    (body as ExtendedMatterBody).tags = tags || [];

    return body;
  }

  return null;
}

function calculateArea(
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
