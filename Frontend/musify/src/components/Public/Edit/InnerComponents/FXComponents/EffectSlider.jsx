import React from "react";

const EffectSlider = ({ label, value, onChange, min = 0, max = 100, step = 1 }) => (
  <div className="space-y-2 w-full">
    <div className="flex justify-between">
      <label className="text-sm text-zinc-300">{label}</label>
      <span className="text-sm text-zinc-400">{value.toFixed(1)}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-zinc-700"
    />
  </div>
);

export default EffectSlider;
