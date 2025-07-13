import React from 'react';
import { Wallet as WalletIcon, ExternalLink, RefreshCw } from 'lucide-react';
import { Wallet } from '../types';

interface WalletCardProps {
  wallet: Wallet;
  onRefresh: () => void;
  refreshing?: boolean;
}

export function WalletCard({ wallet, onRefresh, refreshing = false }: WalletCardProps) {
  const truncateKey = (key: string) => `${key.slice(0, 6)}...${key.slice(-6)}`;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <WalletIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{wallet.name}</h3>
            <p className="text-sm text-gray-500">Stellar Testnet</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-500 mb-1">Balance</p>
          <p className="text-2xl font-bold text-gray-900">
            {wallet.balance.toFixed(2)} XLM
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">Public Key</p>
          <div className="flex items-center space-x-2">
            <code className="text-sm text-gray-700 bg-gray-50 px-2 py-1 rounded">
              {truncateKey(wallet.publicKey)}
            </code>
            <button
              onClick={() => window.open(`https://stellar.expert/explorer/testnet/account/${wallet.publicKey}`, '_blank')}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}