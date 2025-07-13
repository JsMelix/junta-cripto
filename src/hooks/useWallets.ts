import { useState, useEffect } from 'react';
import { Wallet } from '../types';
import { StellarService } from '../services/stellar';
import { storageService } from '../services/storage';

export function useWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedWallets = storageService.getWallets();
    setWallets(savedWallets);
  }, []);

  const createWallet = async (name: string): Promise<Wallet> => {
    setLoading(true);
    try {
      const { publicKey, secretKey } = await StellarService.createWallet();
      
      try {
        await StellarService.fundWallet(publicKey);
        // Wait for mock funding to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.warn('Funding may have failed, checking balance:', error);
      }
      
      const balance = await StellarService.getBalance(publicKey);
      
      const newWallet: Wallet = {
        publicKey,
        secretKey,
        balance,
        name
      };

      const updatedWallets = [...wallets, newWallet];
      setWallets(updatedWallets);
      storageService.saveWallets(updatedWallets);
      
      return newWallet;
    } finally {
      setLoading(false);
    }
  };

  const updateWalletBalance = async (publicKey: string): Promise<void> => {
    const balance = await StellarService.getBalance(publicKey);
    const updatedWallets = wallets.map(w => 
      w.publicKey === publicKey ? { ...w, balance } : w
    );
    setWallets(updatedWallets);
    storageService.saveWallets(updatedWallets);
  };

  const refreshAllBalances = async (): Promise<void> => {
    setLoading(true);
    try {
      const updatedWallets = await Promise.all(
        wallets.map(async (wallet) => ({
          ...wallet,
          balance: await StellarService.getBalance(wallet.publicKey)
        }))
      );
      setWallets(updatedWallets);
      storageService.saveWallets(updatedWallets);
    } finally {
      setLoading(false);
    }
  };

  return {
    wallets,
    loading,
    createWallet,
    updateWalletBalance,
    refreshAllBalances
  };
}