// ⚠️ Arquivo só de servidor: contém as respostas e os próximos bares.
// Nunca importe este arquivo em um componente "use client".

import type { Parada } from "./tipos";

type ParadaSecreta = Parada & {
  /** Resposta do enigma feito NESTE bar. Acertar libera a próxima parada. */
  resposta: string;
};

const maps = (q: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export const ROTA: ParadaSecreta[] = [
  {
    nome: "Bitaca da Norte",
    apelido: "Bitaca",
    endereco: "SCLRN 716 · Bloco F, loja 29",
    petisco: "Pastel",
    maps: maps("Bitaca da Norte SCLRN 716 Brasília"),
    resposta: "Bitaca",
  },
  {
    nome: "Bar dos Cunhados",
    apelido: "Cunhados",
    endereco: "CLN 115",
    petisco: "Torresmo",
    maps: maps("Bar dos Cunhados CLN 115 Brasília"),
    resposta: "Cunhados",
  },
  {
    nome: "Ilgiorno Gelato",
    apelido: "Ilgiorno",
    endereco: "CLN 113",
    petisco: "Gelato",
    maps: maps("Ilgiorno Gelato CLN 113 Brasília"),
    resposta: "Ilgiorno",
  },
  {
    nome: "Arena 312 ou Chiquinhos Bar",
    apelido: "Arena 312",
    endereco: "CLN 312 · Bloco A, loja 16",
    petisco: "Isca de frango ou batata com cheddar e bacon",
    maps: maps("Arena 312 CLN 312 Brasília"),
    resposta: "Arena",
  },
  {
    nome: "Bar do Mendes",
    apelido: "Mendes",
    endereco: "CLN 410",
    petisco: "Pastel",
    maps: maps("Bar do Mendes CLN 410 Brasília"),
    resposta: "Mendes",
  },
  {
    nome: "Vale da Lua",
    apelido: "Vale da Lua",
    endereco: "CLN 408",
    petisco: "Carne de sol com mandioca",
    maps: maps("Vale da Lua CLN 408 Brasília"),
    resposta: "Vale da Lua",
  },
  {
    nome: "Buteco do Encontro",
    apelido: "Encontro",
    endereco: "CLN 206 · Bloco C, loja 23",
    petisco: "Pastel",
    maps: maps("Buteco do Encontro CLN 206 Brasília"),
    resposta: "butecodoEncontro",
  },
  {
    nome: "Origen",
    apelido: "Origen",
    endereco: "CLN 203 · Bloco C, loja 37",
    maps: maps("Origen Bar CLN 203 Brasília"),
    resposta: "Origen",
  },
  {
    nome: "Deboche",
    apelido: "Deboche",
    endereco: "CLN 201 · Bloco A",
    maps: maps("Deboche Bar CLN 201 Brasília"),
    resposta: "Deboche",
  },
];

/** Local da jogatina: revelado só depois da última resposta. */
export const DESTINO_FINAL: Parada = {
  nome: "Local da jogatina",
  apelido: "Jogatina",
  endereco: "Casa do Claudio ou do Diego",
  maps: maps("Brasília"),
};

export function publica(i: number): Parada {
  const { nome, apelido, endereco, petisco, maps } = ROTA[i];
  return { nome, apelido, endereco, petisco, maps };
}

export function normalizar(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}
