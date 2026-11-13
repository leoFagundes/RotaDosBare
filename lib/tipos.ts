export type Parada = {
  nome: string;
  /** Nome curto escrito no mapa. */
  apelido: string;
  endereco: string;
  petisco?: string;
  maps: string;
};

export type RespostaApi =
  | { ok: false; erro?: string }
  | { ok: true; final: false; proxima: Parada }
  | { ok: true; final: true; destino: Parada };

export const TOTAL_FASES = 9;
