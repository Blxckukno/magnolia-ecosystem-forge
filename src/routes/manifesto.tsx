import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/magnolia/SiteHeader";
import { SiteFooter } from "@/components/magnolia/SiteFooter";

export const Route = createFileRoute("/manifesto")({
  head: () => ({
    meta: [
      { title: "Manifesto — Magnolia OS" },
      { name: "description", content: "The principles behind Magnolia OS: premium craft, intelligent by default, private by design." },
      { property: "og:title", content: "Manifesto — Magnolia OS" },
      { property: "og:description", content: "Premium craft, intelligent by default, private by design." },
    ],
  }),
  component: Manifesto,
});

const principles = [
  { n: "01", t: "Premium by default", b: "Every surface — from the smallest button to the longest scroll — is designed with intent. No filler, no defaults." },
  { n: "02", t: "Intelligent everywhere", b: "AI is a layer, not a feature. Magnolia Intelligence powers every app, while staying invisible until you need it." },
  { n: "03", t: "One account, many tools", b: "Your Magnolia Account is your identity across the ecosystem. Sign in once. Sync everywhere." },
  { n: "04", t: "Private and yours", b: "Row-level security, encrypted secrets, transparent data controls. We never trade your trust for telemetry." },
  { n: "05", t: "Built to last", b: "Open standards. Modular architecture. Long-term thinking. No throwaway demos." },
];

function Manifesto() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 pt-24 pb-24">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Manifesto</p>
        <h1 className="mt-3 font-display text-5xl tracking-tight text-balance md:text-6xl">
          A new <span className="text-gradient-magnolia">operating system</span> for personal software.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Software has become bloated, lonely, and disposable. Magnolia OS is our answer — a small set of apps that share one mind, one identity, and one aesthetic.
        </p>
        <ol className="mt-16 space-y-12">
          {principles.map((p) => (
            <li key={p.n} className="grid grid-cols-[auto_1fr] gap-6 border-t border-hairline pt-8">
              <span className="font-display text-sm text-magnolia">{p.n}</span>
              <div>
                <h3 className="font-display text-2xl tracking-tight">{p.t}</h3>
                <p className="mt-2 text-muted-foreground">{p.b}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <SiteFooter />
    </div>
  );
}
