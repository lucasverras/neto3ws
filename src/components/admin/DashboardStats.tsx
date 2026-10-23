import {
  Archive,
  CheckCircle2,
  Clock3,
  EyeOff,
  FileEdit,
  ImageOff,
  Layers,
  Sparkles,
} from "lucide-react";
import type { AdminStats } from "@/lib/admin/types";

interface Tile {
  label: string;
  value: number;
  icon: React.ReactNode;
  /** Destaca o cartão quando há algo pedindo atenção. */
  warn?: boolean;
}

/**
 * O primeiro bloco que o dono vê.
 *
 * Números, não gráficos: a pergunta real é "quantos moldes estão no ar e o
 * que está faltando", e isso cabe em oito contagens.
 */
export function DashboardStats({ stats }: { stats: AdminStats }) {
  const tiles: Tile[] = [
    { label: "Produtos cadastrados", value: stats.total, icon: <Layers size={16} strokeWidth={1.75} /> },
    { label: "Publicados", value: stats.published, icon: <CheckCircle2 size={16} strokeWidth={1.75} /> },
    { label: "Em rascunho", value: stats.draft, icon: <FileEdit size={16} strokeWidth={1.75} /> },
    { label: "Ocultos ou vendidos", value: stats.hiddenOrSold, icon: <EyeOff size={16} strokeWidth={1.75} /> },
    {
      label: "Sem fotografias",
      value: stats.withoutPhotos,
      icon: <ImageOff size={16} strokeWidth={1.75} />,
      warn: stats.withoutPhotos > 0,
    },
    { label: "Com peça produzida", value: stats.withResult, icon: <Sparkles size={16} strokeWidth={1.75} /> },
    { label: "Atualizados nos 7 dias", value: stats.recentlyUpdated, icon: <Clock3 size={16} strokeWidth={1.75} /> },
    { label: "Arquivados", value: stats.archived, icon: <Archive size={16} strokeWidth={1.75} /> },
  ];

  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {tiles.map((tile) => (
        <li
          key={tile.label}
          className={`rounded-2xl border px-4 py-4 ${
            tile.warn
              ? "border-amber-400/35 bg-amber-400/[0.07]"
              : "border-white/10 bg-white/[0.02]"
          }`}
        >
          <span
            aria-hidden
            className={tile.warn ? "text-amber-300" : "text-teal"}
          >
            {tile.icon}
          </span>
          <p className="mt-3 font-display text-3xl font-medium leading-none tracking-tight text-white">
            {tile.value}
          </p>
          <p className="mt-2 font-body text-[12px] leading-snug text-white/45">{tile.label}</p>
        </li>
      ))}
    </ul>
  );
}
