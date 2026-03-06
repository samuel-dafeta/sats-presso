import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Coffee, Menu, X, Wallet, Sun, Moon, Bell, LogOut, Copy, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useWallet } from "@/contexts/WalletContext";
import { useTheme } from "next-themes";
import { toast } from "@/hooks/use-toast";
import { toastError } from "@/lib/error";
import { useNotifications } from "@/contexts/NotificationContext";
import { formatSats } from "@/lib/mock-data";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "Explore" },
  { to: "/battles", label: "Battles" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/create-jar", label: "Create Jar" },
  { to: "/leaderboard", label: "Leaderboard" },
];

export const Header = () => {
  const { isConnected, address, balance, disconnect, connect, connecting } = useWallet();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  return (
    <>
      <header className="sticky top-0 z-50 glass-strong">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg gradient-bitcoin flex items-center justify-center group-hover:scale-110 transition-transform">
              <Coffee className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Sats<span className="gradient-text-bitcoin">Presso</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -90, scale: 0, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="block"
                >
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </motion.span>
              </AnimatePresence>
            </button>
            <NotificationBell />
            {isConnected ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden md:flex border-primary/30 text-primary hover:bg-primary/10 font-mono text-xs"
                  >
                    <Wallet className="w-3.5 h-3.5 mr-1" />
                    {address?.slice(0, 4)}...{address?.slice(-4)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3 bg-popover" align="end">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs font-medium text-foreground">Connected</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-primary/10 px-3 py-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-primary" />
                      <span className="text-sm font-bold gradient-text-bitcoin">{formatSats(balance ?? 0)} sats</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">~${((balance ?? 0) / 1000).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-secondary px-3 py-2 mb-3">
                    <span className="text-xs font-mono text-muted-foreground truncate mr-2">
                      {address?.slice(0, 8)}...{address?.slice(-8)}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(address || "");
                        toast({ title: "Copied!", description: "Address copied to clipboard" });
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      disconnect();
                      toast({ title: "Wallet Disconnected", description: "Your wallet has been disconnected", variant: "destructive" });
                    }}
                  >
                    <LogOut className="w-3.5 h-3.5 mr-2" />
                    Disconnect
                  </Button>
                </PopoverContent>
              </Popover>
            ) : (
              <Button
                size="sm"
                disabled={connecting}
                onClick={async () => {
                  try {
                    await connect();
                    toast({ title: "Wallet Connected", description: "Your Stacks wallet is now active" });
                  } catch (err) {
                    toastError("Connection Failed", err);
                  }
                }}
                className="hidden md:flex gradient-bitcoin text-primary-foreground font-semibold glow-bitcoin-sm hover:opacity-90"
              >
                <Wallet className="w-3.5 h-3.5 mr-1" />
                {connecting ? "Connecting..." : "Connect"}
              </Button>
            )}
            <button
              className="md:hidden p-2 text-muted-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-xl">
            <nav className="container py-3 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isConnected ? (
                <div className="mt-2 p-3 rounded-lg border border-border bg-secondary/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs font-medium text-foreground">Connected</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-primary/10 px-3 py-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-primary" />
                      <span className="text-sm font-bold gradient-text-bitcoin">{formatSats(balance ?? 0)} sats</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">~${((balance ?? 0) / 1000).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-secondary px-3 py-2 mb-2">
                    <span className="text-xs font-mono text-muted-foreground truncate mr-2">
                      {address?.slice(0, 8)}...{address?.slice(-8)}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(address || "");
                        toast({ title: "Copied!", description: "Address copied to clipboard" });
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      disconnect();
                      setMobileOpen(false);
                      toast({ title: "Wallet Disconnected", description: "Your wallet has been disconnected", variant: "destructive" });
                    }}
                  >
                    <LogOut className="w-3.5 h-3.5 mr-2" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  disabled={connecting}
                  onClick={async () => {
                    setMobileOpen(false);
                    try {
                      await connect();
                      toast({ title: "Wallet Connected", description: "Your Stacks wallet is now active" });
                    } catch (err) {
                      toastError("Connection Failed", err);
                    }
                  }}
                  className="mt-2 gradient-bitcoin text-primary-foreground font-semibold"
                >
                  <Wallet className="w-3.5 h-3.5 mr-1" />
                  {connecting ? "Connecting..." : "Connect Wallet"}
                </Button>
              )}
            </nav>
          </div>
        )}
      </header>

    </>
  );
};

const NotificationBell = () => {
  const { notifications, unreadCount, markAllRead } = useNotifications();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" aria-label="Notifications">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="end">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <p className="text-sm font-semibold">Notifications</p>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-[11px] text-primary hover:underline">Mark all read</button>
          )}
        </div>
        <div className="max-h-64 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="p-4 text-center text-xs text-muted-foreground">No notifications yet. Follow creators to get tip alerts!</p>
          ) : (
            notifications.slice(0, 5).map((n) => (
              <div key={n.id} className={`px-3 py-2 border-b border-border/50 last:border-0 ${!n.read ? "bg-primary/5" : ""}`}>
                <p className="text-xs"><span className="font-semibold">⚡ {n.sender}</span> tipped <span className="font-semibold">{n.creator}</span></p>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[10px] font-mono text-primary font-bold">{formatSats(n.amount)} sats</span>
                  <span className="text-[10px] text-muted-foreground">{n.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
