import React from 'react';
import { Star, TrendingUp, CheckCircle, Users } from 'lucide-react';
import { UserReputation } from '../types';

interface ReputationCardProps {
  reputation: UserReputation;
  walletName: string;
}

export function ReputationCard({ reputation, walletName }: ReputationCardProps) {
  const getReputationLevel = (score: number) => {
    if (score >= 90) return { level: 'Excelente', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 70) return { level: 'Bueno', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (score >= 50) return { level: 'Regular', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { level: 'Nuevo', color: 'text-gray-600', bg: 'bg-gray-50' };
  };

  const reputationLevel = getReputationLevel(reputation.reputationScore);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{walletName}</h3>
          <p className="text-sm text-gray-500">Reputación Financiera</p>
        </div>
        <div className={`px-3 py-1 rounded-full ${reputationLevel.bg}`}>
          <span className={`text-sm font-medium ${reputationLevel.color}`}>
            {reputationLevel.level}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Star className="w-5 h-5 text-yellow-500" />
          <span className="text-sm text-gray-600">Puntuación de Reputación</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex-1 bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(reputation.reputationScore, 100)}%` }}
            />
          </div>
          <span className="text-2xl font-bold text-gray-900">
            {reputation.reputationScore.toFixed(0)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <CheckCircle className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Contribuciones</p>
          <p className="text-xl font-bold text-blue-600">{reputation.totalContributions}</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Rondas Completadas</p>
          <p className="text-xl font-bold text-green-600">{reputation.completedRounds}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Historial de Participación</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {reputation.participationHistory.slice(-5).map((juntaId, index) => (
            <div
              key={index}
              className="w-3 h-3 bg-green-400 rounded-full"
              title={`Junta: ${juntaId}`}
            />
          ))}
          {reputation.participationHistory.length === 0 && (
            <span className="text-xs text-gray-400">Sin participaciones aún</span>
          )}
        </div>
      </div>
    </div>
  );
}