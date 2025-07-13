import { useState, useEffect } from 'react';
import { Junta, Transaction } from '../types';
import { storageService } from '../services/storage';

export function useJuntas() {
  const [juntas, setJuntas] = useState<Junta[]>([]);

  useEffect(() => {
    const savedJuntas = storageService.getJuntas();
    setJuntas(savedJuntas);
  }, []);

  const createJunta = (
    name: string,
    members: string[],
    weeklyAmount: number,
    totalWeeks: number
  ): Junta => {
    const newJunta: Junta = {
      id: `junta-${Date.now()}`,
      name,
      members,
      weeklyAmount,
      currentWeek: 1,
      totalWeeks,
      currentTurnIndex: 0,
      transactions: [],
      status: 'active',
      createdAt: new Date()
    };

    const updatedJuntas = [...juntas, newJunta];
    setJuntas(updatedJuntas);
    storageService.saveJuntas(updatedJuntas);
    
    return newJunta;
  };

  const addTransaction = (juntaId: string, transaction: Transaction): void => {
    const updatedJuntas = juntas.map(junta => 
      junta.id === juntaId 
        ? { ...junta, transactions: [...junta.transactions, transaction] }
        : junta
    );
    setJuntas(updatedJuntas);
    storageService.saveJuntas(updatedJuntas);
  };

  const advanceWeek = (juntaId: string): void => {
    const updatedJuntas = juntas.map(junta => {
      if (junta.id === juntaId) {
        const newWeek = junta.currentWeek + 1;
        const newTurnIndex = (junta.currentTurnIndex + 1) % junta.members.length;
        const status = newWeek > junta.totalWeeks ? 'completed' : 'active';
        
        return {
          ...junta,
          currentWeek: newWeek,
          currentTurnIndex: newTurnIndex,
          status
        };
      }
      return junta;
    });
    
    setJuntas(updatedJuntas);
    storageService.saveJuntas(updatedJuntas);
  };

  return {
    juntas,
    createJunta,
    addTransaction,
    advanceWeek
  };
}