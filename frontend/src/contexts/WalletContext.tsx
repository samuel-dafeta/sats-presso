import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  connectWallet,
  disconnectWallet,
  isWalletConnected,
  getStxAddress,
  getAccountBalance,
  HIRO_API,
} from "@/lib/stacks";

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  balance: number | null;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  address: null,
  balance: null,
  connecting: false,
  connect: async () => {},
  disconnect: () => {},
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);

  const fetchBalance = useCallback(async (addr: string) => {
    try {
      const data = await getAccountBalance(addr);
      if (data?.stx?.balance) {
        setBalance(Number(data.stx.balance));
      }
      // Also check sBTC balance if available
      const sbtcKey = Object.keys(data?.fungible_tokens ?? {}).find((k) =>
        k.includes("sbtc-token::sbtc")
      );
      if (sbtcKey) {
        setBalance(Number(data.fungible_tokens[sbtcKey].balance));
      }
    } catch {
      // balance stays null
    }
  }, []);

  // Restore session on mount
  useEffect(() => {
    if (isWalletConnected()) {
      // The library remembers the session, but we need the address
      // Re-trigger connect silently to get addresses
    }
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      const response = await connectWallet();
      const stxAddress = getStxAddress(response);
      setAddress(stxAddress);
      setIsConnected(true);
      await fetchBalance(stxAddress);
    } finally {
      setConnecting(false);
    }
  }, [fetchBalance]);

  const disconnect = useCallback(() => {
    disconnectWallet();
    setIsConnected(false);
    setAddress(null);
    setBalance(null);
  }, []);

  return (
    <WalletContext.Provider value={{ isConnected, address, balance, connecting, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};
