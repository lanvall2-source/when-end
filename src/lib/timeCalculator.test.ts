import { describe, it, expect } from 'vitest';
import {
  calculateForward,
  calculateBackward,
  formatKoreanTime,
  formatTimeWithDayDiff,
  ScheduleStep,
} from './timeCalculator';

describe('timeCalculator verification', () => {
  // 1. 오후 8:15 시작 + 87분 + 50분 = 오후 10:32 완료
  it('Case 1: 8:15 PM start + 87m + 50m = 10:32 PM finish', () => {
    const start = new Date(2026, 10, 24, 20, 15, 0); // 20:15
    const steps: ScheduleStep[] = [
      { id: '1', title: '세탁', durationMinutes: 87 },
      { id: '2', title: '건조', durationMinutes: 50 },
    ];

    const result = calculateForward(start, steps, 0);

    expect(formatKoreanTime(start)).toBe('오후 8:15');
    expect(result.totalDurationMinutes).toBe(137);
    expect(result.formattedTotalDuration).toBe('2시간 17분');
    expect(result.highlightText).toBe('오후 10:32에 끝나요');
    expect(result.steps[0].formattedEnd).toBe('오후 9:42');
    expect(result.steps[1].formattedEnd).toBe('오후 10:32');
  });

  // 2. 오후 11:00 완료 − 87분 − 50분 = 오후 8:43 시작
  it('Case 2: 11:00 PM target end - 87m - 50m = 8:43 PM start', () => {
    const targetEnd = new Date(2026, 10, 24, 23, 0, 0); // 23:00
    const steps: ScheduleStep[] = [
      { id: '1', title: '세탁', durationMinutes: 87 },
      { id: '2', title: '건조', durationMinutes: 50 },
    ];
    const mockNow = new Date(2026, 10, 24, 19, 0, 0); // Before start time

    const result = calculateBackward(targetEnd, steps, 0, mockNow);

    expect(formatKoreanTime(targetEnd)).toBe('오후 11:00');
    expect(result.totalDurationMinutes).toBe(137);
    expect(result.highlightText).toBe('오후 8:43에 시작하세요');
    expect(formatKoreanTime(result.steps[0].startTime)).toBe('오후 8:43');
    expect(formatKoreanTime(result.steps[1].startTime)).toBe('오후 10:10');
    expect(formatKoreanTime(result.steps[1].endTime)).toBe('오후 11:00');
    expect(result.isOverdue).toBe(false);
  });

  // 3. 오후 11:50 시작 + 35분 = 내일 오전 12:25 완료
  it('Case 3: 11:50 PM start + 35m = Tomorrow 12:25 AM finish', () => {
    const start = new Date(2026, 10, 24, 23, 50, 0); // 23:50
    const steps: ScheduleStep[] = [{ id: '1', title: '야간 작업', durationMinutes: 35 }];

    const result = calculateForward(start, steps, 0);

    expect(formatKoreanTime(start)).toBe('오후 11:50');
    expect(result.dayDifference).toBe(1);
    expect(result.highlightText).toBe('내일 오전 12:25에 끝나요');
  });

  // 4. 내일 오전 12:20 완료 − 40분 = 오늘 오후 11:40 시작
  it('Case 4: Tomorrow 12:20 AM target end - 40m = Today 11:40 PM start', () => {
    const today = new Date(2026, 10, 24, 20, 0, 0);
    const tomorrow1220AM = new Date(2026, 10, 25, 0, 20, 0); // Next day 00:20
    const steps: ScheduleStep[] = [{ id: '1', title: '밤샘 정리', durationMinutes: 40 }];

    const result = calculateBackward(tomorrow1220AM, steps, 0, today);

    expect(formatKoreanTime(tomorrow1220AM)).toBe('오전 12:20');
    expect(formatKoreanTime(result.calculatedStartTime)).toBe('오후 11:40');
    // Relative to tomorrow1220AM (base reference day is tomorrow), calculatedStartTime is yesterday relative to that end day!
    expect(formatTimeWithDayDiff(tomorrow1220AM, result.calculatedStartTime)).toBe('어제 오후 11:40');
    expect(result.highlightText).toBe('어제 오후 11:40에 시작하세요');
  });

  // 5. 여유 시간 변경, 단계 삭제, 모드 전환 후에도 계산이 정확함
  it('Case 5: Buffer time, step deletion, and mode switching integrity', () => {
    const start = new Date(2026, 10, 24, 20, 0, 0); // 20:00
    let steps: ScheduleStep[] = [
      { id: '1', title: '세탁', durationMinutes: 60 },
      { id: '2', title: '건조', durationMinutes: 40 },
    ];

    // Initial with buffer 10m
    let forward = calculateForward(start, steps, 10);
    expect(forward.totalDurationMinutes).toBe(110); // 60 + 40 + 10
    expect(forward.highlightText).toBe('오후 9:50에 끝나요');

    // Step deletion: delete '건조'
    steps = steps.filter((s) => s.id !== '2');
    forward = calculateForward(start, steps, 10);
    expect(forward.totalDurationMinutes).toBe(70); // 60 + 10
    expect(forward.highlightText).toBe('오후 9:10에 끝나요');

    // Mode switch to backward with target 10:00 PM
    const target = new Date(2026, 10, 24, 22, 0, 0); // 22:00
    const backward = calculateBackward(target, steps, 10, start);
    expect(backward.totalDurationMinutes).toBe(70);
    expect(backward.highlightText).toBe('오후 8:50에 시작하세요');
  });

  // Overdue check verification
  it('Overdue check: detects passed start time and suggests alternative', () => {
    const targetEnd = new Date(2026, 10, 24, 20, 0, 0); // 20:00
    const steps: ScheduleStep[] = [{ id: '1', title: '청소', durationMinutes: 45 }];
    const now = new Date(2026, 10, 24, 19, 30, 0); // 19:30 (start was 19:15, so 15 min overdue)

    const result = calculateBackward(targetEnd, steps, 0, now);
    expect(result.isOverdue).toBe(true);
    expect(result.overdueMinutes).toBe(15);
    expect(result.highlightText).toBe('오후 7:15에 시작하세요');
    expect(result.formattedAlternativeEndTime).toBe('오후 8:15');
  });
});
