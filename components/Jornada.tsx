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
  const primeiraResposta = useRef<Parada | null>(null);
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

  const p: Progresso = salvo ?? { iniciado: false, acertos: 0, paradas: [] };
  const concluido = p.acertos >= TOTAL_FASES;
  const destino = p.paradas.at(-1) ?? inicial;

  async function conferirInicio(resposta: string): Promise<boolean> {
    const r = await fetch("/api/resposta", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fase: 0, resposta }),
    });
    const dados = (await r.json()) as RespostaApi;
    if (!dados.ok) return false;
    if (dados.final) throw new Error("Resposta inicial recebeu uma parada final inesperada.");
    primeiraResposta.current = dados.proxima;
    return true;
  }

  async function iniciar() {
    const primeira = primeiraResposta.current;
    if (!primeira) throw new Error("A primeira resposta ainda não foi conferida.");

    setCartao(false);
    setOcupado(true);
    flushSync(() =>
      salvar({ iniciado: true, acertos: 1, paradas: [primeira] }),
    );
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
    await mapa.current?.desenhar(i - 1, dados.final);

    if (!dados.final) {
      salvar({ ...p, acertos: i + 1, paradas: [...p.paradas, dados.proxima] });
      await mapa.current?.carimbar(i);
      await esperar(250);
      await mapa.current?.recuar();
      setCartao(true);
    } else {
      salvar({
        ...p,
        acertos: TOTAL_FASES,
        paradas: [...p.paradas, dados.parada],
        destinoFinal: dados.destino,
      });
      await mapa.current?.recuar(1500);
      setCartao(true);
    }
    setOcupado(false);
    return true;
  }

  if (!p.iniciado) {
    return <Intro aoConferir={conferirInicio} aoIniciar={iniciar} />;
  }

  const rotulos = p.paradas.map((x) => x.apelido);

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
        trechos={concluido ? TOTAL_FASES : Math.max(0, p.paradas.length - 1)}
        rotulos={rotulos}
        xInicial={concluido || !cartao ? null : p.paradas.length - 1}
        concluido={concluido}
        margemTopo={96}
        margemBase={290}
      />

      <div className="absolute inset-x-0 top-0 z-20">
        <Topo acertos={p.acertos} />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
        <AnimatePresence mode="wait">
          {cartao && !ocupado && (
            <Cartao
              key={p.acertos}
              parada={destino}
              primeira={p.paradas.length === 1}
              textoAcao={concluido ? "Ver destino final" : undefined}
              aoResponder={() => (concluido ? setFinal(true) : setPainel(true))}
            />
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
