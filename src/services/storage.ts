import { Wallet, Junta, UserReputation } from '../types';

class StorageService {
  private readonly WALLETS_KEY = 'junta_wallets';
  private readonly JUNTAS_KEY = 'junta_juntas';
  private readonly REPUTATION_KEY = 'junta_reputation';

  saveWallets(wallets: Wallet[]): void {
    localStorage.setItem(this.WALLETS_KEY, JSON.stringify(wallets));
  }

  getWallets(): Wallet[] {
    const stored = localStorage.getItem(this.WALLETS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  saveJuntas(juntas: Junta[]): void {
    localStorage.setItem(this.JUNTAS_KEY, JSON.stringify(juntas));
  }

  getJuntas(): Junta[] {
    const stored = localStorage.getItem(this.JUNTAS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  saveReputation(reputation: UserReputation[]): void {
    localStorage.setItem(this.REPUTATION_KEY, JSON.stringify(reputation));
  }

  getReputation(): UserReputation[] {
    const stored = localStorage.getItem(this.REPUTATION_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  updateWalletBalance(publicKey: string, balance: number): void {
    const wallets = this.getWallets();
    const walletIndex = wallets.findIndex(w => w.publicKey === publicKey);
    if (walletIndex !== -1) {
      wallets[walletIndex].balance = balance;
      this.saveWallets(wallets);
    }
  }
}

export const storageService = new StorageService();