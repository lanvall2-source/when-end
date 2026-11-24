import React, { useState } from 'react';
import { X, Bookmark, Check } from 'lucide-react';
import { ScheduleStep } from '../lib/timeCalculator';

interface SavePresetModalProps {
  isOpen: boolean;
  steps: ScheduleStep[];
  onClose: () => void;
  onSave: (presetName: string) => void;
}

export const SavePresetModal: React.FC<SavePresetModalProps> = ({
  isOpen,
  steps,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
      setName('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-toss-border/60">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-toss-blue/10 flex items-center justify-center text-toss-blue">
              <Bookmark className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-toss-text">내 프리셋으로 저장</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-toss-text-muted hover:text-toss-text rounded-full hover:bg-toss-bg-gray transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-toss-text-secondary mb-3 leading-relaxed">
          현재 편집한 {steps.length}개 단계를 기기에 저장하여 언제든지 다시 불러올 수 있습니다.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="프리셋 이름 (예: 퇴근 루틴, 주말 대청소)"
            className="w-full px-3.5 py-2.5 bg-toss-bg-gray-subtle border border-toss-border focus:border-toss-blue rounded-xl text-sm font-semibold text-toss-text focus:outline-none mb-4"
            autoFocus
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-toss-border text-xs font-bold text-toss-text-secondary hover:bg-toss-bg-gray transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-2.5 rounded-xl bg-toss-blue text-white text-xs font-bold hover:bg-toss-blue-dark disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center justify-center gap-1 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>저장하기</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
