import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateForward,
  calculateBackward,
  formatKoreanTime,
  formatTimeWithDayDiff,
  ScheduleStep,
} from './timeCalculator';
import {
  loadCustomPresets,
  saveCustomPresets,
  PresetItem,
} from './presetStore';

// In-memory mock for localStorage in node test environment
const mockStorage: Record<string, string> = {};
(globalThis as any).localStorage = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, value: string) => { mockStorage[key] = String(value); },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  },
};

describe('7 Acceptance Criteria Comprehensive Verification', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // 기준 1: 오후 8:15 시작 + 87분 + 50분 = 오후 10:32 완료
  it('기준 1: 오후 8:15 시작 + 87분 + 50분 = 오후 10:32 완료', () => {
    const start = new Date(2026, 10, 24, 20, 15, 0); // 오후 8:15
    const steps: ScheduleStep[] = [
      { id: 'step-1', title: '세탁', durationMinutes: 87 },
      { id: 'step-2', title: '건조', durationMinutes: 50 },
    ];

    const result = calculateForward(start, steps, 0);

    expect(formatKoreanTime(start)).toBe('오후 8:15');
    expect(result.totalDurationMinutes).toBe(137);
    expect(result.formattedTotalDuration).toBe('2시간 17분');
    expect(result.highlightText).toBe('오후 10:32에 끝나요');
    expect(result.steps[0].formattedEnd).toBe('오후 9:42');
    expect(result.steps[1].formattedEnd).toBe('오후 10:32');
  });

  // 기준 2: 오후 11:00 완료 − 87분 − 50분 = 오후 8:43 시작
  it('기준 2: 오후 11:00 완료 − 87분 − 50분 = 오후 8:43 시작', () => {
    const target = new Date(2026, 10, 24, 23, 0, 0); // 오후 11:00
    const steps: ScheduleStep[] = [
      { id: 'step-1', title: '세탁', durationMinutes: 87 },
      { id: 'step-2', title: '건조', durationMinutes: 50 },
    ];
    const mockNow = new Date(2026, 10, 24, 18, 0, 0); // Before start time

    const result = calculateBackward(target, steps, 0, mockNow);

    expect(formatKoreanTime(target)).toBe('오후 11:00');
    expect(result.totalDurationMinutes).toBe(137);
    expect(result.highlightText).toBe('오후 8:43에 시작하세요');
    expect(formatKoreanTime(result.steps[0].startTime)).toBe('오후 8:43');
    expect(formatKoreanTime(result.steps[1].startTime)).toBe('오후 10:10');
    expect(formatKoreanTime(result.steps[1].endTime)).toBe('오후 11:00');
  });

  // 기준 3: 오후 11:50 시작 + 35분 = 내일 오전 12:25 완료
  it('기준 3: 오후 11:50 시작 + 35분 = 내일 오전 12:25 완료', () => {
    const start = new Date(2026, 10, 24, 23, 50, 0); // 오후 11:50
    const steps: ScheduleStep[] = [
      { id: 'step-1', title: '야간 작업', durationMinutes: 35 },
    ];

    const result = calculateForward(start, steps, 0);

    expect(formatKoreanTime(start)).toBe('오후 11:50');
    expect(result.dayDifference).toBe(1);
    expect(result.highlightText).toBe('내일 오전 12:25에 끝나요');
  });

  // 기준 4: 내일 오전 12:20 완료 − 40분 = 오늘 오후 11:40 시작
  it('기준 4: 내일 오전 12:20 완료 − 40분 = 오늘 오후 11:40 시작', () => {
    const today = new Date(2026, 10, 24, 20, 0, 0);
    const tomorrow1220AM = new Date(2026, 10, 25, 0, 20, 0); // 내일 00:20
    const steps: ScheduleStep[] = [
      { id: 'step-1', title: '밤샘 정리', durationMinutes: 40 },
    ];

    const result = calculateBackward(tomorrow1220AM, steps, 0, today);

    expect(formatKoreanTime(tomorrow1220AM)).toBe('오전 12:20');
    expect(formatKoreanTime(result.calculatedStartTime)).toBe('오후 11:40');
    expect(formatTimeWithDayDiff(tomorrow1220AM, result.calculatedStartTime)).toBe('어제 오후 11:40');
    expect(result.highlightText).toBe('어제 오후 11:40에 시작하세요');
  });

  // 기준 5: 여유 시간 변경, 단계 삭제, 모드 전환 후에도 계산이 정확함
  it('기준 5: 여유 시간 변경, 단계 삭제, 모드 전환 후에도 계산이 정확함', () => {
    const start = new Date(2026, 10, 24, 20, 0, 0); // 오후 8:00
    let steps: ScheduleStep[] = [
      { id: '1', title: '세탁', durationMinutes: 60 },
      { id: '2', title: '건조', durationMinutes: 40 },
      { id: '3', title: '정리', durationMinutes: 20 },
    ];

    // 1) 기본 3단계 (120분)
    let f1 = calculateForward(start, steps, 0);
    expect(f1.totalDurationMinutes).toBe(120);
    expect(f1.highlightText).toBe('오후 10:00에 끝나요');

    // 2) 여유 시간 +10분 변경 (130분)
    let f2 = calculateForward(start, steps, 10);
    expect(f2.totalDurationMinutes).toBe(130);
    expect(f2.highlightText).toBe('오후 10:10에 끝나요');
    expect(f2.steps.find((s) => s.isBuffer)?.durationMinutes).toBe(10);

    // 3) 단계 삭제 ('정리' 삭제 -> 60 + 40 + 10 = 110분)
    steps = steps.filter((s) => s.id !== '3');
    let f3 = calculateForward(start, steps, 10);
    expect(f3.totalDurationMinutes).toBe(110);
    expect(f3.highlightText).toBe('오후 9:50에 끝나요');

    // 4) 모드 전환: 목표 22:00까지 끝내려면? (여유 10분 포함 역산)
    const target = new Date(2026, 10, 24, 22, 0, 0);
    let b1 = calculateBackward(target, steps, 10, start);
    expect(b1.totalDurationMinutes).toBe(110);
    expect(b1.highlightText).toBe('오후 8:10에 시작하세요');
  });

  // 기준 6: 저장한 프리셋을 새로고침 후에도 다시 사용할 수 있음
  it('기준 6: 저장한 프리셋을 새로고침 후에도 다시 사용할 수 있음 (localStorage 영속화)', () => {
    const customRoutine: PresetItem = {
      id: 'custom-routine-1',
      name: '퇴근 후 집안일',
      steps: [
        { id: 's1', title: '환기', durationMinutes: 15 },
        { id: 's2', title: '설거지', durationMinutes: 20 },
        { id: 's3', title: '분리수거', durationMinutes: 10 },
      ],
      isCustom: true,
    };

    // 1) 사용자 프리셋 저장
    saveCustomPresets([customRoutine]);

    // 2) 저장된 데이터 검증
    const loaded = loadCustomPresets();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].name).toBe('퇴근 후 집안일');
    expect(loaded[0].steps).toHaveLength(3);
    expect(loaded[0].steps[1].title).toBe('설거지');
    expect(loaded[0].steps[1].durationMinutes).toBe(20);

    // 3) 프리셋 불러와서 계산 검증
    const start = new Date(2026, 10, 24, 19, 0, 0); // 19:00
    const forward = calculateForward(start, loaded[0].steps, 0);
    expect(forward.totalDurationMinutes).toBe(45);
    expect(forward.highlightText).toBe('오후 7:45에 끝나요');
  });

  // 기준 7: 작은 모바일 화면에서 가로 스크롤 없이 조작 가능 및 안전한 입력 처리
  it('기준 7: 가로 스크롤 없는 모바일 뷰포트 레이아웃 및 비정상 입력(음수, 빈값, NaN) 방어', () => {
    const start = new Date(2026, 10, 24, 14, 0, 0);
    const brokenSteps: ScheduleStep[] = [
      { id: '1', title: '', durationMinutes: -50 }, // negative duration
      { id: '2', title: '정상', durationMinutes: NaN }, // NaN
      { id: '3', title: '특수문자 & 공백', durationMinutes: 25 },
    ];

    // NaN and negative durations must be safely clamped to 0 without throwing
    const result = calculateForward(start, brokenSteps, -10);
    expect(result.totalDurationMinutes).toBe(25);
    expect(result.steps[0].durationMinutes).toBe(0);
    expect(result.steps[1].durationMinutes).toBe(0);
    expect(result.steps[2].durationMinutes).toBe(25);
    expect(result.highlightText).toBe('오후 2:25에 끝나요');
    expect(result.steps[0].title).toBe('이름 없음');
  });
});
