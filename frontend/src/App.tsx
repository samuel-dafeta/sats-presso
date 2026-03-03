import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { WalletProvider } from "@/contexts/WalletContext";
import { FollowProvider } from "@/contexts/FollowContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileNav } from "@/components/MobileNav";
import PageTransition from "@/components/PageTransition";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CreateJar from "./pages/CreateJar";
import TipPage from "./pages/TipPage";
import Collection from "./pages/Collection";
import Explore from "./pages/Explore";
import Battles from "./pages/Battles";
import CreateBattle from "./pages/CreateBattle";
import BattleArena from "./pages/BattleArena";
import Leaderboard from "./pages/Leaderboard";
import CreatorProfile from "./pages/CreatorProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/explore" element={<PageTransition><Explore /></PageTransition>} />
        <Route path="/battles" element={<PageTransition><Battles /></PageTransition>} />
        <Route path="/create-battle" element={<PageTransition><CreateBattle /></PageTransition>} />
        <Route path="/battles/:id" element={<PageTransition><BattleArena /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/create-jar" element={<PageTransition><CreateJar /></PageTransition>} />
        <Route path="/tip/:address" element={<PageTransition><TipPage /></PageTransition>} />
        <Route path="/collection/:address" element={<PageTransition><Collection /></PageTransition>} />
        <Route path="/creator/:address" element={<PageTransition><CreatorProfile /></PageTransition>} />
        <Route path="/leaderboard" element={<PageTransition><Leaderboard /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WalletProvider>
        <FollowProvider>
          <NotificationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Header />
            <main>
              <AnimatedRoutes />
            </main>
            <Footer />
            <MobileNav />
          </BrowserRouter>
          </NotificationProvider>
        </FollowProvider>
      </WalletProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
