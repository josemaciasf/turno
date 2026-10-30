// Row shapes mirror replica/schema.sql so the Supabase data layer can replace
// the dev store without touching screens.
export type Role = "owner" | "manager" | "employee";

export interface Company { id: string; name: string; industry: string | null; currency: string; createdAt: string }

export interface Location {
  id: string; companyId: string; name: string; timezone: string;
  weekStartDay: number; earlyClockInMin: number; otWeeklyMin: number; otDailyMin: number | null;
}

export interface Member {
  id: string; companyId: string; fullName: string; email: string | null; phone: string | null;
  role: Role; status: "invited" | "active" | "archived";
  jobRole: string | null; wageCents: number; colour: number; // 1..8, role-n token
}

export interface ScheduleWeek {
  id: string; companyId: string; locationId: string; weekStart: string;
  status: "draft" | "published"; publishedAt: string | null; publishedBy: string | null;
}

export interface Shift {
  id: string; companyId: string; locationId: string; scheduleWeekId: string;
  memberId: string | null; jobRole: string | null; startAt: string; endAt: string;
  unpaidBreakMin: number; note: string | null; publishedVersion: number; dirty: boolean;
}

export interface TimeCard {
  id: string; companyId: string; locationId: string; memberId: string; shiftId: string | null;
  wageCents: number; clockInAt: string; clockOutAt: string | null;
  source: "kiosk" | "mobile" | "web" | "manual"; approvedAt: string | null;
}

export interface Session { member: Member; company: Company; location: Location }

export class RuleError extends Error {
  constructor(public code: string, message: string) { super(message); }
}
