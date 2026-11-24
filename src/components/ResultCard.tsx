import React from 'react';
import { AlertCircle, ArrowRight, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import {
  ForwardCalculationResult,
  BackwardCalculationResult,
  formatKoreanTime,
} from '../lib/timeCalculator';

interface ResultCardProps {
  mode: 'forward' | 'backward';
  forwardResult: ForwardCalculationResult;
  backwardResult: BackwardCalculationResult;
  targetDateOption: 'today' | 'tomorrow' | 'custom';
  targetTimeString: string; // 'HH:mm'
  customDateString: string; // 'YYYY-MM-DD'
  onSelectDateOption: (option: 'today' | 'tomorrow' | 'custom') => void;
  onTargetTimeChange: (timeStr: string) => void;
  onCustomDateChange: (dateStr: string) => void;
  onSwitchToForward: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  mode,
  forwardResult,
  backwardResult,
  targetDateOption,
  targetTimeString,
  customDateString,
  onSelectDateOption,
  onTargetTimeChange,
  onCustomDateChange,
  onSwitchToForward,
}) => {
  if (mode === 'forward') {
    const { highlightText, formattedTotalDuration, totalDurationMinutes, steps } = forwardResult;

    return (
      <section className="mx-4 mt-4 p-5 bg-gradient-to-br from-blue-50/70 via-white to-blue-50/30 border border-toss-blue/20 rounded-3xl shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-toss-blue tracking-wider uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-toss-blue"></span>
            도착 예상 시각
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-toss-blue/10 text-toss-blue font-semibold">
            총 {formattedTotalDuration} ({totalDurationMinutes}분)
          </span>
        </div>

        {/* Most prominent final time */}
        <div className="my-2">
          <h2 className="text-3xl font-extrabold text-toss-text tracking-tight break-keep leading-tight">
            {highlightText}
          </h2>
        </div>

        {/* Step breakdown */}
        <div className="mt-5 pt-4 border-t border-toss-border/60 space-y-2.5">
          <p className="text-[11px] font-semibold text-toss-text-muted mb-2 tracking-wide">단계별 완료 시각</p>
          {steps.map((step, idx) => (
            <div key={step.stepId} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step.isBuffer ? 'bg-amber-100 text-amber-700' : 'bg-toss-bg-gray text-toss-text-secondary'
                }`}>
                  {idx + 1}
                </div>
                <span className={`font-medium ${step.isBuffer ? 'text-amber-800' : 'text-toss-text'}`}>
                  {step.title} 끝
                </span>
                <span className="text-xs text-toss-text-muted">({step.durationMinutes}분)</span>
              </div>
              <span className="font-bold text-toss-text">
                {step.formattedEnd}
              </span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Mode: backward (그때 끝내려면?)
  const {
    highlightText,
    formattedTotalDuration,
    totalDurationMinutes,
    steps,
    isOverdue,
    overdueMinutes,
    formattedAlternativeEndTime,
    targetEndTime,
  } = backwardResult;

  return (
    <section className="mx-4 mt-4 p-5 bg-gradient-to-br from-blue-50/70 via-white to-blue-50/30 border border-toss-blue/20 rounded-3xl shadow-sm">
      {/* Target time controls */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-toss-text-secondary block mb-1.5 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-toss-blue" />
          언제까지 끝내실 건가요?
        </label>

        <div className="flex items-center gap-1.5 mb-2">
          <button
            type="button"
            onClick={() => onSelectDateOption('today')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              targetDateOption === 'today'
                ? 'bg-toss-blue text-white'
                : 'bg-white border border-toss-border text-toss-text-secondary hover:bg-toss-bg-gray'
            }`}
          >
            오늘
          </button>
          <button
            type="button"
            onClick={() => onSelectDateOption('tomorrow')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              targetDateOption === 'tomorrow'
                ? 'bg-toss-blue text-white'
                : 'bg-white border border-toss-border text-toss-text-secondary hover:bg-toss-bg-gray'
            }`}
          >
            내일
          </button>
          <button
            type="button"
            onClick={() => onSelectDateOption('custom')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              targetDateOption === 'custom'
                ? 'bg-toss-blue text-white'
                : 'bg-white border border-toss-border text-toss-text-secondary hover:bg-toss-bg-gray'
            }`}
          >
            날짜 직접 선택
          </button>
        </div>

        {targetDateOption === 'custom' && (
          <div className="mb-2">
            <input
              type="date"
              value={customDateString}
              onChange={(e) => onCustomDateChange(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-toss-border rounded-xl font-medium text-toss-text focus:outline-none focus:ring-2 focus:ring-toss-blue"
            />
          </div>
        )}

        {/* Time input */}
        <div className="flex items-center gap-2 bg-white border border-toss-border/80 rounded-2xl px-3 py-2">
          <Clock className="w-4 h-4 text-toss-blue shrink-0" />
          <span className="text-xs font-medium text-toss-text-muted">완료 목표 시각</span>
          <input
            type="time"
            value={targetTimeString}
            onChange={(e) => onTargetTimeChange(e.target.value)}
            className="flex-1 text-right text-base font-bold text-toss-text bg-transparent focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-toss-blue tracking-wider uppercase flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-toss-blue"></span>
          출발 권장 시각
        </span>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-toss-blue/10 text-toss-blue font-semibold">
          총 {formattedTotalDuration} ({totalDurationMinutes}분)
        </span>
      </div>

      {/* Most prominent start time */}
      <div className="my-2">
        <h2 className="text-3xl font-extrabold text-toss-text tracking-tight break-keep leading-tight">
          {highlightText}
        </h2>
      </div>

      {/* Overdue alert card */}
      {isOverdue && (
        <div className="mt-4 p-3.5 bg-toss-red-light border border-toss-red/20 rounded-2xl text-sm">
          <div className="flex items-center gap-2 text-toss-red font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>시작 시각이 {overdueMinutes}분 지났어요</span>
          </div>
          <p className="mt-1 text-xs text-toss-text-secondary leading-relaxed">
            지금 시작하면 <strong className="text-toss-text font-bold">{formattedAlternativeEndTime}</strong>에 완료돼요.
          </p>
          <button
            type="button"
            onClick={onSwitchToForward}
            className="mt-2.5 w-full py-2 bg-white border border-toss-red/30 rounded-xl text-xs font-bold text-toss-red hover:bg-toss-red hover:text-white transition-colors flex items-center justify-center gap-1 shadow-sm"
          >
            <span>지금 시작 모드로 전환</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Step breakdown */}
      <div className="mt-5 pt-4 border-t border-toss-border/60 space-y-2.5">
        <p className="text-[11px] font-semibold text-toss-text-muted mb-2 tracking-wide">단계별 시작 시각</p>
        {steps.map((step, idx) => (
          <div key={step.stepId} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step.isBuffer ? 'bg-amber-100 text-amber-700' : 'bg-toss-bg-gray text-toss-text-secondary'
              }`}>
                {idx + 1}
              </div>
              <span className={`font-medium ${step.isBuffer ? 'text-amber-800' : 'text-toss-text'}`}>
                {step.title} 시작
              </span>
              <span className="text-xs text-toss-text-muted">({step.durationMinutes}분)</span>
            </div>
            <span className="font-bold text-toss-text">
              {formatKoreanTime(step.startTime)}
            </span>
          </div>
        ))}

        <div className="flex items-center justify-between text-sm pt-1 border-t border-dashed border-toss-border">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-toss-blue" />
            <span className="font-bold text-toss-text">모두 완료</span>
          </div>
          <span className="font-bold text-toss-blue">
            {formatKoreanTime(targetEndTime)}
          </span>
        </div>
      </div>
    </section>
  );
};
