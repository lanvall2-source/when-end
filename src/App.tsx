import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { ModeSelector, CalculationMode } from './components/ModeSelector';
import { ResultCard } from './components/ResultCard';
import { AdBannerSlot } from './components/AdBannerSlot';
import { PresetSection } from './components/PresetSection';
import { StepEditor } from './components/StepEditor';
import { SavePresetModal } from './components/SavePresetModal';
import {
  ScheduleStep,
  calculateForward,
  calculateBackward,
} from './lib/timeCalculator';
import {
  PresetItem,
  loadCustomPresets,
  saveCustomPresets,
} from './lib/presetStore';

export const App: React.FC = () => {
  // Live clock: keeps sync with real time and updates on window focus / visibility change
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const tick = () => setCurrentTime(new Date());
    const interval = setInterval(tick, 1000);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        setCurrentTime(new Date());
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, []);

  // Calculation mode: 'forward' (지금 시작하면?) or 'backward' (그때 끝내려면?)
  const [mode, setMode] = useState<CalculationMode>('forward');

  // Initial steps: First visit shows '세탁 87분' example immediately
  const [steps, setSteps] = useState<ScheduleStep[]>([
    { id: 'initial-step-1', title: '세탁', durationMinutes: 87 },
  ]);

  // Buffer time (0, 5, 10 min)
  const [bufferMinutes, setBufferMinutes] = useState<number>(0);

  // Target date & time for Mode 2 (그때 끝내려면?)
  const [targetDateOption, setTargetDateOption] = useState<'today' | 'tomorrow' | 'custom'>('today');
  const [targetTimeString, setTargetTimeString] = useState<string>(() => {
    // Default target time: 2 hours from now rounded to nearest 5 min or default 23:00
    const d = new Date();
    d.setHours(d.getHours() + 2);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(Math.ceil(d.getMinutes() / 5) * 5 % 60).padStart(2, '0');
    return `${h}:${m}`;
  });
  const [customDateString, setCustomDateString] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });

  // Custom Presets
  const [customPresets, setCustomPresets] = useState<PresetItem[]>(() => loadCustomPresets());
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // Compute target Date object for Mode 2
  const targetDateObject = useMemo(() => {
    const [hStr, mStr] = targetTimeString.split(':');
    const hours = parseInt(hStr || '0', 10);
    const minutes = parseInt(mStr || '0', 10);

    const base = new Date(currentTime);
    if (targetDateOption === 'tomorrow') {
      base.setDate(base.getDate() + 1);
    } else if (targetDateOption === 'custom' && customDateString) {
      const [cy, cm, cd] = customDateString.split('-').map((n) => parseInt(n, 10));
      if (cy && cm && cd) {
        base.setFullYear(cy, cm - 1, cd);
      }
    }
    base.setHours(hours, minutes, 0, 0);
    return base;
  }, [currentTime, targetDateOption, customDateString, targetTimeString]);

  // Calculations
  const forwardResult = useMemo(() => {
    return calculateForward(currentTime, steps, bufferMinutes);
  }, [currentTime, steps, bufferMinutes]);

  const backwardResult = useMemo(() => {
    return calculateBackward(targetDateObject, steps, bufferMinutes, currentTime);
  }, [targetDateObject, steps, bufferMinutes, currentTime]);

  // Step operations
  const handleUpdateStep = useCallback((id: string, updates: Partial<ScheduleStep>) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  }, []);

  const handleAddStep = useCallback(() => {
    const newId = `step-${Date.now()}`;
    setSteps((prev) => [
      ...prev,
      { id: newId, title: `단계 ${prev.length + 1}`, durationMinutes: 15 },
    ]);
  }, []);

  const handleDeleteStep = useCallback((id: string) => {
    setSteps((prev) => (prev.length > 1 ? prev.filter((s) => s.id !== id) : prev));
  }, []);

  const handleMoveStep = useCallback((index: number, direction: 'up' | 'down') => {
    setSteps((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  }, []);

  // Presets operations
  const handleSelectPreset = useCallback((presetSteps: ScheduleStep[]) => {
    setSteps(presetSteps.map((s) => ({ ...s, id: `step-${Math.random().toString(36).substring(2, 9)}` })));
  }, []);

  const handleSaveCustomPreset = useCallback((presetName: string) => {
    const newPreset: PresetItem = {
      id: `custom-${Date.now()}`,
      name: presetName,
      steps: steps.map((s) => ({ ...s })),
      isCustom: true,
    };
    const updated = [newPreset, ...customPresets];
    setCustomPresets(updated);
    saveCustomPresets(updated);
  }, [steps, customPresets]);

  const handleDeleteCustomPreset = useCallback((presetId: string) => {
    const updated = customPresets.filter((p) => p.id !== presetId);
    setCustomPresets(updated);
    saveCustomPresets(updated);
  }, [customPresets]);

  const handleRenameCustomPreset = useCallback((presetId: string, newName: string) => {
    const updated = customPresets.map((p) =>
      p.id === presetId ? { ...p, name: newName } : p
    );
    setCustomPresets(updated);
    saveCustomPresets(updated);
  }, [customPresets]);

  return (
    <div className="flex-1 flex flex-col pb-10">
      {/* 1. Header */}
      <Header currentTime={currentTime} />

      <main className="flex-1 flex flex-col">
        {/* 2. Mode Selector */}
        <ModeSelector mode={mode} onSelectMode={setMode} />

        {/* 3. Primary Calculated Result Card */}
        <ResultCard
          mode={mode}
          forwardResult={forwardResult}
          backwardResult={backwardResult}
          targetDateOption={targetDateOption}
          targetTimeString={targetTimeString}
          customDateString={customDateString}
          onSelectDateOption={setTargetDateOption}
          onTargetTimeChange={setTargetTimeString}
          onCustomDateChange={setCustomDateString}
          onSwitchToForward={() => setMode('forward')}
        />

        {/* 4. Ad Slot Architecture placeholder (disabled, 0px space) */}
        <AdBannerSlot enabled={false} />

        {/* 5. Frequently used Presets */}
        <PresetSection
          customPresets={customPresets}
          onSelectPreset={handleSelectPreset}
          onDeleteCustomPreset={handleDeleteCustomPreset}
          onRenameCustomPreset={handleRenameCustomPreset}
          onOpenSaveModal={() => setIsSaveModalOpen(true)}
        />

        {/* 6. Step & Buffer Editor */}
        <StepEditor
          steps={steps}
          bufferMinutes={bufferMinutes}
          onUpdateStep={handleUpdateStep}
          onAddStep={handleAddStep}
          onDeleteStep={handleDeleteStep}
          onMoveStep={handleMoveStep}
          onSetBufferMinutes={setBufferMinutes}
        />
      </main>

      {/* 7. Save Preset Modal */}
      <SavePresetModal
        isOpen={isSaveModalOpen}
        steps={steps}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveCustomPreset}
      />
    </div>
  );
};

export default App;
