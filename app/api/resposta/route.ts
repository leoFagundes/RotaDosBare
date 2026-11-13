import { DESTINO_FINAL, ROTA, normalizar, publica } from "@/lib/rota";
import type { RespostaApi } from "@/lib/tipos";

export async function POST(request: Request) {
  let fase: unknown, resposta: unknown;
  try {
    ({ fase, resposta } = await request.json());
  } catch {
    return Response.json({ ok: false, erro: "json" } satisfies RespostaApi, { status: 400 });
  }

  if (
    typeof fase !== "number" ||
    !Number.isInteger(fase) ||
    fase < 0 ||
    fase >= ROTA.length ||
    typeof resposta !== "string"
  ) {
    return Response.json({ ok: false, erro: "fase" } satisfies RespostaApi, { status: 400 });
  }

  if (normalizar(resposta) !== normalizar(ROTA[fase].resposta)) {
    return Response.json({ ok: false } satisfies RespostaApi);
  }

  const corpo: RespostaApi =
    fase === ROTA.length - 1
      ? { ok: true, final: true, destino: DESTINO_FINAL }
      : { ok: true, final: false, proxima: publica(fase + 1) };

  return Response.json(corpo);
}
