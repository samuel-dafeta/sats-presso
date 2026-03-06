import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { Zap, Users, Trophy, TrendingUp, Copy, Share2, Gem, ExternalLink, Search, Lock, CheckCircle2, Loader2, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatSats, tierConfig, type Tier, getTier } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { toastError } from "@/lib/error";
import { Link, useNavigate } from "react-router-dom";
import { useWallet } from "@/contexts/WalletContext";
import {
  getCreator, getCreatorGoal, getGoalProgress,
  getCreatorTipAtIndex, getTip, getTipCount,
  getClaimableBadges, hasBadge, getBadgeTypeInfo, getUserStats,
  claimBadge as claimBadgeContract,
  updateProfile,
  getNFTHoldings, CONTRACTS,
  unwrapCV, checkIsCreator,
} from "@/lib/stacks";

// Badge type mapping (on-chain badge-type uint → display info)
const BADGE_MAP: { type: number; name: string; emoji: string; description: string }[] = [
  { type: 1, name: "First Sip", emoji: "☕", description: "Received your first tip" },
  { type: 2, name: "Regular", emoji: "☕☕", description: "Received 10 tips" },
  { type: 3, name: "Connoisseur", emoji: "☕☕☕", description: "Received 100 tips" },
  { type: 4, name: "Whale Watcher", emoji: "💎", description: "Received a 100k+ sat tip" },
  { type: 5, name: "Streak Master", emoji: "🔥", description: "7-day tip streak" },
  { type: 6, name: "Top Supporter", emoji: "👑", description: "Top 10 on leaderboard" },
];

const tierFilters: (Tier | "all")[] = ["all", "diamond", "gold", "silver", "bronze"];
const TIPS_PER_PAGE = 5;

interface CreatorData {
  name: string;
  bio: string;
  address: string;
  shortAddress: string;
  totalSats: number;
  tipCount: number;
  supporters: number;
}

interface TipData {
  id: string;
  sender: string;
  amount: number;
  message: string;
  tier: Tier;
  timestamp: string;
}

interface BadgeData {
  id: string;
  type: number;
  name: string;
  emoji: string;
  description: string;
  earned: boolean;
  claimable: boolean;
  progress: number;
}

interface NFTData {
  id: string;
  serial: number;
  tier: Tier;
  amount: number;
  from: string;
  to: string;
  date: string;
  message: string;
  color: string;
}

const tierColors: Record<Tier, string> = {
  diamond: "from-cyan-500 to-blue-600",
  gold: "from-yellow-500 to-orange-600",
  silver: "from-gray-400 to-gray-600",
  bronze: "from-orange-600 to-red-700",
};

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isConnected, address } = useWallet();
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  // Data from chain
  const [creator, setCreator] = useState<CreatorData | null>(null);
  const [goal, setGoal] = useState<{ title: string; target: number; current: number } | null>(null);
  const [tipHistory, setTipHistory] = useState<TipData[]>([]);
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [nfts, setNfts] = useState<NFTData[]>([]);

  const tipUrl = address ? `${window.location.origin}/tip/${address}` : "";
  const goalPercent = goal ? Math.round((goal.current / goal.target) * 100) : 0;

  // Tip History state
  const [tipSearch, setTipSearch] = useState("");
  const [tipTierFilter, setTierFilter] = useState<Tier | "all">("all");
  const [tipPage, setTipPage] = useState(0);

  // Badges state
  const [claiming, setClaiming] = useState<string | null>(null);

  // NFT state
  const [nftFilter, setNftFilter] = useState<Tier | "all">("all");

  // Settings state
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [minAmount, setMinAmount] = useState("1000");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected || !address) {
      navigate("/");
    }
  }, [isConnected, address, navigate]);

  // Fetch all data
  const fetchDashboardData = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      // Check if user is a registered creator
      const isCreatorResult = unwrapCV(await checkIsCreator(address));
      if (!isCreatorResult) {
        toast({ title: "Not a creator", description: "Register a tip jar first", variant: "destructive" });
        navigate("/create");
        return;
      }

      // Fetch creator profile
      const creatorRaw = unwrapCV(await getCreator(address));
      const creatorData: CreatorData = {
        name: creatorRaw?.name ?? "Creator",
        bio: creatorRaw?.bio ?? "",
        address,
        shortAddress: `${address.slice(0, 4)}...${address.slice(-4)}`,
        totalSats: Number(creatorRaw?.["total-received"]) || 0,
        tipCount: Number(creatorRaw?.["tip-count"]) || 0,
        supporters: Number(creatorRaw?.["supporter-count"]) || 0,
      };
      setCreator(creatorData);
      setDisplayName(creatorData.name);
      setBio(creatorData.bio);

      // Fetch goal
      try {
        const goalRaw = unwrapCV(await getCreatorGoal(address));
        if (goalRaw && goalRaw.active) {
          const progressRaw = unwrapCV(await getGoalProgress(address));
          setGoal({
            title: goalRaw.description ?? "Goal",
            target: goalRaw.amount ?? 0,
            current: progressRaw?.progress ?? 0,
          });
        }
      } catch { /* no goal set */ }

      // Fetch tip history (last 20 tips)
      const tipCount = creatorData.tipCount;
      const tips: TipData[] = [];
      const fetchCount = Math.min(tipCount, 20);
      for (let i = tipCount; i > tipCount - fetchCount && i > 0; i--) {
        try {
          const tipIdRaw = unwrapCV(await getCreatorTipAtIndex(address, i - 1));
          if (tipIdRaw == null) continue;
          const tipRaw = unwrapCV(await getTip(tipIdRaw));
          if (!tipRaw) continue;
          const amount = Number(tipRaw.amount) || 0;
          tips.push({
            id: String(tipIdRaw),
            sender: tipRaw.from ?? "Unknown",
            amount,
            message: tipRaw.message ?? "",
            tier: getTier(amount),
            timestamp: tipRaw.timestamp ? new Date(Number(tipRaw.timestamp) * 1000).toISOString() : new Date().toISOString(),
          });
        } catch { /* skip failed tip fetch */ }
      }
      setTipHistory(tips);

      // Fetch badges
      const badgeList: BadgeData[] = [];
      for (const b of BADGE_MAP) {
        try {
          const earned = unwrapCV(await hasBadge(address, b.type));
          badgeList.push({
            id: String(b.type),
            type: b.type,
            name: b.name,
            emoji: b.emoji,
            description: b.description,
            earned: !!earned,
            claimable: false, // Will compute below
            progress: earned ? 100 : 0,
          });
        } catch {
          badgeList.push({
            id: String(b.type),
            type: b.type,
            name: b.name,
            emoji: b.emoji,
            description: b.description,
            earned: false,
            claimable: false,
            progress: 0,
          });
        }
      }
      // Check which badges are claimable
      try {
        const claimable = unwrapCV(await getClaimableBadges(address));
        if (claimable) {
          // claimable is a tuple of booleans keyed by badge name
          const claimKeys = Object.entries(claimable);
          claimKeys.forEach(([key, val], idx) => {
            if (val && idx < badgeList.length && !badgeList[idx].earned) {
              badgeList[idx].claimable = true;
              badgeList[idx].progress = 100;
            }
          });
        }
      } catch { /* claimable check failed */ }
      setBadges(badgeList);

      // Fetch NFT receipts from Hiro API
      try {
        const nftAsset = `${CONTRACTS.TIP_RECEIPTS}::tip-receipt`;
        const holdings = await getNFTHoldings(address, nftAsset);
        if (holdings?.results) {
          const nftList: NFTData[] = holdings.results.map((h: any, idx: number) => {
            const amount = 0; // Will be enriched later from token metadata
            const tier: Tier = "bronze";
            return {
              id: `NFT-${String(idx + 1).padStart(3, "0")}`,
              serial: idx + 1,
              tier,
              amount,
              from: "",
              to: address,
              date: new Date().toISOString().split("T")[0],
              message: "",
              color: tierColors[tier],
            };
          });
          setNfts(nftList);
        }
      } catch { /* NFT fetch failed */ }
    } catch (err) {
      toast({ title: "Failed to load dashboard", description: "Could not fetch your data. Try refreshing.", variant: "destructive" });
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }, [address, navigate, toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const topSupporters = useMemo(() => {
    const map = new Map<string, number>();
    tipHistory.forEach((t) => map.set(t.sender, (map.get(t.sender) ?? 0) + t.amount));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [tipHistory]);

  if (loading) return <DashboardSkeleton />;
  if (!creator) return <DashboardSkeleton />;

  const stats = [
    { label: "Total Sats", value: formatSats(creator.totalSats), icon: Zap, suffix: "sats" },
    { label: "Tips Received", value: creator.tipCount.toString(), icon: TrendingUp, suffix: "" },
    { label: "Rank", value: "-", icon: Trophy, suffix: "" },
    { label: "Supporters", value: creator.supporters.toString(), icon: Users, suffix: "" },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(tipUrl);
    toast({ title: "Link copied!", description: "Share it with your supporters" });
  };

  // Tip History filtering + pagination
  const filteredTips = tipHistory.filter((tip) => {
    const matchSearch = tip.sender.toLowerCase().includes(tipSearch.toLowerCase());
    const matchTier = tipTierFilter === "all" || tip.tier === tipTierFilter;
    return matchSearch && matchTier;
  });
  const totalTipPages = Math.max(1, Math.ceil(filteredTips.length / TIPS_PER_PAGE));
  const pagedTips = filteredTips.slice(tipPage * TIPS_PER_PAGE, (tipPage + 1) * TIPS_PER_PAGE);

  // NFT filtering
  const filteredNfts = nftFilter === "all" ? nfts : nfts.filter((r) => r.tier === nftFilter);

  // Weekly stats from tip history (last 7 days)
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weeklyTipsList = tipHistory.filter((t) => new Date(t.timestamp).getTime() > weekAgo);
  const weeklyTips = weeklyTipsList.length;
  const weeklySats = weeklyTipsList.reduce((sum, t) => sum + t.amount, 0);

  const handleClaimBadge = async (id: string) => {
    setClaiming(id);
    try {
      await claimBadgeContract(Number(id));
      toast({ title: "Badge Claimed! 🏆", description: "Your soul-bound badge has been minted on-chain" });
      // Refresh badges
      fetchDashboardData();
    } catch (err: unknown) {
      toastError("Claim failed", err);
    } finally {
      setClaiming(null);
    }
  };

  const handleSaveSettings = async () => {
    if (!displayName.trim()) return;
    setSavingSettings(true);
    try {
      await updateProfile(displayName.trim(), bio.trim());
      toast({ title: "Settings saved! ✅", description: "Profile update transaction submitted" });
    } catch (err: unknown) {
      toastError("Update failed", err);
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="container py-6 md:py-10 pb-24 md:pb-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl border border-border bg-secondary flex items-center justify-center text-lg font-bold">{creator.name[0]}</div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{creator.name}</h1>
            <p className="text-sm text-muted-foreground font-mono">{creator.shortAddress}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                    <s.icon className="w-3.5 h-3.5 text-primary" />
                    {s.label}
                  </div>
                  <p className="text-2xl font-bold">
                    {s.value}
                    {s.suffix && <span className="text-sm font-normal text-muted-foreground ml-1">{s.suffix}</span>}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Goal */}
        {goal && (
        <Card className="glass border-border/50 mb-6">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-muted-foreground">Current Goal</p>
                <p className="font-semibold">{goal.title}</p>
              </div>
              <span className="text-sm font-semibold text-primary">{goalPercent}%</span>
            </div>
            <Progress value={goalPercent} className="h-2.5 bg-secondary [&>div]:gradient-bitcoin" />
            <p className="text-xs text-muted-foreground mt-2">
              {formatSats(goal.current)} / {formatSats(goal.target)} sats
            </p>
          </CardContent>
        </Card>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant="outline" size="sm" onClick={copyLink} className="border-border hover:border-primary/30">
            <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Tip Link
          </Button>
          <Button variant="outline" size="sm" className="border-border hover:border-primary/30">
            <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share
          </Button>
          <Button variant="outline" size="sm" asChild className="border-border hover:border-primary/30">
            <Link to={`/collection/${address}`}>
              <Gem className="w-3.5 h-3.5 mr-1.5" /> NFT Receipts
            </Link>
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={(v) => { setTab(v); setTipPage(0); }}>
          <TabsList className="bg-secondary/50 mb-4 overflow-x-auto scrollbar-none flex-nowrap w-full justify-start">
            <TabsTrigger value="overview" className="shrink-0">Overview</TabsTrigger>
            <TabsTrigger value="tips" className="shrink-0">Tip History</TabsTrigger>
            <TabsTrigger value="badges" className="shrink-0">My Badges</TabsTrigger>
            <TabsTrigger value="nfts" className="shrink-0">NFT Receipts</TabsTrigger>
            <TabsTrigger value="settings" className="shrink-0">Settings</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview">
            {/* Weekly Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Card className="glass border-border/50">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Tips This Week</p>
                  <p className="text-2xl font-bold">{weeklyTips}</p>
                </CardContent>
              </Card>
              <Card className="glass border-border/50">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Sats This Week</p>
                  <p className="text-2xl font-bold text-primary">{formatSats(weeklySats)}</p>
                </CardContent>
              </Card>
            </div>

            {/* Top Supporters */}
            <Card className="glass border-border/50 mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><Trophy className="w-4 h-4 text-primary" /> Top Supporters</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/30">
                  {topSupporters.map(([name, total], i) => (
                    <div key={name} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-muted-foreground w-5">#{i + 1}</span>
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">{name[0]}</div>
                        <p className="text-sm font-medium">{name}</p>
                      </div>
                      <p className="text-sm font-semibold text-primary font-mono">{formatSats(total)} <span className="text-xs font-normal">sats</span></p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Tips */}
            <Card className="glass border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recent Tips</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/30">
                  {tipHistory.slice(0, 5).map((tip) => (
                    <div key={tip.id} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">{tip.sender[0]}</div>
                        <div>
                          <p className="text-sm font-medium">{tip.sender}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">{tip.message}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-primary">{formatSats(tip.amount)} <span className="text-xs font-normal">sats</span></p>
                        <Badge variant="outline" className={`text-[10px] ${tierConfig[tip.tier].color}`}>
                          {tierConfig[tip.tier].emoji} {tierConfig[tip.tier].label}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TIP HISTORY */}
          <TabsContent value="tips">
            <Card className="glass border-border/50">
              <CardContent className="p-4">
                {/* Search + Filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search by sender..." value={tipSearch} onChange={(e) => { setTipSearch(e.target.value); setTipPage(0); }} className="pl-9 bg-secondary/50 border-border" />
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                    {tierFilters.map((t) => (
                      <button key={t} onClick={() => { setTierFilter(t); setTipPage(0); }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${
                          tipTierFilter === t ? "gradient-bitcoin text-primary-foreground border-transparent" : "border-border bg-secondary/30 hover:border-primary/30"
                        }`}
                      >
                        {t === "all" ? "All" : `${tierConfig[t].emoji} ${tierConfig[t].label}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left p-3 font-medium text-muted-foreground">Sender</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Amount</th>
                        <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Message</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Tier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedTips.map((tip) => (
                        <tr key={tip.id} className="border-b border-border/20 last:border-0">
                          <td className="p-3 font-medium">{tip.sender}</td>
                          <td className="p-3 text-primary font-semibold font-mono">{formatSats(tip.amount)}</td>
                          <td className="p-3 text-muted-foreground hidden sm:table-cell truncate max-w-[200px]">{tip.message}</td>
                          <td className="p-3">
                            <Badge variant="outline" className={`text-[10px] ${tierConfig[tip.tier].color}`}>
                              {tierConfig[tip.tier].emoji} {tierConfig[tip.tier].label}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                      {pagedTips.length === 0 && (
                        <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No tips match your filter</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalTipPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
                    <Button variant="outline" size="sm" disabled={tipPage === 0} onClick={() => setTipPage((p) => p - 1)}>
                      <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <span className="text-xs text-muted-foreground">Page {tipPage + 1} of {totalTipPages}</span>
                    <Button variant="outline" size="sm" disabled={tipPage >= totalTipPages - 1} onClick={() => setTipPage((p) => p + 1)}>
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* MY BADGES */}
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

          {/* NFT RECEIPTS */}
          <TabsContent value="nfts">
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
              <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              {tierFilters.map((t) => (
                <button key={t} onClick={() => setNftFilter(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${
                    nftFilter === t ? "gradient-bitcoin text-primary-foreground border-transparent" : "border-border bg-secondary/30 hover:border-primary/30"
                  }`}
                >
                  {t === "all" ? "All" : `${tierConfig[t].emoji} ${tierConfig[t].label}`}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredNfts.map((nft, i) => (
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

          {/* SETTINGS */}
          <TabsContent value="settings">
            <Card className="glass border-border/50">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="bg-secondary/50 border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="bg-secondary/50 border-border" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minAmount">Tip Jar Minimum (sats)</Label>
                  <Input id="minAmount" type="number" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} className="bg-secondary/50 border-border" />
                </div>
                <div className="space-y-4">
                  <p className="text-sm font-medium">Notification Preferences</p>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailNotifs" className="text-sm text-muted-foreground">Email Notifications</Label>
                    <Switch id="emailNotifs" checked={emailNotifs} onCheckedChange={setEmailNotifs} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pushNotifs" className="text-sm text-muted-foreground">Push Notifications</Label>
                    <Switch id="pushNotifs" checked={pushNotifs} onCheckedChange={setPushNotifs} />
                  </div>
                </div>
                <Button className="gradient-bitcoin text-primary-foreground font-semibold w-full sm:w-auto"
                  disabled={savingSettings}
                  onClick={handleSaveSettings}>
                  {savingSettings ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</> : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Dashboard;
