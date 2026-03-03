import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Gem, Filter, Lock, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockNFTReceipts, mockBadges, formatSats, tierConfig, Tier } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

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
  const [filter, setFilter] = useState<Tier | "all">("all");
  const [claiming, setClaiming] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const filtered = filter === "all" ? mockNFTReceipts : mockNFTReceipts.filter((r) => r.tier === filter);

  const claimBadge = (id: string) => {
    setClaiming(id);
    setTimeout(() => {
      setClaiming(null);
      toast({ title: "Badge Claimed! 🏆", description: "Your soul-bound badge has been minted on-chain" });
    }, 3000);
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
              {mockBadges.map((badge, i) => (
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
                        <Button size="sm" onClick={() => claimBadge(badge.id)} disabled={claiming === badge.id}
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
