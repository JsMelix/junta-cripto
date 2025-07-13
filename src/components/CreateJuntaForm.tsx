import React, { useState } from 'react';
import { Plus, Users, DollarSign, Calendar } from 'lucide-react';
import { Wallet } from '../types';

interface CreateJuntaFormProps {
  wallets: Wallet[];
  onCreateJunta: (name: string, members: string[], weeklyAmount: number, totalWeeks: number) => void;
}

export function CreateJuntaForm({ wallets, onCreateJunta }: CreateJuntaFormProps) {
  const [name, setName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [weeklyAmount, setWeeklyAmount] = useState(10);
  const [totalWeeks, setTotalWeeks] = useState(3);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && selectedMembers.length >= 2) {
      onCreateJunta(name, selectedMembers, weeklyAmount, totalWeeks);
      setName('');
      setSelectedMembers([]);
      setWeeklyAmount(10);
      setTotalWeeks(3);
      setShowForm(false);
    }
  };

  const toggleMember = (publicKey: string) => {
    setSelectedMembers(prev => 
      prev.includes(publicKey)
        ? prev.filter(key => key !== publicKey)
        : [...prev, publicKey]
    );
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
      >
        <Plus className="w-6 h-6" />
        <span className="text-lg font-semibold">Crear Nueva Junta</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Nueva Junta</h3>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre de la Junta
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ej: Junta Amigos 2024"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Users className="w-4 h-4 inline mr-1" />
          Seleccionar Miembros (mín. 2)
        </label>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {wallets.map((wallet) => (
            <label
              key={wallet.publicKey}
              className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedMembers.includes(wallet.publicKey)}
                onChange={() => toggleMember(wallet.publicKey)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium">{wallet.name}</span>
              <span className="text-sm text-gray-500">
                {wallet.publicKey.slice(0, 8)}...
              </span>
            </label>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Seleccionados: {selectedMembers.length}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Aporte Semanal (XLM)
          </label>
          <input
            type="number"
            value={weeklyAmount}
            onChange={(e) => setWeeklyAmount(Number(e.target.value))}
            min="1"
            step="0.1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Total Semanas
          </label>
          <input
            type="number"
            value={totalWeeks}
            onChange={(e) => {
              const weeks = Number(e.target.value);
              setTotalWeeks(Math.max(weeks, selectedMembers.length));
            }}
            min={Math.max(2, selectedMembers.length)}
            max="52"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Mínimo: {Math.max(2, selectedMembers.length)} semanas (uno por miembro)
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={!name.trim() || selectedMembers.length < 2}
        className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-green-600 disabled:hover:to-blue-600"
      >
        Crear Junta
      </button>
    </form>
  );
}