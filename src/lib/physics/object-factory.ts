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
  polygonSides?: number;
  isStar?: boolean;
  isRope?: boolean;
  ropeSegments?: Matter.Body[];
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
      // Create a hexagon using circle with custom rendering
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
      (body as ExtendedMatterBody).polygonSides = 6;
      break;

    case "triangle":
      // Create a triangle using polygon vertices
      const triangleRadius = radius || 25;
      const triangleVertices = [
        { x: 0, y: -triangleRadius },
        {
          x: -triangleRadius * Math.cos(Math.PI / 6),
          y: triangleRadius * Math.sin(Math.PI / 6),
        },
        {
          x: triangleRadius * Math.cos(Math.PI / 6),
          y: triangleRadius * Math.sin(Math.PI / 6),
        },
      ];

      body = Bodies.fromVertices(x, y, [triangleVertices], {
        isStatic,
        friction,
        restitution,
        density: calculatedDensity,
        angle: (rotation * Math.PI) / 180,
      });

      // Mark as polygon for custom rendering
      (body as ExtendedMatterBody).isPolygon = true;
      (body as ExtendedMatterBody).polygonRadius = triangleRadius;
      (body as ExtendedMatterBody).polygonSides = 3;
      break;

    case "pentagon":
      // Create a pentagon using polygon vertices
      const pentagonRadius = radius || 25;
      const pentagonVertices = [];
      const sides = 5;

      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2; // Start from top
        pentagonVertices.push({
          x: pentagonRadius * Math.cos(angle),
          y: pentagonRadius * Math.sin(angle),
        });
      }

      body = Bodies.fromVertices(x, y, [pentagonVertices], {
        isStatic,
        friction,
        restitution,
        density: calculatedDensity,
        angle: (rotation * Math.PI) / 180,
      });

      // Mark as polygon for custom rendering
      (body as ExtendedMatterBody).isPolygon = true;
      (body as ExtendedMatterBody).polygonRadius = pentagonRadius;
      (body as ExtendedMatterBody).polygonSides = 5;
      break;

    case "star":
      // Create a star using polygon vertices
      const starRadius = radius || 25;
      const starVertices = [];
      const starPoints = 5;
      const innerRadius = starRadius * 0.4;

      for (let i = 0; i < starPoints * 2; i++) {
        const angle = (i * Math.PI) / starPoints - Math.PI / 2;
        const currentRadius = i % 2 === 0 ? starRadius : innerRadius;
        starVertices.push({
          x: currentRadius * Math.cos(angle),
          y: currentRadius * Math.sin(angle),
        });
      }

      body = Bodies.fromVertices(x, y, [starVertices], {
        isStatic,
        friction,
        restitution,
        density: calculatedDensity,
        angle: (rotation * Math.PI) / 180,
      });

      // Mark as polygon for custom rendering
      (body as ExtendedMatterBody).isPolygon = true;
      (body as ExtendedMatterBody).polygonRadius = starRadius;
      (body as ExtendedMatterBody).polygonSides = starPoints * 2;
      (body as ExtendedMatterBody).isStar = true;
      break;

    case "rope":
      // Create a rope using multiple connected circles
      const ropeRadius = radius || 8;
      const ropeLength = 6;
      const ropeSegments = [];

      for (let i = 0; i < ropeLength; i++) {
        const segment = Bodies.circle(x + i * ropeRadius * 1.5, y, ropeRadius, {
          isStatic: i === 0, // Only first segment is static
          friction,
          restitution,
          density: calculatedDensity,
          angle: (rotation * Math.PI) / 180,
        });
        ropeSegments.push(segment);
      }

      // Connect segments with constraints (simplified - just return first segment)
      body = ropeSegments[0];
      (body as ExtendedMatterBody).isRope = true;
      (body as ExtendedMatterBody).ropeSegments = ropeSegments;
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
    case "triangle":
      // Equilateral triangle area
      return (Math.sqrt(3) / 4) * (radius || 0) * (radius || 0);
    case "pentagon":
      // Regular pentagon area
      return (5 / 4) * (radius || 0) * (radius || 0) * Math.tan(Math.PI / 5);
    case "star":
      // Approximate star area (simplified)
      return Math.PI * (radius || 0) * (radius || 0) * 0.6;
    case "rope":
      // Rope area (single segment)
      return Math.PI * (radius || 0) * (radius || 0);
    default:
      return 1;
  }
}
