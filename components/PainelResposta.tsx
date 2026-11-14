"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useAnimate } from "motion/react";
import { ERROS } from "@/lib/config";
import type { Parada } from "@/lib/tipos";

type Props = {
  aberto: boolean;
  parada: Parada;
  fase: number;
  aoFechar: () => void;
  aoConferir: (resposta: string) => Promise<boolean>;
};

export default function PainelResposta(props: Props) {
  return (
    <AnimatePresence>
      {props.aberto && <Conteudo key={props.fase} {...props} />}
    </AnimatePresence>
  );
}

function Conteudo({ parada, aoFechar, aoConferir }: Props) {
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<{ msg: string; n: number } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [escopo, animar] = useAnimate();
  const ultimoErro = useRef(-1);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    let certo = false;
    let msg: string;
    try {
      certo = await aoConferir(texto);
      let k = Math.floor(Math.random() * ERROS.length);
      if (k === ultimoErro.current) k = (k + 1) % ERROS.length;
      ultimoErro.current = k;
      msg = ERROS[k];
    } catch {
      msg = "Sem sinal no mar... tenta de novo.";
    }
    if (certo) return;
    setEnviando(false);
    setErro((v) => ({ msg, n: (v?.n ?? 0) + 1 }));
    navigator.vibrate?.([70, 40, 70]);
    animar(
      escopo.current,
      { x: [0, -14, 12, -9, 7, -3, 0] },
      { duration: 0.45, ease: "easeOut" },
    );
  }

  return (
    <>
      <motion.div
        className="fixed inset-0 z-40 bg-[#1b0f05]/55 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => !enviando && aoFechar()}
      />
      <motion.div
        className="papel fixed inset-x-0 bottom-0 z-50 rounded-t-[28px] px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-20px_50px_rgba(0,0,0,0.4)]"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 90 && !enviando) aoFechar();
        }}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-tinta/30" />
        <p className="text-[11px] font-bold tracking-[0.25em] text-tinta/60 uppercase">
          Você está em
        </p>
        <h3 className="font-pirata text-3xl leading-tight text-tinta">{parada.nome}</h3>
        <p className="mt-1 text-sm text-tinta/75 italic">
          Digite a resposta da próxima pista para revelar o próximo bar.
        </p>

        <form onSubmit={enviar} className="mt-4">
          <div ref={escopo}>
            <input
              autoFocus
              value={texto}
              onChange={(e) => {
                setTexto(e.target.value);
                if (erro) setErro(null);
              }}
              placeholder="Escreva a resposta..."
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
              disabled={enviando}
              className="w-full rounded-xl border-2 border-tinta/50 bg-[#fff8e6]/80 px-4 py-3.5 text-center font-pirata text-2xl tracking-wide text-tinta placeholder:text-tinta/35 outline-none focus:border-sangue transition-colors"
            />
          </div>

          <div className="h-9 pt-2 text-center">
            <AnimatePresence mode="wait">
              {erro && (
                <motion.p
                  key={erro.n}
                  initial={{ opacity: 0, y: -6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[17px] text-sangue italic"
                >
                  {erro.msg}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={enviando || !texto.trim()}
            className="mt-1 flex w-full items-center justify-center gap-3 rounded-xl bg-lacre py-4 font-pirata text-2xl text-papel shadow-[0_5px_0_#4d1308] transition-all active:translate-y-1 active:shadow-none disabled:opacity-60"
          >
            {enviando ? (
              <motion.span
                className="inline-block"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                ✦
              </motion.span>
            ) : (
              "Conferir"
            )}
          </button>
        </form>
      </motion.div>
    </>
  );
}
