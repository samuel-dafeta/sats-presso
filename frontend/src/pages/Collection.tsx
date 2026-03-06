import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Gem, Filter, Lock, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatSats, tierConfig, type Tier, getTier } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { toastError } from "@/lib/error";
import { useWallet } from "@/contexts/WalletContext";
import {
  getNFTHoldings, CONTRACTS,
  hasBadge, getClaimableBadges,
  claimBadge as claimBadgeContract,
  unwrapCV,
} from "@/lib/stacks";

// Badge type mapping
const BADGE_MAP = [
  { type: 1, name: "First Sip", emoji: "☕", description: "Received your first tip" },
  { type: 2, name: "Regular", emoji: "☕☕", description: "Received 10 tips" },
  { type: 3, name: "Connoisseur", emoji: "☕☕☕", description: "Received 100 tips" },
  { type: 4, name: "Whale Watcher", emoji: "💎", description: "Received a 100k+ sat tip" },
  { type: 5, name: "Streak Master", emoji: "🔥", description: "7-day tip streak" },
  { type: 6, name: "Top Supporter", emoji: "👑", description: "Top 10 on leaderboard" },
];

const tierColors: Record<Tier, string> = {
  diamond: "from-cyan-500 to-blue-600",
  gold: "from-yellow-500 to-orange-600",
  silver: "from-gray-400 to-gray-600",
  bronze: "from-orange-600 to-red-700",
};

interface NFTData {
  id: string; serial: number; tier: Tier; amount: number;
  from: string; to: string; date: string; message: string; color: string;
}

interface BadgeData {
  id: string; type: number; name: string; emoji: string;
  description: string; earned: boolean; claimable: boolean; progress: number;
}

const tierFilters: (Tier | "all")[] = ["all", "diamond", "gold", "silver", "bronze"];

const CollectionSkeleton = () => (
  <div className="container py-6 md:py-10 pb-24 md:pb-10">
    <Skeleton className="w-36 h-8 mb-2" />
    <Skeleton className="w-56 h-4 mb-6" />
    <Skeleton className="w-48 h-10 rounded-md mb-6" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {[0, 1, 2, 3].map((i) => (
        <Card key={i} className="glass border-border/50 overflow-hidden">
          <Skeleton className="h-28 w-full" />
          <CardContent className="p-3.5 space-y-2">
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-24 h-3" />
            <Skeleton className="w-20 h-3" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const Collection = () => {
  const { toast } = useToast();
  const { isConnected, address } = useWallet();
  const [filter, setFilter] = useState<Tier | "all">("all");
  const [claiming, setClaiming] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [badges, setBadges] = useState<BadgeData[]>([]);

  const fetchData = useCallback(async () => {
    if (!address) { setLoading(false); return; }
    setLoading(true);
    try {
      // Fetch NFT receipts
      try {
        const nftAsset = `${CONTRACTS.TIP_RECEIPTS}::tip-receipt`;
        const holdings = await getNFTHoldings(address, nftAsset);
        if (holdings?.results) {
          setNfts(holdings.results.map((h: any, idx: number) => {
            const tier: Tier = "bronze";
            return {
              id: `NFT-${String(idx + 1).padStart(3, "0")}`,
              serial: idx + 1, tier, amount: 0, from: "", to: address,
              date: new Date().toISOString().split("T")[0],
              message: "", color: tierColors[tier],
            };
          }));
        }
      } catch { /* NFT fetch failed */ }

      // Fetch badges
      const badgeList: BadgeData[] = [];
      for (const b of BADGE_MAP) {
        try {
          const earned = unwrapCV(await hasBadge(address, b.type));
          badgeList.push({
            id: String(b.type), type: b.type, name: b.name, emoji: b.emoji,
            description: b.description, earned: !!earned, claimable: false, progress: earned ? 100 : 0,
          });
        } catch {
          badgeList.push({
            id: String(b.type), type: b.type, name: b.name, emoji: b.emoji,
            description: b.description, earned: false, claimable: false, progress: 0,
          });
        }
      }
      try {
        const claimable = unwrapCV(await getClaimableBadges(address));
        if (claimable) {
          Object.values(claimable).forEach((val, idx) => {
            if (val && idx < badgeList.length && !badgeList[idx].earned) {
              badgeList[idx].claimable = true;
              badgeList[idx].progress = 100;
            }
          });
        }
      } catch { /* claimable check failed */ }
      setBadges(badgeList);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = filter === "all" ? nfts : nfts.filter((r) => r.tier === filter);

  const handleClaimBadge = async (id: string) => {
    setClaiming(id);
    try {
      await claimBadgeContract(Number(id));
      toast({ title: "Badge Claimed! 🏆", description: "Your soul-bound badge has been minted on-chain" });
      fetchData();
    } catch (err: unknown) {
      toastError("Claim failed", err);
    } finally {
      setClaiming(null);
    }
  };

  if (loading) return <CollectionSkeleton />;

  return (
    <div className="container py-6 md:py-10 pb-24 md:pb-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Collection</h1>
        <p className="text-muted-foreground mb-6">Your NFT receipts and soul-bound badges</p>

        <Tabs defaultValue="nfts">
          <TabsList className="bg-secondary/50 mb-6">
            <TabsTrigger value="nfts">NFT Receipts</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
          </TabsList>

          <TabsContent value="nfts">
            {/* Filter */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1" role="tablist">
              <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              {tierFilters.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  role="tab"
                  aria-selected={filter === t}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    filter === t
                      ? "gradient-bitcoin text-primary-foreground border-transparent"
                      : "border-border bg-secondary/30 hover:border-primary/30"
                  }`}
                >
                  {t === "all" ? "All" : `${tierConfig[t].emoji} ${tierConfig[t].label}`}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map((nft, i) => (
                <motion.div key={nft.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                  <Card className="glass border-border/50 overflow-hidden hover:border-primary/30 transition-all group">
                    <div className={`h-28 bg-gradient-to-br ${nft.color} relative`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-4xl opacity-30 font-mono font-bold">#{nft.serial.toString().padStart(3, "0")}</div>
                      </div>
                      <Badge className="absolute top-2 right-2 text-[10px]" variant="outline">
                        {tierConfig[nft.tier].emoji} {tierConfig[nft.tier].label}
                      </Badge>
                    </div>
                    <CardContent className="p-3.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-mono text-muted-foreground">{nft.id}</p>
                        <p className="text-sm font-bold text-primary font-mono">{formatSats(nft.amount)}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">From: {nft.from}</p>
                      <p className="text-xs text-muted-foreground">Date: {nft.date}</p>
                      {nft.message && <p className="text-xs mt-1.5 text-foreground/80 italic">"{nft.message}"</p>}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="badges">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge, i) => (
                <motion.div key={badge.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className={`glass border-border/50 ${badge.earned ? "border-primary/20 glow-bitcoin-sm" : "opacity-75"}`}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{badge.emoji}</span>
                          <div>
                            <p className="font-semibold">{badge.name}</p>
                            <p className="text-xs text-muted-foreground">{badge.description}</p>
                          </div>
                        </div>
                        {badge.earned ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> : <Lock className="w-4 h-4 text-muted-foreground shrink-0" />}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{badge.progress}%</span>
                        </div>
                        <Progress value={badge.progress} className="h-1.5 bg-secondary [&>div]:gradient-bitcoin" />
                      </div>
                      {badge.claimable && !badge.earned && (
                        <Button size="sm" onClick={() => handleClaimBadge(badge.id)} disabled={claiming === badge.id}
                          className="w-full mt-3 gradient-bitcoin text-primary-foreground font-semibold text-xs">
                          {claiming === badge.id ? <><Loader2 className="w-3 h-3 animate-spin mr-1" /> Minting...</> : "Claim Badge"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Collection;
