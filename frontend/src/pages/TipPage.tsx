import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useSearchParams } from "react-router-dom";
import { Zap, Send, MessageSquare, Users, Share2, Coffee, Twitter, Link, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatSats, getTier, tierConfig } from "@/lib/mock-data";
import { TransactionOverlay } from "@/components/TransactionOverlay";
import { useToast } from "@/hooks/use-toast";
import { toastError } from "@/lib/error";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useWallet } from "@/contexts/WalletContext";
import { getCreator, sendTip, getTip, getCreatorTipAtIndex, unwrapCV, HIRO_API, CONTRACTS } from "@/lib/stacks";

const presets = [1000, 5000, 10000, 50000, 100000];

interface CreatorData {
  name: string;
  bio: string;
  totalReceived: number;
  tipCount: number;
}

interface TipData {
  from: string;
  amount: number;
  message: string;
  timestamp: number;
}

const TipPage = () => {
  const { toast } = useToast();
  const { address: creatorAddress } = useParams<{ address: string }>();
  const [searchParams] = useSearchParams();
  const { isConnected, address: walletAddress, connect } = useWallet();
  const [amount, setAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [txOpen, setTxOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [creator, setCreator] = useState<CreatorData | null>(null);
  const [recentTips, setRecentTips] = useState<TipData[]>([]);
  const [loading, setLoading] = useState(true);

  const currentTier = getTier(amount);
  const tier = tierConfig[currentTier];

  // Fetch creator data from contract
  useEffect(() => {
    if (!creatorAddress) return;
    setLoading(true);
    getCreator(creatorAddress)
      .then((raw) => {
        const data = unwrapCV(raw);
        if (data) {
          setCreator({
            name: data.name ?? "Unknown",
            bio: data.bio ?? "",
            totalReceived: Number(data["total-received"]) || 0,
            tipCount: Number(data["tip-count"]) || 0,
          });
        }
      })
      .catch(() => {
        toast({ title: "Creator not found", description: "Could not load creator data", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, [creatorAddress]);

  // Fetch recent tips for this creator
  useEffect(() => {
    if (!creatorAddress || !creator) return;
    const fetchTips = async () => {
      const tips: TipData[] = [];
      const count = creator.tipCount;
      const start = Math.max(0, count - 5);
      for (let i = count - 1; i >= start && i >= 0; i--) {
        try {
          const raw = await getCreatorTipAtIndex(creatorAddress, i);
          const tipId = unwrapCV(raw);
          if (tipId != null) {
            const tipRaw = await getTip(tipId);
            const tip = unwrapCV(tipRaw);
            if (tip) tips.push({ from: tip.from ?? "", amount: Number(tip.amount) || 0, message: tip.message ?? "", timestamp: Number(tip.timestamp) || 0 });
          }
        } catch { break; }
      }
      setRecentTips(tips);
    };
    fetchTips();
  }, [creatorAddress, creator]);

  const handlePreset = (val: number) => {
    setAmount(val);
    setCustomAmount("");
  };

  const handleCustom = (val: string) => {
    setCustomAmount(val);
    const num = parseInt(val);
    if (!isNaN(num) && num > 0) setAmount(num);
  };

  useEffect(() => {
    if (searchParams.get("ref") === "share") {
      toast({ title: "Welcome!", description: "You're viewing a shared tip jar" });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleSend = async () => {
    if (!creatorAddress) return;
    if (!isConnected) {
      await connect();
      return;
    }
    setSending(true);
    setTxOpen(true);
    try {
      const result = await sendTip(creatorAddress, amount, message || "Sent via SatsPresso");
      toast({ title: "Tip Sent! ⚡", description: `${formatSats(amount)} sats sent. TX: ${result.txid.slice(0, 8)}...` });
      setMessage("");
    } catch (err: unknown) {
      toastError("Transaction Failed", err);
    } finally {
      setSending(false);
      setTxOpen(false);
    }
  };

  const handleTxComplete = useCallback((success: boolean) => {
    setTxOpen(false);
    setSending(false);
  }, []);

  const creatorName = creator?.name ?? creatorAddress?.slice(0, 8) + "..." ?? "Creator";
  const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${creatorAddress}&backgroundColor=f59e0b`;

  return (
    <div className="container py-6 md:py-10 pb-24 md:pb-10 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Creator Header */}
        <div className="text-center mb-8">
          <img src={avatarUrl} alt="" className="w-20 h-20 rounded-2xl border-2 border-primary/30 mx-auto mb-3 glow-bitcoin-sm" />
          {loading ? (
            <div className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading creator...</div>
          ) : creator ? (
            <>
              <h1 className="text-2xl font-bold">{creator.name}</h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">{creator.bio}</p>
              <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-primary" /> {formatSats(creator.totalReceived)} sats</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {creator.tipCount} tips</span>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold">{creatorAddress?.slice(0, 8)}...</h1>
              <p className="text-sm text-muted-foreground mt-1">Creator not registered yet</p>
            </>
          )}
          <TooltipProvider delayDuration={300}>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      const shareUrl = `${window.location.origin}${window.location.pathname}?ref=share`;
                      const text = `Support ${creatorName} with Bitcoin tips on SatsPresso! ⚡`;
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
                    }}
                  >
                    <Twitter className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share on Twitter</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      const shareUrl = `${window.location.origin}${window.location.pathname}?ref=share`;
                      navigator.clipboard.writeText(shareUrl);
                      toast({ title: "Link Copied!", description: "Share this tip jar with others" });
                    }}
                  >
                    <Link className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy Link</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={async () => {
                      const shareUrl = `${window.location.origin}${window.location.pathname}?ref=share`;
                      if (navigator.share) {
                        await navigator.share({ title: `Support ${creatorName}`, text: "Send Bitcoin tips on SatsPresso! ⚡", url: shareUrl });
                      } else {
                        navigator.clipboard.writeText(shareUrl);
                        toast({ title: "Link Copied!", description: "Share this tip jar with others" });
                      }
                    }}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>

        {/* Amount Selector */}
        <Card className="glass border-border/50 mb-4">
          <CardContent className="p-5">
            <p className="text-sm font-medium mb-3">Choose Amount</p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
              {presets.map((p) => (
                <button
                  key={p}
                  onClick={() => handlePreset(p)}
                  className={`py-2.5 px-3 rounded-lg text-sm font-semibold transition-all border ${
                    amount === p && !customAmount
                      ? "gradient-bitcoin text-primary-foreground border-transparent glow-bitcoin-sm"
                      : "border-border bg-secondary/30 hover:border-primary/30 text-foreground"
                  }`}
                >
                  {formatSats(p)}
                </button>
              ))}
            </div>
            <Input
              type="number"
              placeholder="Custom amount in sats"
              value={customAmount}
              onChange={(e) => handleCustom(e.target.value)}
              className="bg-secondary/50 border-border"
            />
          </CardContent>
        </Card>

        {/* Tier Indicator */}
        <Card className="glass border-border/50 mb-4">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{tier.emoji}</span>
              <div>
                <p className={`font-semibold ${tier.color}`}>{tier.label} Tier</p>
                <p className="text-xs text-muted-foreground">{formatSats(amount)} sats</p>
              </div>
            </div>
            <Badge variant="outline" className={`${tier.color} border-current/30`}>
              NFT Receipt Included
            </Badge>
          </CardContent>
        </Card>

        {/* Message */}
        <Card className="glass border-border/50 mb-6">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-sm font-medium">Add a Message (optional)</p>
            </div>
            <Input
              placeholder="Keep creating amazing work! 🎨"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-secondary/50 border-border"
            />
          </CardContent>
        </Card>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={sending}
          className="w-full gradient-bitcoin text-primary-foreground font-semibold h-12 text-base glow-bitcoin hover:opacity-90 disabled:opacity-50"
        >
          {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          {isConnected ? `Send ${formatSats(amount)} Sats` : "Connect Wallet to Tip"}
        </Button>

        {/* Recent Supporters */}
        <div className="mt-10">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Recent Supporters</h3>
          {recentTips.length > 0 ? (
            <div className="space-y-2">
              {recentTips.map((tip, i) => {
                const tipTier = getTier(tip.amount);
                return (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-card/40 border border-border/30">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">{tip.from.slice(0, 2)}</div>
                    <div>
                      <p className="text-sm font-medium font-mono">{tip.from.slice(0, 6)}...{tip.from.slice(-4)}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[160px]">{tip.message}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary font-mono">{formatSats(tip.amount)}</p>
                    <span className="text-[10px] text-muted-foreground">{tierConfig[tipTier].emoji}</span>
                  </div>
                </div>
                );
              })}
            </div>
          ) : (
            <Card className="glass border-border/50">
              <CardContent className="p-8 text-center">
                <Coffee className="w-8 h-8 mx-auto mb-2 text-primary/50" />
                <p className="font-medium">No supporters yet</p>
                <p className="text-sm text-muted-foreground">Be the first to support this creator!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>

      <TransactionOverlay isOpen={txOpen} onComplete={handleTxComplete} />
    </div>
  );
};

export default TipPage;
