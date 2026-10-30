import type { Metadata } from "next";
import { Card, EmptyState, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Solicitudes" };

// Stub: built after the vertical slice (see replica/architecture.md build order).
export default function Page() {
  return (
    <>
      <PageHeader title="Solicitudes" />
      <Card><EmptyState title="Próximamente" body="Aquí vas a aprobar vacaciones, cambios de turno y cambios de disponibilidad." /></Card>
    </>
  );
}
