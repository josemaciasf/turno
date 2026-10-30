import type { Metadata } from "next";
import { Card, EmptyState, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Configuración" };

// Stub: built after the vertical slice (see replica/architecture.md build order).
export default function Page() {
  return (
    <>
      <PageHeader title="Configuración" />
      <Card><EmptyState title="Próximamente" body="Aquí vas a ajustar la geocerca, las reglas de descansos y horas extra, y el periodo de pago." /></Card>
    </>
  );
}
