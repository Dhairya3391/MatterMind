class ObjectManager {
  constructor() {
    this.objects = new Map();
    this.objectCounter = 0;
  }

  addObject(body, config) {
    const objectData = {
      id: body.id,
      body: body,
      config: { ...config },
      createdAt: new Date(),
      lastModified: new Date(),
    };

    this.objects.set(body.id, objectData);
    this.objectCounter++;

    return objectData;
  }

  getObject(objectId) {
    return this.objects.get(objectId);
  }

  getAllObjects() {
    return Array.from(this.objects.values());
  }

  updateObject(objectId, config) {
    const objectData = this.objects.get(objectId);
    if (objectData) {
      objectData.config = { ...config };
      objectData.lastModified = new Date();
      return true;
    }
    return false;
  }

  removeObject(objectId) {
    const removed = this.objects.delete(objectId);
    if (removed) {
      this.objectCounter--;
    }
    return removed;
  }

  clearObjects() {
    this.objects.clear();
    this.objectCounter = 0;
  }

  getObjectCount() {
    return this.objects.size;
  }

  getObjectsByType(type) {
    return Array.from(this.objects.values()).filter(
      (obj) => obj.config.shape === type
    );
  }

  getStaticObjects() {
    return Array.from(this.objects.values()).filter(
      (obj) => obj.config.isStatic
    );
  }

  getDynamicObjects() {
    return Array.from(this.objects.values()).filter(
      (obj) => !obj.config.isStatic
    );
  }

  getObjectsByProperty(property, value) {
    return Array.from(this.objects.values()).filter(
      (obj) => obj.config[property] === value
    );
  }

  getObjectsInRange(x, y, radius) {
    return Array.from(this.objects.values()).filter((obj) => {
      const body = obj.body;
      const distance = Math.sqrt(
        Math.pow(body.position.x - x, 2) + Math.pow(body.position.y - y, 2)
      );
      return distance <= radius;
    });
  }

  // Get objects with specific mass range
  getObjectsByMassRange(minMass, maxMass) {
    return Array.from(this.objects.values()).filter((obj) => {
      const mass = obj.config.mass;
      return mass >= minMass && mass <= maxMass;
    });
  }

  // Get objects with specific friction range
  getObjectsByFrictionRange(minFriction, maxFriction) {
    return Array.from(this.objects.values()).filter((obj) => {
      const friction = obj.config.friction;
      return friction >= minFriction && friction <= maxFriction;
    });
  }

  // Get objects with specific elasticity range
  getObjectsByElasticityRange(minElasticity, maxElasticity) {
    return Array.from(this.objects.values()).filter((obj) => {
      const elasticity = obj.config.restitution;
      return elasticity >= minElasticity && elasticity <= maxElasticity;
    });
  }

  // Get objects by color
  getObjectsByColor(color) {
    return Array.from(this.objects.values()).filter(
      (obj) => obj.config.color === color
    );
  }

  // Get objects by name (partial match)
  getObjectsByName(name) {
    const searchTerm = name.toLowerCase();
    return Array.from(this.objects.values()).filter((obj) =>
      obj.config.name.toLowerCase().includes(searchTerm)
    );
  }

  // Get object statistics
  getStatistics() {
    const objects = Array.from(this.objects.values());

    if (objects.length === 0) {
      return {
        total: 0,
        byType: {},
        averageMass: 0,
        averageFriction: 0,
        averageElasticity: 0,
        staticCount: 0,
        dynamicCount: 0,
      };
    }

    const stats = {
      total: objects.length,
      byType: {},
      averageMass: 0,
      averageFriction: 0,
      averageElasticity: 0,
      staticCount: 0,
      dynamicCount: 0,
    };

    let totalMass = 0;
    let totalFriction = 0;
    let totalElasticity = 0;

    objects.forEach((obj) => {
      // Count by type
      const type = obj.config.shape;
      stats.byType[type] = (stats.byType[type] || 0) + 1;

      // Count static vs dynamic
      if (obj.config.isStatic) {
        stats.staticCount++;
      } else {
        stats.dynamicCount++;
      }

      // Sum properties for averages
      totalMass += obj.config.mass;
      totalFriction += obj.config.friction;
      totalElasticity += obj.config.restitution;
    });

    // Calculate averages
    stats.averageMass = totalMass / objects.length;
    stats.averageFriction = totalFriction / objects.length;
    stats.averageElasticity = totalElasticity / objects.length;

    return stats;
  }

  // Export objects data
  exportData() {
    return Array.from(this.objects.values()).map((obj) => ({
      id: obj.id,
      name: obj.config.name,
      color: obj.config.color,
      config: obj.config,
      createdAt: obj.createdAt,
      lastModified: obj.lastModified,
    }));
  }

  // Import objects data
  importData(data) {
    this.clearObjects();

    data.forEach((objData) => {
      // Note: We don't recreate the body here as that should be done by the physics engine
      // This just stores the metadata
      const objectData = {
        id: objData.id,
        body: null, // Will be set when body is created
        config: objData.config,
        createdAt: new Date(objData.createdAt),
        lastModified: new Date(objData.lastModified),
      };

      this.objects.set(objData.id, objectData);
    });

    this.objectCounter = this.objects.size;
  }

  // Link body to object data (used when recreating objects)
  linkBody(objectId, body) {
    const objectData = this.objects.get(objectId);
    if (objectData) {
      objectData.body = body;
      return true;
    }
    return false;
  }

  // Get objects that need to be recreated (have no body)
  getUnlinkedObjects() {
    return Array.from(this.objects.values()).filter((obj) => obj.body === null);
  }

  // Validate object configuration
  validateConfig(config) {
    const errors = [];

    // Required fields
    if (!config.shape) {
      errors.push("Shape is required");
    }

    if (!config.name) {
      errors.push("Name is required");
    }

    // Shape-specific validation
    if (config.shape === "circle") {
      if (!config.radius || config.radius <= 0) {
        errors.push("Circle radius must be positive");
      }
    } else if (config.shape === "rectangle" || config.shape === "polygon") {
      if (!config.width || config.width <= 0) {
        errors.push("Width must be positive");
      }
      if (!config.height || config.height <= 0) {
        errors.push("Height must be positive");
      }
    }

    // Physics properties validation
    if (config.mass !== undefined && config.mass <= 0) {
      errors.push("Mass must be positive");
    }

    if (
      config.friction !== undefined &&
      (config.friction < 0 || config.friction > 1)
    ) {
      errors.push("Friction must be between 0 and 1");
    }

    if (
      config.restitution !== undefined &&
      (config.restitution < 0 || config.restitution > 1)
    ) {
      errors.push("Elasticity must be between 0 and 1");
    }

    if (config.airResistance !== undefined && config.airResistance < 0) {
      errors.push("Air resistance must be non-negative");
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }

  // Get default configuration for a shape
  getDefaultConfig(shape) {
    const defaults = {
      rectangle: {
        shape: "rectangle",
        name: "Rectangle",
        color: "#4CAF50",
        width: 50,
        height: 50,
        mass: 1,
        friction: 0.1,
        restitution: 0.5,
        airResistance: 0,
        rotation: 0,
        angularVelocity: 0,
        isStatic: false,
      },
      circle: {
        shape: "circle",
        name: "Circle",
        color: "#2196F3",
        radius: 25,
        mass: 1,
        friction: 0.1,
        restitution: 0.5,
        airResistance: 0,
        rotation: 0,
        angularVelocity: 0,
        isStatic: false,
      },
      polygon: {
        shape: "polygon",
        name: "Polygon",
        color: "#FF9800",
        width: 50,
        height: 50,
        mass: 1,
        friction: 0.1,
        restitution: 0.5,
        airResistance: 0,
        rotation: 0,
        angularVelocity: 0,
        isStatic: false,
      },
    };

    return defaults[shape] ? { ...defaults[shape] } : null;
  }
}
