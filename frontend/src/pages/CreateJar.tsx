import { useState } from "react";
import { motion } from "framer-motion";
import { Coffee, Eye, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { tierConfig, formatSats } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { toastError } from "@/lib/error";
import { useWallet } from "@/contexts/WalletContext";
import { registerCreator, setGoal } from "@/lib/stacks";
import { useNavigate } from "react-router-dom";

const MAX_BIO = 160;

const CreateJar = () => {
  const { toast } = useToast();
  const { isConnected, address, connect } = useWallet();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    avatarUrl: "",
    goalAmount: "",
    goalDescription: "",
  });

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const errors = {
    name: submitted && !form.name.trim() ? "Display name is required" : "",
    bio: submitted && !form.bio.trim() ? "Bio is required" : form.bio.length > MAX_BIO ? `Bio must be under ${MAX_BIO} characters` : "",
  };

  const isValid = form.name.trim() && form.bio.trim() && form.bio.length <= MAX_BIO;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!isValid) return;

    if (!isConnected) {
      await connect();
      return;
    }

    setLoading(true);
    try {
      const result = await registerCreator(form.name.trim(), form.bio.trim());
      toast({ title: "Tip Jar Created! ☕", description: `TX: ${result.txid.slice(0, 8)}... Your page is being set up on-chain.` });

      // If there's a goal, set it too
      if (form.goalDescription.trim() && form.goalAmount) {
        try {
          await setGoal(
            Number(form.goalAmount),
            form.goalDescription.trim(),
            0, // no deadline
          );
        } catch {
          // Goal is optional, don't fail the whole flow
        }
      }

      navigate("/dashboard");
    } catch (err: unknown) {
      toastError("Failed", err);
    } finally {
      setLoading(false);
    }
  };

  const previewAvatar = form.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${form.name || "preview"}&backgroundColor=f59e0b`;

  return (
    <div className="container py-6 md:py-10 pb-24 md:pb-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Create Your Tip Jar</h1>
        <p className="text-muted-foreground mb-8">Set up your Bitcoin tip jar and start receiving sats from supporters</p>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Form */}
          <div className="md:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Card className="glass border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Display Name <span className="text-destructive">*</span></Label>
                    <Input id="name" placeholder="Satoshi Studio" value={form.name} onChange={(e) => update("name", e.target.value)} className={`mt-1 bg-secondary/50 border-border ${errors.name ? "border-destructive" : ""}`} />
                    {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio <span className="text-destructive">*</span></Label>
                    <Input id="bio" placeholder="Digital artist exploring Bitcoin and generative art" value={form.bio} onChange={(e) => update("bio", e.target.value)} className={`mt-1 bg-secondary/50 border-border ${errors.bio ? "border-destructive" : ""}`} />
                    <div className="flex justify-between mt-1">
                      {errors.bio ? <p className="text-xs text-destructive">{errors.bio}</p> : <span />}
                      <p className={`text-xs ${form.bio.length > MAX_BIO ? "text-destructive" : "text-muted-foreground"}`}>{form.bio.length}/{MAX_BIO}</p>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="avatar">Profile Image URL</Label>
                    <Input id="avatar" placeholder="https://..." value={form.avatarUrl} onChange={(e) => update("avatarUrl", e.target.value)} className="mt-1 bg-secondary/50 border-border" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Funding Goal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="goal">Goal Description</Label>
                    <Input id="goal" placeholder="New Drawing Tablet" value={form.goalDescription} onChange={(e) => update("goalDescription", e.target.value)} className="mt-1 bg-secondary/50 border-border" />
                  </div>
                  <div>
                    <Label htmlFor="amount">Target Amount (sats)</Label>
                    <Input id="amount" type="number" placeholder="500000" value={form.goalAmount} onChange={(e) => update("goalAmount", e.target.value)} className="mt-1 bg-secondary/50 border-border" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Tier Thresholds</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {(Object.entries(tierConfig) as [string, typeof tierConfig.bronze][]).map(([key, tier]) => (
                      <div key={key} className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30 border border-border/30">
                        <span className="text-lg">{tier.emoji}</span>
                        <div>
                          <p className={`text-sm font-semibold ${tier.color}`}>{tier.label}</p>
                          <p className="text-xs text-muted-foreground">{formatSats(tier.min)}+ sats</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" disabled={loading || (submitted && !isValid)} className="w-full gradient-bitcoin text-primary-foreground font-semibold h-12 glow-bitcoin-sm">
                {loading ? (
                  <span className="flex items-center gap-2"><Coffee className="w-4 h-4 animate-spin" /> Creating...</span>
                ) : (
                  <span className="flex items-center gap-2">Create Tip Jar <ArrowRight className="w-4 h-4" /></span>
                )}
              </Button>
            </form>
          </div>

          {/* Preview */}
          <div className="md:col-span-2">
            <div className="sticky top-24">
              <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Preview</p>
              <Card className="glass border-border/50 glow-bitcoin-sm">
                <CardContent className="p-5 text-center">
                  <img src={previewAvatar} alt="" className="w-16 h-16 rounded-xl border border-border mx-auto mb-3" />
                  <h3 className="font-bold text-lg">{form.name || "Your Name"}</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">{form.bio || "Your bio goes here"}</p>
                  {form.goalDescription && (
                    <div className="p-3 rounded-lg bg-secondary/30 border border-border/30 mb-4">
                      <p className="text-xs text-muted-foreground">Goal: {form.goalDescription}</p>
                      <p className="text-sm font-semibold text-primary mt-1">{form.goalAmount ? formatSats(Number(form.goalAmount)) : "0"} sats</p>
                    </div>
                  )}
                  <div className="flex gap-2 justify-center">
                    {["1k", "5k", "10k"].map((amt) => (
                      <Badge key={amt} variant="outline" className="text-xs border-primary/30 text-primary">{amt}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateJar;
