import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Zap, Heart, Users, Star, Lock, ArrowLeft, Twitter, Github, Globe, Share2, Target, PartyPopper } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockCreators, mockTipHistory, mockBadges, formatSats, tierConfig, getTier, type Tier } from "@/lib/mock-data";
import { useFollow } from "@/contexts/FollowContext";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/contexts/NotificationContext";
import { ConfettiExplosion } from "@/components/ConfettiExplosion";
import { playConfettiSound, playTipSound } from "@/lib/sounds";

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
  const creator = mockCreators.find((c) => c.address === address);
  const { toggleFollow, isFollowing } = useFollow();
  const { toast } = useToast();
  const { notifications } = useNotifications();

  const [bonusSats, setBonusSats] = useState(0);
  const [bonusTips, setBonusTips] = useState(0);
  const [floatingTip, setFloatingTip] = useState<{ id: string; amount: number } | null>(null);
  const [liveTips, setLiveTips] = useState<Array<{ id: string; sender: string; amount: number; message: string; tier: Tier; timestamp: string; isLive: boolean }>>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const lastNotifIdRef = useRef<string | null>(null);
  const prevGoalReachedRef = useRef(false);

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
  const creatorGoalForEffect = creator ? (creator as any).goal as { title: string; target: number; current: number } | undefined : undefined;
  const currentGoalReached = creatorGoalForEffect ? ((creatorGoalForEffect.current + bonusSats) / creatorGoalForEffect.target) >= 1 : false;

  useEffect(() => {
    if (currentGoalReached && !prevGoalReachedRef.current) {
      setShowConfetti(true);
      playConfettiSound();
      const timer = setTimeout(() => setShowConfetti(false), 1500);
      return () => clearTimeout(timer);
    }
    prevGoalReachedRef.current = currentGoalReached;
  }, [currentGoalReached]);

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
  const socialLinks = (creator as any).socialLinks as { twitter?: string; github?: string; website?: string } | undefined;
  const creatorGoal = (creator as any).goal as { title: string; target: number; current: number } | undefined;
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
                <div className="w-24 h-24 rounded-full border-[3px] border-primary/40 p-0.5 shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
                  <img src={creator.avatar} alt={creator.name} className="w-full h-full rounded-full" />
                </div>
                {creator.featured && (
                  <Badge className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] bg-primary/15 text-primary border-primary/30">
                    <Star className="w-2.5 h-2.5 mr-0.5 fill-primary" /> Featured
                  </Badge>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold mb-1">{creator.name}</h1>
                <Badge variant="secondary" className="mb-3">{creator.category}</Badge>
                <p className="text-muted-foreground mb-4">{creator.bio}</p>

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

                {/* Social Links */}
                {socialLinks && (
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
                    {socialLinks.twitter && (
                      <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-md bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
                        <Twitter className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {socialLinks.github && (
                      <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="p-2 rounded-md bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
                        <Github className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {socialLinks.website && (
                      <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="p-2 rounded-md bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
                        <Globe className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}

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
          {mockBadges.map((badge) => (
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
          <Badge variant="secondary" className="text-[10px]">{liveTips.length + mockTipHistory.length}</Badge>
        </div>
        <AnimatePresence initial={false}>
          <div className="space-y-2">
            {[...liveTips, ...mockTipHistory.map(t => ({ ...t, isLive: false }))].map((tip) => {
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
