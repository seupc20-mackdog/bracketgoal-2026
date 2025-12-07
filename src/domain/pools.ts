// src/domain/pools.ts
import type { MatchId, TournamentId } from "./competitions";

export type PoolId = string;

export type PaymentMode = "organizer_pays" | "participant_pays";

export interface Pool {
  id: PoolId;
  organizerId: string;   // empresa, influencer, etc.
  tournamentId: TournamentId | null; 
  // null -> bolão totalmente customizado (pode misturar ligas)
  
  name: string;
  slug: string; // usado na URL: /p/meu-bolao-brasileirao-2025

  maxParticipants: number;
  paymentMode: PaymentMode;
  pricePerEntry?: number; // se participant_pays
  currency: "BRL" | "USD" | "EUR";

  status: "draft" | "active" | "closed";
  createdAt: string;
}

// Jogos que fazem parte de um bolão
export interface PoolMatch {
  poolId: PoolId;
  matchId: MatchId;
  order: number; // ordem de exibição (1..10, etc.)
}

// Participante dentro de um bolão
export interface PoolEntry {
  id: string;
  poolId: PoolId;
  userId?: string; // se for usuário logado (Supabase)
  displayName: string;
  whatsapp?: string;
  status: "pending_payment" | "active" | "eliminated";
  createdAt: string;
}

// Palpite genérico – serve pro Brasileirão, Champions, Copa etc.
export interface Prediction {
  id: string;
  poolId: PoolId;
  entryId: string;
  matchId: MatchId;
  homeGoals: number;
  awayGoals: number;
  // Pode guardar “modo mata-mata” no futuro
  extra?: {
    winnerAfterPenalties?: string;
    winnerAfterET?: string;
  };
  createdAt: string;
}
