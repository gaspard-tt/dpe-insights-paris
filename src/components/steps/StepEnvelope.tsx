import type { FormData, InsulationQuality, WindowType, Orientation } from "@/lib/types";
import { HelpCircle } from "lucide-react";

interface Props {
  data: FormData;
  onChange: (updates: Partial<FormData>) => void;
}

const HelperText = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-2 rounded-lg bg-secondary/60 p-3 text-xs text-muted-foreground">
    <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
    <span>{children}</span>
  </div>
);

const QualitySelector = ({
  label,
  value,
  onChange,
  helper,
}: {
  label: string;
  value: InsulationQuality;
  onChange: (v: InsulationQuality) => void;
  helper: string;
}) => {
  const options: { value: InsulationQuality; label: string; emoji: string }[] = [
    { value: "none", label: "Aucune", emoji: "🔴" },
    { value: "poor", label: "Faible", emoji: "🟠" },
    { value: "average", label: "Moyenne", emoji: "🟡" },
    { value: "good", label: "Bonne", emoji: "🟢" },
    { value: "excellent", label: "Excellente", emoji: "💚" },
  ];

  return (
    <div>
      <h3 className="mb-1 font-serif text-lg font-semibold text-foreground">{label}</h3>
      <HelperText>{helper}</HelperText>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-1.5 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
              value === opt.value
                ? "border-primary bg-primary/5 text-primary shadow-sm"
                : "border-border bg-card text-foreground hover:border-primary/30"
            }`}
          >
            <span>{opt.emoji}</span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const StepEnvelope = ({ data, onChange }: Props) => {
  const windowTypes: { value: WindowType; label: string; desc: string }[] = [
    { value: "single", label: "Simple vitrage", desc: "Très peu isolant" },
    { value: "double", label: "Double vitrage", desc: "Standard actuel" },
    { value: "triple", label: "Triple vitrage", desc: "Très performant" },
  ];

  const orientations: { value: Orientation; label: string; emoji: string }[] = [
    { value: "north", label: "Nord", emoji: "⬆️" },
    { value: "south", label: "Sud", emoji: "⬇️" },
    { value: "east", label: "Est", emoji: "➡️" },
    { value: "west", label: "Ouest", emoji: "⬅️" },
  ];

  return (
    <div className="space-y-8">
      <QualitySelector
        label="Isolation des murs"
        value={data.wallInsulation}
        onChange={(v) => onChange({ wallInsulation: v })}
        helper="Les murs représentent 20 à 25% des pertes thermiques. Si votre logement a été construit avant 1974, il n'a probablement pas d'isolation murale d'origine."
      />

      <QualitySelector
        label="Isolation de la toiture"
        value={data.roofInsulation}
        onChange={(v) => onChange({ roofInsulation: v })}
        helper="La toiture est le premier poste de déperdition (jusqu'à 30%). Pour un appartement au dernier étage ou une maison, c'est un facteur critique."
      />

      <QualitySelector
        label="Isolation du plancher"
        value={data.floorInsulation}
        onChange={(v) => onChange({ floorInsulation: v })}
        helper="Le plancher bas contribue à 7-10% des pertes. Si vous avez un vide sanitaire ou une cave non isolée, les pertes peuvent être significatives."
      />

      <div>
        <h3 className="mb-1 font-serif text-lg font-semibold text-foreground">Type de vitrage</h3>
        <HelperText>
          Les fenêtres sont responsables de 10 à 15% des pertes thermiques. Le type de vitrage est déterminant pour l'isolation et le confort.
        </HelperText>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {windowTypes.map((w) => (
            <button
              key={w.value}
              type="button"
              onClick={() => onChange({ windowType: w.value })}
              className={`flex flex-col items-center rounded-lg border-2 px-4 py-3 transition-all ${
                data.windowType === w.value
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <span className={`text-sm font-semibold ${
                data.windowType === w.value ? "text-primary" : "text-foreground"
              }`}>
                {w.label}
              </span>
              <span className="mt-0.5 text-xs text-muted-foreground">{w.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-1 font-serif text-lg font-semibold text-foreground">
          Surface vitrée approximative
        </h3>
        <HelperText>
          Une grande surface vitrée apporte des gains solaires en hiver mais augmente les pertes si le vitrage est peu performant.
        </HelperText>
        <div className="mt-3 flex items-center gap-3">
          <input
            type="number"
            value={data.windowSurface}
            onChange={(e) => onChange({ windowSurface: Number(e.target.value) || 0 })}
            min={2}
            max={100}
            className="w-28 rounded-lg border bg-card px-4 py-2.5 text-center text-lg font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <span className="text-sm text-muted-foreground">m² de vitrage</span>
        </div>
      </div>

      <div>
        <h3 className="mb-1 font-serif text-lg font-semibold text-foreground">
          Orientation principale
        </h3>
        <HelperText>
          L'orientation sud permet de bénéficier des apports solaires gratuits en hiver, réduisant les besoins de chauffage.
        </HelperText>
        <div className="mt-3 flex gap-2">
          {orientations.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange({ orientation: o.value })}
              className={`flex flex-1 flex-col items-center rounded-lg border-2 py-3 transition-all ${
                data.orientation === o.value
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <span className="text-xl">{o.emoji}</span>
              <span className={`mt-1 text-sm font-medium ${
                data.orientation === o.value ? "text-primary" : "text-foreground"
              }`}>
                {o.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepEnvelope;
