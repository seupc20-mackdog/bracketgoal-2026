// src/lib/bracket.ts

import {
  WORLD_CUP_2026_KNOCKOUT_TEMPLATE,
  KnockoutTemplateMatch,
  SlotSource,
  MatchCode,
  KnockoutStage,
  GroupLetter,
} from "@/data/worldcup2026_knockout";

/**
 * Estrutura de posições finais de cada grupo para UM bilhete.
 * Aqui você só precisa passar os IDs dos times já definidos na sua tabela `teams`.
 */
export type GroupPositions = {
  [g in GroupLetter]: {
    first: string;         // teamId do 1º lugar do grupo
    second: string;        // teamId do 2º lugar do grupo
    third?: string;        // teamId do 3º (se você quiser usar)
    fourth?: string;       // opcional
  };
};

/**
 * Ranking dos terceiros colocados (melhores 3ºs) para esse bilhete.
 * Ordenado do melhor 3º até o 8º.
 */
export type BestThirdEntry = {
  teamId: string;
  group: GroupLetter;
};

export type MatchPredictionMinimal = {
  winnerTeamId: string | null; // quem o usuário disse que passa
};

export type MatchPredictionsMap = Partial<Record<MatchCode, MatchPredictionMinimal>>;

/**
 * Contexto do bracket do usuário (por bilhete).
 */
export type UserBracketContext = {
  groupPositions: GroupPositions;
  bestThirdRanking: BestThirdEntry[]; // até 8 times, em ordem
  predictions?: MatchPredictionsMap;  // palpites já feitos nos mata-matas
};

/**
 * Partida do bracket já resolvida para o usuário:
 * quais times jogam cada M73..M104.
 */
export type UserBracketMatch = {
  code: MatchCode;
  stage: KnockoutStage;
  homeTeamId: string | null;
  awayTeamId: string | null;
};

/**
 * Função principal:
 * Dado o contexto do bilhete (classificação dos grupos + ranking de terceiros
 * + vencedores já escolhidos), gera TODAS as partidas M73..M104
 * com os times concretos em cada slot (ou null se ainda não der pra saber).
 */
export function buildUserBracket(context: UserBracketContext): UserBracketMatch[] {
  const { groupPositions, bestThirdRanking, predictions } = context;

  // Terceiros já usados em slots BEST_THIRD_POOL
  const usedThirdTeamIds = new Set<string>();

  // Mapa para permitir que MATCH_LOSER veja os jogos anteriores
  const matchMap = new Map<MatchCode, UserBracketMatch>();

  function resolveSlot(source: SlotSource): string | null {
    switch (source.type) {
      case "GROUP_POSITION": {
        const gp = groupPositions[source.group];
        if (!gp) return null;

        if (source.position === 1) return gp.first ?? null;
        if (source.position === 2) return gp.second ?? null;
        if (source.position === 3) return gp.third ?? null;
        return null;
      }

      case "BEST_THIRD_POOL": {
        // pega o melhor 3º disponível que venha de um dos grupos da pool
        const candidate = bestThirdRanking.find(
          (t) => source.groups.includes(t.group) && !usedThirdTeamIds.has(t.teamId)
        );
        if (!candidate) return null;
        usedThirdTeamIds.add(candidate.teamId);
        return candidate.teamId;
      }

      case "MATCH_WINNER": {
        const pred = predictions?.[source.matchCode];
        return pred?.winnerTeamId ?? null;
      }

      case "MATCH_LOSER": {
        const baseMatch = matchMap.get(source.matchCode);
        const pred = predictions?.[source.matchCode];

        if (!baseMatch || !pred?.winnerTeamId) return null;
        const { homeTeamId, awayTeamId } = baseMatch;
        if (!homeTeamId || !awayTeamId) return null;

        if (pred.winnerTeamId === homeTeamId) return awayTeamId;
        if (pred.winnerTeamId === awayTeamId) return homeTeamId;

        // se winner não bate com nenhum dos dois (erro de dados)
        return null;
      }

      default:
        return null;
    }
  }

  const result: UserBracketMatch[] = [];

  // A ordem do template já é topológica (ROUND_OF_32 → ... → FINAL),
  // então podemos ir construindo e salvando no matchMap.
  for (const tmpl of WORLD_CUP_2026_KNOCKOUT_TEMPLATE) {
    const homeTeamId = resolveSlot(tmpl.home);
    const awayTeamId = resolveSlot(tmpl.away);

    const match: UserBracketMatch = {
      code: tmpl.code,
      stage: tmpl.stage,
      homeTeamId,
      awayTeamId,
    };

    result.push(match);
    matchMap.set(tmpl.code, match);
  }

  return result;
}
