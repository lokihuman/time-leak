import React from 'react';
import { TimeData } from '../types';

interface TimeInputProps {
  data: TimeData;
  onChange: (newData: TimeData) => void;
}

const SliderInput = ({ 
  label, 
  value, 
  max, 
  onChange, 
  colorClass 
}: { 
  label: string; 
  value: number; 
  max: number; 
  onChange: (val: number) => void;
  colorClass: string;
}) => (
  <div className="mb-6">
    <div className="flex justify-between mb-2 text-sm font-medium tracking-wider uppercase text-gray-400">
      <span>{label}</span>
      <span className={`${colorClass} font-bold`}>{value} hrs</span>
    </div>
    <input
      type="range"
      min="0"
      max={max}
      step="0.5"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className={`w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-${colorClass.split('-')[1]}-500 hover:bg-gray-700 transition-colors`}
    />
  </div>
);

export const TimeInput: React.FC<TimeInputProps> = ({ data, onChange }) => {
  const handleChange = (key: keyof TimeData, value: number) => {
    onChange({ ...data, [key]: value });
  };

  // Calculate remaining goal time for display
  const spent = data.socialMedia + data.procrastination + data.fear;
  const goalTime = Math.max(0, data.totalAvailable - spent);

  return (
    <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl backdrop-blur-sm shadow-2xl">
      <h2 className="text-2xl font-bold mb-6 text-white border-b border-gray-800 pb-4">
        Configure Your Day
      </h2>
      
      <SliderInput 
        label="Waking Hours (Total)" 
        value={data.totalAvailable} 
        max={24} 
        onChange={(v) => handleChange('totalAvailable', v)} 
        colorClass="text-white"
      />

      <div className="space-y-1">
         <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Where is it going?</p>
         
        <SliderInput 
          label="Social Media (Distraction)" 
          value={data.socialMedia} 
          max={12} 
          onChange={(v) => handleChange('socialMedia', v)} 
          colorClass="text-yellow-400"
        />
        
        <SliderInput 
          label="Procrastination (Delay)" 
          value={data.procrastination} 
          max={12} 
          onChange={(v) => handleChange('procrastination', v)} 
          colorClass="text-yellow-400"
        />
        
        <SliderInput 
          label="Fear & Overthinking" 
          value={data.fear} 
          max={12} 
          onChange={(v) => handleChange('fear', v)} 
          colorClass="text-yellow-400"
        />
      </div>

      <div className="mt-8 p-4 bg-gray-950 rounded-lg border border-gray-800 flex justify-between items-center">
        <span className="text-gray-400">Time Left for Goals</span>
        <span className={`text-2xl font-bold ${goalTime < 3 ? 'text-red-500' : 'text-green-400'}`}>
          {goalTime.toFixed(1)} hrs
        </span>
      </div>
    </div>
  );
};