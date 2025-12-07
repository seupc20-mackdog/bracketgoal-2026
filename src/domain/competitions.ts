// src/domain/competitions.ts

// ID genérico de torneio – deixa aberto pra novos campeonatos
export type TournamentId =
  | "world-cup-2026"
  | "brasileirao-serie-a-2025"
  | "ucl-2025-26"
  | string;

export type TournamentKind =
  | "world_cup_groups_knockout" // formato especial (Copa)
  | "league"                    // pontos corridos (Brasileirão)
  | "cup_knockout"              // mata-mata (Champions)
  | "custom";                   // combos de jogos aleatórios

export interface Tournament {
  id: TournamentId;
  name: string;      // "Campeonato Brasileiro Série A 2025"
  shortName: string; // "Brasileirão 2025"
  code: string;      // "BRA-2025", "UCL-25-26"
  season: string;    // "2025", "2025-2026"
  kind: TournamentKind;
  region: "world" | "europe" | "south_america" | "other";
  createdAt: string;
}

export type TeamId = string;

export interface Team {
  id: TeamId;
  name: string;       // "Flamengo", "Real Madrid"
  shortName: string;  // "FLA", "RMA"
  countryCode: string; // "BR", "ES"
  flagUrl?: string;   // opcional, pra usar no front
}

// Uma partida genérica, serve pra Copa, Brasileirão, Champions etc.
export type MatchId = string;

export interface Match {
  id: MatchId;
  tournamentId: TournamentId;
  round: string;       // "Grupo A - Rodada 1", "Rodada 5", "Quartas"
  matchday?: number;   // p/ ligas: 1, 2, 3...
  kickoffAt?: string;  // ISO, UTC, opcional se ainda não tiver
  homeTeamId: TeamId;
  awayTeamId: TeamId;
  // futuro: status, placar oficial, etc.
}
