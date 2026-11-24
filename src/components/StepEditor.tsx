import React from 'react';
import { ArrowUp, ArrowDown, Trash2, Plus, Clock, Coffee } from 'lucide-react';
import { ScheduleStep } from '../lib/timeCalculator';

interface StepEditorProps {
  steps: ScheduleStep[];
  bufferMinutes: number;
  onUpdateStep: (id: string, updates: Partial<ScheduleStep>) => void;
  onAddStep: () => void;
  onDeleteStep: (id: string) => void;
  onMoveStep: (index: number, direction: 'up' | 'down') => void;
  onSetBufferMinutes: (buffer: number) => void;
}

export const StepEditor: React.FC<StepEditorProps> = ({
  steps,
  bufferMinutes,
  onUpdateStep,
  onAddStep,
  onDeleteStep,
  onMoveStep,
  onSetBufferMinutes,
}) => {
  const handleDurationChange = (id: string, rawVal: string) => {
    if (rawVal === '') {
      onUpdateStep(id, { durationMinutes: 0 });
      return;
    }
    const parsed = parseInt(rawVal, 10);
    onUpdateStep(id, { durationMinutes: isNaN(parsed) ? 0 : Math.max(0, parsed) });
  };

  const handleQuickAdd = (id: string, current: number, add: number) => {
    const currentSafe = Math.max(0, current || 0);
    onUpdateStep(id, { durationMinutes: currentSafe + add });
  };

  return (
    <section className="mx-4 mt-6">
      {/* Buffer time section */}
      <div className="mb-5 p-3.5 bg-white border border-toss-border/80 rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-toss-text flex items-center gap-1.5">
            <Coffee className="w-3.5 h-3.5 text-amber-600" />
            일정에 여유 시간 두기
          </span>
          <span className="text-[11px] text-toss-text-muted">전체 일정에 1회 포함</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onSetBufferMinutes(0)}
            className={`py-2 px-2 text-xs font-semibold rounded-xl transition-all ${
              bufferMinutes === 0
                ? 'bg-toss-blue text-white shadow-sm'
                : 'bg-toss-bg-gray text-toss-text-secondary hover:bg-toss-border/60'
            }`}
          >
            여유 없음
          </button>
          <button
            type="button"
            onClick={() => onSetBufferMinutes(5)}
            className={`py-2 px-2 text-xs font-semibold rounded-xl transition-all ${
              bufferMinutes === 5
                ? 'bg-toss-blue text-white shadow-sm'
                : 'bg-toss-bg-gray text-toss-text-secondary hover:bg-toss-border/60'
            }`}
          >
            + 여유 5분
          </button>
          <button
            type="button"
            onClick={() => onSetBufferMinutes(10)}
            className={`py-2 px-2 text-xs font-semibold rounded-xl transition-all ${
              bufferMinutes === 10
                ? 'bg-toss-blue text-white shadow-sm'
                : 'bg-toss-bg-gray text-toss-text-secondary hover:bg-toss-border/60'
            }`}
          >
            + 여유 10분
          </button>
        </div>
      </div>

      {/* Steps list header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-toss-text flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-toss-blue" />
          단계별 소요 시간 편집
        </h3>
        <span className="text-xs text-toss-text-muted">{steps.length}개 단계</span>
      </div>

      {/* Steps list */}
      <div className="space-y-2.5">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            className="p-3 bg-white border border-toss-border rounded-2xl shadow-sm hover:border-toss-border/80 transition-all"
          >
            <div className="flex items-center gap-2">
              {/* Order number */}
              <div className="w-6 h-6 rounded-full bg-toss-bg-gray text-toss-text-secondary font-bold text-xs flex items-center justify-center shrink-0">
                {idx + 1}
              </div>

              {/* Step title input */}
              <input
                type="text"
                value={step.title}
                onChange={(e) => onUpdateStep(step.id, { title: e.target.value })}
                placeholder="단계 이름"
                className="flex-1 min-w-0 px-2.5 py-1.5 bg-toss-bg-gray-subtle border border-toss-border/60 focus:border-toss-blue rounded-xl text-sm font-semibold text-toss-text focus:outline-none"
              />

              {/* Duration input */}
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="999"
                  value={step.durationMinutes === 0 ? '' : step.durationMinutes}
                  placeholder="0"
                  onChange={(e) => handleDurationChange(step.id, e.target.value)}
                  className="w-14 px-2 py-1.5 text-center bg-toss-bg-gray-subtle border border-toss-border/60 focus:border-toss-blue rounded-xl text-sm font-bold text-toss-text focus:outline-none"
                />
                <span className="text-xs font-semibold text-toss-text-muted">분</span>
              </div>

              {/* Reorder Up */}
              <button
                type="button"
                disabled={idx === 0}
                onClick={() => onMoveStep(idx, 'up')}
                title="위로 이동"
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-toss-bg-gray text-toss-text-secondary hover:bg-toss-border/70 disabled:opacity-30 disabled:pointer-events-none transition-colors shrink-0"
              >
                <ArrowUp className="w-4 h-4" />
              </button>

              {/* Reorder Down */}
              <button
                type="button"
                disabled={idx === steps.length - 1}
                onClick={() => onMoveStep(idx, 'down')}
                title="아래로 이동"
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-toss-bg-gray text-toss-text-secondary hover:bg-toss-border/70 disabled:opacity-30 disabled:pointer-events-none transition-colors shrink-0"
              >
                <ArrowDown className="w-4 h-4" />
              </button>

              {/* Delete */}
              <button
                type="button"
                disabled={steps.length <= 1}
                onClick={() => onDeleteStep(step.id)}
                title="단계 삭제"
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-toss-bg-gray text-toss-text-muted hover:text-toss-red hover:bg-toss-red-light disabled:opacity-30 disabled:pointer-events-none transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Quick minute increment chips */}
            <div className="flex items-center gap-1.5 mt-2 pl-8">
              <span className="text-[10px] text-toss-text-muted">빠른 추가:</span>
              <button
                type="button"
                onClick={() => handleQuickAdd(step.id, step.durationMinutes, 5)}
                className="px-2 py-0.5 text-[10px] font-semibold bg-toss-bg-gray hover:bg-toss-border/70 text-toss-text-secondary rounded-md transition-colors"
              >
                +5분
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(step.id, step.durationMinutes, 10)}
                className="px-2 py-0.5 text-[10px] font-semibold bg-toss-bg-gray hover:bg-toss-border/70 text-toss-text-secondary rounded-md transition-colors"
              >
                +10분
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(step.id, step.durationMinutes, 30)}
                className="px-2 py-0.5 text-[10px] font-semibold bg-toss-bg-gray hover:bg-toss-border/70 text-toss-text-secondary rounded-md transition-colors"
              >
                +30분
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Step button */}
      <button
        type="button"
        onClick={onAddStep}
        className="mt-3 w-full py-3 border-2 border-dashed border-toss-border hover:border-toss-blue/60 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-bold text-toss-blue bg-white hover:bg-toss-blue/5 transition-all active:scale-[0.99]"
      >
        <Plus className="w-4 h-4" />
        <span>새 단계 추가</span>
      </button>
    </section>
  );
};
