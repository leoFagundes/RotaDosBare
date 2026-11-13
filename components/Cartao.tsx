"use client";

import { motion } from "motion/react";
import type { Parada } from "@/lib/tipos";

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

export default function Cartao({
  parada,
  primeira,
  aoResponder,
}: {
  parada: Parada;
  primeira: boolean;
  aoResponder: () => void;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 90, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      exit={{ opacity: 0, y: 90, rotate: 2, transition: { duration: 0.3 } }}
      transition={{ type: "spring", stiffness: 210, damping: 22 }}
      className="relative mb-1 rounded-2xl border-2 border-dashed border-tinta-clara/70 bg-[#fbf0d6]/95 p-4 shadow-[0_14px_30px_rgba(60,30,5,0.35)]"
    >
      <motion.div
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.07, delayChildren: 0.15 }}
        className="flex flex-col"
      >
        <motion.p
          variants={item}
          className="text-[11px] font-bold tracking-[0.25em] text-tinta/60 uppercase"
        >
          {primeira ? "O mapa começa aqui" : "Próxima parada"}
        </motion.p>
        <motion.h2 variants={item} className="mt-1 font-pirata text-[2rem] leading-none text-tinta">
          {parada.nome}
        </motion.h2>
        <motion.p variants={item} className="mt-1 text-[15px] text-tinta/80 italic">
          {parada.endereco}
        </motion.p>
        {parada.petisco && (
          <motion.p variants={item} className="text-[15px] text-tinta/80">
            <span className="font-pirata tracking-wide text-sangue">Pedida da casa:</span>{" "}
            {parada.petisco}
          </motion.p>
        )}

        <motion.div variants={item} className="mt-4 grid grid-cols-2 gap-2.5">
          <a
            href={parada.maps}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-tinta/70 py-3 font-pirata text-lg text-tinta active:scale-95 transition-transform"
          >
            <Bussola /> Ver no Maps
          </a>
          <button
            onClick={aoResponder}
            className="rounded-xl bg-lacre py-3 font-pirata text-lg text-papel shadow-[0_4px_0_#4d1308] active:translate-y-1 active:shadow-none transition-all"
          >
            Responder
          </button>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

function Bussola() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M15.5 8.5 13.4 13.4 8.5 15.5 10.6 10.6Z" fill="currentColor" fillOpacity={0.3} />
    </svg>
  );
}
