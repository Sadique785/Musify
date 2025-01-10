import React from "react";
import EffectSlider from "./EffectSlider";

const ReverbControls = ({ parameters, onChange }) => (
  <div className="space-y-4 w-full">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-white font-medium">Reverb</h3>
      <input
        type="checkbox"
        checked={parameters.enabled}
        onChange={(e) => onChange({ enabled: e.target.checked })}
        className="h-4 w-4 rounded border-zinc-600"
      />
    </div>
    <EffectSlider
      label="Room Size"
      value={parameters.roomSize * 100}
      min={0}
      max={100}
      onChange={(e) => onChange({ roomSize: e.target.valueAsNumber / 100 })}
    />
    <EffectSlider
      label="Decay"
      value={parameters.decay}
      min={0.1}
      max={10}
      step={0.1}
      onChange={(e) => onChange({ decay: e.target.valueAsNumber })}
    />
    <EffectSlider
      label="Mix"
      value={parameters.wet * 100}
      onChange={(e) => onChange({ wet: e.target.valueAsNumber / 100 })}
    />
  </div>
);

export default ReverbControls;
