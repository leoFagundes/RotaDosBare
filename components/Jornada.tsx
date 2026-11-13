"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import Mapa, { type MapaHandle } from "./Mapa";
import Intro from "./Intro";
import Cartao from "./Cartao";
import PainelResposta from "./PainelResposta";
import Acertou from "./Acertou";
import Final from "./Final";
import Topo from "./Topo";
import Recomecar from "./Recomecar";
import { salvar, useProgresso, type Progresso } from "@/lib/progresso";
import { TOTAL_FASES, type Parada, type RespostaApi } from "@/lib/tipos";

const esperar = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function Jornada({ inicial }: { inicial: Parada }) {
  const salvo = useProgresso();
  const mapa = useRef<MapaHandle>(null);
  const [cartao, setCartao] = useState(true);
  const [painel, setPainel] = useState(false);
  const [acertou, setAcertou] = useState(false);
  const [final, setFinal] = useState(false);
  const [ocupado, setOcupado] = useState(false);

  // ?reset na URL zera a jornada (útil para testar).
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("reset")) {
      salvar(null);
      url.searchParams.delete("reset");
      window.history.replaceState(null, "", url);
    }
  }, []);

  if (salvo === undefined) return <div className="papel fixed inset-0" />;

  const p: Progresso = salvo ?? { iniciado: false, acertos: 0, paradas: [inicial] };
  const concluido = p.acertos >= TOTAL_FASES;
  const destino = p.paradas[Math.min(p.acertos, p.paradas.length - 1)];

  async function iniciar() {
    setCartao(false);
    setOcupado(true);
    flushSync(() => salvar({ ...p, iniciado: true }));
    await esperar(700);
    await mapa.current?.focar(0, 1300);
    await mapa.current?.carimbar(0);
    await esperar(300);
    await mapa.current?.recuar(1200);
    setCartao(true);
    setOcupado(false);
  }

  async function conferir(resposta: string): Promise<boolean> {
    const r = await fetch("/api/resposta", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fase: p.acertos, resposta }),
    });
    const dados = (await r.json()) as RespostaApi;
    if (!dados.ok) return false;

    setOcupado(true);
    setPainel(false);
    setCartao(false);
    navigator.vibrate?.([30, 50, 30]);
    setAcertou(true);
    await esperar(1500);
    setAcertou(false);

    const i = p.acertos;
    await mapa.current?.desenhar(i);

    if (!dados.final) {
      salvar({ ...p, acertos: i + 1, paradas: [...p.paradas, dados.proxima] });
      await mapa.current?.carimbar(i + 1);
      await esperar(250);
      await mapa.current?.recuar();
      setCartao(true);
    } else {
      salvar({ ...p, acertos: TOTAL_FASES, destinoFinal: dados.destino });
      await mapa.current?.recuar(1500);
      await mapa.current?.pintar();
      await esperar(400);
      setFinal(true);
    }
    setOcupado(false);
    return true;
  }

  if (!p.iniciado) return <Intro aoIniciar={iniciar} />;

  const rotulos = p.paradas.slice(0, Math.min(p.acertos + 1, TOTAL_FASES)).map((x) => x.apelido);

  return (
    <motion.main
      className="papel fixed inset-0 flex flex-col overflow-hidden"
      initial={{ opacity: 0, scale: 1.08, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <div className="papel-borda absolute inset-0 z-10" />

      <Mapa
        ref={mapa}
        trechos={p.acertos}
        rotulos={rotulos}
        xInicial={concluido ? null : cartao ? p.acertos : null}
        concluido={concluido}
        margemTopo={96}
        margemBase={concluido ? 130 : 290}
      />

      <div className="absolute inset-x-0 top-0 z-20">
        <Topo acertos={p.acertos} />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
        <AnimatePresence mode="wait">
          {cartao && !concluido && !ocupado && (
            <Cartao
              key={p.acertos}
              parada={destino}
              primeira={p.acertos === 0}
              aoResponder={() => setPainel(true)}
            />
          )}
          {concluido && !final && !ocupado && (
            <motion.button
              key="rever"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              onClick={() => setFinal(true)}
              className="mb-2 w-full rounded-2xl bg-lacre py-4 font-pirata text-2xl text-papel shadow-[0_6px_0_#4d1308]"
            >
              Ver a última parada
            </motion.button>
          )}
        </AnimatePresence>
        <Recomecar visivel={!ocupado} />
      </div>

      <PainelResposta
        aberto={painel}
        parada={destino}
        fase={p.acertos}
        aoFechar={() => setPainel(false)}
        aoConferir={conferir}
      />

      <AnimatePresence>{acertou && <Acertou key="ok" />}</AnimatePresence>
      <AnimatePresence>
        {final && <Final key="fim" paradas={p.paradas} destino={p.destinoFinal} aoFechar={() => setFinal(false)} />}
      </AnimatePresence>
    </motion.main>
  );
}
