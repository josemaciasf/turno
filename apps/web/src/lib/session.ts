// Dev session: an httpOnly cookie holding the member id. Replaced by Supabase
// Auth in replica-backend; screens only call getSession / requireSession.
import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionRows } from "./store";
import type { Role, Session } from "./types";

const COOKIE = "turno_member";

export async function getSession(): Promise<Session | null> {
  const id = (await cookies()).get(COOKIE)?.value;
  return id ? getSessionRows(id) : null;
}

export async function requireSession(roles?: Role[]): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/signup");
  if (roles && !roles.includes(s.member.role)) redirect(s.member.role === "employee" ? "/clock" : "/schedule");
  return s;
}

export async function signInAs(memberId: string) {
  (await cookies()).set(COOKIE, memberId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
}

export async function signOut() {
  (await cookies()).delete(COOKIE);
}

export const isManager = (s: Session) => s.member.role !== "employee";
