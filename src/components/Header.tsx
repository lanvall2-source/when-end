import React from 'react';
import { Clock } from 'lucide-react';
import { formatKoreanTime } from '../lib/timeCalculator';

interface HeaderProps {
  currentTime: Date;
}

export const Header: React.FC<HeaderProps> = ({ currentTime }) => {
  return (
    <header className="safe-top px-5 pt-3 pb-2 flex items-center justify-between border-b border-toss-border/40 bg-white">
      <div>
        <h1 className="text-lg font-bold text-toss-text tracking-tight flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-toss-blue inline-block"></span>
          언제끝나
        </h1>
        <p className="text-[11px] text-toss-text-muted">스마트 시간 계산기</p>
      </div>
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-toss-bg-gray rounded-full text-xs font-medium text-toss-text-secondary">
        <Clock className="w-3.5 h-3.5 text-toss-text-muted" />
        <span>지금 {formatKoreanTime(currentTime)}</span>
      </div>
    </header>
  );
};
