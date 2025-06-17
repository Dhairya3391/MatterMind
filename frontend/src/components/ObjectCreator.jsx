import React, { useState } from "react";

const ObjectCreator = ({ onCreateObject }) => {
  const [formData, setFormData] = useState({
    name: "",
    shapeType: "rectangle",
    mass: 1,
    width: 50,
    height: 50,
    positionX: 0,
    positionY: 0,
    velocityX: 0,
    velocityY: 0,
    rotation: 0,
    color: "#3B82F6",
    material: "default",
    density: 1,
    buoyancy: false,
    windResistance: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateObject(formData);
    // Reset form after creation
    setFormData({
      name: "",
      shapeType: "rectangle",
      mass: 1,
      width: 50,
      height: 50,
      positionX: 0,
      positionY: 0,
      velocityX: 0,
      velocityY: 0,
      rotation: 0,
      color: "#3B82F6",
      material: "default",
      density: 1,
      buoyancy: false,
      windResistance: false,
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Create Physics Object
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Object name"
          />
        </div>

        {/* Shape Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Shape Type
          </label>
          <select
            name="shapeType"
            value={formData.shapeType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="rectangle">Rectangle</option>
            <option value="circle">Circle</option>
            <option value="polygon">Polygon</option>
          </select>
        </div>

        {/* Physical Properties */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Mass (kg)
            </label>
            <input
              type="number"
              name="mass"
              value={formData.mass}
              onChange={handleChange}
              min="0"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Density (kg/m²)
            </label>
            <input
              type="number"
              name="density"
              value={formData.density}
              onChange={handleChange}
              min="0"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Width (px)
            </label>
            <input
              type="number"
              name="width"
              value={formData.width}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Height (px)
            </label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Position */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Position X
            </label>
            <input
              type="number"
              name="positionX"
              value={formData.positionX}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Position Y
            </label>
            <input
              type="number"
              name="positionY"
              value={formData.positionY}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Velocity */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Velocity X
            </label>
            <input
              type="number"
              name="velocityX"
              value={formData.velocityX}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Velocity Y
            </label>
            <input
              type="number"
              name="velocityY"
              value={formData.velocityY}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Rotation */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Rotation (degrees)
          </label>
          <input
            type="number"
            name="rotation"
            value={formData.rotation}
            onChange={handleChange}
            min="0"
            max="360"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Material and Color */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Material
            </label>
            <select
              name="material"
              value={formData.material}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="default">Default</option>
              <option value="rubber">Rubber</option>
              <option value="wood">Wood</option>
              <option value="metal">Metal</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Color
            </label>
            <input
              type="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-full h-10 px-1 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Advanced Properties */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="buoyancy"
              checked={formData.buoyancy}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-gray-700">
              Enable Buoyancy
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="windResistance"
              checked={formData.windResistance}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-gray-700">
              Enable Wind Resistance
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Create Object
        </button>
      </form>
    </div>
  );
};

export default ObjectCreator;
