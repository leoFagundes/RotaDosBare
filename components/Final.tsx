"use client";

import { motion } from "motion/react";
import Confete from "./Confete";
import Letreiro from "./Letreiro";
import { TEXTOS } from "@/lib/config";
import { MEEPLE } from "@/lib/meeple";
import type { Parada } from "@/lib/tipos";

export default function Final({
  paradas,
  destino,
  aoFechar,
}: {
  paradas: Parada[];
  destino?: Parada;
  aoFechar: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-y-auto bg-[radial-gradient(circle_at_50%_30%,rgba(255,240,200,0.97),rgba(233,206,150,0.98)_70%)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Confete />
      <div className="relative mx-auto flex min-h-full max-w-md flex-col items-center px-6 pt-[max(2.5rem,env(safe-area-inset-top))] pb-10 text-center">
        {/* Erick  [meeple]  Diandra */}
        <div className="-mx-3 grid w-[calc(100%+1.5rem)] grid-cols-[1fr_auto_1fr] items-center gap-1">
          <Nome texto={TEXTOS.nomeEsquerda} lado="esquerda" inicio={1.0} />

          <motion.svg
            viewBox="80 0 356 345"
            className="h-36 w-36 drop-shadow-[0_14px_20px_rgba(59,13,8,0.35)]"
            initial={{ scale: 0, rotate: -25, y: 40 }}
            animate={{ scale: 1, rotate: 0, y: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 11, delay: 0.2 }}
          >
            <motion.g
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut", delay: 1.4 }}
            >
              <path d={MEEPLE} fill="#b8281c" stroke="#3b0d08" strokeWidth={12} strokeLinejoin="round" />
              <path
                d="M200 70 C210 45 230 35 250 34"
                stroke="#fff"
                strokeOpacity={0.4}
                strokeWidth={10}
                strokeLinecap="round"
                fill="none"
              />
            </motion.g>
          </motion.svg>

          <Nome texto={TEXTOS.nomeDireita} lado="direita" inicio={1.45} />
        </div>

        <h1 className="mt-6 font-pirata text-6xl leading-none text-tinta">
          <Letreiro
            texto={TEXTOS.finalTitulo}
            inicio={2.1}
            passo={0.05}
            de={{ opacity: 0, y: 30, scale: 0.4 }}
            transicao={{ type: "spring", stiffness: 300, damping: 14 }}
          />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.8, duration: 0.8 }}
          className="mt-4 text-xl leading-snug text-tinta/90 italic"
        >
          {TEXTOS.finalTexto}
        </motion.p>

        {destino && (
          <motion.section
            initial={{ opacity: 0, y: 40, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 3.4, type: "spring", stiffness: 200, damping: 18 }}
            className="mt-6 w-full rounded-2xl border-2 border-dashed border-tinta-clara/70 bg-[#fbf0d6]/95 p-4 text-left shadow-[0_14px_30px_rgba(60,30,5,0.3)]"
          >
            <p className="text-[11px] font-bold tracking-[0.25em] text-tinta/60 uppercase">
              Última parada
            </p>
            <h2 className="mt-1 font-pirata text-[2rem] leading-none text-tinta">{destino.nome}</h2>
            <p className="mt-1 text-[15px] text-tinta/80 italic">{destino.endereco}</p>
            <a
              href={destino.maps}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block rounded-xl bg-lacre py-3.5 text-center font-pirata text-xl text-papel shadow-[0_4px_0_#4d1308] transition-all active:translate-y-1 active:shadow-none"
            >
              Ver no Maps
            </a>
          </motion.section>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4 }}
          className="mt-9 text-[11px] font-bold tracking-[0.25em] text-tinta/60 uppercase"
        >
          A rota de hoje
        </motion.p>
        <motion.ol
          className="mt-2 w-full space-y-1.5 text-left"
          initial="h"
          animate="s"
          transition={{ staggerChildren: 0.08, delayChildren: 4.1 }}
        >
          {paradas.map((p, i) => (
            <motion.li
              key={i}
              variants={{ h: { opacity: 0, x: -20 }, s: { opacity: 1, x: 0 } }}
              className="flex items-baseline gap-3 border-b border-dashed border-tinta/25 pb-1.5"
            >
              <span className="font-pirata text-lg text-sangue">{i + 1}</span>
              <span className="font-pirata text-xl text-tinta">{p.nome}</span>
              <span className="ml-auto text-sm text-tinta/60 italic">{p.endereco}</span>
            </motion.li>
          ))}
        </motion.ol>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 5 }}
          className="mt-6 font-pirata text-2xl text-tinta/80"
        >
          {TEXTOS.finalAssinatura}
        </motion.p>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 5.3 }}
          onClick={aoFechar}
          className="mt-6 rounded-xl border-2 border-tinta/60 px-6 py-3 font-pirata text-lg text-tinta"
        >
          Ver o mapa
        </motion.button>
      </div>
    </motion.div>
  );
}

/** Nome que chega do lado do meeple, letra por letra, com um floreio de tinta por baixo. */
function Nome({
  texto,
  lado,
  inicio,
}: {
  texto: string;
  lado: "esquerda" | "direita";
  inicio: number;
}) {
  const esq = lado === "esquerda";
  const letras = Array.from(texto);
  return (
    <motion.div
      className={`flex flex-col ${esq ? "items-end" : "items-start"}`}
      animate={{ y: [0, esq ? -4 : 4, 0] }}
      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: inicio + 1.5 }}
    >
      <span
        className="font-pirata text-[1.8rem] leading-none whitespace-nowrap text-tinta"
        aria-label={texto}
      >
        {letras.map((l, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="inline-block"
            initial={{ opacity: 0, x: esq ? -24 : 24, y: -10, rotate: esq ? -20 : 20, filter: "blur(3px)" }}
            animate={{ opacity: 1, x: 0, y: 0, rotate: 0, filter: "blur(0px)" }}
            transition={{ delay: inicio + i * 0.07, type: "spring", stiffness: 280, damping: 15 }}
          >
            {l}
          </motion.span>
        ))}
      </span>
      <svg viewBox="0 0 100 16" className={`mt-1 w-24 ${esq ? "" : "-scale-x-100"}`}>
        <motion.path
          d="M4 10 Q 40 2 70 8 T 98 6"
          fill="none"
          stroke="#a3201a"
          strokeWidth={2.4}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: inicio + letras.length * 0.07, duration: 0.7, ease: "easeInOut" }}
        />
      </svg>
    </motion.div>
  );
}
