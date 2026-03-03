import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

interface FollowContextType {
  followedAddresses: string[];
  toggleFollow: (address: string) => void;
  isFollowing: (address: string) => boolean;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

const STORAGE_KEY = "tipjar-follows";

export const FollowProvider = ({ children }: { children: ReactNode }) => {
  const [followedAddresses, setFollowedAddresses] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(followedAddresses));
  }, [followedAddresses]);

  const toggleFollow = useCallback((address: string) => {
    setFollowedAddresses((prev) =>
      prev.includes(address) ? prev.filter((a) => a !== address) : [...prev, address]
    );
  }, []);

  const isFollowing = useCallback(
    (address: string) => followedAddresses.includes(address),
    [followedAddresses]
  );

  return (
    <FollowContext.Provider value={{ followedAddresses, toggleFollow, isFollowing }}>
      {children}
    </FollowContext.Provider>
  );
};

export const useFollow = () => {
  const ctx = useContext(FollowContext);
  if (!ctx) throw new Error("useFollow must be used within FollowProvider");
  return ctx;
};
