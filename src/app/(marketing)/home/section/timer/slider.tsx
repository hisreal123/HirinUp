'use client';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export default function Slider({
  label,
  value,
  min,
  max,
  onChange,
}: SliderProps) {
  return (
    <div className="bg-gray-500/60  rounded-xl p-5 backdrop-blur">
      <div className="flex justify-between items-center mb-2 text-sm text-gray-300">
        <span>{label}</span>
        <span className="text-white font-semibold">{value}</span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        className="w-full accent-purple-500 cursor-pointer"
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
