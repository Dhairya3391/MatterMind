import { useEffect, useRef } from "react";

export default function Canvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      canvas.width = window.innerWidth * 0.9;
      canvas.height = window.innerHeight * 0.9;

      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <canvas ref={canvasRef} className="border border-gray-700 shadow-lg" />
    </div>
  );
}
