"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { TEXTOS } from "@/lib/config";
import Letreiro from "./Letreiro";

/** Pergaminho inicial: a primeira resposta libera a entrada no mapa. */
export default function Intro({
  aoConferir,
  aoIniciar,
}: {
  aoConferir: (resposta: string) => Promise<boolean>;
  aoIniciar: () => void;
}) {
  const [saindo, setSaindo] = useState(false);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim() || enviando || saindo) return;

    setEnviando(true);
    setErro(null);
    try {
      if (await aoConferir(texto)) setSaindo(true);
      else setErro("Resposta incorreta. Confira a pista e tente novamente.");
    } catch {
      setErro("Não foi possível conferir agora. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

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

            <form onSubmit={enviar} className="mt-7 w-full text-left">
              <label
                htmlFor="primeira-resposta"
                className="block text-center text-sm text-tinta/75 italic"
              >
                Digite a resposta do primeiro enigma para abrir o mapa
              </label>
              <input
                id="primeira-resposta"
                value={texto}
                onChange={(e) => {
                  setTexto(e.target.value);
                  if (erro) setErro(null);
                }}
                autoFocus
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                disabled={enviando || saindo}
                placeholder="Sua resposta..."
                className="mt-3 w-full rounded-xl border-2 border-tinta/50 bg-[#fff8e6]/80 px-4 py-3.5 text-center font-pirata text-2xl tracking-wide text-tinta placeholder:text-tinta/35 outline-none transition-colors focus:border-sangue"
              />
              <div className="h-9 pt-2 text-center" aria-live="polite">
                {erro && <p className="text-sm text-sangue italic">{erro}</p>}
              </div>
              <motion.button
                type="submit"
                disabled={enviando || saindo || !texto.trim()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.97 }}
                transition={{ delay: 3.4, type: "spring", stiffness: 220, damping: 13 }}
                className="w-full rounded-xl bg-lacre py-4 font-pirata text-2xl text-papel shadow-[0_5px_0_#4d1308] transition-all active:translate-y-1 active:shadow-none disabled:opacity-60"
              >
                {enviando ? "Conferindo..." : TEXTOS.botaoIniciar}
              </motion.button>
            </form>
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
