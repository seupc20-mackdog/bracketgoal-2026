'use client';

import React, { useState } from 'react';

type TournamentType = 'worldcup_2026' | 'brasileirao_2026' | 'champions_league' | 'custom';

type AccessType = 'private' | 'public';

interface FriendPoolConfig {
  tournamentType: TournamentType;
  poolName: string;
  numMatches: 5 | 6 | 10;
  filterHours: number;
  maxPlayers: number;
  accessType: AccessType;
  acceptTerms: boolean;
  acceptRecreationalOnly: boolean;
}

const initialConfig: FriendPoolConfig = {
  tournamentType: 'worldcup_2026',
  poolName: 'Bolão entre amigos',
  numMatches: 5,
  filterHours: 24,
  maxPlayers: 10,
  accessType: 'private',
  acceptTerms: false,
  acceptRecreationalOnly: false,
};

export function ModesSection() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<FriendPoolConfig>(initialConfig);
  const totalSteps = 4;

  function openWizard() {
    setConfig(initialConfig);
    setStep(1);
    setIsWizardOpen(true);
  }

  function closeWizard() {
    setIsWizardOpen(false);
  }

  function nextStep() {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    }
  }

  function prevStep() {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  }

  function handleConfirm() {
    if (!config.acceptTerms || !config.acceptRecreationalOnly) {
      alert('Você precisa aceitar os termos e confirmar que o bolão é recreativo.');
      return;
    }

    // Aqui é onde, no futuro, você chamaria a API/checkout.
    console.log('Configuração do bolão entre amigos:', config);

    alert(
      'Bolão configurado com sucesso (MVP). No próximo passo você integra o pagamento e criação real do bolão.'
    );
    setIsWizardOpen(false);
  }

  function setTournamentType(value: TournamentType) {
    setConfig((prev) => ({ ...prev, tournamentType: value }));
  }

  function setNumMatches(value: 5 | 6 | 10) {
    setConfig((prev) => ({ ...prev, numMatches: value }));
  }

  function setMaxPlayers(value: number) {
    if (value < 2) value = 2;
    if (value > 500) value = 500;
    setConfig((prev) => ({ ...prev, maxPlayers: value }));
  }

  function setAccessType(value: AccessType) {
    setConfig((prev) => ({ ...prev, accessType: value }));
  }

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Modos de uso do BracketGoal
          </h2>
          <p className="text-sm text-slate-500">
            Escolha como você quer usar o BracketGoal: com amigos, empresas ou comunidade.
          </p>
        </div>
      </div>

      {/* Cards de modos */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Modo Amigos */}
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 text-2xl">👥</div>
          <h3 className="text-base font-semibold text-slate-900">Modo Amigos</h3>
          <p className="mt-1 text-sm text-slate-600">
            Bolões recreativos para grupos de amigos, família ou colegas. Você paga o
            serviço, cria o bolão e convida quem quiser para participar.
          </p>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            <li>• Escolha campeonato e número de jogos (5, 6 ou 10).</li>
            <li>• Jogos filtrados pelas próximas 24h automaticamente.</li>
            <li>• Defina limite de jogadores e convites via link.</li>
          </ul>

          <div className="mt-4 flex-1" />

          <button
            onClick={openWizard}
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
          >
            Criar bolão entre amigos
          </button>
        </div>

        {/* Modo Empresa */}
        <div className="flex flex-col rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div className="mb-2 text-2xl">👔</div>
          <h3 className="text-base font-semibold text-slate-900">Modo Empresa</h3>
          <p className="mt-1 text-sm text-slate-600">
            Bolões corporativos para engajar times internos com ranking privado, branding
            da empresa e relatórios para RH.
          </p>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            <li>• Ranking por área, diretoria ou filiais.</li>
            <li>• Convite via e-mail corporativo ou link interno.</li>
            <li>• Relatórios para RH e comunicação interna.</li>
          </ul>
          <div className="mt-4 flex-1" />
          <button
            disabled
            className="mt-4 inline-flex cursor-not-allowed items-center justify-center rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-400"
          >
            Em breve
          </button>
        </div>

        {/* Modo Influencer / Streamer */}
        <div className="flex flex-col rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div className="mb-2 text-2xl">📺</div>
          <h3 className="text-base font-semibold text-slate-900">
            Modo Influencer / Streamer
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Bolões para audiência, inscritos e membros, com URL própria e identidade
            visual do criador.
          </p>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            <li>• Link para live, bio, Discord, etc.</li>
            <li>• Ranking apenas da sua comunidade.</li>
            <li>• Integrações com Twitch/YouTube/Discord no roadmap.</li>
          </ul>
          <div className="mt-4 flex-1" />
          <button
            disabled
            className="mt-4 inline-flex cursor-not-allowed items-center justify-center rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-400"
          >
            Em breve
          </button>
        </div>
      </div>

      {/* Modal / Wizard Modo Amigos */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
            {/* Cabeçalho */}
            <div className="border-b border-slate-200 px-5 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Criar bolão entre amigos
                  </h2>
                  <p className="text-xs text-slate-500">
                    Passo {step} de {totalSteps}
                  </p>
                </div>
                <button
                  onClick={closeWizard}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Fechar"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="max-h-[60vh] overflow-y-auto px-5 py-4 text-sm text-slate-800">
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-900">
                    1. Tipo de bolão
                  </h3>
                  <p className="text-xs text-slate-500">
                    Escolha o campeonato e dê um nome para o seu bolão. No MVP, vamos
                    pré-configurar as regras a partir desta escolha.
                  </p>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700">
                      Campeonato / torneio
                    </label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setTournamentType('worldcup_2026')}
                        className={`rounded-lg border px-3 py-2 text-xs text-left ${
                          config.tournamentType === 'worldcup_2026'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                            : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className="block font-semibold">Copa do Mundo 2026</span>
                        <span className="block text-[11px] text-slate-500">
                          Ideal para fase de grupos e mata-mata.
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTournamentType('brasileirao_2026')}
                        className={`rounded-lg border px-3 py-2 text-xs text-left ${
                          config.tournamentType === 'brasileirao_2026'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                            : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className="block font-semibold">
                          Campeonato Brasileiro 2026
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          Usa sempre a próxima rodada como base.
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTournamentType('champions_league')}
                        className={`rounded-lg border px-3 py-2 text-xs text-left ${
                          config.tournamentType === 'champions_league'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                            : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className="block font-semibold">Champions League</span>
                        <span className="block text-[11px] text-slate-500">
                          Ideal para fases eliminatórias.
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTournamentType('custom')}
                        className={`rounded-lg border px-3 py-2 text-xs text-left ${
                          config.tournamentType === 'custom'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                            : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className="block font-semibold">Outro torneio</span>
                        <span className="block text-[11px] text-slate-500">
                          Futuras ligas e campeonatos personalizados.
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      Nome do bolão
                    </label>
                    <input
                      type="text"
                      value={config.poolName}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, poolName: e.target.value }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-emerald-500 focus:border-emerald-400 focus:ring-1"
                      placeholder="Ex.: Bolão da Firma 2026, Família na Copa, etc."
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-900">
                    2. Estrutura de jogos
                  </h3>
                  <p className="text-xs text-slate-500">
                    Defina quantos jogos farão parte do seu bolão. O sistema irá buscar
                    automaticamente partidas que começam nas próximas {config.filterHours}{' '}
                    horas, usando a próxima rodada do campeonato escolhido.
                  </p>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700">
                      Quantidade de jogos por bolão
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[5, 6, 10].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setNumMatches(n as 5 | 6 | 10)}
                          className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                            config.numMatches === n
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                              : 'border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-slate-50'
                          }`}
                        >
                          {n} jogos
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      Janela de início dos jogos
                    </label>
                    <input
                      type="number"
                      min={6}
                      max={72}
                      value={config.filterHours}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          filterHours: Number(e.target.value) || 24,
                        }))
                      }
                      className="w-28 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none ring-emerald-500 focus:border-emerald-400 focus:ring-1"
                    />
                    <p className="mt-1 text-[11px] text-slate-500">
                      Ex.: 24 horas significa que só entram jogos que começam até 24h
                      depois da criação do bolão.
                    </p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-900">
                    3. Jogadores e acesso
                  </h3>
                  <p className="text-xs text-slate-500">
                    Defina quantas pessoas podem participar e se o bolão será privado
                    (apenas quem tem o link) ou público (qualquer pessoa com o link
                    durante o MVP ainda funciona como um bolão fechado).
                  </p>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      Número máximo de jogadores
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={500}
                      value={config.maxPlayers}
                      onChange={(e) => setMaxPlayers(Number(e.target.value) || 10)}
                      className="w-32 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none ring-emerald-500 focus:border-emerald-400 focus:ring-1"
                    />
                    <p className="mt-1 text-[11px] text-slate-500">
                      Você poderá convidar via link, e-mail ou outros canais na próxima
                      etapa do produto.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700">
                      Tipo de acesso
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setAccessType('private')}
                        className={`rounded-lg border px-3 py-2 text-xs text-left ${
                          config.accessType === 'private'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                            : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className="block font-semibold">Privado</span>
                        <span className="block text-[11px] text-slate-500">
                          Apenas quem recebe o link/convite consegue entrar.
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAccessType('public')}
                        className={`rounded-lg border px-3 py-2 text-xs text-left ${
                          config.accessType === 'public'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                            : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className="block font-semibold">Público</span>
                        <span className="block text-[11px] text-slate-500">
                          Qualquer pessoa com o link pode participar (ideal para criadores).
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-900">
                    4. Resumo e termos
                  </h3>
                  <p className="text-xs text-slate-500">
                    Confira se está tudo certo antes de avançar para o pagamento do
                    serviço na próxima etapa do produto.
                  </p>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">Resumo</span>
                    </div>
                    <dl className="mt-2 space-y-1">
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Nome do bolão</dt>
                        <dd className="font-medium text-slate-900">{config.poolName}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Campeonato</dt>
                        <dd className="font-medium text-slate-900">
                          {config.tournamentType === 'worldcup_2026' && 'Copa do Mundo 2026'}
                          {config.tournamentType === 'brasileirao_2026' &&
                            'Campeonato Brasileiro 2026'}
                          {config.tournamentType === 'champions_league' &&
                            'Champions League'}
                          {config.tournamentType === 'custom' && 'Outro torneio'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Jogos no bolão</dt>
                        <dd className="font-medium text-slate-900">
                          {config.numMatches} jogos
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Janela de início</dt>
                        <dd className="font-medium text-slate-900">
                          Até {config.filterHours}h após criação
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Máx. jogadores</dt>
                        <dd className="font-medium text-slate-900">
                          {config.maxPlayers} participantes
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Acesso</dt>
                        <dd className="font-medium text-slate-900">
                          {config.accessType === 'private' ? 'Privado' : 'Público'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="space-y-2 text-xs text-slate-700">
                    <label className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        className="mt-[2px]"
                        checked={config.acceptTerms}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            acceptTerms: e.target.checked,
                          }))
                        }
                      />
                      <span>
                        Declaro que li e concordo com os Termos de Uso e condições do
                        serviço BracketGoal.
                      </span>
                    </label>

                    <label className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        className="mt-[2px]"
                        checked={config.acceptRecreationalOnly}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            acceptRecreationalOnly: e.target.checked,
                          }))
                        }
                      />
                      <span>
                        Confirmo que este bolão é exclusivamente recreativo, sem
                        enquadramento como casa de apostas ou operação de jogo.
                      </span>
                    </label>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    No próximo passo do desenvolvimento, esta confirmação levará para a
                    tela de pagamento (Pix, cartão, etc.), e após a confirmação você
                    receberá os links de convite para seus amigos.
                  </p>
                </div>
              )}
            </div>

            {/* Rodapé (botões) */}
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
              <button
                onClick={step === 1 ? closeWizard : prevStep}
                className="text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                {step === 1 ? 'Cancelar' : 'Voltar'}
              </button>

              <div className="flex items-center gap-2">
                {step < totalSteps && (
                  <button
                    onClick={nextStep}
                    className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-800"
                  >
                    Continuar
                  </button>
                )}

                {step === totalSteps && (
                  <button
                    onClick={handleConfirm}
                    className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-800"
                  >
                    Confirmar e criar bolão (MVP)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
