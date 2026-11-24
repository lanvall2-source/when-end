import React from 'react';
import { Play, Flag } from 'lucide-react';

export type CalculationMode = 'forward' | 'backward';

interface ModeSelectorProps {
  mode: CalculationMode;
  onSelectMode: (mode: CalculationMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, onSelectMode }) => {
  return (
    <div className="grid grid-cols-2 gap-2 p-1.5 bg-toss-bg-gray rounded-2xl mx-4 mt-4">
      <button
        type="button"
        onClick={() => onSelectMode('forward')}
        className={`flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl font-bold text-sm transition-all duration-150 ${
          mode === 'forward'
            ? 'bg-white text-toss-blue shadow-sm'
            : 'bg-transparent text-toss-text-muted hover:text-toss-text'
        }`}
      >
        <Play className={`w-4 h-4 ${mode === 'forward' ? 'fill-toss-blue' : ''}`} />
        <span>지금 시작하면?</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectMode('backward')}
        className={`flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl font-bold text-sm transition-all duration-150 ${
          mode === 'backward'
            ? 'bg-white text-toss-blue shadow-sm'
            : 'bg-transparent text-toss-text-muted hover:text-toss-text'
        }`}
      >
        <Flag className={`w-4 h-4 ${mode === 'backward' ? 'fill-toss-blue' : ''}`} />
        <span>그때 끝내려면?</span>
      </button>
    </div>
  );
};
