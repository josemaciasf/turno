"use server";
// Server actions for the vertical slice. Each one checks the session and role
// itself; never trust that the caller came from a page that already did.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { shiftInterval } from "@turno/core";
import * as db from "@/lib/store";
import { requireSession, signInAs, signOut } from "@/lib/session";
import { RuleError, type Role } from "@/lib/types";

export type FormState = { error?: string; ok?: string; fields?: Record<string, string> };

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const fail = (e: unknown, fields?: Record<string, string>): FormState => {
  if (e instanceof RuleError) return { error: e.message, fields };
  throw e;
};

export async function signupAction(_: FormState, f: FormData): Promise<FormState> {
  const fields = Object.fromEntries(["companyName", "industry", "locationName", "timezone", "ownerName", "ownerEmail"].map((k) => [k, str(f, k)]));
  if (!fields.companyName || !fields.ownerName || !fields.ownerEmail || !fields.locationName) {
    return { error: "Completa el nombre del negocio, el local, tu nombre y tu correo.", fields };
  }
  const { member } = await db.createCompany({
    companyName: fields.companyName, industry: fields.industry || null, locationName: fields.locationName,
    timezone: fields.timezone || "America/Chicago", ownerName: fields.ownerName, ownerEmail: fields.ownerEmail,
  });
  await signInAs(member.id);
  redirect("/team?nuevo=1");
}

export async function addMemberAction(_: FormState, f: FormData): Promise<FormState> {
  const s = await requireSession(["owner", "manager"]);
  const fields = Object.fromEntries(["fullName", "phone", "email", "role", "jobRole", "wage"].map((k) => [k, str(f, k)]));
  if (!fields.fullName) return { error: "Escribe el nombre.", fields };
  const wage = fields.wage ? Math.round(Number(fields.wage) * 100) : 0;
  if (!Number.isFinite(wage) || wage < 0) return { error: "El sueldo por hora no puede ser negativo.", fields };
  const role = (["employee", "manager"].includes(fields.role) ? fields.role : "employee") as Role;
  try {
    await db.addMember(s.company.id, { fullName: fields.fullName, phone: fields.phone || null, email: fields.email || null, role, jobRole: fields.jobRole || null, wageCents: wage });
  } catch (e) { return fail(e, fields); }
  revalidatePath("/team");
  return { ok: `${fields.fullName} se agregó al equipo.` };
}

export async function createShiftAction(_: FormState, f: FormData): Promise<FormState> {
  const s = await requireSession(["owner", "manager"]);
  const week = str(f, "week"), date = str(f, "date"), start = str(f, "start"), end = str(f, "end");
  const fields = { memberId: str(f, "memberId"), jobRole: str(f, "jobRole"), date, start, end, breakMin: str(f, "breakMin"), note: str(f, "note") };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) {
    return { error: "Elige el día y las horas de entrada y salida.", fields };
  }
  if (start === end) return { error: "La hora de salida tiene que ser distinta a la de entrada.", fields };
  const { startAt, endAt } = shiftInterval(date, start, end, s.location.timezone);
  try {
    await db.createShift(s.location, week, {
      memberId: fields.memberId || null, jobRole: fields.jobRole || null, startAt, endAt,
      unpaidBreakMin: Math.max(0, Number(fields.breakMin) || 0), note: fields.note || null,
    });
  } catch (e) { return fail(e, fields); }
  revalidatePath("/schedule");
  redirect(`/schedule?semana=${week}`);
}

export async function deleteShiftAction(f: FormData) {
  const s = await requireSession(["owner", "manager"]);
  await db.deleteShift(s.company.id, str(f, "shiftId"));
  revalidatePath("/schedule");
}

export async function copyWeekAction(f: FormData) {
  const s = await requireSession(["owner", "manager"]);
  const n = await db.copyWeek(s.location, str(f, "from"), str(f, "to"));
  revalidatePath("/schedule");
  redirect(`/schedule?semana=${str(f, "to")}&copiados=${n}`);
}

export async function publishAction(f: FormData) {
  const s = await requireSession(["owner", "manager"]);
  const week = str(f, "week");
  const { notified } = await db.publishWeek(s.location, week, s.member.id);
  revalidatePath("/schedule");
  redirect(`/schedule?semana=${week}&publicado=${notified}`);
}

export async function clockInAction(): Promise<FormState> {
  const s = await requireSession();
  try { await db.clockIn(s.member, s.location); } catch (e) {
    if (e instanceof RuleError && e.code === "too_early") return { error: `too_early:${e.message}` };
    return fail(e);
  }
  revalidatePath("/clock");
  return { ok: "in" };
}

export async function clockOutAction(): Promise<FormState> {
  const s = await requireSession();
  try { await db.clockOut(s.member); } catch (e) { return fail(e); }
  revalidatePath("/clock");
  return { ok: "out" };
}

export async function approveAction(f: FormData) {
  const s = await requireSession(["owner", "manager"]);
  await db.approveCards(s.company.id, f.getAll("cardId").map(String));
  revalidatePath("/timesheets");
}

export async function devSignInAction(f: FormData) {
  if (process.env.NODE_ENV === "production" && process.env.TURNO_DEV_LOGIN !== "1") redirect("/signup");
  await signInAs(str(f, "memberId"));
  redirect("/");
}

export async function signOutAction() {
  await signOut();
  redirect("/signup");
}
