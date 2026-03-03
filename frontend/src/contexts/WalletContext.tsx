import React, { createContext, useContext, useState, ReactNode } from "react";

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  balance: number | null;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  address: null,
  balance: null,
  connect: () => {},
  disconnect: () => {},
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  const connect = () => {
    setIsConnected(true);
    setAddress("SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7");
    setBalance(125000);
  };

  const disconnect = () => {
    setIsConnected(false);
    setAddress(null);
    setBalance(null);
  };

  return (
    <WalletContext.Provider value={{ isConnected, address, balance, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};
