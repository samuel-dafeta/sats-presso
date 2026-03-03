import { Link, useLocation } from "react-router-dom";
import { Home, LayoutDashboard, Users, Trophy, Swords } from "lucide-react";

const navItems = [
  { to: "/", icon: Home, label: "Home", matchPrefixes: [] as string[] },
  { to: "/explore", icon: Users, label: "Explore", matchPrefixes: ["/creator", "/tip"] },
  { to: "/battles", icon: Swords, label: "Battles", matchPrefixes: ["/create-battle"] },
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", matchPrefixes: ["/collection", "/create-jar"] },
  { to: "/leaderboard", icon: Trophy, label: "Leaderboard", matchPrefixes: [] as string[] },
];

export const MobileNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-strong border-t border-border/50">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || 
            (item.to !== "/" && location.pathname.startsWith(item.to)) ||
            item.matchPrefixes.some((prefix) => location.pathname.startsWith(prefix));
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "drop-shadow-[0_0_6px_hsl(36,100%,50%)]" : ""}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
