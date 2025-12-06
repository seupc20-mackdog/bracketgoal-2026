// src/data/matches.ts

export type Match = {
  id: string;
  stage: "groups" | "roundOf16" | "quarterfinal" | "semifinal" | "final";
  group?: string;
  home: string;
  away: string;
  kickoff: string; // ISO
};

export const sampleGroupMatches: Match[] = [
  {
    id: "match-1",
    stage: "groups",
    group: "A",
    home: "Seleção A",
    away: "Seleção B",
    kickoff: "2026-06-10T18:00:00Z"
  },
  {
    id: "match-2",
    stage: "groups",
    group: "A",
    home: "Seleção C",
    away: "Seleção D",
    kickoff: "2026-06-10T21:00:00Z"
  },
  {
    id: "match-3",
    stage: "groups",
    group: "B",
    home: "Seleção E",
    away: "Seleção F",
    kickoff: "2026-06-11T18:00:00Z"
  }
];
