import type { FormData, UsageLevel } from "@/lib/types";
import { HelpCircle, Users, Thermometer, Droplets } from "lucide-react";

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

const UsageLevelSelector = ({
  label,
  value,
  onChange,
  helper,
  icon: Icon,
  descriptions,
}: {
  label: string;
  value: UsageLevel;
  onChange: (v: UsageLevel) => void;
  helper: string;
  icon: React.ElementType;
  descriptions: Record<UsageLevel, string>;
}) => {
  const options: { value: UsageLevel; label: string; emoji: string }[] = [
    { value: "low", label: "Faible", emoji: "🟢" },
    { value: "average", label: "Moyen", emoji: "🟡" },
    { value: "high", label: "Élevé", emoji: "🔴" },
  ];

  return (
    <div>
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="font-serif text-lg font-semibold text-foreground">{label}</h3>
      </div>
      <div className="mt-1">
        <HelperText>{helper}</HelperText>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex flex-col items-center rounded-lg border-2 px-4 py-3 transition-all ${
              value === opt.value
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-primary/30"
            }`}
          >
            <span className="text-lg">{opt.emoji}</span>
            <span className={`text-sm font-semibold ${
              value === opt.value ? "text-primary" : "text-foreground"
            }`}>
              {opt.label}
            </span>
            <span className="mt-0.5 text-center text-xs text-muted-foreground">
              {descriptions[opt.value]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

const StepOccupancy = ({ data, onChange }: Props) => {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-serif text-lg font-semibold text-foreground">
            Nombre d'occupants
          </h3>
        </div>
        <div className="mt-1">
          <HelperText>
            Le nombre d'occupants influence la consommation d'eau chaude, la ventilation nécessaire et les apports de chaleur internes.
          </HelperText>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ occupants: n })}
              className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 text-lg font-bold transition-all ${
                data.occupants === n
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "border-border bg-card text-foreground hover:border-primary/30"
              }`}
            >
              {n}{n === 6 ? "+" : ""}
            </button>
          ))}
        </div>
      </div>

      <UsageLevelSelector
        label="Habitudes de chauffage"
        value={data.heatingHabits}
        onChange={(v) => onChange({ heatingHabits: v })}
        helper="Votre façon de chauffer peut faire varier la consommation de ±20%. La température de consigne est le facteur le plus important : chaque degré en plus = +7% de consommation."
        icon={Thermometer}
        descriptions={{
          low: "18°C, pièces fermées",
          average: "19-20°C, confort standard",
          high: "21°C+, toutes pièces",
        }}
      />

      <UsageLevelSelector
        label="Consommation d'eau chaude"
        value={data.hotWaterUsage}
        onChange={(v) => onChange({ hotWaterUsage: v })}
        helper="L'eau chaude sanitaire représente environ 12% de la consommation totale d'énergie d'un logement. Les bains sont 3 à 5 fois plus consommateurs que les douches."
        icon={Droplets}
        descriptions={{
          low: "Douches courtes, peu fréquentes",
          average: "Douches quotidiennes",
          high: "Bains fréquents, longs",
        }}
      />
    </div>
  );
};

export default StepOccupancy;
