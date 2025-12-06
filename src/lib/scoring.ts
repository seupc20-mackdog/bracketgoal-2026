// src/lib/scoring.ts

// Tipo da partida: grupos ou mata-mata
export type TipoPartida = "GRUPO" | "MATA";

// Resultado em termos de 1X2
export type Resultado1X2 = "CASA" | "EMPATE" | "FORA";

// Método de vitória no mata-mata
export type MetodoVitoria = "NORMAL" | "PRORROGACAO" | "PENALTIS";

// Placar simplificado
export type Placar = {
  golsCasa: number;
  golsFora: number;
};

// Dados reais da partida
export type DadosJogoReal = {
  tipo: TipoPartida;
  placar: Placar;

  // Só usado se for mata-mata
  vencedorId?: string;          // time que efetivamente passou de fase
  metodoVitoria?: MetodoVitoria;
};

// Palpite do usuário para a partida
export type PalpiteJogo = {
  placar: Placar;

  // Só usado se for mata-mata
  vencedorId?: string;          // time que o usuário disse que passa
  metodoVitoria?: MetodoVitoria;
};

// Detalhamento da pontuação de um jogo
export type PontuacaoJogo = {
  pontosTotais: number;

  // detalhamento
  pontosPlacar: number;        // 3 se placar exato, senão 0
  pontosResultado: number;     // 1 se acertou 1X2 (sem ser exato), senão 0
  pontosMetodo: number;        // 1 se acertou método + vencedor (mata-mata), senão 0

  acertouPlacar: boolean;
  acertouResultado: boolean;   // acertou 1X2 (CASA/EMPATE/FORA)
  acertouMetodo: boolean;      // acertou vencedor + como venceu (apenas mata-mata)
};

/**
 * Converte um placar em um rótulo 1X2 (CASA / EMPATE / FORA)
 */
function resultado1X2DePlacar(placar: Placar): Resultado1X2 {
  if (placar.golsCasa > placar.golsFora) return "CASA";
  if (placar.golsCasa < placar.golsFora) return "FORA";
  return "EMPATE";
}

/**
 * Calcula a pontuação de um único jogo
 *
 * Regras:
 * - Placar exato (90min): 3 pontos
 * - Resultado 1X2 correto (mas placar diferente): 1 ponto
 * - Mata-mata: se vencedor + método (NORMAL/PRORROGACAO/PENALTIS) corretos: +1 ponto
 */
export function calcPontuacaoJogo(
  jogoReal: DadosJogoReal,
  palpite: PalpiteJogo
): PontuacaoJogo {
  let pontosPlacar = 0;
  let pontosResultado = 0;
  let pontosMetodo = 0;

  const { placar: placarReal, tipo } = jogoReal;
  const { placar: placarUser } = palpite;

  const acertouPlacar =
    placarReal.golsCasa === placarUser.golsCasa &&
    placarReal.golsFora === placarUser.golsFora;

  // 1) Placar exato → 3 pontos
  if (acertouPlacar) {
    pontosPlacar = 3;
  } else {
    // 2) Se não acertou placar, checa 1X2 (CASA / EMPATE / FORA)
    const resultadoReal = resultado1X2DePlacar(placarReal);
    const resultadoPalpite = resultado1X2DePlacar(placarUser);

    if (resultadoReal === resultadoPalpite) {
      pontosResultado = 1; // acertou tendência (vitória/empate/derrota)
    }
  }

  // 3) Se for mata-mata, avalia método de vitória
  let acertouMetodo = false;

  if (tipo === "MATA") {
    const vencedorReal = jogoReal.vencedorId;
    const vencedorUser = palpite.vencedorId;

    const metodoReal = jogoReal.metodoVitoria;
    const metodoUser = palpite.metodoVitoria;

    // Só considera método se o usuário acertou quem passou de fase
    if (
      vencedorReal &&
      vencedorUser &&
      vencedorReal === vencedorUser &&
      metodoReal &&
      metodoUser &&
      metodoReal === metodoUser
    ) {
      pontosMetodo = 1;
      acertouMetodo = true;
    }
  }

  const pontosTotais = pontosPlacar + pontosResultado + pontosMetodo;

  return {
    pontosTotais,
    pontosPlacar,
    pontosResultado,
    pontosMetodo,
    acertouPlacar,
    acertouResultado: pontosPlacar > 0 || pontosResultado > 0,
    acertouMetodo,
  };
}
