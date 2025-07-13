// Mock Stellar Service - Simulates blockchain operations without actual Stellar SDK

export class StellarService {
  static async createWallet(): Promise<{ publicKey: string; secretKey: string }> {
    // Generate mock wallet keys
    const publicKey = 'G' + Math.random().toString(36).substring(2, 56).toUpperCase().padEnd(55, 'A');
    const secretKey = 'S' + Math.random().toString(36).substring(2, 56).toUpperCase().padEnd(55, 'A');
    
    return {
      publicKey,
      secretKey
    };
  }

  static async fundWallet(publicKey: string): Promise<void> {
    // Simulate funding delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Mock: Funded wallet ${publicKey} with 10000 XLM`);
  }

  static async getBalance(publicKey: string): Promise<number> {
    // Return mock balance between 9000-10000 XLM
    return 9000 + Math.random() * 1000;
  }

  static async sendPayment(
    sourceKeypair: any,
    destinationPublicKey: string,
    amount: string
  ): Promise<string> {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock transaction hash
    const hash = Math.random().toString(36).substring(2, 64).toLowerCase();
    
    console.log(`Mock: Sent ${amount} XLM from ${sourceKeypair.publicKey} to ${destinationPublicKey}`);
    console.log(`Mock transaction hash: ${hash}`);
    
    return hash;
  }

  static getExplorerUrl(hash: string): string {
    return `https://stellar.expert/explorer/testnet/tx/${hash}`;
  }
}

// Mock Keypair class
export class MockKeypair {
  constructor(private _publicKey: string, private _secretKey: string) {}

  static fromSecret(secretKey: string): MockKeypair {
    // Extract public key from secret (mock implementation)
    const publicKey = 'G' + secretKey.substring(1, 56);
    return new MockKeypair(publicKey, secretKey);
  }

  publicKey(): string {
    return this._publicKey;
  }

  secret(): string {
    return this._secretKey;
  }
}