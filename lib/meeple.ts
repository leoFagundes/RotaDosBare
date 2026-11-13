// Geometria do mapa. O contorno do meeple é a própria rota:
// cada parada é um vértice do contorno e cada acerto desenha um trecho.

export type Pt = { x: number; y: number };

export const PONTOS: Pt[] = [
  { x: 118, y: 305 }, // 0 pé esquerdo
  { x: 168, y: 188 }, // 1 axila esquerda
  { x: 101, y: 160 }, // 2 mão esquerda
  { x: 210, y: 92 }, // 3 pescoço esquerdo
  { x: 258, y: 22 }, // 4 topo da cabeça
  { x: 306, y: 92 }, // 5 pescoço direito
  { x: 415, y: 160 }, // 6 mão direita
  { x: 348, y: 188 }, // 7 axila direita
  { x: 398, y: 305 }, // 8 pé direito
];

/** Trecho i vai da parada i até a parada i+1. O trecho 8 fecha o meeple. */
export const TRECHOS: string[] = [
  "M118,305 C131,270 151,230 168,188",
  "M168,188 L136,185 C118,185 101,175 101,160",
  "M101,160 C101,138 165,112 210,92",
  "M210,92 C206,45 226,22 258,22",
  "M258,22 C290,22 310,45 306,92",
  "M306,92 C351,112 415,138 415,160",
  "M415,160 C415,175 398,185 380,185 L348,188",
  "M348,188 C365,230 385,270 398,305",
  "M398,305 C405,322 395,330 380,330 L318,330 C305,330 298,325 292,312 L270,272 C263,260 253,260 246,272 L224,312 C218,325 211,330 198,330 L136,330 C121,330 111,322 118,305",
];

export const MEEPLE =
  "M118,305 C131,270 151,230 168,188 L136,185 C118,185 101,175 101,160 C101,138 165,112 210,92 C206,45 226,22 258,22 C290,22 310,45 306,92 C351,112 415,138 415,160 C415,175 398,185 380,185 L348,188 C365,230 385,270 398,305 C405,322 395,330 380,330 L318,330 C305,330 298,325 292,312 L270,272 C263,260 253,260 246,272 L224,312 C218,325 211,330 198,330 L136,330 C121,330 111,322 118,305 Z";

export const CENTRO_MEEPLE: Pt = { x: 258, y: 190 };

/** Onde o nome de cada parada fica escrito no mapa. */
export const ROTULOS: { dx: number; dy: number; ancora: "start" | "middle" | "end" }[] = [
  { dx: -20, dy: 5, ancora: "end" },
  { dx: -20, dy: 26, ancora: "end" },
  { dx: -20, dy: 5, ancora: "end" },
  { dx: -20, dy: -14, ancora: "end" },
  { dx: 0, dy: -22, ancora: "middle" },
  { dx: 20, dy: -14, ancora: "start" },
  { dx: 20, dy: 5, ancora: "start" },
  { dx: 20, dy: 26, ancora: "start" },
  { dx: 20, dy: 5, ancora: "start" },
];

export type Cam = { x: number; y: number; w: number; h: number };

/** Área que precisa caber na tela: o meeple e os nomes das paradas. */
export const CONTEUDO: Cam = { x: 18, y: -24, w: 484, h: 370 };

export function mistura(a: Cam, b: Cam, t: number): Cam {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    w: a.w + (b.w - a.w) * t,
    h: a.h + (b.h - a.h) * t,
  };
}

export const suave = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
