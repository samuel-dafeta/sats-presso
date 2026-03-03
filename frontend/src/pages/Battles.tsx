import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Swords, Clock, Trophy, Plus, ArrowRight, Zap, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockBattles, formatSats, type Battle } from "@/lib/mock-data";

const BattlesSkeleton = () => (
  <div className="container py-6 md:py-10 pb-24 md:pb-10">
    <div className="flex items-center justify-between mb-6">
      <div className="space-y-1">
        <Skeleton className="w-40 h-8" />
        <Skeleton className="w-64 h-4" />
      </div>
      <Skeleton className="w-28 h-9 rounded-md" />
    </div>
    <Skeleton className="w-72 h-10 rounded-md mb-6" />
    <div className="space-y-4">
      {[0, 1].map((i) => (
        <Card key={i} className="glass border-border/50">
          <CardContent className="p-5 space-y-4">
            <div className="flex justify-between">
              <Skeleton className="w-16 h-5 rounded-full" />
              <Skeleton className="w-20 h-4" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="w-20 h-4" />
              </div>
              <Skeleton className="w-8 h-5 rounded" />
              <div className="flex items-center gap-2">
                <Skeleton className="w-20 h-4" />
                <Skeleton className="w-10 h-10 rounded-full" />
              </div>
            </div>
            <Skeleton className="w-full h-3 rounded-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const BattleCard = ({ battle, index }: { battle: Battle; index: number }) => {
  const totalSats = battle.tipsA.totalSats + battle.tipsB.totalSats;
  const pctA = totalSats > 0 ? (battle.tipsA.totalSats / totalSats) * 100 : 50;
  const isCompleted = battle.status === "completed";
  const winnerA = isCompleted && battle.tipsA.totalSats > battle.tipsB.totalSats;
  const winnerB = isCompleted && battle.tipsB.totalSats > battle.tipsA.totalSats;

  const getTimeLabel = () => {
    if (battle.status === "upcoming") {
      const diff = new Date(battle.startTime).getTime() - Date.now();
      const hours = Math.max(0, Math.floor(diff / 3600000));
      return `Starts in ${hours}h`;
    }
    if (battle.status === "active") {
      const diff = new Date(battle.endTime).getTime() - Date.now();
      const hours = Math.max(0, Math.floor(diff / 3600000));
      const mins = Math.max(0, Math.floor((diff % 3600000) / 60000));
      return `${hours}h ${mins}m left`;
    }
    return "Completed";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Card className="glass border-border/50 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <Badge
              variant={battle.status === "active" ? "default" : "secondary"}
              className={
                battle.status === "active"
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : battle.status === "upcoming"
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  : "bg-muted text-muted-foreground"
              }
            >
              {battle.status === "active" && <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse" />}
              {battle.status.charAt(0).toUpperCase() + battle.status.slice(1)}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {getTimeLabel()}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 mb-4">
            <div className={`flex items-center gap-2 flex-1 min-w-0 ${winnerA ? "" : winnerB ? "opacity-50" : ""}`}>
              <img src={battle.creatorA.avatar} alt={battle.creatorA.name} className="w-10 h-10 rounded-full border border-border shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{battle.creatorA.name}</p>
                {totalSats > 0 && <p className="text-xs font-mono text-primary">{formatSats(battle.tipsA.totalSats)}</p>}
              </div>
              {winnerA && <Trophy className="w-4 h-4 text-primary shrink-0" />}
            </div>

            <div className="shrink-0">
              <Badge className="gradient-bitcoin text-primary-foreground font-bold text-xs px-2">VS</Badge>
            </div>

            <div className={`flex items-center gap-2 flex-1 min-w-0 justify-end text-right ${winnerB ? "" : winnerA ? "opacity-50" : ""}`}>
              {winnerB && <Trophy className="w-4 h-4 text-primary shrink-0" />}
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{battle.creatorB.name}</p>
                {totalSats > 0 && <p className="text-xs font-mono text-primary">{formatSats(battle.tipsB.totalSats)}</p>}
              </div>
              <img src={battle.creatorB.avatar} alt={battle.creatorB.name} className="w-10 h-10 rounded-full border border-border shrink-0" />
            </div>
          </div>

          {totalSats > 0 && (
            <div className="flex gap-1 h-3 rounded-full overflow-hidden mb-4 bg-secondary/50">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-l-full transition-all duration-700 ease-out" style={{ width: `${pctA}%` }} />
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-r-full transition-all duration-700 ease-out" style={{ width: `${100 - pctA}%` }} />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {totalSats > 0 && (
                <>
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-primary" />{formatSats(totalSats)} total</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{battle.tipsA.supporters + battle.tipsB.supporters}</span>
                </>
              )}
              {battle.wager > 0 && <span className="text-primary font-mono">🎰 {formatSats(battle.wager)} wager</span>}
            </div>
            {battle.status === "active" ? (
              <Button asChild size="sm" className="gradient-bitcoin text-primary-foreground font-semibold text-xs">
                <Link to={`/battles/${battle.id}`}>Enter Arena <ArrowRight className="w-3 h-3 ml-1" /></Link>
              </Button>
            ) : battle.status === "completed" ? (
              <Button asChild size="sm" variant="outline" className="text-xs border-border">
                <Link to={`/battles/${battle.id}`}>View Results</Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Battles = () => {
  const [tab, setTab] = useState("active");
  const [loading, setLoading] = useState(true);
  const active = mockBattles.filter((b) => b.status === "active");
  const upcoming = mockBattles.filter((b) => b.status === "upcoming");
  const completed = mockBattles.filter((b) => b.status === "completed");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <BattlesSkeleton />;

  return (
    <div className="container py-6 md:py-10 pb-24 md:pb-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <Swords className="w-6 h-6 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold">Tip Battles</h1>
          </div>
          <Button asChild size="sm" className="gradient-bitcoin text-primary-foreground font-semibold glow-bitcoin-sm hover:opacity-90">
            <Link to="/create-battle"><Plus className="w-4 h-4 mr-1" />Create Battle</Link>
          </Button>
        </div>
        <p className="text-muted-foreground mb-6">Two creators enter, one leaves victorious. May the best tips win!</p>

        <Tabs value={tab} onValueChange={setTab} className="mb-6">
          <TabsList className="bg-secondary/50 w-full sm:w-auto">
            <TabsTrigger value="active" className="flex-1 sm:flex-initial gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Active ({active.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex-1 sm:flex-initial">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 sm:flex-initial">Completed ({completed.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4 space-y-4">
            {active.length > 0 ? active.map((b, i) => <BattleCard key={b.id} battle={b} index={i} />) : (
              <Card className="glass border-border/50"><CardContent className="p-10 text-center text-muted-foreground">
                <Swords className="w-8 h-8 mx-auto mb-2 text-primary/50" />
                <p className="font-medium">No active battles</p>
                <p className="text-sm">Create one to get started!</p>
              </CardContent></Card>
            )}
          </TabsContent>
          <TabsContent value="upcoming" className="mt-4 space-y-4">
            {upcoming.length > 0 ? upcoming.map((b, i) => <BattleCard key={b.id} battle={b} index={i} />) : (
              <Card className="glass border-border/50"><CardContent className="p-10 text-center text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 text-primary/50" />
                <p className="font-medium">No upcoming battles</p>
              </CardContent></Card>
            )}
          </TabsContent>
          <TabsContent value="completed" className="mt-4 space-y-4">
            {completed.length > 0 ? completed.map((b, i) => <BattleCard key={b.id} battle={b} index={i} />) : (
              <Card className="glass border-border/50"><CardContent className="p-10 text-center text-muted-foreground">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-primary/50" />
                <p className="font-medium">No completed battles yet</p>
              </CardContent></Card>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Battles;
