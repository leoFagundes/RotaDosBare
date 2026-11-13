"use client";

import { motion, type TargetAndTransition, type Transition } from "motion/react";

/** Texto que entra letra por letra, sem quebrar palavras no meio. */
export default function Letreiro({
  texto,
  inicio,
  passo,
  de,
  transicao,
}: {
  texto: string;
  inicio: number;
  passo: number;
  de: TargetAndTransition;
  transicao: Transition;
}) {
  let n = 0;
  return texto.split(" ").map((palavra, w) => (
    <span key={w}>
      {w > 0 && " "}
      <span className="inline-block whitespace-nowrap">
        {Array.from(palavra).map((l, i) => {
          const atraso = inicio + n++ * passo;
          return (
            <motion.span
              key={i}
              className="inline-block"
              initial={de}
              animate={{ opacity: 1, y: 0, rotate: 0, scale: 1, filter: "blur(0px)" }}
              transition={{ ...transicao, delay: atraso }}
            >
              {l}
            </motion.span>
          );
        })}
      </span>
    </span>
  ));
}
