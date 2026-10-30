import { signOutAction } from "@/app/actions";
import { Nav } from "@/components/nav";
import { requireSession } from "@/lib/session";

// AppShell (components.md): sidebar on md+, top scrolling nav on phones.
export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const s = await requireSession(["owner", "manager"]);
  return (
    <div className="min-h-screen md:flex">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-10 focus:rounded-md focus:bg-bg focus:p-2">Saltar al contenido</a>
      <aside className="border-b border-border bg-bg p-3 md:sticky md:top-0 md:h-screen md:w-sidebar md:shrink-0 md:border-b-0 md:border-r">
        <div className="mb-3 flex items-center gap-2 px-3 md:mb-6 md:block">
          <p className="font-semibold">{s.company.name}</p>
          <p className="text-xs text-text-muted">{s.location.name}</p>
        </div>
        <Nav />
        <form action={signOutAction} className="mt-3 px-3 md:mt-8">
          <p className="text-xs text-text-muted">{s.member.fullName}</p>
          <button className="text-xs text-accent underline">Salir</button>
        </form>
      </aside>
      <main id="contenido" className="min-w-0 flex-1 px-4 py-6 md:px-8">{children}</main>
    </div>
  );
}
