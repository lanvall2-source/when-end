export interface ScheduleStep {
  id: string;
  title: string;
  durationMinutes: number;
}

export interface StepCalculationResult {
  stepId: string;
  title: string;
  durationMinutes: number;
  startTime: Date;
  endTime: Date;
  formattedStart: string;
  formattedEnd: string;
  isBuffer?: boolean;
}

export interface ForwardCalculationResult {
  startTime: Date;
  endTime: Date;
  totalDurationMinutes: number;
  formattedTotalDuration: string;
  formattedStartTime: string;
  formattedEndTime: string;
  dayDifference: number; // 0: today, 1: tomorrow, -1: yesterday, etc.
  highlightText: string;
  steps: StepCalculationResult[];
}

export interface BackwardCalculationResult {
  targetEndTime: Date;
  calculatedStartTime: Date;
  totalDurationMinutes: number;
  formattedTotalDuration: string;
  formattedTargetEndTime: string;
  formattedCalculatedStartTime: string;
  dayDifference: number;
  highlightText: string;
  steps: StepCalculationResult[];
  isOverdue: boolean;
  overdueMinutes: number;
  alternativeEndTime: Date;
  formattedAlternativeEndTime: string;
}

/**
 * Format total duration in Korean (e.g. 137 -> '2시간 17분', 45 -> '45분')
 */
export function formatDurationKorean(totalMinutes: number): string {
  const safeMinutes = Math.max(0, Math.round(totalMinutes || 0));
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  if (hours === 0 && minutes === 0) return '0분';
  if (hours === 0) return `${minutes}분`;
  if (minutes === 0) return `${hours}시간`;
  return `${hours}시간 ${minutes}분`;
}

/**
 * Format time to 12-hour Korean string (e.g. '오후 8:15', '오전 12:25')
 */
export function formatKoreanTime(date: Date): string {
  if (!date || isNaN(date.getTime())) return '--:--';
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours < 12 ? '오전' : '오후';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${period} ${displayHours}:${displayMinutes}`;
}

/**
 * Calculates calendar day difference between baseDate and targetDate
 * 0 = same day, 1 = next day (tomorrow), -1 = previous day (yesterday)
 */
export function getCalendarDayDiff(baseDate: Date, targetDate: Date): number {
  const baseMidnight = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const diffMs = targetMidnight.getTime() - baseMidnight.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Format time with day difference relative to referenceDate
 * e.g., '오후 10:32', '내일 오전 12:25', '어제 오후 11:40'
 */
export function formatTimeWithDayDiff(referenceDate: Date, targetDate: Date): string {
  const timeStr = formatKoreanTime(targetDate);
  const dayDiff = getCalendarDayDiff(referenceDate, targetDate);

  if (dayDiff === 0) {
    return timeStr;
  }
  if (dayDiff === 1) {
    return `내일 ${timeStr}`;
  }
  if (dayDiff === -1) {
    return `어제 ${timeStr}`;
  }
  if (dayDiff > 1) {
    return `+${dayDiff}일 ${timeStr}`;
  }
  return `${dayDiff}일 ${timeStr}`;
}

/**
 * Sanitize step duration: guarantees non-negative integer
 */
export function sanitizeDuration(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  const parsed = parseInt(String(val), 10);
  if (isNaN(parsed) || parsed < 0) return 0;
  return parsed;
}

/**
 * Mode 1: 지금 시작하면? (Forward calculation)
 */
export function calculateForward(
  startTime: Date,
  steps: ScheduleStep[],
  bufferMinutes: number = 0
): ForwardCalculationResult {
  const safeBuffer = sanitizeDuration(bufferMinutes);
  let currentPointer = new Date(startTime.getTime());
  let totalMinutes = 0;

  const calculatedSteps: StepCalculationResult[] = [];

  for (const step of steps) {
    const duration = sanitizeDuration(step.durationMinutes);
    const stepStart = new Date(currentPointer.getTime());
    const stepEnd = new Date(stepStart.getTime() + duration * 60 * 1000);

    calculatedSteps.push({
      stepId: step.id,
      title: step.title || '이름 없음',
      durationMinutes: duration,
      startTime: stepStart,
      endTime: stepEnd,
      formattedStart: formatTimeWithDayDiff(startTime, stepStart),
      formattedEnd: formatTimeWithDayDiff(startTime, stepEnd),
      isBuffer: false,
    });

    currentPointer = stepEnd;
    totalMinutes += duration;
  }

  // Add buffer step if present
  if (safeBuffer > 0) {
    const bufferStart = new Date(currentPointer.getTime());
    const bufferEnd = new Date(bufferStart.getTime() + safeBuffer * 60 * 1000);
    calculatedSteps.push({
      stepId: 'buffer-step',
      title: `여유 시간 (+${safeBuffer}분)`,
      durationMinutes: safeBuffer,
      startTime: bufferStart,
      endTime: bufferEnd,
      formattedStart: formatTimeWithDayDiff(startTime, bufferStart),
      formattedEnd: formatTimeWithDayDiff(startTime, bufferEnd),
      isBuffer: true,
    });
    currentPointer = bufferEnd;
    totalMinutes += safeBuffer;
  }

  const finalEndTime = currentPointer;
  const dayDiff = getCalendarDayDiff(startTime, finalEndTime);
  const formattedEnd = formatTimeWithDayDiff(startTime, finalEndTime);

  return {
    startTime,
    endTime: finalEndTime,
    totalDurationMinutes: totalMinutes,
    formattedTotalDuration: formatDurationKorean(totalMinutes),
    formattedStartTime: formatKoreanTime(startTime),
    formattedEndTime: formattedEnd,
    dayDifference: dayDiff,
    highlightText: `${formattedEnd}에 끝나요`,
    steps: calculatedSteps,
  };
}

/**
 * Mode 2: 그때 끝내려면? (Backward calculation)
 */
export function calculateBackward(
  targetEndTime: Date,
  steps: ScheduleStep[],
  bufferMinutes: number = 0,
  now: Date = new Date()
): BackwardCalculationResult {
  const safeBuffer = sanitizeDuration(bufferMinutes);
  let totalMinutes = safeBuffer;
  for (const step of steps) {
    totalMinutes += sanitizeDuration(step.durationMinutes);
  }

  const calculatedStartTime = new Date(targetEndTime.getTime() - totalMinutes * 60 * 1000);
  const dayDiff = getCalendarDayDiff(targetEndTime, calculatedStartTime);

  // Now calculate step by step from calculatedStartTime forward to targetEndTime
  let currentPointer = new Date(calculatedStartTime.getTime());
  const calculatedSteps: StepCalculationResult[] = [];

  for (const step of steps) {
    const duration = sanitizeDuration(step.durationMinutes);
    const stepStart = new Date(currentPointer.getTime());
    const stepEnd = new Date(stepStart.getTime() + duration * 60 * 1000);

    calculatedSteps.push({
      stepId: step.id,
      title: step.title || '이름 없음',
      durationMinutes: duration,
      startTime: stepStart,
      endTime: stepEnd,
      formattedStart: formatTimeWithDayDiff(now, stepStart),
      formattedEnd: formatTimeWithDayDiff(now, stepEnd),
      isBuffer: false,
    });

    currentPointer = stepEnd;
  }

  if (safeBuffer > 0) {
    const bufferStart = new Date(currentPointer.getTime());
    const bufferEnd = new Date(bufferStart.getTime() + safeBuffer * 60 * 1000);
    calculatedSteps.push({
      stepId: 'buffer-step',
      title: `여유 시간 (+${safeBuffer}분)`,
      durationMinutes: safeBuffer,
      startTime: bufferStart,
      endTime: bufferEnd,
      formattedStart: formatTimeWithDayDiff(now, bufferStart),
      formattedEnd: formatTimeWithDayDiff(now, bufferEnd),
      isBuffer: true,
    });
  }

  // Check overdue relative to `now`
  const nowMs = now.getTime();
  const startMs = calculatedStartTime.getTime();
  const diffMs = nowMs - startMs;
  const isOverdue = diffMs > 30 * 1000; // overdue if more than 30s in the past
  const overdueMinutes = isOverdue ? Math.ceil(diffMs / (60 * 1000)) : 0;

  const alternativeEndTime = new Date(now.getTime() + totalMinutes * 60 * 1000);
  const formattedAlternativeEnd = formatTimeWithDayDiff(now, alternativeEndTime);

  const formattedCalculatedStart = formatTimeWithDayDiff(targetEndTime, calculatedStartTime);

  return {
    targetEndTime,
    calculatedStartTime,
    totalDurationMinutes: totalMinutes,
    formattedTotalDuration: formatDurationKorean(totalMinutes),
    formattedTargetEndTime: formatKoreanTime(targetEndTime),
    formattedCalculatedStartTime: formattedCalculatedStart,
    dayDifference: dayDiff,
    highlightText: `${formattedCalculatedStart}에 시작하세요`,
    steps: calculatedSteps,
    isOverdue,
    overdueMinutes,
    alternativeEndTime,
    formattedAlternativeEndTime: formattedAlternativeEnd,
  };
}
