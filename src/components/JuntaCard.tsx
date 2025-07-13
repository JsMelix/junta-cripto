import React, { useState } from 'react';
import { Users, Clock, DollarSign, ExternalLink, Send } from 'lucide-react';
import { Junta, Wallet } from '../types';
import { StellarService, MockKeypair } from '../services/stellar';
import { Keypair } from 'stellar-sdk';

interface JuntaCardProps {
  junta: Junta;
  wallets: Wallet[];
  onContribution: (juntaId: string, hash: string, from: string, to: string, amount: number) => void;
  onAdvanceWeek: (juntaId: string) => void;
}

export function JuntaCard({ junta, wallets, onContribution, onAdvanceWeek }: JuntaCardProps) {
  const [contributing, setContributing] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState('');

  const currentReceiver = junta.members[junta.currentTurnIndex];
  const receiverWallet = wallets.find(w => w.publicKey === currentReceiver);
  
  const getStatusColor = () => {
    switch (junta.status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'completed': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleContribution = async () => {
    if (!selectedWallet) return;
    
    setContributing(true);
    try {
      const sourceWallet = wallets.find(w => w.publicKey === selectedWallet);
      if (!sourceWallet) return;

      const sourceKeypair = MockKeypair.fromSecret(sourceWallet.secretKey);
      const hash = await StellarService.sendPayment(
        sourceKeypair,
        currentReceiver,
        junta.weeklyAmount.toString()
      );

      onContribution(junta.id, hash, selectedWallet, currentReceiver, junta.weeklyAmount);
      setSelectedWallet(''); // Reset selection after successful contribution
    } catch (error) {
      console.error('Error contributing:', error);
      alert('Error al realizar la contribución. Verifica que tengas suficiente balance.');
    } finally {
      setContributing(false);
    }
  };

  const canAdvanceWeek = () => {
    const currentWeekContributions = junta.transactions.filter(
      t => t.week === junta.currentWeek && t.type === 'contribution'
    );
    const expectedContributions = junta.members.length - 1; // All except receiver
    return currentWeekContributions.length >= expectedContributions;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{junta.name}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {junta.status === 'active' ? 'Activa' : junta.status === 'completed' ? 'Completada' : 'Pendiente'}
            </span>
            <span className="text-sm text-gray-500">
              Semana {junta.currentWeek} de {junta.totalWeeks}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Fondo Total</p>
          <p className="text-2xl font-bold text-blue-600">
            {(junta.weeklyAmount * junta.members.length).toFixed(1)} XLM
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          <p className="text-sm text-gray-500">Miembros</p>
          <p className="font-semibold">{junta.members.length}</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <p className="text-sm text-gray-500">Aporte</p>
          <p className="font-semibold">{junta.weeklyAmount} XLM</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
          <p className="text-sm text-gray-500">Duración</p>
          <p className="font-semibold">{junta.totalWeeks} sem</p>
        </div>
      </div>

      {junta.status === 'active' && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 mb-2">Turno Actual</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Receptor:</p>
              <p className="font-medium">{receiverWallet?.name || 'Desconocido'}</p>
              <p className="text-xs text-gray-500">
                {currentReceiver.slice(0, 8)}...{currentReceiver.slice(-8)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Recibirá:</p>
              <p className="text-xl font-bold text-green-600">
                {(junta.weeklyAmount * junta.members.length).toFixed(1)} XLM
              </p>
            </div>
          </div>
        </div>
      )}

      {junta.status === 'active' && (
        <div className="space-y-3">
          <div className="flex space-x-2">
            <select
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={contributing}
            >
              <option value="">Seleccionar wallet para contribuir</option>
              {wallets
                .filter(w => w.publicKey !== currentReceiver)
                .filter(w => w.balance >= junta.weeklyAmount)
                .map(wallet => (
                  <option key={wallet.publicKey} value={wallet.publicKey}>
                    {wallet.name} ({wallet.balance.toFixed(1)} XLM)
                  </option>
                ))
              }
            </select>
            <button
              onClick={handleContribution}
              disabled={!selectedWallet || contributing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{contributing ? 'Enviando...' : 'Contribuir'}</span>
            </button>
          </div>

          {canAdvanceWeek() && (
            <button
              onClick={() => onAdvanceWeek(junta.id)}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Avanzar a la siguiente semana
            </button>
          )}
        </div>
      )}

      {junta.transactions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2">Transacciones Recientes</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {junta.transactions.slice(-3).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Sem {tx.week}: {tx.amount} XLM
                </span>
                <button
                  onClick={() => window.open(StellarService.getExplorerUrl(tx.hash), '_blank')}
                  className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <span>Ver</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}