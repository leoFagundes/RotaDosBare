"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { salvar } from "@/lib/progresso";

/** Link discreto no canto que zera a jornada (com confirmação no próprio lugar). */
export default function Recomecar({ visivel }: { visivel: boolean }) {
  const [confirmando, setConfirmando] = useState(false);

  return (
    <motion.div
      className="flex h-7 items-center text-[13px] text-tinta/45 italic"
      animate={{ opacity: visivel ? 1 : 0 }}
      style={{ pointerEvents: visivel ? "auto" : "none" }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {confirmando ? (
          <motion.span
            key="c"
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
          >
            <span className="text-tinta/60">Apagar tudo?</span>
            <button className="py-1 text-sangue not-italic" onClick={() => salvar(null)}>
              Sim
            </button>
            <span>·</span>
            <button className="py-1 not-italic" onClick={() => setConfirmando(false)}>
              Não
            </button>
          </motion.span>
        ) : (
          <motion.button
            key="r"
            className="py-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmando(true)}
          >
            Recomeçar
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
