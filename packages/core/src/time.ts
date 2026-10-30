// Time math for schedules and timesheets. Instants are Date (UTC); calendar
// days are "YYYY-MM-DD" strings in a location's IANA time zone. Never use the
// viewer's zone for anything a location owns.
import { TZDate } from "@date-fns/tz";
import { addDays, differenceInMinutes, format } from "date-fns";

export type LocalDate = string; // YYYY-MM-DD
export type LocalTime = string; // HH:mm

/** The location-local calendar date of an instant. */
export function localDate(at: Date, tz: string): LocalDate {
  return format(new TZDate(at, tz), "yyyy-MM-dd");
}

/** The location-local wall clock time of an instant, 24 h. */
export function localTime(at: Date, tz: string): LocalTime {
  return format(new TZDate(at, tz), "HH:mm");
}

/** The instant a wall clock time happens on a local date in a zone. */
export function toInstant(date: LocalDate, time: LocalTime, tz: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(new TZDate(y, m - 1, d, hh, mm, tz).getTime());
}

/** Adds days to a local date without going through instants (DST-safe). */
export function addLocalDays(date: LocalDate, days: number): LocalDate {
  const [y, m, d] = date.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + days));
  return utc.toISOString().slice(0, 10);
}

/** Day of week of a local date, 0 = Sunday. */
export function weekday(date: LocalDate): number {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** First day of the week containing `date`, given the location's week start. */
export function weekStartOf(date: LocalDate, weekStartDay: number): LocalDate {
  const back = (weekday(date) - weekStartDay + 7) % 7;
  return addLocalDays(date, -back);
}

/** The seven local dates of a week. */
export function weekDays(weekStart: LocalDate): LocalDate[] {
  return Array.from({ length: 7 }, (_, i) => addLocalDays(weekStart, i));
}

/** Instants bounding a run of local days: [start of first, start of day after last). */
export function localRange(from: LocalDate, days: number, tz: string): { start: Date; end: Date } {
  return { start: toInstant(from, "00:00", tz), end: toInstant(addLocalDays(from, days), "00:00", tz) };
}

/**
 * A shift entered as a local date plus start and end wall times. An end at or
 * before the start means the shift runs past midnight into the next day.
 */
export function shiftInterval(date: LocalDate, start: LocalTime, end: LocalTime, tz: string): { startAt: Date; endAt: Date } {
  const startAt = toInstant(date, start, tz);
  const endDate = end <= start ? addLocalDays(date, 1) : date;
  return { startAt, endAt: toInstant(endDate, end, tz) };
}

/** Elapsed minutes between two instants (real time, so DST nights count 7 or 9 h). */
export function minutesBetween(a: Date, b: Date): number {
  return differenceInMinutes(b, a);
}

export function overlaps(a: { startAt: Date; endAt: Date }, b: { startAt: Date; endAt: Date }): boolean {
  return a.startAt < b.endAt && b.startAt < a.endAt;
}

/** "7h 30m" */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export { addDays };
