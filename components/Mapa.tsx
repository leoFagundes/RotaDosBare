"use client";

import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import {
  CENTRO_MEEPLE,
  CONTEUDO,
  MEEPLE,
  PONTOS,
  ROTULOS,
  TRECHOS,
  mistura,
  suave,
  type Cam,
  type Pt,
} from "@/lib/meeple";
import MapaFundo from "./MapaFundo";

export type MapaHandle = {
  /** Câmera vai até a parada i (zoom). */
  focar: (i: number, ms?: number) => Promise<void>;
  /** Desenha o trecho i (parada i → i+1) com o meeplezinho pulando e a câmera seguindo. */
  desenhar: (i: number, fecharMeeple?: boolean) => Promise<void>;
  /** Carimba o X na parada i (tremida + poeira). */
  carimbar: (i: number) => Promise<void>;
  /** Câmera volta para o mapa inteiro. */
  recuar: (ms?: number) => Promise<void>;
};

type Props = {
  ref?: Ref<MapaHandle>;
  /** Quantos trechos já estão desenhados. */
  trechos: number;
  /** Rótulos das paradas já reveladas. */
  rotulos: string[];
  /** Parada com o X ao montar (null = nenhuma). */
  xInicial: number | null;
  concluido: boolean;
  /** Espaço (px) coberto pelo topo e pelo cartão, para o meeple caber no meio. */
  margemTopo: number;
  margemBase: number;
};

type Geo = { W: number; H: number; s: number; cy: number; base: Cam };

const reduzido = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const esperar = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function tween(ms: number, aCada: (t: number) => void) {
  return new Promise<void>((resolve) => {
    if (reduzido()) ms = Math.min(ms, 200);
    const inicio = performance.now();
    const quadro = (agora: number) => {
      const t = Math.min(1, (agora - inicio) / ms);
      aCada(t);
      if (t < 1) requestAnimationFrame(quadro);
      else resolve();
    };
    requestAnimationFrame(quadro);
  });
}

const vb = (c: Cam) => `${c.x} ${c.y} ${c.w} ${c.h}`;

export default function Mapa({
  ref,
  trechos,
  rotulos,
  xInicial,
  concluido,
  margemTopo,
  margemBase,
}: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const palco = useRef<HTMLDivElement>(null);
  const cam = useRef<Cam>({ ...CONTEUDO });
  const geo = useRef<Geo>({ W: 1, H: 1, s: 1, cy: 0, base: { ...CONTEUDO } });
  const animando = useRef(false);
  const mascaras = useRef<(SVGPathElement | null)[]>([]);
  const medidas = useRef<(SVGPathElement | null)[]>([]);
  const viajante = useRef<SVGGElement>(null);
  const tinta = useRef<SVGCircleElement>(null);
  const contorno = useRef<SVGPathElement>(null);
  const [x, setX] = useState<{ i: number; n: number } | null>(
    xInicial === null ? null : { i: xInicial, n: 0 },
  );
  /** Área do mundo visível entre o topo e o cartão (para posicionar a decoração). */
  const [visivel, setVisivel] = useState<{ base: Cam; util: Cam } | null>(null);

  const aplicarCam = (c: Cam) => {
    cam.current = c;
    svg.current?.setAttribute("viewBox", vb(c));
  };

  // A câmera se adapta ao tamanho da tela: o meeple sempre cabe entre o topo e o cartão.
  useEffect(() => {
    const el = palco.current;
    if (!el) return;
    const medir = () => {
      const W = el.clientWidth || 1;
      const H = el.clientHeight || 1;
      const util = Math.max(120, H - margemTopo - margemBase);
      const s = Math.min(W / CONTEUDO.w, util / CONTEUDO.h);
      const cy = margemTopo + util / 2;
      const cx = CONTEUDO.x + CONTEUDO.w / 2;
      const cyMundo = CONTEUDO.y + CONTEUDO.h / 2;
      const base = { x: cx - W / (2 * s), y: cyMundo - cy / s, w: W / s, h: H / s };
      geo.current = { W, H, s, cy, base };
      if (!animando.current) aplicarCam(base);
      setVisivel({
        base,
        util: { x: base.x, y: cyMundo - util / (2 * s), w: W / s, h: util / s },
      });
    };
    // O ResizeObserver já dispara uma vez assim que começa a observar.
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [margemTopo, margemBase]);

  const foco = (p: Pt, zoom: number): Cam => {
    const { W, H, s, cy } = geo.current;
    const z = s * zoom;
    return { x: p.x - W / (2 * z), y: p.y - cy / z, w: W / z, h: H / z };
  };

  /** O alvo pode ser uma função: assim, se a tela mudar no meio do caminho, a câmera acompanha. */
  const moverCam = async (alvo: Cam | (() => Cam), ms: number) => {
    animando.current = true;
    const de = { ...cam.current };
    const pegar = typeof alvo === "function" ? alvo : () => alvo;
    await tween(ms, (t) => aplicarCam(mistura(de, pegar(), suave(t))));
  };

  useImperativeHandle(ref, () => ({
    focar: (i, ms = 900) => moverCam(foco(PONTOS[i], 2.3), ms),
    async recuar(ms = 1100) {
      await moverCam(() => geo.current.base, ms);
      animando.current = false;
      aplicarCam(geo.current.base);
    },

    async desenhar(i, fecharMeeple = false) {
      const indices = fecharMeeple ? [i, TRECHOS.length - 1] : [i];
      const passos = indices.map((indice) => {
        const medida = medidas.current[indice];
        const mascara = mascaras.current[indice];
        if (!medida || !mascara) return null;
        return { medida, mascara, comprimento: medida.getTotalLength() };
      });
      if (passos.some((passo) => !passo)) return;

      setX(null);
      const zoom = fecharMeeple || i === TRECHOS.length - 1 ? 1.5 : 2.1;
      await moverCam(foco(PONTOS[i], zoom), 800);

      const segmentos = passos.filter((passo) => passo !== null);
      const comprimentoTotal = segmentos.reduce((total, passo) => total + passo.comprimento, 0);
      const ms = Math.max(1500, Math.min(3600, comprimentoTotal * 10));
      const g = viajante.current;
      segmentos.forEach(({ medida }) => {
        medida.style.opacity = "1";
      });
      g?.setAttribute("opacity", "1");
      let ultimo = performance.now();

      await tween(ms, (t) => {
        const agora = performance.now();
        const dt = Math.min(64, agora - ultimo);
        ultimo = agora;
        const e = suave(t);
        const distancia = comprimentoTotal * e;
        let distanciaRestante = distancia;
        let pontoAtual: Pt | null = null;
        let fasePercorrida = 0;
        let localizouPonto = false;

        for (const { medida, mascara, comprimento } of segmentos) {
          const percorrido = Math.min(comprimento, Math.max(0, distanciaRestante));
          const progresso = percorrido / comprimento;
          mascara.style.strokeDashoffset = String(1 - progresso);
          if (!localizouPonto && distanciaRestante <= comprimento) {
            pontoAtual = medida.getPointAtLength(percorrido);
            fasePercorrida += percorrido;
            localizouPonto = true;
          } else if (!localizouPonto) {
            fasePercorrida += comprimento;
          }
          distanciaRestante = Math.max(0, distanciaRestante - comprimento);
        }

        const p = pontoAtual;
        if (!p) return;
        // O meeplezinho anda "pulando", como uma peça movida no tabuleiro.
        const fase = (fasePercorrida * Math.PI) / 26;
        const pulo = Math.abs(Math.sin(fase)) * 9;
        g?.setAttribute(
          "transform",
          `translate(${p.x} ${p.y - pulo}) rotate(${Math.sin(fase) * 8})`,
        );
        // A câmera persegue a ponta da trilha, suavemente.
        const k = 1 - Math.pow(0.002, dt / 1000);
        aplicarCam(mistura(cam.current, foco(p, zoom), k));
      });

      g?.setAttribute("opacity", "0");
      segmentos.forEach(({ mascara }) => {
        mascara.style.strokeDashoffset = "0";
      });
    },

    async carimbar(i) {
      setX((v) => ({ i, n: (v?.n ?? 0) + 1 }));
      await esperar(260);
      navigator.vibrate?.(40);
      palco.current?.animate(
        [
          { transform: "translate(0,0)" },
          { transform: "translate(-6px,4px)" },
          { transform: "translate(5px,-3px)" },
          { transform: "translate(-3px,2px)" },
          { transform: "translate(0,0)" },
        ],
        { duration: 320, easing: "ease-out" },
      );
      await esperar(600);
    },

  }));

  return (
    <div ref={palco} className="absolute inset-0">
      <svg
        ref={svg}
        viewBox={vb(CONTEUDO)}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
        aria-label="Mapa do tesouro"
      >
        <defs>
          {TRECHOS.map((d, i) => (
            <mask
              key={i}
              id={`m${i}`}
              maskUnits="userSpaceOnUse"
              x={-400}
              y={-400}
              width={1400}
              height={1200}
            >
              <path
                ref={(el) => {
                  mascaras.current[i] = el;
                }}
                d={d}
                pathLength={1}
                fill="none"
                stroke="#fff"
                strokeWidth={16}
                strokeDasharray="1 1"
                style={{ strokeDashoffset: i < trechos ? 0 : 1 }}
              />
            </mask>
          ))}
          <clipPath id="forma">
            <path d={MEEPLE} />
          </clipPath>
        </defs>

        {visivel && <MapaFundo base={visivel.base} util={visivel.util} />}

        {/* Meeple final: tinta azul se espalhando a partir do centro */}
        <g clipPath="url(#forma)">
          <circle
            ref={tinta}
            cx={CENTRO_MEEPLE.x}
            cy={CENTRO_MEEPLE.y}
            r={concluido ? 260 : 0}
            fill="#000"
          />
        </g>
        <path
          ref={contorno}
          d={MEEPLE}
          fill="none"
          stroke="#000"
          strokeWidth={7}
          strokeLinejoin="round"
          opacity={concluido ? 1 : 0}
        />

        {/* Trilha tracejada */}
        <g
          fill="none"
          stroke="#5e3a17"
          strokeWidth={3.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="8 7"
        >
          {TRECHOS.map((d, i) => (
            <path
              key={i}
              ref={(el) => {
                medidas.current[i] = el;
              }}
              d={d}
              mask={`url(#m${i})`}
              style={{ opacity: i < trechos ? 1 : 0 }}
            />
          ))}
        </g>

        {/* Paradas reveladas */}
        {rotulos.map((nome, i) => {
          const p = PONTOS[i];
          const r = ROTULOS[i];
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={6} fill="#5e3a17" className="parada-ponto" />
              <circle cx={p.x} cy={p.y} r={2.4} fill="#f3e2bd" className="parada-ponto" />
              <text x={p.x + r.dx} y={p.y + r.dy} textAnchor={r.ancora} className="parada-rotulo">
                {nome}
              </text>
            </g>
          );
        })}

        {/* X marca o local */}
        {x && <MarcaX key={`${x.i}-${x.n}`} i={x.i} />}

        {/* Meeplezinho viajante */}
        <g ref={viajante} opacity={0} style={{ pointerEvents: "none" }}>
          <g transform="translate(0 -11) scale(0.075) translate(-258 -190)">
            <path
              d={MEEPLE}
              fill="#000"
              stroke="#000"
              strokeWidth={24}
              strokeLinejoin="round"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}

function MarcaX({ i }: { i: number }) {
  const p = PONTOS[i];
  const s = 13;
  const d = `M${-s},${-s} L${s},${s} M${s},${-s} L${-s},${s}`;
  return (
    <g transform={`translate(${p.x} ${p.y})`} style={{ pointerEvents: "none" }}>
      <circle r={22} className="x-onda" />
      <g className="x-carimbo">
        <path
          d={d}
          stroke="#3b0d08"
          strokeOpacity={0.35}
          strokeWidth={8}
          strokeLinecap="round"
          transform="translate(1.5 2)"
        />
        <path d={d} stroke="#a3201a" strokeWidth={7} strokeLinecap="round" />
      </g>
      {Array.from({ length: 10 }, (_, k) => {
        const a = (k / 10) * Math.PI * 2 + 0.3;
        const dist = 22 + (k % 3) * 8;
        return (
          <circle
            key={k}
            r={2 + (k % 2)}
            className="x-poeira"
            style={
              {
                "--dx": `${Math.cos(a) * dist}px`,
                "--dy": `${Math.sin(a) * dist}px`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </g>
  );
}
