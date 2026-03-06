import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Trophy, Search, Medal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatSats } from "@/lib/mock-data";
import { discoverCreators, getCreator, unwrapCV } from "@/lib/stacks";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "@/hooks/use-toast";

interface LeaderboardEntry {
  rank: number;
  name: string;
  address: string;
  totalSats: number;
  tipCount: number;
  isCurrentUser: boolean;
}

const podiumColors = ["text-yellow-400", "text-gray-300", "text-orange-500"];
const podiumBg = ["bg-yellow-500/10 border-yellow-500/30", "bg-gray-400/10 border-gray-400/30", "bg-orange-500/10 border-orange-500/30"];

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

const PodiumAndList = ({ data, search }: { data: LeaderboardEntry[]; search: string }) => {
  const filtered = data.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.address.toLowerCase().includes(search.toLowerCase()));
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
                    <div className="w-10 h-10 rounded-full mx-auto mb-2 border border-border bg-secondary flex items-center justify-center text-sm font-bold">
                      {u.name[0]}
                    </div>
                    <p className="text-sm font-bold truncate">{u.name}</p>
                    <p className="text-xs text-primary font-mono font-semibold">{formatSats(u.totalSats)}</p>
                    <p className="text-[10px] text-muted-foreground">{u.tipCount} tips</p>
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
                <div className="w-8 h-8 rounded-full border border-border bg-secondary flex items-center justify-center text-xs font-bold">
                  {u.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {u.name}
                    {u.isCurrentUser && <Badge variant="outline" className="ml-2 text-[10px] text-primary border-primary/30">You</Badge>}
                  </p>
                  <p className="text-xs text-muted-foreground">{u.tipCount} tips</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary font-mono">{formatSats(u.totalSats)}</p>
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
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const { address } = useWallet();

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const addresses = await discoverCreators();
      const results: LeaderboardEntry[] = [];
      for (const addr of addresses) {
        try {
          const raw = unwrapCV(await getCreator(addr));
          if (raw) {
            results.push({
              rank: 0,
              name: raw.name ?? "Creator",
              address: addr,
              totalSats: Number(raw["total-received"]) || 0,
              tipCount: Number(raw["tip-count"]) || 0,
              isCurrentUser: addr === address,
            });
          }
        } catch { /* skip */ }
      }
      results.sort((a, b) => b.totalSats - a.totalSats);
      results.forEach((e, i) => { e.rank = i + 1; });
      setEntries(results);
    } catch (err) {
      toast({ title: "Failed to load leaderboard", description: "Could not fetch ranking data. Try refreshing.", variant: "destructive" });
      console.error("Failed to fetch leaderboard:", err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  return (
    <div className="container py-6 md:py-10 pb-24 md:pb-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <Trophy className="w-6 h-6 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Leaderboard</h1>
        </div>
        <p className="text-muted-foreground mb-6">Top creators across the SatsPresso network</p>

        {loading ? (
          <LeaderboardSkeleton />
        ) : (
          <>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search creators..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/50 border-border" />
            </div>
            {entries.length > 0 ? (
              <PodiumAndList data={entries} search={search} />
            ) : (
              <Card className="glass border-border/50">
                <CardContent className="p-10 text-center text-muted-foreground">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-primary/50" />
                  <p className="font-medium">No creators yet</p>
                  <p className="text-sm">Be the first to create a tip jar!</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Leaderboard;
