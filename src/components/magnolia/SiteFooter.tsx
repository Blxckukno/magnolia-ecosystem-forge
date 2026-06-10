import { Link } from "@tanstack/react-router";
import { MagnoliaLogo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2.5">
          <MagnoliaLogo className="h-6 w-6" />
          <span className="font-display text-base tracking-tight">Magnolia OS</span>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          <Link to="/ecosystem" className="hover:text-foreground">Ecosystem</Link>
          <Link to="/manifesto" className="hover:text-foreground">Manifesto</Link>
          <Link to="/app/assistant" className="hover:text-foreground">Assistant</Link>
          <Link to="/auth" className="hover:text-foreground">Sign in</Link>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Magnolia OS</p>
      </div>
    </footer>
  );
}
