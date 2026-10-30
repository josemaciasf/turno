import { describe, expect, it } from "vitest";
import {
  canClockIn, formatDuration, grossCents, localDate, localTime, minutesBetween, overlaps,
  shiftInterval, toInstant, weekDays, weekStartOf, weeklyTotals,
} from "./index.ts";

const CHI = "America/Chicago";

describe("time", () => {
  it("converts local wall time to an instant and back", () => {
    const at = toInstant("2026-11-02", "09:00", CHI);
    expect(at.toISOString()).toBe("2026-11-02T15:00:00.000Z");
    expect(localDate(at, CHI)).toBe("2026-11-02");
    expect(localTime(at, CHI)).toBe("09:00");
  });

  it("finds the week start for a Monday-start and a Sunday-start location", () => {
    expect(weekStartOf("2026-11-05", 1)).toBe("2026-11-02");
    expect(weekStartOf("2026-11-02", 1)).toBe("2026-11-02");
    expect(weekStartOf("2026-11-05", 0)).toBe("2026-11-01");
    expect(weekDays("2026-11-02")).toHaveLength(7);
    expect(weekDays("2026-12-28").at(-1)).toBe("2027-01-03");
  });

  it("treats an end time at or before the start as an overnight shift", () => {
    const s = shiftInterval("2026-11-06", "22:00", "06:00", CHI);
    expect(minutesBetween(s.startAt, s.endAt)).toBe(480);
    expect(localDate(s.endAt, CHI)).toBe("2026-11-07");
  });

  it("counts real elapsed time across the fall-back DST night", () => {
    // 2026-11-01 02:00 CDT -> 01:00 CST in Chicago
    const s = shiftInterval("2026-10-31", "22:00", "06:00", CHI);
    expect(minutesBetween(s.startAt, s.endAt)).toBe(540);
  });

  it("detects overlap but not touching shifts", () => {
    const a = shiftInterval("2026-11-02", "09:00", "17:00", CHI);
    const b = shiftInterval("2026-11-02", "16:00", "20:00", CHI);
    const c = shiftInterval("2026-11-02", "17:00", "20:00", CHI);
    expect(overlaps(a, b)).toBe(true);
    expect(overlaps(a, c)).toBe(false);
  });

  it("formats durations", () => {
    expect(formatDuration(450)).toBe("7h 30m");
    expect(formatDuration(480)).toBe("8h");
  });
});

describe("pay", () => {
  const day = (d: string, from: string, to: string) => {
    const s = shiftInterval(d, from, to, CHI);
    return { clockInAt: s.startAt, clockOutAt: s.endAt };
  };

  it("pays weekly overtime after 40 hours", () => {
    const cards = ["2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05", "2026-11-06"].map((d) => day(d, "08:00", "17:00"));
    const t = weeklyTotals(cards);
    expect(t.workedMinutes).toBe(45 * 60);
    expect(t.regularMinutes).toBe(40 * 60);
    expect(t.overtimeMinutes).toBe(5 * 60);
    expect(grossCents(t, 2000)).toBe(40 * 2000 + 5 * 3000);
  });

  it("applies daily overtime without double counting it weekly", () => {
    const cards = ["2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05", "2026-11-06"].map((d) => day(d, "08:00", "18:00"));
    const t = weeklyTotals(cards, { weeklyThresholdMinutes: 2400, dailyThresholdMinutes: 480 });
    expect(t.regularMinutes).toBe(40 * 60);
    expect(t.overtimeMinutes).toBe(10 * 60);
  });

  it("subtracts unpaid breaks and counts open cards up to now", () => {
    const start = toInstant("2026-11-02", "09:00", CHI);
    const now = toInstant("2026-11-02", "11:30", CHI);
    const t = weeklyTotals([{ clockInAt: start, clockOutAt: null, unpaidBreakMinutes: 30 }], undefined, now);
    expect(t.workedMinutes).toBe(120);
    expect(t.openCards).toBe(1);
  });
});

describe("clock", () => {
  const shift = toInstant("2026-11-02", "09:00", CHI);
  it("blocks a second clock-in", () => {
    expect(canClockIn({ now: shift, hasOpenCard: true, nextShiftStart: null, earlyClockInMinutes: 10 })).toEqual({ ok: false, reason: "already_clocked_in" });
  });
  it("blocks clocking in too early and allows it inside the window", () => {
    const early = canClockIn({ now: toInstant("2026-11-02", "08:30", CHI), hasOpenCard: false, nextShiftStart: shift, earlyClockInMinutes: 10 });
    expect(early.ok).toBe(false);
    const ok = canClockIn({ now: toInstant("2026-11-02", "08:52", CHI), hasOpenCard: false, nextShiftStart: shift, earlyClockInMinutes: 10 });
    expect(ok.ok).toBe(true);
  });
  it("lets unscheduled people clock in", () => {
    expect(canClockIn({ now: shift, hasOpenCard: false, nextShiftStart: null, earlyClockInMinutes: 10 }).ok).toBe(true);
  });
});
