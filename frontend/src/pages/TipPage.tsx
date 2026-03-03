import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { Zap, Send, MessageSquare, Users, Share2, Coffee, Twitter, Link } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockCreator, mockTipHistory, formatSats, getTier, tierConfig } from "@/lib/mock-data";
import { TransactionOverlay } from "@/components/TransactionOverlay";
import { useToast, toast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const presets = [1000, 5000, 10000, 50000, 100000];

const TipPage = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [amount, setAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [txOpen, setTxOpen] = useState(false);

  const currentTier = getTier(amount);
  const tier = tierConfig[currentTier];

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

  const handleSend = () => setTxOpen(true);

  const handleTxComplete = useCallback((success: boolean) => {
    setTxOpen(false);
    if (success) {
      toast({ title: "Tip Sent! ⚡", description: `${formatSats(amount)} sats sent to ${mockCreator.name}` });
      setMessage("");
    }
  }, [amount, toast]);

  return (
    <div className="container py-6 md:py-10 pb-24 md:pb-10 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Creator Header */}
        <div className="text-center mb-8">
          <img src={mockCreator.avatar} alt="" className="w-20 h-20 rounded-2xl border-2 border-primary/30 mx-auto mb-3 glow-bitcoin-sm" />
          <h1 className="text-2xl font-bold">{mockCreator.name}</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">{mockCreator.bio}</p>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-primary" /> {formatSats(mockCreator.totalSats)} sats</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {mockCreator.supporters} supporters</span>
          </div>
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
                      const text = `Support ${mockCreator.name} with Bitcoin tips on SatsPresso! ⚡`;
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
                        await navigator.share({ title: `Support ${mockCreator.name}`, text: "Send Bitcoin tips on SatsPresso! ⚡", url: shareUrl });
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
          className="w-full gradient-bitcoin text-primary-foreground font-semibold h-12 text-base glow-bitcoin hover:opacity-90"
        >
          <Send className="w-4 h-4 mr-2" />
          Send {formatSats(amount)} Sats
        </Button>

        {/* Recent Supporters */}
        <div className="mt-10">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Recent Supporters</h3>
          {mockTipHistory.length > 0 ? (
            <div className="space-y-2">
              {mockTipHistory.slice(0, 5).map((tip) => (
                <div key={tip.id} className="flex items-center justify-between p-3 rounded-lg bg-card/40 border border-border/30">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">{tip.sender[0]}</div>
                    <div>
                      <p className="text-sm font-medium">{tip.sender}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[160px]">{tip.message}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary font-mono">{formatSats(tip.amount)}</p>
                    <span className="text-[10px] text-muted-foreground">{tierConfig[tip.tier].emoji}</span>
                  </div>
                </div>
              ))}
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
