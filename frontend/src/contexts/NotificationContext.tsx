import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { useFollow } from "@/contexts/FollowContext";
import { mockCreators, mockTipSenders, mockTipAmounts, formatSats } from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";

export interface Notification {
  id: string;
  sender: string;
  creator: string;
  creatorAddress: string;
  amount: number;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => void;
  pauseNotifications: () => void;
  resumeNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [paused, setPaused] = useState(false);
  const { followedAddresses } = useFollow();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleNext = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const delay = 15000 + Math.random() * 15000;
    timeoutRef.current = setTimeout(() => {
      if (document.hidden || followedAddresses.length === 0) {
        scheduleNext();
        return;
      }

      const addr = followedAddresses[Math.floor(Math.random() * followedAddresses.length)];
      const creator = mockCreators.find((c) => c.address === addr);
      if (!creator) { scheduleNext(); return; }

      const sender = mockTipSenders[Math.floor(Math.random() * mockTipSenders.length)];
      const amount = mockTipAmounts[Math.floor(Math.random() * mockTipAmounts.length)];

      const notif: Notification = {
        id: crypto.randomUUID(),
        sender,
        creator: creator.name,
        creatorAddress: addr,
        amount,
        timestamp: new Date(),
        read: false,
      };

      setNotifications((prev) => [notif, ...prev].slice(0, 10));

      toast({
        title: `⚡ ${sender} tipped ${creator.name}`,
        description: `${formatSats(amount)} sats`,
      });

      scheduleNext();
    }, delay);
  }, [followedAddresses]);

  useEffect(() => {
    if (paused || followedAddresses.length === 0) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }
    scheduleNext();
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [paused, followedAddresses.length, scheduleNext]);

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, pauseNotifications: () => setPaused(true), resumeNotifications: () => setPaused(false) }}>
      {children}
    </NotificationContext.Provider>
  );
};
