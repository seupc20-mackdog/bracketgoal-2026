// src/data/tournaments.ts

export type Tournament = {
  slug: string;
  name: string;
  year: number;
  description: string;
};

export const copa2026: Tournament = {
  slug: "copa-2026-oficial",
  name: "Copa do Mundo 2026",
  year: 2026,
  description:
    "Bolão base da Copa do Mundo FIFA 2026. Fase de grupos + mata-mata, ranking e pontuação automatizada."
};
