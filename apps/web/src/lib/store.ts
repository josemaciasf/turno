// Development data layer: a JSON file under .data/. Same function signatures
// the Supabase layer will implement (replica-backend). Server-only.
import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { addLocalDays, canClockIn, localDate, localRange, localTime, overlaps, toInstant } from "@turno/core";
import type { Company, Location, Member, Role, ScheduleWeek, Shift, TimeCard } from "./types";
import { RuleError } from "./types";

interface Db { companies: Company[]; locations: Location[]; members: Member[]; weeks: ScheduleWeek[]; shifts: Shift[]; cards: TimeCard[] }

const FILE = path.join(process.cwd(), ".data", "store.json");
const empty = (): Db => ({ companies: [], locations: [], members: [], weeks: [], shifts: [], cards: [] });

let queue: Promise<unknown> = Promise.resolve();

async function read(): Promise<Db> {
  try { return { ...empty(), ...JSON.parse(await fs.readFile(FILE, "utf8")) }; } catch { return empty(); }
}

async function write(db: Db) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = FILE + "." + process.pid + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(db, null, 2));
  await fs.rename(tmp, FILE);
}

/** Serialises read-modify-write so two requests cannot lose each other's change. */
function tx<T>(fn: (db: Db) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => { const db = await read(); const out = await fn(db); await write(db); return out; });
  queue = run.catch(() => undefined);
  return run;
}

const now = () => new Date().toISOString();

// ------------------------------------------------------------- companies & team

export async function createCompany(input: {
  companyName: string; industry: string | null; locationName: string; timezone: string;
  ownerName: string; ownerEmail: string;
}): Promise<{ company: Company; location: Location; member: Member }> {
  return tx((db) => {
    const company: Company = { id: randomUUID(), name: input.companyName, industry: input.industry, currency: "USD", createdAt: now() };
    const location: Location = {
      id: randomUUID(), companyId: company.id, name: input.locationName, timezone: input.timezone,
      weekStartDay: 1, earlyClockInMin: 10, otWeeklyMin: 2400, otDailyMin: null,
    };
    const member: Member = {
      id: randomUUID(), companyId: company.id, fullName: input.ownerName, email: input.ownerEmail, phone: null,
      role: "owner", status: "active", jobRole: null, wageCents: 0, colour: 8,
    };
    db.companies.push(company); db.locations.push(location); db.members.push(member);
    return { company, location, member };
  });
}

export async function getSessionRows(memberId: string) {
  const db = await read();
  const member = db.members.find((m) => m.id === memberId && m.status !== "archived");
  if (!member) return null;
  const company = db.companies.find((c) => c.id === member.companyId)!;
  const location = db.locations.find((l) => l.companyId === company.id)!;
  return { member, company, location };
}

export async function listAllMembersForDevLogin() {
  const db = await read();
  return db.members.filter((m) => m.status !== "archived").map((m) => ({
    ...m, companyName: db.companies.find((c) => c.id === m.companyId)?.name ?? "",
  }));
}

export async function listMembers(companyId: string): Promise<Member[]> {
  const db = await read();
  return db.members.filter((m) => m.companyId === companyId && m.status !== "archived")
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export async function addMember(companyId: string, input: {
  fullName: string; email: string | null; phone: string | null; role: Role; jobRole: string | null; wageCents: number;
}): Promise<Member> {
  if (!input.email && !input.phone) throw new RuleError("unreachable", "Agrega un celular o un correo para poder mandarle la invitación.");
  return tx((db) => {
    const used = db.members.filter((m) => m.companyId === companyId).length;
    const member: Member = { id: randomUUID(), companyId, ...input, status: "invited", colour: (used % 7) + 1 };
    db.members.push(member);
    return member;
  });
}

// ------------------------------------------------------------- schedule

export async function getWeek(location: Location, weekStart: string): Promise<{ week: ScheduleWeek | null; shifts: Shift[] }> {
  const db = await read();
  const week = db.weeks.find((w) => w.locationId === location.id && w.weekStart === weekStart) ?? null;
  const { start, end } = localRange(weekStart, 7, location.timezone);
  const shifts = db.shifts.filter((s) => s.locationId === location.id && new Date(s.startAt) >= start && new Date(s.startAt) < end)
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
  return { week, shifts };
}

function ensureWeek(db: Db, location: Location, weekStart: string): ScheduleWeek {
  let week = db.weeks.find((w) => w.locationId === location.id && w.weekStart === weekStart);
  if (!week) {
    week = { id: randomUUID(), companyId: location.companyId, locationId: location.id, weekStart, status: "draft", publishedAt: null, publishedBy: null };
    db.weeks.push(week);
  }
  return week;
}

export async function createShift(location: Location, weekStart: string, input: {
  memberId: string | null; jobRole: string | null; startAt: Date; endAt: Date; unpaidBreakMin: number; note: string | null;
}): Promise<Shift> {
  if (input.endAt <= input.startAt) throw new RuleError("invalid_range", "El turno tiene que terminar después de empezar.");
  if (input.endAt.getTime() - input.startAt.getTime() > 24 * 3600_000) throw new RuleError("too_long", "Un turno no puede durar más de 24 horas.");
  return tx((db) => {
    if (input.memberId) {
      const member = db.members.find((m) => m.id === input.memberId && m.companyId === location.companyId);
      if (!member) throw new RuleError("not_found", "Esa persona no está en este equipo.");
      const clash = db.shifts.find((s) => s.memberId === input.memberId &&
        overlaps({ startAt: new Date(s.startAt), endAt: new Date(s.endAt) }, input));
      if (clash) throw new RuleError("double_booked", `${member.fullName} ya tiene un turno a esa hora.`);
    }
    const week = ensureWeek(db, location, weekStart);
    const shift: Shift = {
      id: randomUUID(), companyId: location.companyId, locationId: location.id, scheduleWeekId: week.id,
      memberId: input.memberId, jobRole: input.jobRole, startAt: input.startAt.toISOString(), endAt: input.endAt.toISOString(),
      unpaidBreakMin: input.unpaidBreakMin, note: input.note, publishedVersion: 0, dirty: true,
    };
    db.shifts.push(shift);
    return shift;
  });
}

export async function deleteShift(companyId: string, shiftId: string): Promise<void> {
  await tx((db) => { db.shifts = db.shifts.filter((s) => !(s.id === shiftId && s.companyId === companyId)); });
}

export async function copyWeek(location: Location, fromWeek: string, toWeek: string): Promise<number> {
  const { shifts } = await getWeek(location, fromWeek);
  const tz = location.timezone;
  const days = Math.round((Date.parse(toWeek) - Date.parse(fromWeek)) / 86_400_000);
  // Move by local calendar days so wall times survive a DST change between weeks.
  const move = (iso: string) => {
    const at = new Date(iso);
    return toInstant(addLocalDays(localDate(at, tz), days), localTime(at, tz), tz);
  };
  let created = 0;
  for (const s of shifts) {
    try {
      await createShift(location, toWeek, {
        memberId: s.memberId, jobRole: s.jobRole, note: s.note, unpaidBreakMin: s.unpaidBreakMin,
        startAt: move(s.startAt), endAt: move(s.endAt),
      });
      created++;
    } catch (e) {
      if (!(e instanceof RuleError)) throw e; // skip clashes with shifts already in the target week
    }
  }
  return created;
}

export async function publishWeek(location: Location, weekStart: string, publisherId: string): Promise<{ notified: number }> {
  return tx((db) => {
    const week = ensureWeek(db, location, weekStart);
    const affected = new Set<string>();
    for (const s of db.shifts) {
      if (s.scheduleWeekId !== week.id || !s.dirty) continue;
      s.dirty = false; s.publishedVersion += 1;
      if (s.memberId) affected.add(s.memberId);
    }
    week.status = "published"; week.publishedAt = now(); week.publishedBy = publisherId;
    // Notifications are sent by a job in the real backend; here we only count them.
    return { notified: affected.size };
  });
}

export async function myPublishedShifts(member: Member, from: Date, to: Date): Promise<Shift[]> {
  const db = await read();
  return db.shifts.filter((s) => s.memberId === member.id && s.publishedVersion > 0 &&
    new Date(s.endAt) > from && new Date(s.startAt) < to).sort((a, b) => a.startAt.localeCompare(b.startAt));
}

// ------------------------------------------------------------- time clock

export async function openCard(memberId: string): Promise<TimeCard | null> {
  const db = await read();
  return db.cards.find((c) => c.memberId === memberId && c.clockOutAt === null) ?? null;
}

export async function clockIn(member: Member, location: Location, at = new Date()): Promise<TimeCard> {
  return tx((db) => {
    const open = db.cards.some((c) => c.memberId === member.id && c.clockOutAt === null);
    // the person's current or next published shift within the coming 12 hours
    const end = new Date(at.getTime() + 12 * 3600_000);
    const next = db.shifts
      .filter((s) => s.memberId === member.id && s.publishedVersion > 0 && new Date(s.endAt) > at && new Date(s.startAt) < end)
      .sort((a, b) => a.startAt.localeCompare(b.startAt))[0];
    const started = next && new Date(next.startAt) <= at;
    const check = canClockIn({ now: at, hasOpenCard: open, nextShiftStart: next && !started ? new Date(next.startAt) : null, earlyClockInMinutes: location.earlyClockInMin });
    if (!check.ok) {
      if (check.reason === "already_clocked_in") throw new RuleError(check.reason, "Ya checaste entrada.");
      throw new RuleError(check.reason, check.allowedFrom.toISOString());
    }
    const card: TimeCard = {
      id: randomUUID(), companyId: member.companyId, locationId: location.id, memberId: member.id,
      shiftId: next?.id ?? null, wageCents: member.wageCents, clockInAt: at.toISOString(), clockOutAt: null,
      source: "web", approvedAt: null,
    };
    db.cards.push(card);
    return card;
  });
}

export async function clockOut(member: Member, at = new Date()): Promise<TimeCard> {
  return tx((db) => {
    const card = db.cards.find((c) => c.memberId === member.id && c.clockOutAt === null);
    if (!card) throw new RuleError("not_clocked_in", "No has checado entrada.");
    card.clockOutAt = at.toISOString();
    return card;
  });
}

export async function cardsInRange(location: Location, from: Date, to: Date): Promise<TimeCard[]> {
  const db = await read();
  return db.cards.filter((c) => c.locationId === location.id && new Date(c.clockInAt) >= from && new Date(c.clockInAt) < to);
}

export async function approveCards(companyId: string, ids: string[]): Promise<number> {
  return tx((db) => {
    let n = 0;
    for (const c of db.cards) {
      if (c.companyId === companyId && ids.includes(c.id) && c.clockOutAt && !c.approvedAt) { c.approvedAt = now(); n++; }
    }
    return n;
  });
}
