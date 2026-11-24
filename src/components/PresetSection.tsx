import React, { useState } from 'react';
import { Bookmark, Sparkles, Trash2, Edit2, Check, X } from 'lucide-react';
import { DEFAULT_PRESETS, PresetItem } from '../lib/presetStore';
import { ScheduleStep } from '../lib/timeCalculator';

interface PresetSectionProps {
  customPresets: PresetItem[];
  onSelectPreset: (steps: ScheduleStep[]) => void;
  onDeleteCustomPreset: (presetId: string) => void;
  onRenameCustomPreset: (presetId: string, newName: string) => void;
  onOpenSaveModal: () => void;
}

export const PresetSection: React.FC<PresetSectionProps> = ({
  customPresets,
  onSelectPreset,
  onDeleteCustomPreset,
  onRenameCustomPreset,
  onOpenSaveModal,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleStartRename = (preset: PresetItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(preset.id);
    setEditingName(preset.name);
  };

  const handleConfirmRename = (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingName.trim()) {
      onRenameCustomPreset(presetId, editingName.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <section className="mx-4 mt-6">
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-sm font-bold text-toss-text flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-toss-blue" />
          자주 쓰는 프리셋
        </h3>
        <button
          type="button"
          onClick={onOpenSaveModal}
          className="text-xs font-semibold text-toss-blue hover:text-toss-blue-dark flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-toss-blue/5 transition-colors"
        >
          <Bookmark className="w-3.5 h-3.5" />
          현재 루틴 저장
        </button>
      </div>

      {/* Built-in default presets */}
      <div className="grid grid-cols-3 gap-2">
        {DEFAULT_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelectPreset(preset.steps)}
            className="p-3 bg-white border border-toss-border hover:border-toss-blue rounded-2xl text-left transition-all active:scale-[0.98] shadow-sm flex flex-col justify-between"
          >
            <div>
              <p className="text-xs font-bold text-toss-text truncate">{preset.name}</p>
              <p className="text-[10px] text-toss-text-muted mt-1 leading-tight line-clamp-2">
                {preset.steps.map((s) => `${s.title} ${s.durationMinutes}분`).join(' → ')}
              </p>
            </div>
            <span className="text-[10px] text-toss-blue font-semibold mt-2 inline-block">
              불러오기
            </span>
          </button>
        ))}
      </div>

      {/* Custom presets if any */}
      {customPresets.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] font-semibold text-toss-text-muted mb-1.5">나의 저장된 프리셋</p>
          <div className="flex flex-wrap gap-2">
            {customPresets.map((preset) => (
              <div
                key={preset.id}
                onClick={() => onSelectPreset(preset.steps)}
                className="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/80 border border-blue-200/70 hover:border-toss-blue rounded-xl text-xs cursor-pointer transition-all active:scale-[0.98]"
              >
                {editingId === preset.id ? (
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="w-20 px-1 py-0.5 text-xs bg-white border border-toss-blue rounded font-medium focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={(e) => handleConfirmRename(preset.id, e)}
                      className="p-0.5 text-toss-blue hover:text-toss-blue-dark"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelRename}
                      className="p-0.5 text-toss-text-muted hover:text-toss-text"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="font-semibold text-toss-text">{preset.name}</span>
                    <span className="text-[10px] text-toss-text-muted">
                      ({preset.steps.length}단계)
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleStartRename(preset, e)}
                      title="이름 변경"
                      className="p-0.5 text-toss-text-muted hover:text-toss-text transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCustomPreset(preset.id);
                      }}
                      title="삭제"
                      className="p-0.5 text-toss-text-muted hover:text-toss-red transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
