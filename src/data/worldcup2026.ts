// src/data/worldcup2026.ts

export type GroupLetter =
  | "A" | "B" | "C" | "D"
  | "E" | "F" | "G" | "H"
  | "I" | "J" | "K" | "L";

export type WorldCupTeam = {
  id: string;           // usado para relacionar com BD e com o nome do arquivo de bandeira
  name: string;
  fifaCode?: string;
  isPlayoff?: boolean;
  flagSrc?: string;     // caminho da bandeira em /public
};

export type WorldCupGroup = {
  letter: GroupLetter;
  name: string; // "Grupo A" etc.
  teams: WorldCupTeam[];
};

export const WORLD_CUP_2026_GROUPS: WorldCupGroup[] = [
  {
    letter: "A",
    name: "Grupo A",
    teams: [
      { id: "mex", name: "México", fifaCode: "MEX", flagSrc: "/flags/mex.svg" },
      { id: "rsa", name: "África do Sul", fifaCode: "RSA", flagSrc: "/flags/rsa.svg" },
      { id: "kor", name: "República da Coreia", fifaCode: "KOR", flagSrc: "/flags/kor.svg" },
      {
        id: "uefa-a",
      name: "Tchéquia / Dinamarca / Macedônia do Norte / Rep. da Irlanda",
      isPlayoff: true,
      flagSrc: "/flags/playoff-europe.svg", //
      },
    ],
  },
  {
    letter: "B",
    name: "Grupo B",
    teams: [
      { id: "can", name: "Canadá", fifaCode: "CAN", flagSrc: "/flags/can.svg" },
      {
        id: "uefa-b",
        name: "Bósnia e Herzegovina / Itália / Irlanda do Norte / País de Gales",
        isPlayoff: true,
      flagSrc: "/flags/playoff-europe.svg", //
      },
      { id: "qat", name: "Catar", fifaCode: "QAT", flagSrc: "/flags/qat.svg" },
      { id: "sui", name: "Suíça", fifaCode: "SUI", flagSrc: "/flags/sui.svg" },
    ],
  },
  {
    letter: "C",
    name: "Grupo C",
    teams: [
      { id: "bra", name: "Brasil", fifaCode: "BRA", flagSrc: "/flags/bra.svg" },
      { id: "mar", name: "Marrocos", fifaCode: "MAR", flagSrc: "/flags/mar.svg" },
      { id: "hti", name: "Haiti", fifaCode: "HAI", flagSrc: "/flags/hti.svg" },
      { id: "sco", name: "Escócia", fifaCode: "SCO", flagSrc: "/flags/sco.svg" },
    ],
  },
  {
    letter: "D",
    name: "Grupo D",
    teams: [
      { id: "usa", name: "Estados Unidos", fifaCode: "USA", flagSrc: "/flags/usa.svg" },
      { id: "par", name: "Paraguai", fifaCode: "PAR", flagSrc: "/flags/par.svg" },
      { id: "aus", name: "Austrália", fifaCode: "AUS", flagSrc: "/flags/aus.svg" },
      {
        id: "uefa-c",
        name: "Kosovo / Romênia / Eslováquia / Turquia",
        isPlayoff: true,
       flagSrc: "/flags/playoff-europe.svg", //
      },
    ],
  },
  {
    letter: "E",
    name: "Grupo E",
    teams: [
      { id: "ger", name: "Alemanha", fifaCode: "GER", flagSrc: "/flags/ger.svg" },
      { id: "cuw", name: "Curaçau", fifaCode: "CUW", flagSrc: "/flags/cuw.svg" },
      { id: "civ", name: "Costa do Marfim", fifaCode: "CIV", flagSrc: "/flags/civ.svg" },
      { id: "ecu", name: "Equador", fifaCode: "ECU", flagSrc: "/flags/ecu.svg" },
    ],
  },
  {
    letter: "F",
    name: "Grupo F",
    teams: [
      { id: "ned", name: "Holanda", fifaCode: "NED", flagSrc: "/flags/ned.svg" },
      { id: "jpn", name: "Japão", fifaCode: "JPN", flagSrc: "/flags/jpn.svg" },
      {
        id: "uefa-d",
        name: "Albânia / Polônia / Suécia / Ucrânia",
        isPlayoff: true,
       flagSrc: "/flags/playoff-europe.svg", //
      },
      { id: "tun", name: "Tunísia", fifaCode: "TUN", flagSrc: "/flags/tun.svg" },
    ],
  },
  {
    letter: "G",
    name: "Grupo G",
    teams: [
      { id: "bel", name: "Bélgica", fifaCode: "BEL", flagSrc: "/flags/bel.svg" },
      { id: "egy", name: "Egito", fifaCode: "EGY", flagSrc: "/flags/egy.svg" },
      { id: "irn", name: "RI do Irã", fifaCode: "IRN", flagSrc: "/flags/irn.svg" },
      { id: "nzl", name: "Nova Zelândia", fifaCode: "NZL", flagSrc: "/flags/nzl.svg" },
    ],
  },
  {
    letter: "H",
    name: "Grupo H",
    teams: [
      { id: "esp", name: "Espanha", fifaCode: "ESP", flagSrc: "/flags/esp.svg" },
      { id: "cpv", name: "Cabo Verde", fifaCode: "CPV", flagSrc: "/flags/cpv.svg" },
      { id: "sau", name: "Arábia Saudita", fifaCode: "KSA", flagSrc: "/flags/sau.svg" },
      { id: "uru", name: "Uruguai", fifaCode: "URU", flagSrc: "/flags/uru.svg" },
    ],
  },
  {
    letter: "I",
    name: "Grupo I",
    teams: [
      { id: "fra", name: "França", fifaCode: "FRA", flagSrc: "/flags/fra.svg" },
      { id: "sen", name: "Senegal", fifaCode: "SEN", flagSrc: "/flags/sen.svg" },
      {
        id: "ic-1",
        name: "Bolívia / Iraque / Suriname",
        isPlayoff: true,
       flagSrc: "/flags/playoff-europe.svg", //
      },
      { id: "nor", name: "Noruega", fifaCode: "NOR", flagSrc: "/flags/nor.svg" },
    ],
  },
  {
    letter: "J",
    name: "Grupo J",
    teams: [
      { id: "arg", name: "Argentina", fifaCode: "ARG", flagSrc: "/flags/arg.svg" },
      { id: "alg", name: "Argélia", fifaCode: "ALG", flagSrc: "/flags/alg.svg" },
      { id: "aut", name: "Áustria", fifaCode: "AUT", flagSrc: "/flags/aut.svg" },
      { id: "jor", name: "Jordânia", fifaCode: "JOR", flagSrc: "/flags/jor.svg" },
    ],
  },
  {
    letter: "K",
    name: "Grupo K",
    teams: [
      { id: "por", name: "Portugal", fifaCode: "POR", flagSrc: "/flags/por.svg" },
      {
        id: "ic-2",
        name: "RD do Congo / Jamaica / Nova Caledônia",
        isPlayoff: true,
       flagSrc: "/flags/playoff-europe.svg", //
      },
      { id: "uzb", name: "Uzbequistão", fifaCode: "UZB", flagSrc: "/flags/uzb.svg" },
      { id: "col", name: "Colômbia", fifaCode: "COL", flagSrc: "/flags/col.svg" },
    ],
  },
  {
    letter: "L",
    name: "Grupo L",
    teams: [
      { id: "eng", name: "Inglaterra", fifaCode: "ENG", flagSrc: "/flags/eng.svg" },
      { id: "cro", name: "Croácia", fifaCode: "CRO", flagSrc: "/flags/cro.svg" },
      { id: "gha", name: "Gana", fifaCode: "GHA", flagSrc: "/flags/gha.svg" },
      { id: "pan", name: "Panamá", fifaCode: "PAN", flagSrc: "/flags/pan.svg" },
    ],
  },
];
