import { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Users, Coffee, Zap, Heart, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatSats } from "@/lib/mock-data";
import { useFollow } from "@/contexts/FollowContext";
import { useToast } from "@/hooks/use-toast";
import { toastError } from "@/lib/error";
import { discoverCreators, getCreator, unwrapCV } from "@/lib/stacks";

interface OnChainCreator {
  name: string;
  address: string;
  bio: string;
  totalSats: number;
  tipCount: number;
  supporters: number;
}

const ExploreSkeleton = () => (
  <div className="container py-6 md:py-10 pb-24 md:pb-10">
    <Skeleton className="w-48 h-8 mb-2" />
    <Skeleton className="w-64 h-4 mb-6" />
    <Skeleton className="w-full h-10 mb-4 rounded-md" />
    <div className="flex gap-2 mb-6">
      {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="w-16 h-7 rounded-full" />)}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Card key={i} className="glass border-border/50">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-11 h-11 rounded-full" />
              <div className="space-y-1 flex-1">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-12 h-3" />
              </div>
            </div>
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-9 rounded-md" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const Explore = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [creators, setCreators] = useState<OnChainCreator[]>([]);
  const { followedAddresses, toggleFollow, isFollowing } = useFollow();
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState<"all" | "following">("all");

  const fetchCreators = useCallback(async () => {
    setLoading(true);
    try {
      const addresses = await discoverCreators();
      const results: OnChainCreator[] = [];
      for (const addr of addresses) {
        try {
          const raw = unwrapCV(await getCreator(addr));
          if (raw) {
            results.push({
              name: raw.name ?? "Creator",
              address: addr,
              bio: raw.bio ?? "",
              totalSats: Number(raw["total-received"]) || 0,
              tipCount: Number(raw["tip-count"]) || 0,
              supporters: Number(raw["supporter-count"]) || 0,
            });
          }
        } catch { /* skip */ }
      }
      results.sort((a, b) => b.totalSats - a.totalSats);
      setCreators(results);
    } catch (err) {
      toastError("Failed to load creators", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCreators(); }, [fetchCreators]);

  const followCount = followedAddresses.length;

  const handleToggleFollow = (address: string, name: string) => {
    const wasFollowing = isFollowing(address);
    toggleFollow(address);
    toast({ title: wasFollowing ? `Unfollowed ${name}` : `Following ${name}! ❤️` });
  };

  const filtered = creators.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.bio.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase());
    if (activeFilter === "following") return matchesSearch && isFollowing(c.address);
    return matchesSearch;
  });

  if (loading) return <ExploreSkeleton />;

  return (
    <div className="container py-6 md:py-10 pb-24 md:pb-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <Users className="w-6 h-6 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Explore Creators</h1>
        </div>
        <p className="text-muted-foreground mb-6">
          Discover talented creators and support them with sats
        </p>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search creators..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/50 border-border" />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none" role="tablist">
          {(["all", "following"] as const).map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              role="tab"
              aria-selected={activeFilter === f}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                activeFilter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary/50 text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
              }`}
            >
              {f === "following" ? `Following${followCount > 0 ? ` (${followCount})` : ""}` : "All"}
            </button>
          ))}
        </div>

        {/* Creator Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((creator, i) => (
              <motion.div key={creator.address} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="glass border-border/50 h-full flex flex-col">
                  <CardContent className="p-5 flex flex-col flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-11 h-11 rounded-full border border-border bg-secondary flex items-center justify-center text-sm font-bold shrink-0">
                        {creator.name[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link to={`/tip/${creator.address}`} className="font-semibold truncate hover:text-primary transition-colors block">{creator.name}</Link>
                        <p className="text-[10px] text-muted-foreground font-mono">{creator.address.slice(0, 8)}...{creator.address.slice(-4)}</p>
                      </div>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleToggleFollow(creator.address, creator.name)}
                        className="p-1.5 rounded-full hover:bg-secondary/80 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        <Heart className={`w-4 h-4 transition-colors ${isFollowing(creator.address) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                      </motion.button>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{creator.bio || "No bio yet"}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-primary" /><span className="font-mono font-semibold text-foreground">{formatSats(creator.totalSats)}</span></span>
                      <span className="flex items-center gap-1"><Coffee className="w-3 h-3" />{creator.tipCount} tips</span>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{creator.supporters}</span>
                    </div>
                    <Button asChild size="sm" className="w-full gradient-bitcoin text-primary-foreground font-semibold glow-bitcoin-sm hover:opacity-90">
                      <Link to={`/tip/${creator.address}`}><Coffee className="w-3.5 h-3.5 mr-1" /> Send Tip</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="glass border-border/50">
            <CardContent className="p-10 text-center text-muted-foreground">
              <Users className="w-8 h-8 mx-auto mb-2 text-primary/50" />
              <p className="font-medium">No creators found</p>
              <p className="text-sm">Try adjusting your search or be the first to create a tip jar!</p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

export default Explore;
