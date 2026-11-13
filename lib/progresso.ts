"use client";

import { useSyncExternalStore } from "react";
import type { Parada } from "./tipos";

export type Progresso = {
  iniciado: boolean;
  /** Quantas respostas certas (0..9). Também é quantos trechos do meeple estão desenhados. */
  acertos: number;
  /** Paradas já reveladas, na ordem. paradas[acertos] é o destino atual. */
  paradas: Parada[];
  /** Local da jogatina, revelado só depois da última resposta. */
  destinoFinal?: Parada;
};

const CHAVE = "rota-progresso-v1";
const ouvintes = new Set<() => void>();
let bruto: string | null | undefined;
let cache: Progresso | null = null;
// Se o navegador bloquear o localStorage, o progresso vive só na memória.
let memoria: string | null = null;

function ler(): Progresso | null {
  let atual: string | null = null;
  try {
    atual = localStorage.getItem(CHAVE);
  } catch {
    atual = memoria;
  }
  if (atual !== bruto) {
    bruto = atual;
    try {
      cache = atual ? (JSON.parse(atual) as Progresso) : null;
    } catch {
      cache = null;
    }
  }
  return cache;
}

export function salvar(p: Progresso | null) {
  memoria = p ? JSON.stringify(p) : null;
  try {
    if (p) localStorage.setItem(CHAVE, JSON.stringify(p));
    else localStorage.removeItem(CHAVE);
  } catch {}
  bruto = undefined;
  ouvintes.forEach((f) => f());
}

function assinar(f: () => void) {
  ouvintes.add(f);
  const aoMudarStorage = (e: StorageEvent) => e.key === CHAVE && f();
  window.addEventListener("storage", aoMudarStorage);
  return () => {
    ouvintes.delete(f);
    window.removeEventListener("storage", aoMudarStorage);
  };
}

/** undefined = ainda não leu (servidor/hidratação); null = sem progresso salvo. */
export function useProgresso(): Progresso | null | undefined {
  return useSyncExternalStore(assinar, ler, () => undefined);
}
