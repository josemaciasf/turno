"use client";
import { useActionState, useEffect, useState } from "react";
import { clockInAction, clockOutAction, type FormState } from "@/app/actions";
import { Banner } from "@/components/ui";

function elapsed(fromIso: string, now: number) {
  const s = Math.max(0, Math.floor((now - Date.parse(fromIso)) / 1000));
  const p = (n: number) => String(n).padStart(2, "0");
  return `${Math.floor(s / 3600)}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
}

const timeIn = (iso: string, tz: string) =>
  new Intl.DateTimeFormat("es-US", { hour: "numeric", minute: "2-digit", timeZone: tz }).format(new Date(iso));

// ClockButton (components.md): big, one tap, result announced to screen readers.
export function ClockPanel({ clockedInAt, tz }: { clockedInAt: string | null; tz: string }) {
  const [inState, clockIn, inPending] = useActionState<FormState>(clockInAction, {});
  const [outState, clockOut, outPending] = useActionState<FormState>(clockOutAction, {});
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!clockedInAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [clockedInAt]);

  const tooEarly = inState.error?.startsWith("too_early:") ? inState.error.slice(10) : null;
  const error = tooEarly ? null : inState.error ?? outState.error;
  const pending = inPending || outPending;

  return (
    <div className="mt-4 grid gap-3">
      <p className="tnum text-center text-display" aria-hidden={!clockedInAt}>{clockedInAt ? elapsed(clockedInAt, now) : "0:00:00"}</p>
      <p className="sr-only" aria-live="polite">
        {clockedInAt ? `Checaste entrada a las ${timeIn(clockedInAt, tz)}` : outState.ok === "out" ? "Checaste salida" : ""}
      </p>
      {clockedInAt ? (
        <form action={clockOut}>
          <button disabled={pending} aria-busy={pending} className="h-16 w-full rounded-lg bg-clock-out text-lg text-on-clock disabled:opacity-40">Checar salida</button>
        </form>
      ) : (
        <form action={clockIn}>
          <button disabled={pending} aria-busy={pending} className="h-16 w-full rounded-lg bg-clock-in text-lg text-on-clock disabled:opacity-40">Checar entrada</button>
        </form>
      )}
      {clockedInAt && <p className="text-center text-sm text-text-muted">Entraste a las {timeIn(clockedInAt, tz)}</p>}
      {tooEarly && <Banner tone="warning" role="alert">Todavía es temprano. Puedes checar entrada a partir de las {timeIn(tooEarly, tz)}.</Banner>}
      {error && <Banner tone="danger" role="alert">{error}</Banner>}
    </div>
  );
}
