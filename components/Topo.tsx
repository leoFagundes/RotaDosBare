"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { salvar } from "@/lib/progresso";
import { TOTAL_FASES } from "@/lib/tipos";

export default function Topo({ acertos }: { acertos: number }) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fase = Math.min(acertos + 1, TOTAL_FASES);
  const concluido = acertos >= TOTAL_FASES;

  // Segurar o título por 3s permite recomeçar a jornada (escondido de propósito).
  const segurar = () => {
    timer.current = setTimeout(() => {
      if (confirm("Recomeçar a jornada do zero?")) salvar(null);
    }, 3000);
  };
  const soltar = () => timer.current && clearTimeout(timer.current);

  return (
    <header className="relative z-20 flex flex-col items-center gap-2 px-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <motion.p
        key={concluido ? "fim" : fase}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="select-none font-pirata text-lg tracking-[0.2em] text-tinta/80 uppercase"
        onPointerDown={segurar}
        onPointerUp={soltar}
        onPointerLeave={soltar}
        onContextMenu={(e) => e.preventDefault()}
      >
        {concluido ? "Bora jogar!" : `Fase ${fase} de ${TOTAL_FASES}`}
      </motion.p>
      <div className="flex gap-1.5">
        {Array.from({ length: TOTAL_FASES }, (_, i) => {
          const feito = i < acertos;
          const atual = i === acertos;
          return (
            <motion.span
              key={i}
              className="block h-2.5 w-2.5 rounded-full border border-tinta/60"
              initial={false}
              animate={{
                backgroundColor: feito ? "#a3201a" : "rgba(0,0,0,0)",
                scale: atual ? [1, 1.35, 1] : 1,
              }}
              transition={
                atual
                  ? { scale: { duration: 1.6, repeat: Infinity, ease: "easeInOut" } }
                  : { type: "spring", stiffness: 400, damping: 15 }
              }
            />
          );
        })}
      </div>
    </header>
  );
}
