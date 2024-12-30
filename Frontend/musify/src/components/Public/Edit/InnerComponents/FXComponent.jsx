import React, { useState } from "react";
import { Mic, ChevronLeft, ChevronRight, X } from "lucide-react";

const FXComponent = ({ track, onClose }) => {
  const effects = ["Echo", "Reverb", "EQ", "Noise Cancellation"];
  const [currentEffect, setCurrentEffect] = useState(0);

  const nextEffect = () => setCurrentEffect((prev) => (prev + 1) % effects.length);
  const prevEffect = () =>
    setCurrentEffect((prev) => (prev - 1 + effects.length) % effects.length);

  return (
        <div
        className="fixed bottom-0 left-0 w-screen"
        style={{
            height: `calc(50vh - 100px)`,
            background: "#282c32",
            zIndex: 50, // Ensure FXComponent is above EditFooter
            boxShadow: "0 -4px 10px rgba(0,0,0,0.2)",
        }}
        >

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-700">
        <div className="flex items-center space-x-2">
          <Mic size={20} style={{ color: track.color }} />
          <span className="text-white font-medium">{track.name}</span>
        </div>
        <button onClick={onClose} className="text-zinc-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Separator Line */}
      <div className="h-[1px] bg-zinc-700 w-full" />

      {/* Main Content */}
      <div className="flex h-full">
        {/* Left Div */}
        <div className="w-[200px] p-4">
          <div className="bg-zinc-700 rounded-lg p-4 space-y-2">
            <h3 className="text-white text-sm font-medium">Effects</h3>
            <div className="flex items-center justify-between">
              <button onClick={prevEffect} className="text-zinc-400 hover:text-white">
                <ChevronLeft size={20} />
              </button>
              <span className="text-white text-center font-medium">{effects[currentEffect]}</span>
              <button onClick={nextEffect} className="text-zinc-400 hover:text-white">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Div */}
        <div className="flex-1 p-4">
          {/* Placeholder for Right Div Content */}
          <div
            className="w-full h-full bg-zinc-600 rounded-lg flex items-center justify-center text-white"
          >
            Right Div Content Here
          </div>
        </div>
      </div>
    </div>
  );
};

export default FXComponent;
