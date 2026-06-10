import { Link } from "@tanstack/react-router";
import { MagnoliaLogo } from "./Logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <MagnoliaLogo className="h-7 w-7" />
          <span className="font-display text-lg tracking-tight">Magnolia OS</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link to="/ecosystem" className="transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>
            Ecosystem
          </Link>
          <Link to="/manifesto" className="transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>
            Manifesto
          </Link>
          <Link to="/app/assistant" className="transition-colors hover:text-foreground">
            Assistant
          </Link>
        </nav>
        <Link
          to="/auth"
          className="rounded-full border border-hairline bg-surface px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-elevated"
        >
          Sign in
        </Link>
      </div>
    </header>
  );
}
