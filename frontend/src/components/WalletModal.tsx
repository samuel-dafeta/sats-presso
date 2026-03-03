import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, Shield, Zap } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "@/hooks/use-toast";

interface WalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WalletModal = ({ open, onOpenChange }: WalletModalProps) => {
  const { connect, address } = useWallet();

  const handleConnect = () => {
    connect();
    onOpenChange(false);
    const addr = "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7";
    toast({
      title: "Wallet Connected",
      description: `${addr.slice(0, 4)}...${addr.slice(-4)} is now active`,
      variant: "success",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Connect Wallet
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Connect your Stacks wallet to start tipping creators
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <button
            onClick={handleConnect}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg gradient-bitcoin flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">H</span>
            </div>
            <div className="text-left">
              <p className="font-semibold group-hover:text-primary transition-colors">Hiro Wallet</p>
              <p className="text-xs text-muted-foreground">Most popular Stacks wallet</p>
            </div>
          </button>

          <button
            onClick={handleConnect}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <span className="text-lg font-bold">X</span>
            </div>
            <div className="text-left">
              <p className="font-semibold group-hover:text-primary transition-colors">Xverse</p>
              <p className="text-xs text-muted-foreground">Bitcoin & Stacks wallet</p>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-4 pt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure</span>
          <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Non-custodial</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
