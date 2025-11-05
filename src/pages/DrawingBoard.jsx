import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, Eraser, Download, Trash2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const colors = [
  "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF",
  "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500", "#800080",
  "#FFC0CB", "#A52A2A", "#808080", "#FFD700", "#4B0082"
];

const brushSizes = [2, 5, 10, 15, 20];

export default function DrawingBoard() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = isEraser ? "#FFFFFF" : currentColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "islamic-art.png";
    link.href = url;
    link.click();
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-4">✏️</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Islamic Art Drawing Board
          </h1>
          <p className="text-lg text-gray-600">
            Create beautiful Islamic art and calligraphy!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Tools Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Colors */}
              <div>
                <h3 className="font-semibold mb-3">Colors</h3>
                <div className="grid grid-cols-5 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setCurrentColor(color);
                        setIsEraser(false);
                      }}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        currentColor === color && !isEraser
                          ? "border-blue-500 scale-110"
                          : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Brush Size */}
              <div>
                <h3 className="font-semibold mb-3">Brush Size</h3>
                <div className="flex gap-2">
                  {brushSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setBrushSize(size)}
                      className={`px-3 py-2 rounded-lg border-2 transition-all ${
                        brushSize === size
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tool Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={() => setIsEraser(!isEraser)}
                  variant={isEraser ? "default" : "outline"}
                  className="w-full"
                >
                  <Eraser className="w-4 h-4 mr-2" />
                  Eraser
                </Button>
                <Button onClick={clearCanvas} variant="outline" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
                <Button onClick={downloadDrawing} className="w-full bg-green-600 hover:bg-green-700">
                  <Download className="w-4 h-4 mr-2" />
                  Save Art
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Canvas */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="border-2 border-gray-300 rounded-lg cursor-crosshair w-full"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </CardContent>
            </Card>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6"
            >
              <Card className="border-2 border-purple-200 bg-purple-50">
                <CardContent className="p-4">
                  <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Drawing Tips
                  </h3>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>🎨 Try drawing Islamic geometric patterns</li>
                    <li>✍️ Practice Arabic calligraphy</li>
                    <li>🕌 Draw your favorite mosque</li>
                    <li>💾 Save and share your artwork!</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}