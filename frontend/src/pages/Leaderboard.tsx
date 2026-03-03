import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Search, Medal, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { mockLeaderboard, mockMonthlyLeaderboard, mockStreakLeaderboard, formatSats } from "@/lib/mock-data";

const podiumColors = ["text-yellow-400", "text-gray-300", "text-orange-500"];
const podiumBg = ["bg-yellow-500/10 border-yellow-500/30", "bg-gray-400/10 border-gray-400/30", "bg-orange-500/10 border-orange-500/30"];

const getFireIntensity = (days: number) => {
  if (days >= 30) return "🔥🔥🔥";
  if (days >= 14) return "🔥🔥";
  if (days >= 3) return "🔥";
  return "✨";
};

const LeaderboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-3 gap-3">
      {[0, 1, 2].map((i) => (
        <Card key={i} className="glass border-border/50">
          <CardContent className="p-4 flex flex-col items-center gap-2">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-20 h-4" />
            <Skeleton className="w-14 h-3" />
          </CardContent>
        </Card>
      ))}
    </div>
    <Card className="glass border-border/50">
      <CardContent className="p-0">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-border/30 last:border-0">
            <Skeleton className="w-6 h-4" />
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-16 h-3" />
            </div>
            <Skeleton className="w-16 h-4" />
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

const PodiumAndList = ({ data, search }: { data: typeof mockLeaderboard; search: string }) => {
  const filtered = data.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()));
  const top3 = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  return (
    <>
      {top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 0, 2].map((idx) => {
            const u = top3[idx];
            return (
              <motion.div key={u.rank} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                <Card className={`glass border ${podiumBg[idx]} ${idx === 0 ? "md:-mt-4" : ""}`}>
                  <CardContent className="p-4 text-center">
                    <Medal className={`w-6 h-6 mx-auto mb-2 ${podiumColors[idx]}`} />
                    <img src={u.avatar} alt="" className="w-10 h-10 rounded-full mx-auto mb-2 border border-border" />
                    <p className="text-sm font-bold truncate">{u.name}</p>
                    <p className="text-xs text-primary font-mono font-semibold">{formatSats(u.totalSats)}</p>
                    <p className="text-[10px] text-muted-foreground">{u.tipCount} tips</p>
                    <div className="flex gap-0.5 justify-center mt-1.5">
                      {u.badges.map((b, i) => <span key={i} className="text-xs">{b}</span>)}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Card className="glass border-border/50">
        <CardContent className="p-0">
          <div className="divide-y divide-border/30">
            {rest.map((u) => (
              <div key={u.rank} className={`flex items-center gap-3 px-4 py-3 ${u.isCurrentUser ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}>
                <span className="w-6 text-sm font-mono text-muted-foreground text-center">{u.rank}</span>
                <img src={u.avatar} alt="" className="w-8 h-8 rounded-full border border-border" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {u.name}
                    {u.isCurrentUser && <Badge variant="outline" className="ml-2 text-[10px] text-primary border-primary/30">You</Badge>}
                  </p>
                  <p className="text-xs text-muted-foreground">{u.tipCount} tips</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary font-mono">{formatSats(u.totalSats)}</p>
                  <div className="flex gap-0.5 justify-end">{u.badges.map((b, i) => <span key={i} className="text-xs">{b}</span>)}</div>
                </div>
              </div>
            ))}
            {rest.length === 0 && top3.length < 3 && (
              <div className="p-6 text-center text-muted-foreground text-sm">No results match your search</div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

const Leaderboard = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container py-6 md:py-10 pb-24 md:pb-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <Trophy className="w-6 h-6 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Leaderboard</h1>
        </div>
        <p className="text-muted-foreground mb-6">Top supporters across the SatsPresso network</p>

        <Tabs defaultValue="all-time">
          <TabsList className="bg-secondary/50 mb-6">
            <TabsTrigger value="all-time">All-Time</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="streaks">Streaks</TabsTrigger>
          </TabsList>

          {loading ? (
            <LeaderboardSkeleton />
          ) : (
            <>
              <TabsContent value="all-time">
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search creators..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/50 border-border" />
                </div>
                <PodiumAndList data={mockLeaderboard} search={search} />
              </TabsContent>

              <TabsContent value="monthly">
                <div className="mb-4">
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                    🗓️ February 2026 — resets in 8 days
                  </Badge>
                </div>
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search creators..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/50 border-border" />
                </div>
                <PodiumAndList data={mockMonthlyLeaderboard} search={search} />
              </TabsContent>

              <TabsContent value="streaks">
                {/* Your streak card */}
                <Card className="glass border-primary/20 glow-bitcoin-sm mb-6">
                  <CardContent className="p-4 flex items-center gap-4">
                    <span className="text-3xl">🔥</span>
                    <div>
                      <p className="text-sm text-muted-foreground">Your Current Streak</p>
                      <p className="text-2xl font-bold">5 days</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-xs text-muted-foreground">Keep tipping daily!</p>
                      <p className="text-sm text-primary font-semibold">22 total tips</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass border-border/50">
                  <CardContent className="p-0">
                    <div className="divide-y divide-border/30">
                      {mockStreakLeaderboard.map((u) => (
                        <div key={u.rank} className={`flex items-center gap-3 px-4 py-3 ${u.isCurrentUser ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}>
                          <span className="w-6 text-sm font-mono text-muted-foreground text-center">{u.rank}</span>
                          <img src={u.avatar} alt="" className="w-8 h-8 rounded-full border border-border" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {u.name}
                              {u.isCurrentUser && <Badge variant="outline" className="ml-2 text-[10px] text-primary border-primary/30">You</Badge>}
                            </p>
                            <p className="text-xs text-muted-foreground">{u.totalTips} total tips</p>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            <span className="text-sm">{getFireIntensity(u.streakDays)}</span>
                            <div>
                              <p className="text-sm font-semibold text-primary">{u.streakDays} days</p>
                              <div className="flex gap-0.5 justify-end">{u.badges.map((b, i) => <span key={i} className="text-xs">{b}</span>)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Leaderboard;
