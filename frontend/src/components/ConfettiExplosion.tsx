import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = ["#F59E0B", "#EAB308", "#F97316", "#FEF3C7", "#D97706"];
const PARTICLE_COUNT = 40;

interface Particle {
  id: number;
  color: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  size: number;
}

export const ConfettiExplosion = ({ trigger }: { trigger: boolean }) => {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.5;
      const distance = 80 + Math.random() * 160;
      return {
        id: i,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance - 40,
        rotation: Math.random() * 720 - 360,
        scale: 0.5 + Math.random() * 0.8,
        size: 4 + Math.random() * 6,
      };
    });
  }, [trigger]);

  return (
    <AnimatePresence>
      {trigger && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-[110]">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
              animate={{
                x: p.x,
                y: p.y,
                opacity: 0,
                scale: p.scale,
                rotate: p.rotation,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 + Math.random() * 0.6, ease: "easeOut" }}
              style={{
                position: "absolute",
                width: p.size,
                height: p.size,
                borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                backgroundColor: p.color,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};
