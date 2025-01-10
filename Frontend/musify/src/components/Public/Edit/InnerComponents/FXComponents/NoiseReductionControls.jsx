import React from "react";
import EffectSlider from "./EffectSlider";

const NoiseReductionControls = ({ parameters, onChange }) => (
  <div className="space-y-4 w-full">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-white font-medium">Noise Reduction</h3>
      <input
        type="checkbox"
        checked={parameters.enabled}
        onChange={(e) => onChange({ enabled: e.target.checked })}
        className="h-4 w-4 rounded border-zinc-600"
      />
    </div>
    <EffectSlider
      label="Threshold"
      value={parameters.threshold}
      min={-60}
      max={0}
      onChange={(e) => onChange({ threshold: e.target.valueAsNumber })}
    />
    <EffectSlider
      label="Reduction"
      value={parameters.reduction}
      min={-100}
      max={0}
      onChange={(e) => onChange({ reduction: e.target.valueAsNumber })}
    />
    <EffectSlider
      label="Attack"
      value={parameters.attack * 1000}
      min={0}
      max={1000}
      onChange={(e) => onChange({ attack: e.target.valueAsNumber / 1000 })}
    />
    <EffectSlider
      label="Release"
      value={parameters.release * 1000}
      min={0}
      max={1000}
      onChange={(e) => onChange({ release: e.target.valueAsNumber / 1000 })}
    />
  </div>
);

export default NoiseReductionControls;
