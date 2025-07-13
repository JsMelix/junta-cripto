export interface Wallet {
  publicKey: string;
  secretKey: string;
  balance: number;
  name: string;
}

export interface Junta {
  id: string;
  name: string;
  members: string[];
  weeklyAmount: number;
  currentWeek: number;
  totalWeeks: number;
  currentTurnIndex: number;
  transactions: Transaction[];
  status: 'active' | 'completed' | 'pending';
  createdAt: Date;
}

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  week: number;
  hash: string;
  timestamp: Date;
  type: 'contribution' | 'distribution';
}

export interface UserReputation {
  publicKey: string;
  totalContributions: number;
  completedRounds: number;
  reputationScore: number;
  participationHistory: string[];
}