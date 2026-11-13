"use client";

import type { Cam } from "@/lib/meeple";

// Fundo do mapa: um "continente" no meio (onde o meeple é desenhado),
// mar em cima e embaixo, ilhas, navio, serpente, pássaros, montanhas e florestas.
// Tudo em coordenadas do mundo, então se move junto com a câmera.

const TINTA = "#7a522a";
const MAR = "#4f7c8c";

function aleatorio(semente: number) {
  let s = semente;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** Linha de costa ondulada, de um lado ao outro do mapa. */
function costa(y: number, semente: number) {
  const r = aleatorio(semente);
  const pts: [number, number][] = [];
  for (let x = -160; x <= 680; x += 36) pts.push([x, y + (r() - 0.5) * 22]);
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    d += ` Q${x0},${y0} ${(x0 + x1) / 2},${(y0 + y1) / 2}`;
  }
  return d;
}

/** Contorno irregular de uma ilha. */
function ilha(cx: number, cy: number, raio: number, semente: number) {
  const r = aleatorio(semente);
  const n = 11;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const k = raio * (0.75 + r() * 0.45);
    return [cx + Math.cos(a) * k * 1.35, cy + Math.sin(a) * k] as const;
  });
  let d = "";
  for (let i = 0; i <= n; i++) {
    const [x0, y0] = pts[i % n];
    const [x1, y1] = pts[(i + 1) % n];
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;
    d += i === 0 ? `M${mx},${my}` : ` Q${x0},${y0} ${mx},${my}`;
  }
  return d + "Z";
}

const COSTA_CIMA = costa(-72, 7);
const COSTA_BAIXO = costa(398, 13);

const ILHAS = [
  { x: 330, y: -200, r: 26, s: 3, palmeira: true },
  { x: 404, y: -128, r: 9, s: 5 },
  { x: 178, y: -228, r: 14, s: 9 },
  { x: 120, y: 540, r: 34, s: 11, montanha: true },
  { x: 430, y: 690, r: 24, s: 17, palmeira: true },
  { x: 300, y: 760, r: 10, s: 19 },
];

function ondas(y0: number, y1: number, semente: number) {
  const r = aleatorio(semente);
  const lista: { x: number; y: number; w: number }[] = [];
  let linha = 0;
  for (let y = y0; y <= y1; y += 30, linha++) {
    for (let x = (linha % 2) * 38 - 20; x <= 540; x += 76) {
      const px = x + (r() - 0.5) * 22;
      const py = y + (r() - 0.5) * 10;
      const perto = ILHAS.some((i) => Math.hypot((px - i.x) / 1.35, py - i.y) < i.r + 26);
      if (!perto && r() > 0.25) lista.push({ x: px, y: py, w: r() > 0.5 ? 3 : 2 });
    }
  }
  return lista;
}

const ONDAS = [...ondas(-300, -96, 21), ...ondas(424, 820, 23)];

const MONTANHAS = [
  { x: 26, y: 46, s: 1.1 },
  { x: 56, y: 30, s: 1.4 },
  { x: 92, y: 52, s: 0.9 },
  { x: 120, y: 34, s: 0.7 },
  { x: 426, y: 82, s: 1.0 },
  { x: 456, y: 66, s: 1.3 },
  { x: 488, y: 90, s: 0.8 },
  { x: 140, y: 548, s: 0.9 },
  { x: 112, y: 538, s: 0.7 },
];

const ARVORES = [
  // floresta à esquerda
  [34, 232], [50, 244], [66, 230], [42, 262], [60, 270], [78, 252], [30, 290], [90, 280],
  // floresta à direita
  [432, 236], [450, 226], [468, 240], [486, 230], [440, 266], [460, 274], [478, 260], [494, 290],
  // perto da cabeça
  [146, 30], [160, 40], [352, 22], [368, 32], [384, 20],
  // entre as pernas, ao lado do rio
  [234, 318], [282, 322], [228, 340], [290, 344],
  // embaixo dos pés
  [70, 356], [96, 366], [420, 360], [446, 368], [180, 372], [344, 374],
] as const;

const COLINAS = [
  [20, 330], [470, 322], [150, 128], [372, 132], [210, 380], [306, 384], [30, 196], [490, 190],
] as const;

const PASSAROS = [
  { x: 120, y: -40, d: 0 },
  { x: 136, y: -50, d: 0.4 },
  { x: 380, y: -36, d: 0.2 },
  { x: 396, y: -24, d: 0.7 },
  { x: 250, y: -150, d: 0.1 },
  { x: 266, y: -160, d: 0.5 },
  { x: 60, y: 150, d: 0.3 },
  { x: 470, y: 470, d: 0.6 },
  { x: 486, y: 482, d: 0.9 },
];

export default function MapaFundo({ base, util }: { base: Cam; util: Cam }) {
  const m = 8;
  const esq = util.x + 14;
  const dir = util.x + util.w - 14;
  const cima = util.y + 6;
  const baixo = util.y + util.h - 6;
  const rosa = { x: dir - 26, y: cima + 30 };

  return (
    <g fill="none" stroke={TINTA} strokeLinecap="round" strokeLinejoin="round">
      {/* Mar: leve tom azulado */}
      <path d={`${COSTA_CIMA} L680,-1600 L-160,-1600 Z`} fill={MAR} fillOpacity={0.09} stroke="none" />
      <path d={`${COSTA_BAIXO} L680,1800 L-160,1800 Z`} fill={MAR} fillOpacity={0.09} stroke="none" />

      {/* Linhas de rumo saindo da rosa dos ventos (mapa portulano) */}
      <g stroke={TINTA} strokeWidth={0.5} opacity={0.14}>
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={rosa.x}
              y1={rosa.y}
              x2={rosa.x + Math.cos(a) * 1400}
              y2={rosa.y + Math.sin(a) * 1400}
              strokeDasharray={i % 2 ? "3 5" : undefined}
            />
          );
        })}
      </g>

      {/* Litoral com faixas de água rasa */}
      {[COSTA_CIMA, COSTA_BAIXO].map((d, i) => (
        <g key={i}>
          <path d={d} stroke={MAR} strokeWidth={22} opacity={0.08} />
          <path d={d} stroke={MAR} strokeWidth={11} opacity={0.12} />
          <path d={d} strokeWidth={1.6} opacity={0.55} />
          <path d={d} strokeWidth={0.7} opacity={0.3} transform={`translate(0 ${i ? 7 : -7})`} strokeDasharray="4 4" />
        </g>
      ))}

      {/* Ondas */}
      <g strokeWidth={1.1} opacity={0.35}>
        {ONDAS.map((o, i) => (
          <path
            key={i}
            d={o.w === 3 ? "M0,0 q5,-5 10,0 t10,0 t10,0" : "M0,0 q5,-5 10,0 t10,0"}
            transform={`translate(${o.x} ${o.y})`}
          />
        ))}
      </g>

      {/* Ilhas */}
      {ILHAS.map((il, i) => {
        const d = ilha(il.x, il.y, il.r, il.s);
        return (
          <g key={i}>
            <path d={d} stroke={MAR} strokeWidth={16} opacity={0.1} />
            <path d={d} stroke={MAR} strokeWidth={7} opacity={0.14} />
            <path d={d} fill="#efdcb0" strokeWidth={1.4} opacity={0.85} />
            {il.palmeira && <Palmeira x={il.x - 4} y={il.y + 2} />}
            {il.montanha && <Montanha x={il.x - 18} y={il.y + 6} s={0.8} />}
          </g>
        );
      })}

      {/* Rio descendo entre as pernas até o mar */}
      <path
        d="M258,294 C252,312 268,326 260,344 S250,372 262,400"
        stroke={MAR}
        strokeWidth={4}
        opacity={0.35}
      />
      <path d="M258,294 C252,312 268,326 260,344 S250,372 262,400" strokeWidth={0.8} opacity={0.4} />

      {/* Montanhas, colinas e árvores */}
      {MONTANHAS.map((mt, i) => (
        <Montanha key={i} x={mt.x} y={mt.y} s={mt.s} />
      ))}
      <g strokeWidth={1} opacity={0.35}>
        {COLINAS.map(([x, y], i) => (
          <path key={i} d={`M${x - 12},${y} q12,-10 24,0 M${x + 6},${y - 1} q8,-7 16,0`} />
        ))}
      </g>
      {ARVORES.map(([x, y], i) => (
        <Arvore key={i} x={x} y={y} tipo={i % 3} />
      ))}

      {/* Navios */}
      <Navio x={236} y={-112} />
      <Navio x={360} y={480} espelhar />

      {/* Serpente marinha */}
      <g className="serpente" opacity={0.5} strokeWidth={1.3} transform="translate(214 612)">
        <path d="M0,0 q8,-16 16,0 M22,0 q8,-14 16,0 M44,0 q8,-12 16,0" />
        <path d="M66,0 q6,-20 16,-18 q6,1 4,6 q-4,-2 -6,2" />
        <circle cx={80} cy={-16} r={0.9} fill={TINTA} />
        <path d="M-8,0 h96" strokeWidth={0.6} strokeDasharray="2 4" opacity={0.6} />
      </g>

      {/* Pássaros */}
      <g strokeWidth={1.2} opacity={0.55}>
        {PASSAROS.map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y}) scale(1.5)`}>
            <path
              className="passaro"
              style={{ animationDelay: `${p.d}s` }}
              d="M-7,0 q3.5,-4 7,0 q3.5,-4 7,0"
            />
          </g>
        ))}
      </g>

      {/* Moldura */}
      <rect
        x={base.x + m}
        y={base.y + m}
        width={base.w - 2 * m}
        height={base.h - 2 * m}
        rx={6}
        strokeWidth={1.4}
        opacity={0.45}
      />
      <rect
        x={base.x + m + 6}
        y={base.y + m + 6}
        width={base.w - 2 * m - 12}
        height={base.h - 2 * m - 12}
        rx={4}
        strokeWidth={0.8}
        opacity={0.3}
        strokeDasharray="2 4"
      />

      {/* Rosa dos ventos */}
      <g transform={`translate(${rosa.x} ${rosa.y})`} opacity={0.6}>
        <circle r={27} fill="#f3e2bd" fillOpacity={0.7} strokeWidth={1} />
        <g className="rosa-gira">
          <circle r={20} strokeWidth={0.6} strokeDasharray="1.5 2.5" />
          <path d="M0,-32 L5,0 L0,32 L-5,0 Z" fill={TINTA} fillOpacity={0.35} strokeWidth={0.8} />
          <path d="M-32,0 L0,5 L32,0 L0,-5 Z" fill={TINTA} fillOpacity={0.2} strokeWidth={0.8} />
          <path
            d="M-15,-15 L2,-2 L15,15 L-2,2 Z M15,-15 L2,2 L-15,15 L-2,-2 Z"
            fill={TINTA}
            fillOpacity={0.12}
            strokeWidth={0.5}
          />
          <path d="M0,-32 L5,0 L-5,0 Z" fill="#a3201a" fillOpacity={0.65} stroke="none" />
        </g>
        <text y={-36} textAnchor="middle" className="mapa-letra">
          N
        </text>
      </g>

      {/* Cartucho */}
      <g transform={`translate(${esq + 46} ${cima + 14})`}>
        <path
          d="M-46,-14 h92 q6,0 6,6 v14 q0,6 -6,6 h-92 q-6,0 -6,-6 v-14 q0,-6 6,-6 Z"
          fill="#f3e2bd"
          fillOpacity={0.75}
          strokeWidth={0.9}
          opacity={0.7}
        />
        <text y={1} textAnchor="middle" className="mapa-titulo">
          Asa Norte
        </text>
        <text y={11} textAnchor="middle" className="mapa-sub">
          terras de Brasília
        </text>
      </g>

      {/* Escala */}
      <g transform={`translate(${dir - 64} ${baixo - 4})`} opacity={0.5} strokeWidth={1}>
        <path d="M0,0 h60 M0,-3 v6 M20,-3 v6 M40,-3 v6 M60,-3 v6" />
        <path d="M0,0 h20 M40,0 h20" strokeWidth={3} />
        <text y={-6} x={30} textAnchor="middle" className="mapa-sub">
          1 rodada
        </text>
      </g>
    </g>
  );
}

function Montanha({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={0.5}>
      <path d="M-16,12 L0,-14 L16,12" fill="#f3e2bd" fillOpacity={0.6} strokeWidth={1.3} />
      {/* sombra hachurada do lado direito */}
      <path d="M2,-9 L5,10 M5,-4 L9,11 M8,1 L12,11" strokeWidth={0.7} opacity={0.8} />
      <path d="M-5,-6 L0,-14 L4,-7" strokeWidth={0.8} />
    </g>
  );
}

function Arvore({ x, y, tipo }: { x: number; y: number; tipo: number }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity={0.42} strokeWidth={1}>
      {tipo === 0 ? (
        <path d="M-5,4 L0,-8 L5,4 Z M0,4 v4" fill="#f3e2bd" fillOpacity={0.5} />
      ) : tipo === 1 ? (
        <path d="M0,8 v-6 M-5,0 a5,5 0 1 1 10,0 a5,5 0 0 1 -10,0" fill="#f3e2bd" fillOpacity={0.5} />
      ) : (
        <path d="M-4,1 L0,-9 L4,1 Z M-5,5 L0,-3 L5,5 Z M0,5 v3" fill="#f3e2bd" fillOpacity={0.5} />
      )}
    </g>
  );
}

function Palmeira({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity={0.6} strokeWidth={1}>
      <path d="M0,4 C2,-4 1,-10 4,-16" />
      <path d="M4,-16 q-8,-2 -12,4 M4,-16 q8,-3 12,3 M4,-16 q-3,-7 -9,-8 M4,-16 q5,-7 11,-6" />
    </g>
  );
}

function Navio({ x, y, espelhar = false }: { x: number; y: number; espelhar?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})${espelhar ? " scale(-1 1)" : ""}`}>
      <g className="navio" opacity={0.6} strokeWidth={1.1}>
        <path d="M-16,0 L16,0 L11,7 L-12,7 Z" fill="#e6cc95" />
        <path d="M-2,0 V-24 M8,0 V-16" />
        <path d="M-2,-22 Q8,-16 -2,-6 Z" fill="#f3e2bd" />
        <path d="M8,-15 Q15,-11 8,-4 Z" fill="#f3e2bd" />
        <path d="M-2,-24 l6,2 l-6,2" fill="#a3201a" fillOpacity={0.6} />
        <path d="M-22,10 q5,-4 10,0 t10,0 t10,0 t10,0" strokeWidth={0.8} opacity={0.6} />
      </g>
    </g>
  );
}
