"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { TEXTOS } from "@/lib/config";
import Letreiro from "./Letreiro";

/** Pergaminho que se desenrola, com o título escrito letra a letra e o lacre para abrir. */
export default function Intro({ aoIniciar }: { aoIniciar: () => void }) {
  const [saindo, setSaindo] = useState(false);

  return (
    <main className="fixed inset-0 flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_40%,#4a2c12,#1b0f05_75%)] px-6">
      <Brasas />

      <motion.div
        className="relative w-full max-w-sm"
        animate={saindo ? { scale: 1.6, opacity: 0, filter: "blur(10px)" } : {}}
        transition={{ duration: 0.75, ease: [0.6, 0, 0.8, 0.3] }}
        onAnimationComplete={() => saindo && aoIniciar()}
      >
        {/* rolo de cima */}
        <Rolo />
        <motion.div
          className="papel relative -my-2 overflow-hidden"
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          transition={{ duration: 1.3, ease: [0.25, 0.9, 0.3, 1], delay: 0.3 }}
        >
          <div className="papel-borda absolute inset-0" />
          <div className="relative flex flex-col items-center px-7 pt-12 pb-10 text-center">
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.6em" }}
              animate={{ opacity: 0.7, letterSpacing: "0.28em" }}
              transition={{ delay: 1.1, duration: 1 }}
              className="text-xs font-bold text-tinta uppercase"
            >
              {TEXTOS.chamada}
            </motion.p>

            <h1 className="mt-4 font-pirata text-[3.4rem] leading-[0.95] text-tinta">
              <Letreiro
                texto={TEXTOS.titulo}
                inicio={1.3}
                passo={0.045}
                de={{ opacity: 0, y: 18, rotate: -12, filter: "blur(4px)" }}
                transicao={{ type: "spring", stiffness: 260, damping: 16 }}
              />
            </h1>

            <motion.svg
              viewBox="0 0 200 20"
              className="mt-4 w-48"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2 }}
            >
              <motion.path
                d="M5 10 Q 50 2 100 10 T 195 10"
                fill="none"
                stroke="#7a522a"
                strokeWidth="1.6"
                strokeDasharray="6 5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 2.2, duration: 1.1, ease: "easeInOut" }}
              />
              <motion.path
                d="M188 4 L198 14 M198 4 L188 14"
                stroke="#a3201a"
                strokeWidth="2.6"
                strokeLinecap="round"
                initial={{ scale: 3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ transformOrigin: "193px 9px" }}
                transition={{ delay: 3.25, type: "spring", stiffness: 400, damping: 12 }}
              />
            </motion.svg>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.7, duration: 0.8 }}
              className="mt-5 text-lg leading-snug text-tinta/85 italic"
            >
              {TEXTOS.promessa}
            </motion.p>

            <motion.button
              onClick={() => setSaindo(true)}
              disabled={saindo}
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              whileTap={{ scale: 0.9 }}
              transition={{ delay: 3.4, type: "spring", stiffness: 220, damping: 13 }}
              className="relative mt-8 flex h-32 w-32 items-center justify-center"
            >
              <motion.span
                className="absolute inset-0 rounded-full bg-sangue/30"
                animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, delay: 4 }}
              />
              <svg viewBox="0 0 200 200" className="absolute inset-0 drop-shadow-[0_8px_10px_rgba(60,10,0,0.5)]">
                <path
                  d="M100 8c13 0 18 10 30 13s24-3 32 7 2 22 8 33 18 16 18 39-12 26-18 37-0 23-8 32-21 4-32 8-17 13-30 13-18-10-30-13-24 3-32-7-2-22-8-33-18-16-18-39 12-26 18-37 0-23 8-32 21-4 32-8 17-13 30-13z"
                  fill="#9b2617"
                />
                <circle cx="100" cy="100" r="62" fill="none" stroke="#6e150a" strokeWidth="4" />
              </svg>
              <span className="relative font-pirata text-[1.35rem] leading-[1.05] text-[#f6dcc0]">
                {TEXTOS.botaoIniciar.split(" ").slice(0, 1)}
                <br />
                {TEXTOS.botaoIniciar.split(" ").slice(1).join(" ")}
              </span>
            </motion.button>
          </div>
        </motion.div>
        <Rolo baixo />
      </motion.div>
    </main>
  );
}

function Rolo({ baixo = false }: { baixo?: boolean }) {
  return (
    <div
      className="relative z-10 mx-[-14px] h-7 rounded-full bg-[linear-gradient(180deg,#c9a466,#8a6534_45%,#5b3d1b)] shadow-[0_6px_12px_rgba(0,0,0,0.45)]"
      data-rolo={baixo ? "baixo" : "cima"}
    >
      <span className="absolute -left-2 top-1/2 h-9 w-4 -translate-y-1/2 rounded-full bg-[#4a2c12]" />
      <span className="absolute -right-2 top-1/2 h-9 w-4 -translate-y-1/2 rounded-full bg-[#4a2c12]" />
    </div>
  );
}

/** Faíscas subindo no fundo, como lampiões de taverna. */
function Brasas() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {Array.from({ length: 18 }, (_, i) => {
        const esquerda = (i * 37) % 100;
        const dur = 6 + (i % 5);
        return (
          <motion.span
            key={i}
            className="absolute bottom-[-10px] block h-1.5 w-1.5 rounded-full bg-[#f6b24a]"
            style={{ left: `${esquerda}%`, boxShadow: "0 0 10px 2px rgba(246,178,74,.6)" }}
            animate={{ y: [0, -900], x: [0, (i % 2 ? 1 : -1) * 40], opacity: [0, 0.9, 0] }}
            transition={{ duration: dur, repeat: Infinity, delay: (i * 0.7) % 6, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}
