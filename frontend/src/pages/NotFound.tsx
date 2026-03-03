import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Coffee, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="container flex flex-col items-center justify-center py-20 md:py-32 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="inline-block mb-6"
        >
          <div className="w-20 h-20 rounded-2xl gradient-bitcoin flex items-center justify-center glow-bitcoin-sm">
            <Coffee className="w-10 h-10 text-primary-foreground" />
          </div>
        </motion.div>

        <h1 className="text-6xl font-bold mb-3 gradient-text-bitcoin">404</h1>
        <p className="text-xl font-semibold mb-2">Lost in the Mempool</p>
        <p className="text-muted-foreground mb-8">
          This page got stuck waiting for confirmations. It might never make it to a block.
        </p>

        <Button asChild size="lg" className="gradient-bitcoin text-primary-foreground font-semibold glow-bitcoin-sm h-12 px-8">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
