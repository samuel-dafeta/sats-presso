import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, CheckCircle2 } from "lucide-react";
import { ConfettiExplosion } from "./ConfettiExplosion";

const statusMessages = [
  "Preparing transaction...",
  "Broadcasting to network...",
  "Waiting for confirmation...",
  "Confirming on-chain...",
  "Almost there...",
];

interface TransactionOverlayProps {
  isOpen: boolean;
  onComplete: (success: boolean) => void;
}

export const TransactionOverlay = ({ isOpen, onComplete }: TransactionOverlayProps) => {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isOpen) { setStep(0); setDone(false); return; }

    const intervals = [2000, 4000, 4000, 3000, 2000];
    let timeout: NodeJS.Timeout;
    let currentStep = 0;

    const advance = () => {
      currentStep++;
      if (currentStep >= statusMessages.length) {
        setDone(true);
        setTimeout(() => onComplete(true), 1500);
        return;
      }
      setStep(currentStep);
      timeout = setTimeout(advance, intervals[currentStep]);
    };

    timeout = setTimeout(advance, intervals[0]);
    return () => clearTimeout(timeout);
  }, [isOpen, onComplete]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-lg"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-6 p-8"
          >
            <div className="relative w-24 h-32">
              {/* Cup */}
              <div className="absolute bottom-0 w-24 h-28 rounded-b-2xl border-2 border-primary/40 overflow-hidden">
                <motion.div
                  className="absolute bottom-0 w-full gradient-bitcoin opacity-80"
                  initial={{ height: "0%" }}
                  animate={{ height: done ? "100%" : `${(step + 1) * 20}%` }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </div>
              {/* Handle */}
              <div className="absolute right-[-10px] top-4 w-4 h-10 border-2 border-primary/40 rounded-r-full" />
              {/* Steam */}
              {!done && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 h-4 rounded-full bg-primary/30"
                      animate={{ y: [-2, -8, -2], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
                    />
                  ))}
                </div>
              )}
            </div>

            {done ? (
              <>
                <ConfettiExplosion trigger={done} />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center gap-2"
                >
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                  <p className="text-lg font-semibold text-foreground">Transaction Complete!</p>
                </motion.div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Coffee className="w-6 h-6 text-primary animate-float" />
                <p className="text-sm font-medium text-foreground">{statusMessages[step]}</p>
                <p className="text-xs text-muted-foreground">This may take 15-30 seconds</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
