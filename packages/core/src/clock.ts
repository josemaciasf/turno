// Rules checked before a punch is accepted.
export interface ClockInCheck {
  now: Date;
  hasOpenCard: boolean;
  nextShiftStart: Date | null; // the person's next scheduled shift today, if any
  earlyClockInMinutes: number;
}

export type ClockInResult = { ok: true } | { ok: false; reason: "already_clocked_in" } | { ok: false; reason: "too_early"; allowedFrom: Date };

export function canClockIn(c: ClockInCheck): ClockInResult {
  if (c.hasOpenCard) return { ok: false, reason: "already_clocked_in" };
  if (c.nextShiftStart) {
    const allowedFrom = new Date(c.nextShiftStart.getTime() - c.earlyClockInMinutes * 60_000);
    if (c.now < allowedFrom) return { ok: false, reason: "too_early", allowedFrom };
  }
  return { ok: true };
}
