import React, { useState } from 'react';
import { TimeInput } from './components/TimeInput';
import { SimulationCanvas } from './components/SimulationCanvas';
import { AdviceSection } from './components/AdviceSection';
import { TimeData, DEFAULT_TIME_DATA, AdviceResponse } from './types';
import { generateProductivityAdvice } from './services/geminiService';

export default function App() {
  const [timeData, setTimeData] = useState<TimeData>(DEFAULT_TIME_DATA);
  const [advice, setAdvice] = useState<AdviceResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateAdvice = async () => {
    setLoading(true);
    try {
      const result = await generateProductivityAdvice(timeData);
      setAdvice(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void-black text-white selection:bg-yellow-400 selection:text-black">
      {/* Header */}
      <header className="pt-12 pb-8 px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
          TIME <span className="text-yellow-400">LEAKS</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Visualize where your time disappears. Identify the leaks in your daily flow before they drain your goals.
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Controls */}
          <div className="lg:col-span-4 space-y-6">
            <TimeInput 
              data={timeData} 
              onChange={(newData) => {
                setTimeData(newData);
                setAdvice(null); // Reset advice on change
              }} 
            />
            
            {/* Legend / Instruction */}
            <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/30 text-sm text-gray-400">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span>Your Time (Particles)</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Adjust sliders to see how distractions drain the flow of time before reaching your goals.
              </p>
            </div>
          </div>

          {/* Center: Visuals */}
          <div className="lg:col-span-8">
            <SimulationCanvas data={timeData} />
          </div>
        </div>

        {/* Bottom: AI Advice */}
        <div className="max-w-3xl mx-auto mt-12">
           <AdviceSection 
              advice={advice} 
              loading={loading} 
              onGenerate={handleGenerateAdvice}
              hasData={true} 
           />
        </div>
      </main>
      
      <footer className="text-center py-8 border-t border-gray-900 text-gray-600 text-sm">
         Time Flow Analyzer &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}