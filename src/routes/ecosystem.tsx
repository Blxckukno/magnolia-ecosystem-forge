import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/magnolia/SiteHeader";
import { SiteFooter } from "@/components/magnolia/SiteFooter";
import { apps, categories, type AppStatus } from "@/data/ecosystem";

export const Route = createFileRoute("/ecosystem")({
  head: () => ({
    meta: [
      { title: "Ecosystem — Magnolia OS" },
      { name: "description", content: "Browse every app in the Magnolia OS ecosystem — live products, work in progress, and the future roadmap." },
      { property: "og:title", content: "Ecosystem — Magnolia OS" },
      { property: "og:description", content: "Live products and the future roadmap across the Magnolia ecosystem." },
    ],
  }),
  component: Ecosystem,
});

function Ecosystem() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-12">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Roadmap</p>
        <h1 className="mt-3 max-w-3xl font-display text-5xl tracking-tight text-balance">The Magnolia ecosystem.</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Every product we are building or planning. The Assistant is live today; the rest is shipping over the coming months.
        </p>
      </section>

      {categories.map((cat) => {
        const list = apps.filter((a) => a.category === cat);
        if (list.length === 0) return null;
        return (
          <section key={cat} className="border-t border-hairline">
            <div className="mx-auto max-w-6xl px-6 py-14">
              <h2 className="font-display text-2xl tracking-tight">{cat}</h2>
              <div className="mt-8 grid gap-px bg-hairline sm:grid-cols-2 lg:grid-cols-3">
                {list.map((app) => (
                  <article key={app.name} className="bg-background p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-xl tracking-tight">{app.name}</h3>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{app.description}</p>
                    {app.href && app.status === "live" ? (
                      <Link to={app.href} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-magnolia">
                        Open <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <SiteFooter />
    </div>
  );
}

function StatusBadge({ status }: { status: AppStatus }) {
  const map = {
    live: { label: "Live", dot: "bg-emerald-400" },
    building: { label: "Building", dot: "bg-amber-400" },
    planned: { label: "Planned", dot: "bg-muted-foreground" },
  } as const;
  const s = map[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
      <span className={`size-1.5 rounded-full ${s.dot}`} /> {s.label}
    </span>
  );
}
