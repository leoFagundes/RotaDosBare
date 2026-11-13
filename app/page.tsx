import Jornada from "@/components/Jornada";
import { publica } from "@/lib/rota";

export default function Page() {
  // Só a primeira parada vai junto com a página; as próximas vêm do servidor a cada acerto.
  return <Jornada inicial={publica(0)} />;
}
