"use client";

import { useEffect, useRef } from "react";

type Peca = {
  x: number; y: number; vx: number; vy: number;
  r: number; giro: number; vg: number; tipo: 0 | 1; cor: string; vida: number;
};

const CORES = ["#f6c85a", "#e9a92f", "#3f93c8", "#a3201a", "#f3e2bd"];

/** Explosão de moedas de ouro e papeizinhos num canvas (leve e fluido no celular). */
export default function Confete() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = window.innerWidth;
    const H = window.innerHeight;
    cv.width = W * dpr;
    cv.height = H * dpr;
    ctx.scale(dpr, dpr);

    const pecas: Peca[] = [];
    const rajada = (n: number, ox: number, oy: number) => {
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
        const v = 7 + Math.random() * 9;
        pecas.push({
          x: ox, y: oy,
          vx: Math.cos(a) * v, vy: Math.sin(a) * v,
          r: 5 + Math.random() * 6,
          giro: Math.random() * 6, vg: (Math.random() - 0.5) * 0.4,
          tipo: Math.random() < 0.45 ? 0 : 1,
          cor: CORES[(Math.random() * CORES.length) | 0],
          vida: 1,
        });
      }
    };
    rajada(90, W / 2, H * 0.55);
    const t2 = setTimeout(() => rajada(60, W * 0.15, H), 350);
    const t3 = setTimeout(() => rajada(60, W * 0.85, H), 650);

    let raf = 0;
    const inicio = performance.now();
    const quadro = (agora: number) => {
      ctx.clearRect(0, 0, W, H);
      const velho = agora - inicio > 5000;
      for (const p of pecas) {
        p.vy += 0.28;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.giro += p.vg;
        if (velho) p.vida -= 0.02;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.vida);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.giro);
        if (p.tipo === 0) {
          // moeda girando: elipse que "achata"
          const sx = Math.abs(Math.cos(p.giro * 2)) * 0.9 + 0.1;
          ctx.scale(sx, 1);
          ctx.beginPath();
          ctx.arc(0, 0, p.r, 0, Math.PI * 2);
          ctx.fillStyle = "#e9a92f";
          ctx.fill();
          ctx.lineWidth = 1.6;
          ctx.strokeStyle = "#9a6a12";
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, 0, p.r * 0.55, 0, Math.PI * 2);
          ctx.strokeStyle = "#fbe3a0";
          ctx.stroke();
        } else {
          ctx.scale(1, Math.cos(p.giro * 3));
          ctx.fillStyle = p.cor;
          ctx.fillRect(-p.r * 0.6, -p.r * 0.35, p.r * 1.2, p.r * 0.7);
        }
        ctx.restore();
      }
      if (pecas.some((p) => p.vida > 0 && p.y < H + 40)) raf = requestAnimationFrame(quadro);
    };
    raf = requestAnimationFrame(quadro);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[60] h-full w-full" />;
}
