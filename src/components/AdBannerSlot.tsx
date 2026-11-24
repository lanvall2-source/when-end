import React from 'react';

export interface AdBannerSlotProps {
  /** Future ad unit ID or placement */
  slotId?: string;
  /** Whether ads are enabled in current build */
  enabled?: boolean;
}

/**
 * Clean architectural placeholder for future Ad Banner integration.
 * In this version, enabled defaults to false and returns null,
 * guaranteeing zero empty box or broken whitespace.
 */
export const AdBannerSlot: React.FC<AdBannerSlotProps> = ({ enabled = false }) => {
  if (!enabled) {
    return null;
  }

  return (
    <div className="w-full my-3 p-3 bg-toss-bg-gray rounded-xl flex items-center justify-center text-xs text-toss-text-muted">
      <span>광고 영역</span>
    </div>
  );
};
