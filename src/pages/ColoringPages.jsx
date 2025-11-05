import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Palette, Paintbrush } from "lucide-react";
import { motion } from "framer-motion";

const coloringPages = [
  {
    id: 1,
    title: "Kaaba",
    url: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&h=800&fit=crop",
    description: "Color the Holy Kaaba"
  },
  {
    id: 2,
    title: "Mosque",
    url: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&h=800&fit=crop",
    description: "Beautiful mosque design"
  },
  {
    id: 3,
    title: "Islamic Pattern",
    url: "https://images.unsplash.com/photo-1583578702627-7c1e0618f0c4?w=800&h=800&fit=crop",
    description: "Geometric Islamic art"
  },
  {
    id: 4,
    title: "Crescent Moon",
    url: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=800&h=800&fit=crop",
    description: "Islamic symbol"
  },
  {
    id: 5,
    title: "Arabic Calligraphy",
    url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop",
    description: "Beautiful Arabic writing"
  },
  {
    id: 6,
    title: "Lantern",
    url: "https://images.unsplash.com/photo-1586991879365-a8759d239cf1?w=800&h=800&fit=crop",
    description: "Ramadan lantern"
  }
];

const DrawingCanvas = ({ page, onClose }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [canvasReady, setCanvasReady] = useState(false);

  const colors = [
    "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF",
    "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500", "#800080",
    "#FFC0CB", "#8B4513", "#808080", "#FFD700", "#40E0D0"
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      // Set canvas size
      canvas.width = 800;
      canvas.height = 800;
      
      // Draw white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Apply grayscale filter for coloring effect
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;     // Red
        data[i + 1] = avg; // Green
        data[i + 2] = avg; // Blue
      }
      
      ctx.putImageData(imageData, 0, 0);
      setCanvasReady(true);
    };
    
    img.onerror = () => {
      // If image fails to load, just create a blank canvas
      canvas.width = 800;
      canvas.height = 800;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw a simple outline
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(50, 50, 700, 700);
      ctx.font = '24px Arial';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.fillText(page.title, canvas.width / 2, canvas.height / 2);
      
      setCanvasReady(true);
    };
    
    img.src = page.url;
  }, [page]);

  const startDrawing = (e) => {
    if (!canvasReady) return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e) => {
    if (!isDrawing && e.type !== 'mousedown' && e.type !== 'touchstart') return;
    if (!canvasReady) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    let x, y;
    if (e.type.includes('touch')) {
      const touch = e.touches[0] || e.changedTouches[0];
      x = touch.clientX - rect.left;
      y = touch.clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    // Scale coordinates to canvas size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    x *= scaleX;
    y *= scaleY;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;

    if (e.type === 'mousedown' || e.type === 'touchstart') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Reload the original image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
      }
      ctx.putImageData(imageData, 0, 0);
    };
    img.src = page.url;
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `${page.title}-colored.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b p-4 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Color: {page.title}</h2>
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-[1fr,200px] gap-6">
            {/* Canvas */}
            <div className="flex flex-col items-center">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="border-4 border-gray-300 rounded-lg cursor-crosshair max-w-full touch-none"
                style={{ width: '100%', maxWidth: '600px', height: 'auto', aspectRatio: '1/1' }}
              />
              {!canvasReady && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-gray-500">Loading...</div>
                </div>
              )}
            </div>

            {/* Tools */}
            <div className="space-y-6">
              {/* Colors */}
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Colors
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setCurrentColor(color)}
                      className={`w-full h-12 rounded-lg border-4 transition-all ${
                        currentColor === color ? 'border-blue-500 scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                  className="w-full h-12 mt-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Brush Size */}
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Paintbrush className="w-5 h-5" />
                  Brush Size
                </h3>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-center text-sm text-gray-600 mt-2">{brushSize}px</p>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button onClick={clearCanvas} variant="outline" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
                <Button onClick={downloadImage} className="w-full bg-green-600 hover:bg-green-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function ColoringPages() {
  const [selectedPage, setSelectedPage] = useState(null);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-6xl mb-4">🎨</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Islamic Coloring Pages
          </h1>
          <p className="text-lg text-gray-600">
            Color beautiful Islamic designs online or download to print
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coloringPages.map((page, index) => (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer group">
                <CardHeader className="p-0">
                  <div className="h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-xl overflow-hidden">
                    <img
                      src={page.url}
                      alt={page.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="text-xl mb-2">{page.title}</CardTitle>
                  <p className="text-gray-600 mb-4">{page.description}</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSelectedPage(page)}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500"
                    >
                      <Palette className="w-4 h-4 mr-2" />
                      Color Online
                    </Button>
                    <Button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = page.url;
                        link.download = `${page.title}.jpg`;
                        link.click();
                      }}
                      variant="outline"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Instructions */}
        <Card className="mt-12 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-3">💡 How to Use</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>1. <strong>Color Online:</strong> Click "Color Online" to use our digital coloring tool</p>
              <p>2. <strong>Download:</strong> Click the download icon to print and color with crayons</p>
              <p>3. <strong>Save Your Work:</strong> After coloring online, click "Download" to save your artwork</p>
              <p>4. <strong>Tips:</strong> Use different brush sizes for details and filling large areas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drawing Canvas Modal */}
      {selectedPage && (
        <DrawingCanvas page={selectedPage} onClose={() => setSelectedPage(null)} />
      )}
    </div>
  );
}