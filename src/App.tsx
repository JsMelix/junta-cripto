import React, { useState, useEffect } from 'react';
import { Wallet, DollarSign, Users, TrendingUp, Plus, RefreshCw } from 'lucide-react';
import { WalletCard } from './components/WalletCard';
import { CreateJuntaForm } from './components/CreateJuntaForm';
import { JuntaCard } from './components/JuntaCard';
import { ReputationCard } from './components/ReputationCard';
import { useWallets } from './hooks/useWallets';
import { useJuntas } from './hooks/useJuntas';
import { Transaction, UserReputation } from './types';
import { storageService } from './services/storage';

function App() {
  const { wallets, loading: walletsLoading, createWallet, updateWalletBalance, refreshAllBalances } = useWallets();
  const { juntas, createJunta, addTransaction, advanceWeek } = useJuntas();
  const [activeTab, setActiveTab] = useState<'wallets' | 'juntas' | 'reputation'>('wallets');
  const [reputation, setReputation] = useState<UserReputation[]>([]);

  useEffect(() => {
    const savedReputation = storageService.getReputation();
    setReputation(savedReputation);
  }, []);

  const updateReputation = (publicKey: string, juntaId: string) => {
    const updatedReputation = reputation.map(rep => {
      if (rep.publicKey === publicKey) {
        return {
          ...rep,
          totalContributions: rep.totalContributions + 1,
          reputationScore: Math.min(100, rep.reputationScore + 5),
          participationHistory: [...rep.participationHistory, juntaId]
        };
      }
      return rep;
    });

    // Add new user if not exists
    if (!updatedReputation.find(rep => rep.publicKey === publicKey)) {
      updatedReputation.push({
        publicKey,
        totalContributions: 1,
        completedRounds: 0,
        reputationScore: 5,
        participationHistory: [juntaId]
      });
    }

    setReputation(updatedReputation);
    storageService.saveReputation(updatedReputation);
  };

  const handleCreateWallet = async () => {
    const walletCount = wallets.length + 1;
    await createWallet(`Usuario ${walletCount}`);
  };

  const handleCreateJunta = (name: string, members: string[], weeklyAmount: number, totalWeeks: number) => {
    // Ensure totalWeeks is at least the number of members
    const adjustedWeeks = Math.max(totalWeeks, members.length);
    createJunta(name, members, weeklyAmount, adjustedWeeks);
    setActiveTab('juntas');
  };

  const handleContribution = async (juntaId: string, hash: string, from: string, to: string, amount: number) => {
    const junta = juntas.find(j => j.id === juntaId);
    if (!junta) return;

    const transaction: Transaction = {
      id: `tx-${Date.now()}`,
      from,
      to,
      amount,
      week: junta.currentWeek,
      hash,
      timestamp: new Date(),
      type: 'contribution'
    };

    addTransaction(juntaId, transaction);
    updateReputation(from, juntaId);
    
    // Update wallet balances after a delay to allow blockchain confirmation
    setTimeout(async () => {
      await updateWalletBalance(from);
      await updateWalletBalance(to);
    }, 3000);
  };

  const handleAdvanceWeek = (juntaId: string) => {
    const junta = juntas.find(j => j.id === juntaId);
    if (!junta) return;

    // Mark receiver as completing a round
    const receiver = junta.members[junta.currentTurnIndex];
    const updatedReputation = reputation.map(rep => {
      if (rep.publicKey === receiver) {
        return {
          ...rep,
          completedRounds: rep.completedRounds + 1,
          reputationScore: Math.min(100, rep.reputationScore + 10)
        };
      }
      return rep;
    });

    // Add new user reputation if not exists
    if (!updatedReputation.find(rep => rep.publicKey === receiver)) {
      updatedReputation.push({
        publicKey: receiver,
        totalContributions: 0,
        completedRounds: 1,
        reputationScore: 10,
        participationHistory: [juntaId]
      });
    }

    setReputation(updatedReputation);
    storageService.saveReputation(updatedReputation);
    advanceWeek(juntaId);
  };

  const tabs = [
    { id: 'wallets', label: 'Wallets', icon: Wallet },
    { id: 'juntas', label: 'Juntas', icon: Users },
    { id: 'reputation', label: 'Reputación', icon: TrendingUp }
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Junta Cripto</h1>
                <p className="text-sm text-gray-500">Sistema de Ahorro Comunitario</p>
              </div>
            </div>
            <button
              onClick={refreshAllBalances}
              disabled={walletsLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${walletsLoading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wallets Tab */}
        {activeTab === 'wallets' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Gestión de Wallets</h2>
                <p className="text-gray-600">Crea y administra wallets de Stellar Testnet</p>
              </div>
              <button
                onClick={handleCreateWallet}
                disabled={walletsLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Wallet</span>
              </button>
            </div>

            {wallets.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay wallets</h3>
                <p className="text-gray-500 mb-4">Crea tu primera wallet para comenzar</p>
                <button
                  onClick={handleCreateWallet}
                  disabled={walletsLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {walletsLoading ? 'Creando...' : 'Crear Wallet'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wallets.map((wallet) => (
                  <WalletCard
                    key={wallet.publicKey}
                    wallet={wallet}
                    onRefresh={() => updateWalletBalance(wallet.publicKey)}
                    refreshing={walletsLoading}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Juntas Tab */}
        {activeTab === 'juntas' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Juntas</h2>
              <p className="text-gray-600">Crea y participa en juntas de ahorro comunitario</p>
            </div>

            {wallets.length < 2 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Necesitas más wallets</h3>
                <p className="text-gray-500 mb-4">Crea al menos 2 wallets para formar una junta</p>
                <button
                  onClick={() => setActiveTab('wallets')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ir a Wallets
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <CreateJuntaForm
                  wallets={wallets}
                  onCreateJunta={handleCreateJunta}
                />

                {juntas.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {juntas.map((junta) => (
                      <JuntaCard
                        key={junta.id}
                        junta={junta}
                        wallets={wallets}
                        onContribution={handleContribution}
                        onAdvanceWeek={handleAdvanceWeek}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Reputation Tab */}
        {activeTab === 'reputation' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Reputación Financiera</h2>
              <p className="text-gray-600">Historial crediticio basado en participación en juntas</p>
            </div>

            {reputation.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100">
                <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sin historial de reputación</h3>
                <p className="text-gray-500 mb-4">Participa en juntas para construir tu reputación financiera</p>
                <button
                  onClick={() => setActiveTab('juntas')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Crear Junta
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reputation.map((rep) => {
                  const wallet = wallets.find(w => w.publicKey === rep.publicKey);
                  return (
                    <ReputationCard
                      key={rep.publicKey}
                      reputation={rep}
                      walletName={wallet?.name || 'Wallet Desconocida'}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;