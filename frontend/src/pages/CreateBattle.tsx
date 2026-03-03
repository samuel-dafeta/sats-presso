import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Swords, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { mockCreators } from "@/lib/mock-data";

const durations = [
  { label: "1 hour", value: "1" },
  { label: "6 hours", value: "6" },
  { label: "12 hours", value: "12" },
  { label: "24 hours", value: "24" },
];

const CreateBattle = () => {
  const navigate = useNavigate();
  const [creatorA, setCreatorA] = useState("");
  const [creatorB, setCreatorB] = useState("");
  const [duration, setDuration] = useState("6");
  const [wager, setWager] = useState("");

  const selectedA = mockCreators.find((c) => c.address === creatorA);
  const selectedB = mockCreators.find((c) => c.address === creatorB);
  const canSubmit = creatorA && creatorB && creatorA !== creatorB;

  const handleSubmit = () => {
    toast({
      title: "⚔️ Battle Created!",
      description: `${selectedA?.name} vs ${selectedB?.name} — ${duration}h battle is live!`,
    });
    navigate("/battles");
  };

  return (
    <div className="container py-6 md:py-10 pb-24 md:pb-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <Swords className="w-6 h-6 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Create Battle</h1>
        </div>
        <p className="text-muted-foreground mb-8">Set up a tip battle between two creators</p>

        <div className="grid md:grid-cols-[1fr,340px] gap-6">
          {/* Form */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Battle Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Creator A */}
              <div className="space-y-2">
                <Label>Creator A</Label>
                <Select value={creatorA} onValueChange={setCreatorA}>
                  <SelectTrigger className="bg-secondary/50 border-border">
                    <SelectValue placeholder="Select first creator" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCreators.filter((c) => c.address !== creatorB).map((c) => (
                      <SelectItem key={c.address} value={c.address}>
                        <span className="flex items-center gap-2">
                          <img src={c.avatar} alt={c.name} className="w-5 h-5 rounded-full" />
                          {c.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Creator B */}
              <div className="space-y-2">
                <Label>Creator B</Label>
                <Select value={creatorB} onValueChange={setCreatorB}>
                  <SelectTrigger className="bg-secondary/50 border-border">
                    <SelectValue placeholder="Select second creator" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCreators.filter((c) => c.address !== creatorA).map((c) => (
                      <SelectItem key={c.address} value={c.address}>
                        <span className="flex items-center gap-2">
                          <img src={c.avatar} alt={c.name} className="w-5 h-5 rounded-full" />
                          {c.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label>Duration</Label>
                <div className="flex gap-2">
                  {durations.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDuration(d.value)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                        duration === d.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary/50 text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wager */}
              <div className="space-y-2">
                <Label>Wager Amount (optional)</Label>
                <div className="relative">
                  <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <Input
                    type="number"
                    placeholder="0"
                    value={wager}
                    onChange={(e) => setWager(e.target.value)}
                    className="pl-9 bg-secondary/50 border-border"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">sats</span>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full gradient-bitcoin text-primary-foreground font-semibold glow-bitcoin-sm hover:opacity-90"
              >
                <Swords className="w-4 h-4 mr-2" />
                Launch Battle
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="glass border-primary/20 bg-gradient-to-br from-primary/5 to-transparent sticky top-20">
              <CardHeader>
                <CardTitle className="text-base">Battle Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-3 mb-6">
                  {/* Side A */}
                  <div className="flex flex-col items-center gap-2 flex-1">
                    {selectedA ? (
                      <>
                        <img src={selectedA.avatar} alt={selectedA.name} className="w-14 h-14 rounded-full border-2 border-amber-500/50" />
                        <p className="text-sm font-semibold text-center truncate w-full">{selectedA.name}</p>
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-full bg-secondary/50 border border-dashed border-border" />
                        <p className="text-xs text-muted-foreground">Creator A</p>
                      </>
                    )}
                  </div>

                  <Badge className="gradient-bitcoin text-primary-foreground font-bold shrink-0">VS</Badge>

                  {/* Side B */}
                  <div className="flex flex-col items-center gap-2 flex-1">
                    {selectedB ? (
                      <>
                        <img src={selectedB.avatar} alt={selectedB.name} className="w-14 h-14 rounded-full border-2 border-cyan-500/50" />
                        <p className="text-sm font-semibold text-center truncate w-full">{selectedB.name}</p>
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-full bg-secondary/50 border border-dashed border-border" />
                        <p className="text-xs text-muted-foreground">Creator B</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Duration</span>
                    <span className="font-medium text-foreground">{durations.find((d) => d.value === duration)?.label}</span>
                  </div>
                  {wager && Number(wager) > 0 && (
                    <div className="flex justify-between">
                      <span>Wager</span>
                      <span className="font-mono text-primary">{Number(wager).toLocaleString()} sats</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateBattle;
