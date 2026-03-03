import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Clock, Zap, Users, Trophy, ArrowLeft, Coffee } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfettiExplosion } from "@/components/ConfettiExplosion";
import { mockBattles, formatSats, generateRandomBattleTip, type BattleTip } from "@/lib/mock-data";
import { playTipSound, playConfettiSound, playCountdownTickSound } from "@/lib/sounds";

interface FloatingTip {
  id: string;
  side: "A" | "B";
  amount: number;
}

const BattleArena = () => {
  const { id } = useParams<{ id: string }>();
  const battle = mockBattles.find((b) => b.id === id);

  const [tipsA, setTipsA] = useState(battle?.tipsA.totalSats ?? 0);
  const [tipsB, setTipsB] = useState(battle?.tipsB.totalSats ?? 0);
  const [countA, setCountA] = useState(battle?.tipsA.count ?? 0);
  const [countB, setCountB] = useState(battle?.tipsB.count ?? 0);
  const [suppA, setSuppA] = useState(battle?.tipsA.supporters ?? 0);
  const [suppB, setSuppB] = useState(battle?.tipsB.supporters ?? 0);
  const [feed, setFeed] = useState<(BattleTip & { creatorName: string })[]>(
    () => (battle?.recentTips ?? []).map((t) => ({
      ...t,
      creatorName: t.creatorSide === "A" ? battle!.creatorA.name : battle!.creatorB.name,
    }))
  );
  const [confetti, setConfetti] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [isFinished, setIsFinished] = useState(battle?.status === "completed");
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [floatingTips, setFloatingTips] = useState<FloatingTip[]>([]);
  const [flashSide, setFlashSide] = useState<"A" | "B" | null>(null);
  const [glowBar, setGlowBar] = useState(false);
  const prevSecondsRef = useRef<number | null>(null);

  // Countdown
  useEffect(() => {
    if (!battle || battle.status === "completed") return;
    const tick = () => {
      const diff = new Date(battle.endTime).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("00:00:00");
        setSecondsLeft(0);
        setIsFinished(true);
        setConfetti(true);
        playConfettiSound();
        setTimeout(() => setConfetti(false), 2000);
        return;
      }
      const totalSec = Math.floor(diff / 1000);
      setSecondsLeft(totalSec);
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [battle]);

  // Countdown tick sound for last 10 seconds
  useEffect(() => {
    if (secondsLeft !== null && secondsLeft <= 10 && secondsLeft > 0 && secondsLeft !== prevSecondsRef.current) {
      playCountdownTickSound();
    }
    prevSecondsRef.current = secondsLeft;
  }, [secondsLeft]);

  // Simulated tips
  useEffect(() => {
    if (!battle || battle.status !== "active" || isFinished) return;
    const interval = setInterval(() => {
      const tip = generateRandomBattleTip();
      if (tip.side === "A") {
        setTipsA((v) => v + tip.amount);
        setCountA((v) => v + 1);
        if (Math.random() > 0.6) setSuppA((v) => v + 1);
      } else {
        setTipsB((v) => v + tip.amount);
        setCountB((v) => v + 1);
        if (Math.random() > 0.6) setSuppB((v) => v + 1);
      }
      setFeed((prev) => [{
        id: `sim-${Date.now()}`,
        sender: tip.sender,
        creatorSide: tip.side,
        amount: tip.amount,
        timestamp: "just now",
        creatorName: tip.side === "A" ? battle.creatorA.name : battle.creatorB.name,
      }, ...prev].slice(0, 20));
    }, 2500 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [battle, isFinished]);

  const triggerEffects = (side: "A" | "B", amount: number) => {
    playTipSound();
    // Floating tip
    const fId = `float-${Date.now()}`;
    setFloatingTips((prev) => [...prev, { id: fId, side, amount }]);
    setTimeout(() => setFloatingTips((prev) => prev.filter((f) => f.id !== fId)), 1100);
    // Flash sats number
    setFlashSide(side);
    setTimeout(() => setFlashSide(null), 400);
    // Glow bar
    setGlowBar(true);
    setTimeout(() => setGlowBar(false), 500);
  };

  const handleManualTip = useCallback((side: "A" | "B") => {
    if (!battle) return;
    const amount = 10000;
    if (side === "A") {
      setTipsA((v) => v + amount);
      setCountA((v) => v + 1);
    } else {
      setTipsB((v) => v + amount);
      setCountB((v) => v + 1);
    }
    setFeed((prev) => [{
      id: `manual-${Date.now()}`,
      sender: "You",
      creatorSide: side,
      amount,
      timestamp: "just now",
      creatorName: side === "A" ? battle.creatorA.name : battle.creatorB.name,
    }, ...prev].slice(0, 20));
    setConfetti(true);
    playConfettiSound();
    setTimeout(() => setConfetti(false), 1500);
    triggerEffects(side, amount);
  }, [battle]);

  if (!battle) {
    return (
      <div className="container py-20 text-center">
        <Swords className="w-12 h-12 mx-auto mb-4 text-primary/50" />
        <h1 className="text-xl font-bold mb-2">Battle Not Found</h1>
        <Button asChild variant="outline"><Link to="/battles">Back to Battles</Link></Button>
      </div>
    );
  }

  const total = tipsA + tipsB;
  const pctA = total > 0 ? (tipsA / total) * 100 : 50;
  const winnerA = isFinished && tipsA > tipsB;
  const winnerB = isFinished && tipsB > tipsA;
  const isUrgent = secondsLeft !== null && secondsLeft <= 60 && secondsLeft > 0;

  return (
    <div className="container py-6 md:py-10 pb-24 md:pb-10 relative">
      <ConfettiExplosion trigger={confetti} />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Back + Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button asChild variant="ghost" size="icon" className="shrink-0">
            <Link to="/battles"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Swords className="w-5 h-5 text-primary" />
              Battle Arena
            </h1>
            {isFinished && <p className="text-sm text-muted-foreground">Battle complete!</p>}
          </div>
        </div>

        {/* Timer */}
        {!isFinished && (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center mb-6">
            <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" /> Time Remaining
            </p>
            <motion.p
              className={`text-4xl md:text-5xl font-mono font-bold tracking-wider ${isUrgent ? "text-red-500" : "text-primary"}`}
              animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
              transition={isUrgent ? { duration: 1, repeat: Infinity, ease: "easeInOut" } : {}}
            >
              {timeLeft}
            </motion.p>
          </motion.div>
        )}

        {/* VS Display */}
        <Card className="glass border-border/50 mb-6 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              {/* Creator A */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex flex-col items-center gap-2 flex-1 ${winnerB ? "opacity-50" : ""}`}
              >
                <div className="relative">
                  <img src={battle.creatorA.avatar} alt={battle.creatorA.name} className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-amber-500/50" />
                  {winnerA && (
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full gradient-bitcoin flex items-center justify-center">
                      <Trophy className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <p className="font-bold text-sm md:text-base text-center">{battle.creatorA.name}</p>
                <motion.p
                  className={`text-lg md:text-2xl font-mono font-bold text-amber-500`}
                  animate={flashSide === "A" ? { scale: [1, 1.2, 1], color: ["#f59e0b", "#ffffff", "#f59e0b"] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  {formatSats(tipsA)}
                </motion.p>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>{countA} tips</span>
                  <span>{suppA} fans</span>
                </div>
              </motion.div>

              <div className="shrink-0">
                <Badge className="gradient-bitcoin text-primary-foreground font-black text-lg px-4 py-1">VS</Badge>
              </div>

              {/* Creator B */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex flex-col items-center gap-2 flex-1 ${winnerA ? "opacity-50" : ""}`}
              >
                <div className="relative">
                  <img src={battle.creatorB.avatar} alt={battle.creatorB.name} className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-cyan-500/50" />
                  {winnerB && (
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-cyan-500 flex items-center justify-center">
                      <Trophy className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>
                <p className="font-bold text-sm md:text-base text-center">{battle.creatorB.name}</p>
                <motion.p
                  className={`text-lg md:text-2xl font-mono font-bold text-cyan-500`}
                  animate={flashSide === "B" ? { scale: [1, 1.2, 1], color: ["#06b6d4", "#ffffff", "#06b6d4"] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  {formatSats(tipsB)}
                </motion.p>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>{countB} tips</span>
                  <span>{suppB} fans</span>
                </div>
              </motion.div>
            </div>

            {/* Progress Bar */}
            <div className={`flex gap-1 h-4 rounded-full overflow-hidden bg-secondary/50 mb-4 transition-shadow duration-300 ${glowBar ? "shadow-[0_0_16px_4px_hsl(var(--primary)/0.4)]" : ""}`}>
              <motion.div
                className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-l-full"
                animate={{ width: `${pctA}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
              <motion.div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-r-full"
                animate={{ width: `${100 - pctA}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground font-mono">
              <span>{pctA.toFixed(1)}%</span>
              <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-primary" />{formatSats(total)} total</span>
              <span>{(100 - pctA).toFixed(1)}%</span>
            </div>

            {/* Tip Buttons */}
            {!isFinished && (
              <div className="grid grid-cols-2 gap-3 mt-6 relative">
                <div className="relative">
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => handleManualTip("A")}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:opacity-90"
                    >
                      <Coffee className="w-4 h-4 mr-1" />
                      Tip {battle.creatorA.name.split(" ")[0]}
                    </Button>
                  </motion.div>
                  <AnimatePresence>
                    {floatingTips.filter((f) => f.side === "A").map((f) => (
                      <motion.div key={f.id} initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -60 }} transition={{ duration: 1 }}
                        className="absolute -top-2 left-1/2 -translate-x-1/2 text-amber-500 font-bold font-mono text-sm pointer-events-none">
                        +{formatSats(f.amount)} sats
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <div className="relative">
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => handleManualTip("B")}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:opacity-90"
                    >
                      <Coffee className="w-4 h-4 mr-1" />
                      Tip {battle.creatorB.name.split(" ")[0]}
                    </Button>
                  </motion.div>
                  <AnimatePresence>
                    {floatingTips.filter((f) => f.side === "B").map((f) => (
                      <motion.div key={f.id} initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -60 }} transition={{ duration: 1 }}
                        className="absolute -top-2 left-1/2 -translate-x-1/2 text-cyan-500 font-bold font-mono text-sm pointer-events-none">
                        +{formatSats(f.amount)} sats
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total Sats", value: formatSats(total), icon: Zap },
            { label: "Total Tips", value: String(countA + countB), icon: Coffee },
            { label: "Supporters", value: String(suppA + suppB), icon: Users },
          ].map((s) => (
            <Card key={s.label} className="glass border-border/50">
              <CardContent className="p-4 text-center">
                <s.icon className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold font-mono">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Live Feed */}
        <Card className="glass border-border/50">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Live Tip Feed
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {feed.length > 0 ? feed.map((tip) => (
                <motion.div
                  key={tip.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${tip.creatorSide === "A" ? "bg-amber-500" : "bg-cyan-500"}`} />
                    <span className="truncate">
                      <span className="font-medium">{tip.sender}</span>
                      <span className="text-muted-foreground"> → {tip.creatorName}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-semibold text-primary">{formatSats(tip.amount)}</span>
                    <span className="text-xs text-muted-foreground">{tip.timestamp}</span>
                  </div>
                </motion.div>
              )) : (
                <p className="text-center text-muted-foreground text-sm py-4">No tips yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default BattleArena;
