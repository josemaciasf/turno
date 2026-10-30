"use client";
// Client wrappers around server actions: pending state and inline errors.
import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/app/actions";
import { Banner, Button } from "./ui";

export function ActionForm({ action, children, className, resetOnOk }: {
  action: (s: FormState, f: FormData) => Promise<FormState>;
  children: (state: FormState) => ReactNode;
  className?: string;
  resetOnOk?: boolean;
}) {
  const [state, run] = useActionState(action, {});
  return (
    <form action={run} className={className} key={resetOnOk && state.ok ? state.ok : undefined}>
      {state.error ? <Banner tone="danger" role="alert">{state.error}</Banner> : null}
      {state.ok ? <Banner tone="success" role="status">{state.ok}</Banner> : null}
      {children(state)}
    </form>
  );
}

export function Submit({ children, variant, size, className }: { children: ReactNode; variant?: "primary" | "secondary" | "danger"; size?: "sm" | "md" | "lg"; className?: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" variant={variant} size={size} className={className} disabled={pending} aria-busy={pending}>{children}</Button>;
}
