import React from 'react';
import { AdviceResponse } from '../types';

interface AdviceSectionProps {
  advice: AdviceResponse | null;
  loading: boolean;
  onGenerate: () => void;
  hasData: boolean;
}

export const AdviceSection: React.FC<AdviceSectionProps> = ({ advice, loading, onGenerate, hasData }) => {
  return (
    <div className="mt-8 p-1">
      {!advice && (
        <div className="text-center">
          <button
            onClick={onGenerate}
            disabled={loading || !hasData}
            className={`
              px-8 py-4 rounded-full font-bold text-lg tracking-widest uppercase transition-all transform hover:scale-105
              ${loading 
                ? 'bg-gray-700 text-gray-400 cursor-wait' 
                : 'bg-yellow-400 text-black hover:bg-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.4)]'
              }
            `}
          >
            {loading ? 'Analyzing Leaks...' : 'Analyze My Efficiency'}
          </button>
          <p className="mt-4 text-gray-500 text-sm">
            Uses Gemini AI to analyze your time leaks and provide expert feedback.
          </p>
        </div>
      )}

      {advice && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 animate-fade-in-up">
          <div className="flex justify-between items-start border-b border-gray-800 pb-6 mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Efficiency Audit</h3>
              <p className="text-gray-400 text-sm uppercase tracking-wider">Expert Analysis</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-yellow-400">{advice.score}</div>
              <div className="text-xs text-gray-500">SCORE</div>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {advice.analysis}
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-yellow-400 font-bold uppercase text-sm tracking-widest mb-4">
              Action Plan
            </h4>
            {advice.tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-gray-950 rounded-lg border border-gray-800 hover:border-yellow-400/30 transition-colors">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-400/10 flex items-center justify-center text-yellow-400 font-bold">
                  {index + 1}
                </div>
                <p className="text-gray-300 text-sm pt-1">{tip}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
             <button 
                onClick={onGenerate}
                className="text-sm text-gray-500 underline hover:text-yellow-400 transition-colors"
             >
                Regenerate Analysis
             </button>
          </div>
        </div>
      )}
    </div>
  );
};