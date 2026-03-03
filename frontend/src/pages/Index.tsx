import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Coffee, Trophy, Gem, Zap, Shield, Users, ArrowRight, TrendingUp, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockRecentTips, formatSats, tierConfig, getTier } from "@/lib/mock-data";
import heroCoffee from "@/assets/hero-coffee.png";

const features = [
  { icon: Coffee, title: "Tip in Sats", description: "Send Bitcoin tips directly to your favorite creators with zero intermediaries" },
  { icon: Gem, title: "NFT Receipts", description: "Every tip mints a unique on-chain receipt — a permanent record of your support" },
  { icon: Trophy, title: "Leaderboards", description: "Compete for top supporter spots with global rankings and monthly challenges" },
  { icon: Shield, title: "Soul-Bound Badges", description: "Earn non-transferable badges that prove your creator economy reputation" },
];

const comparisons = [
  { feature: "Currency", satspresso: "Bitcoin (Sats)", kofi: "Fiat", patreon: "Fiat" },
  { feature: "Platform Fee", satspresso: "0%", kofi: "5%", patreon: "5-12%" },
  { feature: "NFT Receipts", satspresso: true, kofi: false, patreon: false },
  { feature: "On-chain Badges", satspresso: true, kofi: false, patreon: false },
  { feature: "Leaderboards", satspresso: true, kofi: "Limited", patreon: false },
  { feature: "Censorship Resistant", satspresso: true, kofi: false, patreon: false },
];

const ComparisonCell = ({ value, highlight = false }: { value: string | boolean; highlight?: boolean }) => {
  if (typeof value === "boolean") {
    return value ? (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30">
        <Check className="w-3 h-3 mr-1" /> Yes
      </Badge>
    ) : (
      <Badge variant="outline" className="text-muted-foreground border-border/50">
        <X className="w-3 h-3 mr-1" /> No
      </Badge>
    );
  }
  return <span className={highlight ? "font-semibold text-primary" : ""}>{value}</span>;
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const heroStagger = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const heroChild = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />

        <div className="container relative pt-20 pb-16 md:pt-32 md:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="text-center lg:text-left"
              variants={heroStagger}
              initial="initial"
              animate="animate"
            >
              <motion.div variants={heroChild} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-6">
                <Zap className="w-3.5 h-3.5" /> Built on Bitcoin & Stacks
              </motion.div>

              <motion.h1 variants={heroChild} className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
                The Bitcoin Tip Jar{" "}
                <span className="gradient-text-bitcoin">That Tips Back</span>
              </motion.h1>

              <motion.p variants={heroChild} className="text-lg md:text-xl text-muted-foreground max-w-2xl lg:max-w-none mx-auto lg:mx-0 mb-8 text-balance">
                Support creators with sats, earn NFT receipts, collect soul-bound badges, and climb the leaderboard. The creator economy, powered by Bitcoin.
              </motion.p>

              <motion.div variants={heroChild} className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button asChild size="lg" className="gradient-bitcoin text-primary-foreground font-semibold glow-bitcoin hover:opacity-90 text-base h-12 px-8">
                  <Link to="/create-jar">
                    Start Creating <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-border hover:border-primary/30 h-12 px-8 text-base">
                  <Link to="/tip/SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7">
                    <Users className="w-4 h-4 mr-2" /> Explore Creators
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              className="flex justify-center relative order-first lg:order-none"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Ambient glow orb */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 lg:w-72 lg:h-72 rounded-full bg-primary/15 animate-glow-pulse blur-[60px]" />
              </div>
              {/* Steam wisps */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
                <div className="steam-wisp steam-wisp-1" />
                <div className="steam-wisp steam-wisp-2" />
                <div className="steam-wisp steam-wisp-3" />
              </div>
              {/* Floating coffee cup */}
              <motion.img
                src={heroCoffee}
                alt="Bitcoin coffee cup with amber glow"
                className="w-full max-w-[220px] lg:max-w-md rounded-2xl relative z-10"
                animate={{ y: [0, -12, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Ticker */}
      <section className="border-y border-border/50 bg-card/30 py-4" aria-hidden="true">
        <div className="overflow-hidden">
          <div className="flex animate-ticker whitespace-nowrap items-center min-h-[2rem]">
            {[...mockRecentTips, ...mockRecentTips].map((tip, i) => (
              <span key={i} className="inline-flex items-center gap-2 mx-8 text-sm">
                <span className="text-muted-foreground">{tip.sender}</span>
                <span className="text-primary font-semibold">⚡ {formatSats(tip.amount)} sats</span>
                <span className="text-muted-foreground">→ {tip.receiver}</span>
                <span className="text-muted-foreground/50 text-xs">{tip.timestamp}</span>
                <span className="w-1 h-1 rounded-full bg-primary/40 ml-2" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20 md:py-28">
        <motion.div className="text-center mb-14" {...fadeUp}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Creators Choose <span className="gradient-text-bitcoin">SatsPresso</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Every tip is a Bitcoin transaction. Every supporter earns on-chain proof.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div key={f.title} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }}>
              <Card className="glass border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:glow-bitcoin-sm h-full group">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg gradient-bitcoin flex items-center justify-center mb-4 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                    <f.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="container pb-20 md:pb-28">
        <motion.div className="text-center mb-10" {...fadeUp}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text-bitcoin">SatsPresso</span> vs The Rest
          </h2>
        </motion.div>

        <motion.div {...fadeUp} className="max-w-3xl mx-auto">
          <Card className="glass border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4 font-medium text-muted-foreground">Feature</th>
                    <th className="p-4 font-semibold text-primary bg-primary/5">SatsPresso</th>
                    <th className="p-4 font-medium text-muted-foreground">Ko-fi</th>
                    <th className="p-4 font-medium text-muted-foreground">Patreon</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((row) => (
                    <tr key={row.feature} className="border-b border-border/30 last:border-0">
                      <td className="p-4 font-medium">{row.feature}</td>
                      <td className="p-4 text-center bg-primary/5">
                        <ComparisonCell value={row.satspresso} highlight />
                      </td>
                      <td className="p-4 text-center text-muted-foreground">
                        <ComparisonCell value={row.kofi} />
                      </td>
                      <td className="p-4 text-center text-muted-foreground">
                        <ComparisonCell value={row.patreon} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="container pb-20 md:pb-28">
        <motion.div {...fadeUp}>
          <Card className="glass border-primary/20 glow-bitcoin overflow-hidden relative shimmer-border">
            <CardContent className="p-8 md:p-12 text-center relative z-10">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="inline-block mb-4"
              >
                <TrendingUp className="w-10 h-10 text-primary" />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to Start Earning Sats?</h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-6">
                Set up your tip jar in under a minute. No KYC. No platform fees. Just Bitcoin.
              </p>
              <Button asChild size="lg" className="gradient-bitcoin text-primary-foreground font-semibold glow-bitcoin-sm h-12 px-8">
                <Link to="/create-jar">
                  Create Your Tip Jar <Coffee className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 relative py-8">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 hover:text-foreground transition-colors">
            <Coffee className="w-4 h-4 text-primary" />
            <span>SatsPresso © 2026</span>
          </div>
          <p className="hover:text-foreground transition-colors">Built on Bitcoin. Powered by Stacks.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
