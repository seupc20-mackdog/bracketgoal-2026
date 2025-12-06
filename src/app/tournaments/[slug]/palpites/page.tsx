"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  WORLD_CUP_2026_GROUPS,
  WorldCupGroup,
  GroupLetter,
} from "@/data/worldcup2026";
import { Badge } from "@/components/ui/badge";

// ===== TYPES =====

type GroupMatch = {
  id: string;
  groupLetter: GroupLetter;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
};

type MatchPrediction = {
  matchId: string;
  groupLetter: GroupLetter;
  homeTeamId: string;
  awayTeamId: string;
  homeGoals: string;
  awayGoals: string;
};

type GroupPredictions = {
  matches: Record<string, MatchPrediction>;
  firstPlaceId?: string;
  secondPlaceId?: string;
};

type GroupsState = Partial<Record<GroupLetter, GroupPredictions>>;

// ===== HELPERS =====

function generateMatchesForGroup(group: WorldCupGroup): GroupMatch[] {
  const matches: GroupMatch[] = [];
  const teams = group.teams ?? [];

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const home = teams[i];
      const away = teams[j];

      // Garantia pro TypeScript: se algum vier undefined, pula
      if (!home || !away) continue;

      matches.push({
        id: `${group.letter}-${home.id}-${away.id}`,
        groupLetter: group.letter,
        homeTeamId: home.id,
        awayTeamId: away.id,
        homeTeamName: home.name,
        awayTeamName: away.name,
      });
    }
  }

  return matches;
}


function countFilledMatches(groupMatches: GroupMatch[], gp?: GroupPredictions) {
  if (!gp) return 0;
  let filled = 0;
  for (const m of groupMatches) {
    const p = gp.matches[m.id];
    if (p && p.homeGoals !== "" && p.awayGoals !== "") filled++;
  }
  return filled;
}

// ===== PAGE COMPONENT =====

export default function PalpitesGruposWizardPage() {
  const groupsWithMatches = useMemo(
    () =>
      WORLD_CUP_2026_GROUPS.map((group) => ({
        group,
        matches: generateMatchesForGroup(group),
      })),
    []
  );

  const [groupsState, setGroupsState] = useState<GroupsState>({});
  const [openGroup, setOpenGroup] = useState<GroupLetter | null>(null);
  const [modalStep, setModalStep] = useState<"MATCHES" | "STANDINGS">(
    "MATCHES"
  );
  const [tempFirst, setTempFirst] = useState<string>("");
  const [tempSecond, setTempSecond] = useState<string>("");

  const totalGroups = WORLD_CUP_2026_GROUPS.length;

  const allGroupsDone = useMemo(() => {
    return groupsWithMatches.every(({ group, matches }) => {
      const gp = groupsState[group.letter];
      if (!gp?.firstPlaceId || !gp?.secondPlaceId) return false;
      const filled = countFilledMatches(matches, gp);
      return filled === matches.length;
    });
  }, [groupsWithMatches, groupsState]);

  function openGroupMatches(letter: GroupLetter) {
    const gp = groupsState[letter];
    setOpenGroup(letter);
    setModalStep("MATCHES");
    setTempFirst(gp?.firstPlaceId ?? "");
    setTempSecond(gp?.secondPlaceId ?? "");
  }

  function closeModal() {
    setOpenGroup(null);
    setModalStep("MATCHES");
    setTempFirst("");
    setTempSecond("");
  }

  function handleScoreChange(
    match: GroupMatch,
    field: "homeGoals" | "awayGoals",
    value: string
  ) {
    const clean = value.replace(/[^0-9]/g, "");

    setGroupsState((prev) => {
      const currentGroup: GroupPredictions = prev[match.groupLetter] ?? {
        matches: {},
      };

      const currentMatch =
        currentGroup.matches[match.id] ??
        ({
          matchId: match.id,
          groupLetter: match.groupLetter,
          homeTeamId: match.homeTeamId,
          awayTeamId: match.awayTeamId,
          homeGoals: "",
          awayGoals: "",
        } as MatchPrediction);

      const updatedMatch: MatchPrediction = {
        ...currentMatch,
        [field]: clean,
      };

      return {
        ...prev,
        [match.groupLetter]: {
          ...currentGroup,
          matches: {
            ...currentGroup.matches,
            [match.id]: updatedMatch,
          },
        },
      };
    });
  }

  function handleGoToStandings(group: WorldCupGroup, matches: GroupMatch[]) {
    const gp = groupsState[group.letter];
    const filled = countFilledMatches(matches, gp);

    if (filled < matches.length) {
      alert(
        `Preencha todos os ${matches.length} jogos do ${group.name} antes de definir 1º e 2º lugar.`
      );
      return;
    }

    setModalStep("STANDINGS");
    const current = groupsState[group.letter];
    setTempFirst(current?.firstPlaceId ?? "");
    setTempSecond(current?.secondPlaceId ?? "");
  }

  function handleSaveStandings(group: WorldCupGroup) {
    if (!tempFirst || !tempSecond) {
      alert("Escolha quem fica em 1º e 2º lugar.");
      return;
    }
    if (tempFirst === tempSecond) {
      alert("1º e 2º lugar precisam ser seleções diferentes.");
      return;
    }

    setGroupsState((prev) => {
      const currentGroup: GroupPredictions = prev[group.letter] ?? {
        matches: {},
      };

      return {
        ...prev,
        [group.letter]: {
          ...currentGroup,
          firstPlaceId: tempFirst,
          secondPlaceId: tempSecond,
        },
      };
    });

    closeModal();
  }

  function handleAvancarChaveamento() {
    const output = WORLD_CUP_2026_GROUPS.map((g) => {
      const gp = groupsState[g.letter];
      return {
        group: g.letter,
        first: gp?.firstPlaceId,
        second: gp?.secondPlaceId,
        matches: gp?.matches ?? {},
      };
    });

    console.log("Fase de grupos concluída. Estado para chaveamento:", output);
    alert(
      "MVP: Fase de grupos concluída! No próximo passo vamos montar a chave do mata-mata com base nesses resultados."
    );
  }

  return (
    <div className="min-h-screen relative text-slate-50">
      {/* Fundo de estádio */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/bg/stadium-2026.jpg"
          alt="Estádio da Copa do Mundo 2026"
          fill
          priority
          className="object-cover"
        />
        {/* Overlay para contraste */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-slate-950/90 to-black/95" />
      </div>

      {/* Conteúdo principal */}
      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* HEADER COM SELO COPA */}
        <header className="mb-6 border-b border-slate-800/70 pb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="neutral">🏆 Copa do Mundo 2026</Badge>
              <Badge variant="outline">Bolão Copa 2026</Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold drop-shadow-[0_0_18px_rgba(0,0,0,0.7)]">
              Meus palpites – Fase de grupos
            </h1>
            <p className="text-sm text-slate-200/85 mt-2 max-w-2xl">
              Clique em um grupo para preencher os placares. Depois escolha
              quem passa em 1º e 2º lugar. Quando todos os grupos estiverem
              completos, você avança para montar o chaveamento do mata-mata.
            </p>
          </div>
        </header>

        {/* PROGRESSO */}
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-100/90">
            Grupos concluídos:{" "}
            <span className="font-semibold text-emerald-400">
              {
                WORLD_CUP_2026_GROUPS.filter((g) => {
                  const gp = groupsState[g.letter];
                  const matches = generateMatchesForGroup(g);
                  return (
                    gp?.firstPlaceId &&
                    gp?.secondPlaceId &&
                    countFilledMatches(matches, gp) === matches.length
                  );
                }).length
              }
              /{totalGroups}
            </span>
          </p>
          {allGroupsDone && (
            <button
              type="button"
              onClick={handleAvancarChaveamento}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-sm font-semibold shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-colors"
            >
              Avançar para chaveamento
            </button>
          )}
        </div>

        {/* GRID DE GRUPOS – CARA “TV FIFA” */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {groupsWithMatches.map(({ group, matches }) => {
            const gp = groupsState[group.letter];
            const filled = countFilledMatches(matches, gp);
            const doneStandings = !!gp?.firstPlaceId && !!gp?.secondPlaceId;

            return (
              <button
                key={group.letter}
                type="button"
                onClick={() => openGroupMatches(group.letter)}
                className="
                  relative group
                  rounded-2xl
                  border border-slate-700/80
                  bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-black/90
                  hover:from-slate-900 hover:via-slate-950 hover:to-black
                  px-5 py-4
                  text-left
                  shadow-xl shadow-black/60
                  transition-transform transition-colors
                  hover:-translate-y-0.5
                  min-h-[210px]
                  flex flex-col
                  backdrop-blur-sm
                "
              >
                {/* Brilho lateral suave */}
                <div className="pointer-events-none absolute -left-px top-6 h-12 w-[2px] bg-gradient-to-b from-emerald-400/60 via-emerald-300/10 to-transparent opacity-80" />

                {/* Cabeçalho do card */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Grupo
                    </span>
                    <span className="text-xl font-bold text-slate-50">
                      {group.letter}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline">Fase de grupos</Badge>
                    <span className="text-[11px] text-slate-400">
                      {matches.length} jogos
                    </span>
                  </div>
                </div>

                {/* Lista de seleções */}
                <div className="space-y-2 flex-1">
                  {group.teams.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {t.flagSrc && (
                          <div className="relative w-7 h-4 overflow-hidden rounded-[3px] border border-slate-800 bg-slate-900">
                            <Image
                              src={t.flagSrc}
                              alt={t.name}
                              fill
                              sizes="28px"
                              className="object-cover"
                            />
                          </div>
                        )}
                        <span className="text-xs sm:text-[13px] text-slate-100 truncate">
                          {t.name}
                        </span>
                      </div>
                      {t.isPlayoff && (
                        <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/30 whitespace-nowrap">
                          repescagem
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Rodapé do card */}
                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-300">
                    Placar:{" "}
                    <span className="font-semibold text-slate-50">
                      {filled}/{matches.length}
                    </span>
                  </span>
                  <span className="text-slate-300">
                    1º e 2º:{" "}
                    {doneStandings ? (
                      <span className="text-emerald-400 font-semibold">
                        definido
                      </span>
                    ) : (
                      <span className="text-slate-500">pendente</span>
                    )}
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Clique para editar palpites do grupo</span>
                  <span className="text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                    Abrir grupo →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* MODAL */}
      {openGroup && (
        <GroupModal
          group={WORLD_CUP_2026_GROUPS.find(
            (g) => g.letter === openGroup
          )!}
          matches={generateMatchesForGroup(
            WORLD_CUP_2026_GROUPS.find((g) => g.letter === openGroup)!
          )}
          groupState={groupsState[openGroup]}
          modalStep={modalStep}
          tempFirst={tempFirst}
          tempSecond={tempSecond}
          onChangeScore={handleScoreChange}
          onClose={closeModal}
          onGoToStandings={handleGoToStandings}
          onSaveStandings={handleSaveStandings}
          setTempFirst={setTempFirst}
          setTempSecond={setTempSecond}
        />
      )}
    </div>
  );
}

// ===== MODAL =====

type GroupModalProps = {
  group: WorldCupGroup;
  matches: GroupMatch[];
  groupState?: GroupPredictions;
  modalStep: "MATCHES" | "STANDINGS";
  tempFirst: string;
  tempSecond: string;
  onChangeScore: (
    match: GroupMatch,
    field: "homeGoals" | "awayGoals",
    value: string
  ) => void;
  onClose: () => void;
  onGoToStandings: (group: WorldCupGroup, matches: GroupMatch[]) => void;
  onSaveStandings: (group: WorldCupGroup) => void;
  setTempFirst: (v: string) => void;
  setTempSecond: (v: string) => void;
};

function GroupModal(props: GroupModalProps) {
  const {
    group,
    matches,
    groupState,
    modalStep,
    tempFirst,
    tempSecond,
    onChangeScore,
    onClose,
    onGoToStandings,
    onSaveStandings,
    setTempFirst,
    setTempSecond,
  } = props;

  const filled = countFilledMatches(matches, groupState);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center px-4">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl shadow-black/70 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/90">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="neutral">🏆 Copa 2026</Badge>
              <Badge variant="outline">Grupo {group.letter}</Badge>
            </div>
            <p className="text-[11px] text-slate-400">
              {group.teams.map((t) => t.name).join(" · ")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 text-sm"
          >
            Fechar ✕
          </button>
        </div>

        {/* STEPPER */}
        <div className="px-5 py-2 flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                modalStep === "MATCHES"
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-slate-700 text-slate-100"
              }`}
            >
              1
            </span>
            <span
              className={
                modalStep === "MATCHES"
                  ? "text-slate-100 font-semibold"
                  : "text-slate-400"
              }
            >
              Placar dos jogos
            </span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                modalStep === "STANDINGS"
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-slate-700 text-slate-100"
              }`}
            >
              2
            </span>
            <span
              className={
                modalStep === "STANDINGS"
                  ? "text-slate-100 font-semibold"
                  : "text-slate-400"
              }
            >
              Escolher 1º e 2º lugar
            </span>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto border-t border-slate-800">
          {modalStep === "MATCHES" && (
            <div className="divide-y divide-slate-800">
              {matches.map((match) => {
                const p =
                  groupState?.matches[match.id] ??
                  ({
                    matchId: match.id,
                    groupLetter: match.groupLetter,
                    homeTeamId: match.homeTeamId,
                    awayTeamId: match.awayTeamId,
                    homeGoals: "",
                    awayGoals: "",
                  } as MatchPrediction);

                return (
                  <div
                    key={match.id}
                    className="px-5 py-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between bg-slate-900/40"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {match.homeTeamName}{" "}
                        <span className="text-slate-500">x</span>{" "}
                        {match.awayTeamName}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Data e horário oficiais ainda serão definidos.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 md:mt-0">
                      <input
                        type="number"
                        min={0}
                        inputMode="numeric"
                        className="w-12 h-9 rounded-md bg-slate-900 border border-slate-700 text-center text-sm outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-400"
                        value={p.homeGoals}
                        onChange={(e) =>
                          onChangeScore(
                            match,
                            "homeGoals",
                            e.target.value
                          )
                        }
                      />
                      <span className="text-slate-500 text-sm">x</span>
                      <input
                        type="number"
                        min={0}
                        inputMode="numeric"
                        className="w-12 h-9 rounded-md bg-slate-900 border border-slate-700 text-center text-sm outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-400"
                        value={p.awayGoals}
                        onChange={(e) =>
                          onChangeScore(
                            match,
                            "awayGoals",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {modalStep === "STANDINGS" && (
            <div className="px-5 py-4">
              <p className="text-sm text-slate-200 mb-3">
                Escolha quem fica em{" "}
                <span className="font-semibold">1º</span> e{" "}
                <span className="font-semibold">2º</span> lugar do grupo.
                No MVP você decide manualmente; depois podemos automatizar
                com base em pontos, saldo e gols.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    1º lugar
                  </label>
                  <select
                    className="w-full h-10 rounded-md bg-slate-900 border border-slate-700 text-sm px-3 outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-400"
                    value={tempFirst}
                    onChange={(e) => setTempFirst(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {group.teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    2º lugar
                  </label>
                  <select
                    className="w-full h-10 rounded-md bg-slate-900 border border-slate-700 text-sm px-3 outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-400"
                    value={tempSecond}
                    onChange={(e) => setTempSecond(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {group.teams.map((t) => (
                      <option
                        key={t.id}
                        value={t.id}
                        disabled={t.id === tempFirst}
                      >
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Jogos preenchidos:{" "}
            <span className="font-semibold text-slate-100">
              {filled}/{matches.length}
            </span>
          </span>

          <div className="flex items-center gap-2">
            {modalStep === "MATCHES" && (
              <button
                type="button"
                onClick={() => onGoToStandings(group, matches)}
                className="px-4 py-1.5 rounded-md bg-emerald-500 text-slate-950 text-xs font-semibold hover:bg-emerald-400 transition-colors"
              >
                Continuar para 1º e 2º
              </button>
            )}
            {modalStep === "STANDINGS" && (
              <button
                type="button"
                onClick={() => onSaveStandings(group)}
                className="px-4 py-1.5 rounded-md bg-emerald-500 text-slate-950 text-xs font-semibold hover:bg-emerald-400 transition-colors"
              >
                Salvar grupo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
