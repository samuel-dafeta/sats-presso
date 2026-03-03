import { Link } from "react-router-dom";
import { Coffee, Zap, Github, Twitter } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm pb-20 md:pb-0">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 group mb-3">
              <div className="w-7 h-7 rounded-lg gradient-bitcoin flex items-center justify-center group-hover:scale-110 transition-transform">
                <Coffee className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="text-base font-bold tracking-tight">
                Sats<span className="gradient-text-bitcoin">Presso</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The Bitcoin tip jar that tips back. Support creators, earn NFT receipts, and climb the leaderboard.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Explore</h4>
            <ul className="space-y-2">
              {[
                { to: "/explore", label: "Discover Creators" },
                { to: "/leaderboard", label: "Leaderboard" },
                { to: "/battles", label: "Tip Battles" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Create */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Create</h4>
            <ul className="space-y-2">
              {[
                { to: "/create-jar", label: "Create Tip Jar" },
                { to: "/create-battle", label: "Start a Battle" },
                { to: "/dashboard", label: "Dashboard" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Built on */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Built on</h4>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
              <Zap className="w-3.5 h-3.5 text-primary shrink-0" />
              <div>
                <p className="text-xs font-semibold text-foreground">Bitcoin &amp; Stacks</p>
                <p className="text-[10px] text-muted-foreground">Powered by Lightning</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} SatsPresso. All rights reserved.
          </p>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            Made with <span className="text-primary">⚡</span> on Bitcoin
          </p>
        </div>
      </div>
    </footer>
  );
};
