import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Mic, X } from "lucide-react";
import * as Tone from "tone";
import ReverbControls from "./FXComponents/ReverbControls";
import NoiseReductionControls from "./FXComponents/NoiseReductionControls";

const FXComponent = ({ track, onClose }) => {
  const dispatch = useDispatch();
  const [activeEffect, setActiveEffect] = useState("reverb");
  const [reverbEffect, setReverbEffect] = useState(null);
  const [noiseGate, setNoiseGate] = useState(null);

  useEffect(() => {
    const reverb = new Tone.Reverb({
      decay: track.effects.reverb.decay,
      wet: track.effects.reverb.wet,
    }).toDestination();

    // Ensure the reverb is ready before using it
    reverb.generate().then(() => {
      setReverbEffect(reverb);
    });

    const gate = new Tone.Gate({
      threshold: track.effects.noiseCancellation.threshold,
      attack: track.effects.noiseCancellation.attack,
      release: track.effects.noiseCancellation.release,
    }).toDestination();

    setNoiseGate(gate);

    return () => {
      reverb.dispose();
      gate.dispose();
    };
  }, []);

  const handleEffectChange = (effectType, parameters) => {
    // Update Redux state at track level
    dispatch({
      type: "audio/updateTrackEffects",
      payload: {
        trackId: track.id,
        effectType,
        parameters,
      },
    });

    // Update audio effects
    if (effectType === "reverb" && reverbEffect) {
      if ("decay" in parameters) reverbEffect.decay.value = parameters.decay;
      if ("wet" in parameters) reverbEffect.wet.value = parameters.wet;
      if ("enabled" in parameters) {
        reverbEffect.wet.value = parameters.enabled ? track.effects.reverb.wet : 0;
      }
    } else if (effectType === "noiseCancellation" && noiseGate) {
      if ("threshold" in parameters) noiseGate.threshold.value = parameters.threshold;
      if ("attack" in parameters) noiseGate.attack = parameters.attack;
      if ("release" in parameters) noiseGate.release = parameters.release;
      if ("enabled" in parameters) {
        noiseGate.threshold.value = parameters.enabled ? 
          track.effects.noiseCancellation.threshold : -100;
      }
    }
  };

  if (!track) return null;

  return (
    <div className="fixed mb-[60px] bg-gray-900 bottom-0 left-0 w-screen h-[200px]" style={{
      minHeight: "300px",
      maxHeight: "calc(80vh - 60px)",
      zIndex: 50,
      boxShadow: "0 -4px 10px rgba(0,0,0,0.2)"
    }}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-700">
        <div className="flex items-center space-x-2">
          <Mic size={20} style={{ color: track.color }} />
          <span className="text-white font-medium">{track.name}</span>
        </div>
        <button onClick={onClose} className="text-zinc-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <div className="flex h-[calc(100%-48px)]">
        <div className="w-[200px] p-4 border-r border-zinc-700">
          <button
            onClick={() => setActiveEffect("reverb")}
            className={`w-full text-left px-4 py-2 rounded ${
              activeEffect === "reverb"
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            Reverb
          </button>
          <button
            onClick={() => setActiveEffect("noiseCancellation")}
            className={`w-full text-left px-4 py-2 rounded ${
              activeEffect === "noiseCancellation"
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            Noise Reduction
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {activeEffect === "reverb" ? (
            <ReverbControls
              parameters={track.effects.reverb}
              onChange={(params) => handleEffectChange("reverb", params)}
            />
          ) : (
            <NoiseReductionControls
              parameters={track.effects.noiseCancellation}
              onChange={(params) => handleEffectChange("noiseCancellation", params)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FXComponent;