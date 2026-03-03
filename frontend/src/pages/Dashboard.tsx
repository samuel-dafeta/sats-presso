import { useState, useEffect, useMemo } from "react";
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
import { mockCreator, mockTipHistory, mockNFTReceipts, mockBadges, formatSats, tierConfig, type Tier } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const stats = [
  { label: "Total Sats", value: formatSats(mockCreator.totalSats), icon: Zap, suffix: "sats" },
  { label: "Tips Received", value: mockCreator.tipCount.toString(), icon: TrendingUp, suffix: "" },
  { label: "Global Rank", value: `#${mockCreator.rank}`, icon: Trophy, suffix: "" },
  { label: "Supporters", value: mockCreator.supporters.toString(), icon: Users, suffix: "" },
];

const tierFilters: (Tier | "all")[] = ["all", "diamond", "gold", "silver", "bronze"];
const TIPS_PER_PAGE = 5;

const Dashboard = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const tipUrl = `${window.location.origin}/tip/${mockCreator.address}`;
  const goalPercent = Math.round((mockCreator.goal.current / mockCreator.goal.target) * 100);

  // Tip History state
  const [tipSearch, setTipSearch] = useState("");
  const [tipTierFilter, setTierFilter] = useState<Tier | "all">("all");
  const [tipPage, setTipPage] = useState(0);

  // Badges state
  const [claiming, setClaiming] = useState<string | null>(null);

  // NFT state
  const [nftFilter, setNftFilter] = useState<Tier | "all">("all");

  // Settings state
  const [displayName, setDisplayName] = useState(mockCreator.name);
  const [bio, setBio] = useState(mockCreator.bio);
  const [minAmount, setMinAmount] = useState("1000");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);

  const topSupporters = useMemo(() => {
    const map = new Map<string, number>();
    mockTipHistory.forEach((t) => map.set(t.sender, (map.get(t.sender) ?? 0) + t.amount));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <DashboardSkeleton />;

  const copyLink = () => {
    navigator.clipboard.writeText(tipUrl);
    toast({ title: "Link copied!", description: "Share it with your supporters" });
  };

  // Tip History filtering + pagination
  const filteredTips = mockTipHistory.filter((tip) => {
    const matchSearch = tip.sender.toLowerCase().includes(tipSearch.toLowerCase());
    const matchTier = tipTierFilter === "all" || tip.tier === tipTierFilter;
    return matchSearch && matchTier;
  });
  const totalTipPages = Math.max(1, Math.ceil(filteredTips.length / TIPS_PER_PAGE));
  const pagedTips = filteredTips.slice(tipPage * TIPS_PER_PAGE, (tipPage + 1) * TIPS_PER_PAGE);

  // NFT filtering
  const filteredNfts = nftFilter === "all" ? mockNFTReceipts : mockNFTReceipts.filter((r) => r.tier === nftFilter);

  // Weekly stats (mock)
  const weeklyTips = 12;
  const weeklySats = 185000;

  const claimBadge = (id: string) => {
    setClaiming(id);
    setTimeout(() => {
      setClaiming(null);
      toast({ title: "Badge Claimed! 🏆", description: "Your soul-bound badge has been minted on-chain" });
    }, 3000);
  };

  return (
    <div className="container py-6 md:py-10 pb-24 md:pb-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-8">
          <img src={mockCreator.avatar} alt="" className="w-12 h-12 rounded-xl border border-border" />
          <div>
            <h1 className="text-2xl font-bold">{mockCreator.name}</h1>
            <p className="text-sm text-muted-foreground font-mono">{mockCreator.shortAddress}</p>
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
        <Card className="glass border-border/50 mb-6">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-muted-foreground">Current Goal</p>
                <p className="font-semibold">{mockCreator.goal.title}</p>
              </div>
              <span className="text-sm font-semibold text-primary">{goalPercent}%</span>
            </div>
            <Progress value={goalPercent} className="h-2.5 bg-secondary [&>div]:gradient-bitcoin" />
            <p className="text-xs text-muted-foreground mt-2">
              {formatSats(mockCreator.goal.current)} / {formatSats(mockCreator.goal.target)} sats
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant="outline" size="sm" onClick={copyLink} className="border-border hover:border-primary/30">
            <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Tip Link
          </Button>
          <Button variant="outline" size="sm" className="border-border hover:border-primary/30">
            <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share
          </Button>
          <Button variant="outline" size="sm" asChild className="border-border hover:border-primary/30">
            <Link to={`/collection/${mockCreator.address}`}>
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
                  {mockTipHistory.slice(0, 5).map((tip) => (
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
                  onClick={() => toast({ title: "Settings saved! ✅", description: "Your preferences have been updated" })}>
                  Save Changes
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
