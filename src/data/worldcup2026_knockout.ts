// src/data/worldcup2026_knockout.ts

// Letras dos grupos da Copa 2026
export type GroupLetter =
  | "A" | "B" | "C" | "D"
  | "E" | "F" | "G" | "H"
  | "I" | "J" | "K" | "L";

// Códigos oficiais dos jogos do mata-mata
export type MatchCode =
  | "M73" | "M74" | "M75" | "M76"
  | "M77" | "M78" | "M79" | "M80"
  | "M81" | "M82" | "M83" | "M84"
  | "M85" | "M86" | "M87" | "M88"
  | "M89" | "M90" | "M91" | "M92"
  | "M93" | "M94" | "M95" | "M96"
  | "M97" | "M98" | "M99" | "M100"
  | "M101" | "M102" | "M103" | "M104";

export type KnockoutStage =
  | "ROUND_OF_32"
  | "ROUND_OF_16"
  | "QUARTER_FINAL"
  | "SEMI_FINAL"
  | "THIRD_PLACE"
  | "FINAL";

/**
 * De onde vem cada “slot” de um jogo do mata-mata.
 * Isso é o coração para montar a chave de cada bilhete.
 */
export type SlotSource =
  | {
      type: "GROUP_POSITION";
      group: GroupLetter;
      position: 1 | 2 | 3;
    }
  | {
      // melhores terceiros dentro de um pool de grupos
      type: "BEST_THIRD_POOL";
      groups: GroupLetter[];
    }
  | {
      // vencedor de um jogo anterior (para 89+)
      type: "MATCH_WINNER";
      matchCode: MatchCode;
    }
  | {
      // perdedor de um jogo (só para o 3º lugar)
      type: "MATCH_LOSER";
      matchCode: MatchCode;
    };

export type KnockoutTemplateMatch = {
  code: MatchCode;
  stage: KnockoutStage;
  home: SlotSource;
  away: SlotSource;
};

/**
 * Template oficial do chaveamento da Copa 2026
 * Fonte: bracket FIFA / torneios (M73–M104)
 */
export const WORLD_CUP_2026_KNOCKOUT_TEMPLATE: KnockoutTemplateMatch[] = [
  // =============== ROUND OF 32 (M73–M88) ===============

  // lado azul superior (imagem)
  {
    code: "M74",
    stage: "ROUND_OF_32",
    home: { type: "GROUP_POSITION", group: "E", position: 1 }, // 1E
    away: {
      type: "BEST_THIRD_POOL",
      groups: ["A", "B", "C", "D", "F"], // 3ABCDF
    },
  },
  {
    code: "M77",
    stage: "ROUND_OF_32",
    home: { type: "GROUP_POSITION", group: "I", position: 1 }, // 1I
    away: {
      type: "BEST_THIRD_POOL",
      groups: ["C", "D", "F", "G", "H"], // 3CDFGH
    },
  },
  {
    code: "M73",
    stage: "ROUND_OF_32",
    home: { type: "GROUP_POSITION", group: "A", position: 2 }, // 2A
    away: { type: "GROUP_POSITION", group: "B", position: 2 }, // 2B
  },
  {
    code: "M75",
    stage: "ROUND_OF_32",
    home: { type: "GROUP_POSITION", group: "F", position: 1 }, // 1F
    away: { type: "GROUP_POSITION", group: "C", position: 2 }, // 2C
  },

  // lado verde inferior esquerdo
  {
    code: "M83",
    stage: "ROUND_OF_32",
    home: { type: "GROUP_POSITION", group: "K", position: 2 }, // 2K
    away: { type: "GROUP_POSITION", group: "L", position: 2 }, // 2L
  },
  {
    code: "M84",
    stage: "ROUND_OF_32",
    home: { type: "GROUP_POSITION", group: "H", position: 1 }, // 1H
    away: { type: "GROUP_POSITION", group: "J", position: 2 }, // 2J
  },
  {
    code: "M81",
    stage: "ROUND_OF_32",
    home: { type: "GROUP_POSITION", group: "D", position: 1 }, // 1D
    away: {
      type: "BEST_THIRD_POOL",
      groups: ["B", "E", "F", "I", "J"], // 3BEFIJ
    },
  },
  {
    code: "M82",
    stage: "ROUND_OF_32",
    home: { type: "GROUP_POSITION", group: "G", position: 1 }, // 1G
    away: {
      type: "BEST_THIRD_POOL",
      groups: ["A", "E", "H", "I", "J"], // 3AEHIJ
    },
  },

  // lado verde superior direito
  {
    code: "M76",
    stage: "ROUND_OF_32",
    home: { type: "GROUP_POSITION", group: "C", position: 1 }, // 1C
    away: { type: "GROUP_POSITION", group: "F", position: 2 }, // 2F
  },
  {
    code: "M78",
    stage: "ROUND_OF_32",
    home: { type: "GROUP_POSITION", group: "E", position: 2 }, // 2E
    away: { type: "GROUP_POSITION", group: "I", position: 2 }, // 2I
  },
  {
    code: "M79",
    stage: "ROUND_OF_32",
    home: { type: "GROUP_POSITION", group: "A", position: 1 }, // 1A
    away: {
      type: "BEST_THIRD_POOL",
      groups: ["C", "E", "F", "H", "I"], // 3CEFHI
    },
  },
  {
    code: "M80",
    stage: "ROUND_OF_32",
    home: { type: "GROUP_POSITION", group: "L", position: 1 }, // 1L
    away: {
      type: "BEST_THIRD_POOL",
      groups: ["E", "H", "I", "J", "K"], // 3EHIJK
    },
  },

  // lado vermelho inferior direito
  {
    code: "M86",
    stage: "ROUND_OF_32",
    home: { type: "GROUP_POSITION", group: "J", position: 1 }, // 1J
    away: { type: "GROUP_POSITION", group: "H", position: 2 }, // 2H
  },
  {
    code: "M88",
    stage: "ROUND_OF_32",
    home: { type: "GROUP_POSITION", group: "D", position: 2 }, // 2D
    away: { type: "GROUP_POSITION", group: "G", position: 2 }, // 2G
  },
  {
    code: "M85",
    stage: "ROUND_OF_32",
    home: { type: "GROUP_POSITION", group: "B", position: 1 }, // 1B
    away: {
      type: "BEST_THIRD_POOL",
      groups: ["E", "F", "G", "I", "J"], // 3EFGIJ
    },
  },
  {
    code: "M87",
    stage: "ROUND_OF_32",
    home: { type: "GROUP_POSITION", group: "K", position: 1 }, // 1K
    away: {
      type: "BEST_THIRD_POOL",
      groups: ["D", "E", "I", "J", "L"], // 3DEIJL
    },
  },

  // =============== ROUND OF 16 (M89–M96) ===============

  // quadrante azul (vêm de 74/77/73/75)
  {
    code: "M89",
    stage: "ROUND_OF_16",
    home: { type: "MATCH_WINNER", matchCode: "M74" }, // W74
    away: { type: "MATCH_WINNER", matchCode: "M77" }, // W77
  },
  {
    code: "M90",
    stage: "ROUND_OF_16",
    home: { type: "MATCH_WINNER", matchCode: "M73" }, // W73
    away: { type: "MATCH_WINNER", matchCode: "M75" }, // W75
  },

  // quadrante verde (vêm de 83/84/81/82)
  {
    code: "M93",
    stage: "ROUND_OF_16",
    home: { type: "MATCH_WINNER", matchCode: "M83" }, // W83
    away: { type: "MATCH_WINNER", matchCode: "M84" }, // W84
  },
  {
    code: "M94",
    stage: "ROUND_OF_16",
    home: { type: "MATCH_WINNER", matchCode: "M81" }, // W81
    away: { type: "MATCH_WINNER", matchCode: "M82" }, // W82
  },

  // quadrante verde (vêm de 76/78/79/80)
  {
    code: "M91",
    stage: "ROUND_OF_16",
    home: { type: "MATCH_WINNER", matchCode: "M76" }, // W76
    away: { type: "MATCH_WINNER", matchCode: "M78" }, // W78
  },
  {
    code: "M92",
    stage: "ROUND_OF_16",
    home: { type: "MATCH_WINNER", matchCode: "M79" }, // W79
    away: { type: "MATCH_WINNER", matchCode: "M80" }, // W80
  },

  // quadrante vermelho (vêm de 86/88/85/87)
  {
    code: "M95",
    stage: "ROUND_OF_16",
    home: { type: "MATCH_WINNER", matchCode: "M86" }, // W86
    away: { type: "MATCH_WINNER", matchCode: "M88" }, // W88
  },
  {
    code: "M96",
    stage: "ROUND_OF_16",
    home: { type: "MATCH_WINNER", matchCode: "M85" }, // W85
    away: { type: "MATCH_WINNER", matchCode: "M87" }, // W87
  },

  // =============== QUARTAS (M97–M100) ===============

  {
    code: "M97",
    stage: "QUARTER_FINAL",
    home: { type: "MATCH_WINNER", matchCode: "M89" }, // W89
    away: { type: "MATCH_WINNER", matchCode: "M90" }, // W90
  },
  {
    code: "M98",
    stage: "QUARTER_FINAL",
    home: { type: "MATCH_WINNER", matchCode: "M93" }, // W93
    away: { type: "MATCH_WINNER", matchCode: "M94" }, // W94
  },
  {
    code: "M99",
    stage: "QUARTER_FINAL",
    home: { type: "MATCH_WINNER", matchCode: "M91" }, // W91
    away: { type: "MATCH_WINNER", matchCode: "M92" }, // W92
  },
  {
    code: "M100",
    stage: "QUARTER_FINAL",
    home: { type: "MATCH_WINNER", matchCode: "M95" }, // W95
    away: { type: "MATCH_WINNER", matchCode: "M96" }, // W96
  },

  // =============== SEMIS, 3º LUGAR, FINAL ===============

  {
    code: "M101",
    stage: "SEMI_FINAL",
    home: { type: "MATCH_WINNER", matchCode: "M97" }, // W97
    away: { type: "MATCH_WINNER", matchCode: "M98" }, // W98
  },
  {
    code: "M102",
    stage: "SEMI_FINAL",
    home: { type: "MATCH_WINNER", matchCode: "M99" }, // W99
    away: { type: "MATCH_WINNER", matchCode: "M100" }, // W100
  },

  {
    code: "M103",
    stage: "THIRD_PLACE",
    home: { type: "MATCH_LOSER", matchCode: "M101" }, // L101
    away: { type: "MATCH_LOSER", matchCode: "M102" }, // L102
  },

  {
    code: "M104",
    stage: "FINAL",
    home: { type: "MATCH_WINNER", matchCode: "M101" }, // W101
    away: { type: "MATCH_WINNER", matchCode: "M102" }, // W102
  },
];
