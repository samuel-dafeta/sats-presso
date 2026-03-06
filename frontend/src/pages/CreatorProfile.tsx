import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Zap, Heart, Users, Star, Lock, ArrowLeft, Share2, Target, PartyPopper } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatSats, tierConfig, getTier, type Tier } from "@/lib/mock-data";
import { useFollow } from "@/contexts/FollowContext";
import { useToast } from "@/hooks/use-toast";
import { toastError } from "@/lib/error";
import { useNotifications } from "@/contexts/NotificationContext";
import { ConfettiExplosion } from "@/components/ConfettiExplosion";
import { playConfettiSound, playTipSound } from "@/lib/sounds";
import {
  getCreator, getCreatorGoal, getGoalProgress,
  getCreatorTipAtIndex, getTip,
  hasBadge,
  unwrapCV,
} from "@/lib/stacks";

const BADGE_MAP = [
  { type: 1, name: "First Sip", emoji: "☕" },
  { type: 2, name: "Regular", emoji: "☕☕" },
  { type: 3, name: "Connoisseur", emoji: "☕☕☕" },
  { type: 4, name: "Whale Watcher", emoji: "💎" },
  { type: 5, name: "Streak Master", emoji: "🔥" },
  { type: 6, name: "Top Supporter", emoji: "👑" },
];

interface CreatorData {
  name: string; bio: string; address: string;
  totalSats: number; tipCount: number; supporters: number;
}

interface GoalData { title: string; target: number; current: number; }

interface TipData {
  id: string; sender: string; amount: number;
  message: string; tier: Tier; timestamp: string; isLive: boolean;
}

interface BadgeData { id: string; name: string; emoji: string; earned: boolean; }

const AnimatedStat = ({ value, suffix = "" }: { value: string; suffix?: string }) => (
  <AnimatePresence mode="wait">
    <motion.span
      key={value}
      initial={{ scale: 1.3, color: "hsl(var(--primary))" }}
      animate={{ scale: 1, color: "inherit" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="font-mono font-bold inline-block"
    >
      {value}{suffix}
    </motion.span>
  </AnimatePresence>
);

const FloatingTip = ({ amount, id }: { amount: number; id: string }) => (
  <motion.div
    key={id}
    initial={{ opacity: 1, y: 0 }}
    animate={{ opacity: 0, y: -30 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 1.5, ease: "easeOut" }}
    className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold text-primary whitespace-nowrap pointer-events-none"
  >
    +{formatSats(amount)} sats
  </motion.div>
);

const CreatorProfile = () => {
  const { address } = useParams<{ address: string }>();
  const { toggleFollow, isFollowing } = useFollow();
  const { toast } = useToast();
  const { notifications } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [creator, setCreator] = useState<CreatorData | null>(null);
  const [creatorGoal, setCreatorGoal] = useState<GoalData | null>(null);
  const [tipHistory, setTipHistory] = useState<TipData[]>([]);
  const [badgeList, setBadgeList] = useState<BadgeData[]>([]);

  const [bonusSats, setBonusSats] = useState(0);
  const [bonusTips, setBonusTips] = useState(0);
  const [floatingTip, setFloatingTip] = useState<{ id: string; amount: number } | null>(null);
  const [liveTips, setLiveTips] = useState<TipData[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const lastNotifIdRef = useRef<string | null>(null);
  const prevGoalReachedRef = useRef(false);

  const fetchProfile = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const raw = unwrapCV(await getCreator(address));
      if (!raw) { setLoading(false); return; }

      const data: CreatorData = {
        name: raw.name ?? "Creator",
        bio: raw.bio ?? "",
        address,
        totalSats: Number(raw["total-received"]) || 0,
        tipCount: Number(raw["tip-count"]) || 0,
        supporters: Number(raw["supporter-count"]) || 0,
      };
      setCreator(data);

      // Goal
      try {
        const goalRaw = unwrapCV(await getCreatorGoal(address));
        if (goalRaw?.active) {
          const progressRaw = unwrapCV(await getGoalProgress(address));
          setCreatorGoal({
            title: goalRaw.description ?? "Goal",
            target: goalRaw.amount ?? 0,
            current: progressRaw?.progress ?? 0,
          });
        }
      } catch { /* no goal */ }

      // Tips (last 10)
      const tips: TipData[] = [];
      const fetchCount = Math.min(data.tipCount, 10);
      for (let i = data.tipCount; i > data.tipCount - fetchCount && i > 0; i--) {
        try {
          const tipIdRaw = unwrapCV(await getCreatorTipAtIndex(address, i - 1));
          if (tipIdRaw == null) continue;
          const tipRaw = unwrapCV(await getTip(tipIdRaw));
          if (!tipRaw) continue;
          const amount = Number(tipRaw.amount) || 0;
          tips.push({
            id: String(tipIdRaw), sender: tipRaw.from ?? "Unknown",
            amount, message: tipRaw.message ?? "",
            tier: getTier(amount),
            timestamp: tipRaw.timestamp ? new Date(Number(tipRaw.timestamp) * 1000).toISOString() : new Date().toISOString(),
            isLive: false,
          });
        } catch { /* skip */ }
      }
      setTipHistory(tips);

      // Badges
      const badges: BadgeData[] = [];
      for (const b of BADGE_MAP) {
        try {
          const earned = unwrapCV(await hasBadge(address, b.type));
          badges.push({ id: String(b.type), name: b.name, emoji: b.emoji, earned: !!earned });
        } catch {
          badges.push({ id: String(b.type), name: b.name, emoji: b.emoji, earned: false });
        }
      }
      setBadgeList(badges);
    } catch (err) {
      toast({ title: "Failed to load profile", description: "Could not fetch creator data. Try refreshing.", variant: "destructive" });
      console.error("Creator profile fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  useEffect(() => {
    if (!address || notifications.length === 0) return;
    const newest = notifications.find((n) => n.creatorAddress === address);
    if (!newest || newest.id === lastNotifIdRef.current) return;
    lastNotifIdRef.current = newest.id;
    setBonusSats((prev) => prev + newest.amount);
    setBonusTips((prev) => prev + 1);
    setFloatingTip({ id: newest.id, amount: newest.amount });
    const floatTimer = setTimeout(() => setFloatingTip(null), 1600);

    const tipTier = getTier(newest.amount);
    setLiveTips((prev) => [
      {
        id: newest.id,
        sender: newest.sender,
        amount: newest.amount,
        message: `Tipped ${formatSats(newest.amount)} sats ⚡`,
        tier: tipTier,
        timestamp: new Date().toISOString(),
        isLive: true,
      },
      ...prev,
    ]);

    playTipSound();

    if (tipTier === "diamond") {
      setShowConfetti(true);
      playConfettiSound();
      const confettiTimer = setTimeout(() => setShowConfetti(false), 1500);
      return () => { clearTimeout(floatTimer); clearTimeout(confettiTimer); };
    }
    return () => clearTimeout(floatTimer);
  }, [notifications, address]);

  // Detect milestone goal completion
  const currentGoalReached = creatorGoal ? ((creatorGoal.current + bonusSats) / creatorGoal.target) >= 1 : false;

  useEffect(() => {
    if (currentGoalReached && !prevGoalReachedRef.current) {
      setShowConfetti(true);
      playConfettiSound();
      const timer = setTimeout(() => setShowConfetti(false), 1500);
      return () => clearTimeout(timer);
    }
    prevGoalReachedRef.current = currentGoalReached;
  }, [currentGoalReached]);

  if (loading) {
    return (
      <div className="container py-6 md:py-10 pb-24 md:pb-10 max-w-3xl space-y-4">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-full h-48 rounded-lg" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-2">Creator not found</h1>
        <p className="text-muted-foreground mb-6">The creator you're looking for doesn't exist.</p>
        <Button asChild variant="outline">
          <Link to="/explore"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Explore</Link>
        </Button>
      </div>
    );
  }

  const following = isFollowing(creator.address);
  const totalSats = creator.totalSats + bonusSats;
  const totalTips = creator.tipCount + bonusTips;
  const goalProgress = creatorGoal ? Math.min(100, ((creatorGoal.current + bonusSats) / creatorGoal.target) * 100) : 0;
  const goalReached = goalProgress >= 100;

  const handleFollow = () => {
    const was = isFollowing(creator.address);
    toggleFollow(creator.address);
    toast({ title: was ? `Unfollowed ${creator.name}` : `Following ${creator.name}! ❤️` });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Profile link copied to clipboard!" });
  };

  return (
    <div className="container py-6 md:py-10 pb-24 md:pb-10 max-w-3xl">
      <Link to="/explore" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Explore
      </Link>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Card className="glass border-border/50 overflow-hidden">
          <CardContent className="p-6 md:p-8 relative">
            <ConfettiExplosion trigger={showConfetti} />
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-full border-[3px] border-primary/40 p-0.5 shadow-[0_0_20px_hsl(var(--primary)/0.3)] bg-secondary flex items-center justify-center text-3xl font-bold">
                  {creator.name[0]}
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold mb-1">{creator.name}</h1>
                <p className="text-xs text-muted-foreground font-mono mb-3">{creator.address.slice(0, 8)}...{creator.address.slice(-4)}</p>
                <p className="text-muted-foreground mb-4">{creator.bio || "No bio"}</p>

                {/* Stats */}
                <div className="flex items-center justify-center sm:justify-start gap-5 text-sm mb-4">
                  <span className="relative flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-primary" />
                    <AnimatedStat value={formatSats(totalSats)} suffix=" sats" />
                    <AnimatePresence>
                      {floatingTip && <FloatingTip id={floatingTip.id} amount={floatingTip.amount} />}
                    </AnimatePresence>
                  </span>
                  <span className="flex items-center gap-1.5"><Coffee className="w-4 h-4 text-muted-foreground" /><AnimatedStat value={totalTips.toString()} suffix=" tips" /></span>
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-muted-foreground" />{creator.supporters}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <Button asChild className="gradient-bitcoin text-primary-foreground font-semibold glow-bitcoin-sm hover:opacity-90">
                    <Link to={`/tip/${creator.address}`}><Coffee className="w-4 h-4 mr-1.5" /> Send Tip</Link>
                  </Button>
                  <Button variant="outline" onClick={handleFollow} className={following ? "border-red-500/30 text-red-500 hover:bg-red-500/10" : "border-border"}>
                    <Heart className={`w-4 h-4 mr-1.5 ${following ? "fill-red-500" : ""}`} />
                    {following ? "Following" : "Follow"}
                  </Button>
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-1.5" /> Share
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Total Received", value: formatSats(totalSats), icon: Zap, suffix: " sats" },
          { label: "Tip Count", value: totalTips.toLocaleString(), icon: Coffee },
          { label: "Supporters", value: creator.supporters.toLocaleString(), icon: Users },
        ].map((stat) => (
          <Card key={stat.label} className="glass border-border/50">
            <CardContent className="p-4 text-center">
              <stat.icon className="w-5 h-5 mx-auto mb-1.5 text-primary" />
              <p className="text-lg"><AnimatedStat value={stat.value} /></p>
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Milestone Progress */}
      {creatorGoal && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mb-8">
          <Card className="glass border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {goalReached ? <PartyPopper className="w-4 h-4 text-primary" /> : <Target className="w-4 h-4 text-primary" />}
                {creatorGoal.title}
                {goalReached && <Badge className="ml-auto bg-primary/15 text-primary border-primary/30 text-[10px]">🎉 Goal Reached!</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="relative">
                <ConfettiExplosion trigger={showConfetti} />
                <Progress
                  value={goalProgress}
                  className="h-3 bg-secondary/80"
                />
                <div
                  className="absolute inset-0 h-3 rounded-full overflow-hidden pointer-events-none"
                >
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: `${goalProgress}%` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                    className="h-full rounded-full bg-gradient-to-r from-primary via-primary/80 to-primary/60"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span className="font-mono">{formatSats(creatorGoal.current + bonusSats)} sats</span>
                <span className="font-semibold text-foreground">{goalProgress.toFixed(0)}%</span>
                <span className="font-mono">{formatSats(creatorGoal.target)} sats</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Badges */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8">
        <h2 className="text-lg font-bold mb-3">Badges Earned</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {badgeList.map((badge) => (
            <Card key={badge.id} className={`glass border-border/50 shrink-0 ${!badge.earned ? "opacity-40" : ""}`}>
              <CardContent className="p-3 flex items-center gap-2 min-w-[120px]">
                <span className="text-xl">{badge.emoji}</span>
                <div>
                  <p className="text-xs font-semibold">{badge.name}</p>
                  {!badge.earned && <Lock className="w-3 h-3 text-muted-foreground" />}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Tip History */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-lg font-bold">Recent Tips</h2>
          <Badge variant="secondary" className="text-[10px]">{liveTips.length + tipHistory.length}</Badge>
        </div>
        <AnimatePresence initial={false}>
          <div className="space-y-2">
            {[...liveTips, ...tipHistory].map((tip) => {
              const tier = tierConfig[tip.tier];
              return (
                <motion.div
                  key={tip.id}
                  layout
                  initial={tip.isLive ? { opacity: 0, x: -20 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  <Card className={`glass border-border/50 transition-all duration-[2000ms] ${tip.isLive ? "border-primary/50 shadow-[0_0_12px_hsl(var(--primary)/0.15)]" : ""}`}>
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold shrink-0">
                        {tip.sender[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold truncate">{tip.sender}</span>
                          <span className="text-xs">{tier.emoji}</span>
                          {tip.isLive && (
                            <Badge variant="default" className="text-[9px] px-1.5 py-0 h-4 animate-fade-in">NEW</Badge>
                          )}
                        </div>
                        {tip.message && <p className="text-xs text-muted-foreground truncate">{tip.message}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono text-sm font-bold text-primary">{formatSats(tip.amount)}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(tip.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default CreatorProfile;
