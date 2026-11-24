import { ScheduleStep } from './timeCalculator';

export interface PresetItem {
  id: string;
  name: string;
  steps: ScheduleStep[];
  isCustom?: boolean;
}

export const DEFAULT_PRESETS: PresetItem[] = [
  {
    id: 'laundry_dry',
    name: '세탁 + 건조',
    steps: [
      { id: 'step-laundry', title: '세탁', durationMinutes: 87 },
      { id: 'step-dry', title: '건조', durationMinutes: 50 },
    ],
  },
  {
    id: 'morning_routine',
    name: '출근 준비',
    steps: [
      { id: 'step-wash', title: '씻기', durationMinutes: 20 },
      { id: 'step-dress', title: '옷 입기', durationMinutes: 10 },
      { id: 'step-commute', title: '이동', durationMinutes: 45 },
    ],
  },
  {
    id: 'custom_blank',
    name: '직접 만들기',
    steps: [
      { id: 'step-new-1', title: '새 활동', durationMinutes: 30 },
    ],
  },
];

const STORAGE_KEY = 'what_time_user_presets_v1';

export function loadCustomPresets(): PresetItem[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((p) => ({ ...p, isCustom: true }));
    }
  } catch (e) {
    console.error('Failed to load presets from localStorage', e);
  }
  return [];
}

export function saveCustomPresets(presets: PresetItem[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch (e) {
    console.error('Failed to save presets to localStorage', e);
  }
}
