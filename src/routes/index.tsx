import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Layers, Lock } from "lucide-react";
import { SiteHeader } from "@/components/magnolia/SiteHeader";
import { SiteFooter } from "@/components/magnolia/SiteFooter";
import { apps, categories } from "@/data/ecosystem";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Magnolia OS — Your intelligent ecosystem" },
      { name: "description", content: "A unified ecosystem of intelligent apps — AI, productivity, creative, social — all under one Magnolia Account." },
      { property: "og:title", content: "Magnolia OS — Your intelligent ecosystem" },
      { property: "og:description", content: "A unified ecosystem of intelligent apps — all under one Magnolia Account." },
    ],
  }),
  component: Index,
});

function Index() {
  const featured = apps.filter((a) => a.status !== "planned").slice(0, 3);
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-magnolia-radial" aria-hidden />
        <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-32 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="size-1.5 rounded-full bg-magnolia" />
            Now in early access · Magnolia Assistant is live
          </div>
          <h1 className="mx-auto mt-8 max-w-4xl font-display text-5xl leading-[1.05] tracking-tight text-balance md:text-7xl">
            <span className="text-gradient-magnolia">One intelligent ecosystem</span>
            <br />
            for everything you do.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
            Magnolia OS is a family of premium apps — AI assistants, productivity, creative tools, smart systems — that work alone and together under one account.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/app/assistant"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Launch Assistant
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/ecosystem"
              className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/60 px-6 py-3 text-sm font-medium text-foreground backdrop-blur hover:bg-surface-elevated"
            >
              Explore the ecosystem
            </Link>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="border-t border-hairline">
        <div className="mx-auto grid max-w-6xl gap-px bg-hairline px-0 md:grid-cols-3">
          {[
            { icon: Sparkles, title: "Built around AI", body: "Every app speaks the same Magnolia Intelligence layer. Ask, automate, generate." },
            { icon: Layers, title: "One account, many apps", body: "Single sign-on, shared preferences, synced storage across the whole ecosystem." },
            { icon: Lock, title: "Privacy by design", body: "Row-level security, encrypted secrets, your data stays yours." },
          ].map((p) => (
            <div key={p.title} className="bg-background p-10">
              <p.icon className="h-5 w-5 text-magnolia" />
              <h3 className="mt-5 font-display text-xl tracking-tight">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured apps */}
      <section className="mx-auto max-w-6xl px-6 py-28">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Featured</p>
            <h2 className="mt-2 font-display text-3xl tracking-tight md:text-4xl">Available now</h2>
          </div>
          <Link to="/ecosystem" className="text-sm text-muted-foreground hover:text-foreground">
            View all →
          </Link>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {featured.map((app) => (
            <article key={app.name} className="group relative overflow-hidden rounded-2xl border border-hairline bg-surface p-6 transition-colors hover:bg-surface-elevated">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{app.category}</span>
                <StatusBadge status={app.status} />
              </div>
              <h3 className="mt-6 font-display text-2xl tracking-tight">{app.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{app.description}</p>
              {app.href && app.status === "live" ? (
                <Link to={app.href} className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-magnolia">
                  Open <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      {/* Categories teaser */}
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">The ecosystem</p>
          <h2 className="mt-2 font-display text-3xl tracking-tight md:text-4xl">{categories.length} categories, one OS.</h2>
          <div className="mt-10 flex flex-wrap gap-2">
            {categories.map((c) => (
              <span key={c} className="rounded-full border border-hairline bg-surface px-4 py-1.5 text-sm text-muted-foreground">
                {c}
              </span>
            ))}
          </div>
          <div className="mt-10">
            <Link to="/ecosystem" className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:opacity-90">
              Browse all apps <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function StatusBadge({ status }: { status: "live" | "building" | "planned" }) {
  const map = {
    live: { label: "Live", dot: "bg-emerald-400" },
    building: { label: "In development", dot: "bg-amber-400" },
    planned: { label: "Planned", dot: "bg-muted-foreground" },
  } as const;
  const s = map[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-background/60 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
      <span className={`size-1.5 rounded-full ${s.dot}`} /> {s.label}
    </span>
  );
}
