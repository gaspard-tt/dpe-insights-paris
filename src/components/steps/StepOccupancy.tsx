import type { FormData, UsageLevel } from "@/lib/types";
import { HelpCircle } from "lucide-react";

interface Props {
  data: FormData;
  onChange: (updates: Partial<FormData>) => void;
}

const HelperText = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
    <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
    <span>{children}</span>
  </div>
);

const OptionRow = ({
  selected,
  label,
  desc,
  onClick,
}: {
  selected: boolean;
  label: string;
  desc?: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full border px-4 py-3 text-left transition ${
      selected
        ? "border-primary bg-primary/5"
        : "border-border hover:border-primary/40"
    }`}
  >
    <div className="flex items-start gap-3">
      <div
        className={`mt-1 h-3 w-3 rounded-full border ${
          selected ? "bg-primary border-primary" : "border-muted-foreground"
        }`}
      />
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        {desc && <div className="text-xs text-muted-foreground">{desc}</div>}
      </div>
    </div>
  </button>
);

const StepOccupancy = ({ data, onChange }: Props) => {
  return (
    <div className="space-y-8">
      {/* Occupants */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">
          Nombre d’occupants
        </h3>
        <HelperText>
          Le nombre d’occupants influence l’eau chaude, la ventilation et les apports de chaleur internes.
        </HelperText>

        {[1, 2, 3, 4, 5].map((n) => (
          <OptionRow
            key={n}
            selected={data.occupants === n}
            label={`${n} personne${n > 1 ? "s" : ""}`}
            onClick={() => onChange({ occupants: n })}
          />
        ))}
        <OptionRow
          selected={data.occupants === 6}
          label="6 personnes ou plus"
          onClick={() => onChange({ occupants: 6 })}
        />
        <OptionRow
          selected={!data.occupants}
          label="Je ne sais pas"
          desc="Nous utiliserons une estimation moyenne"
          onClick={() => onChange({ occupants: undefined })}
        />
      </div>

      {/* Heating habits */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">
          Habitudes de chauffage
        </h3>
        <HelperText>
          Chaque degré en plus augmente la consommation d’environ 7%.
        </HelperText>

        <OptionRow
          selected={data.heatingHabits === "low"}
          label="Faible — ~18°C, pièces fermées"
          onClick={() => onChange({ heatingHabits: "low" })}
        />
        <OptionRow
          selected={data.heatingHabits === "average"}
          label="Moyen — 19-20°C, confort standard"
          onClick={() => onChange({ heatingHabits: "average" })}
        />
        <OptionRow
          selected={data.heatingHabits === "high"}
          label="Élevé — 21°C+, toutes pièces chauffées"
          onClick={() => onChange({ heatingHabits: "high" })}
        />
        <OptionRow
          selected={!data.heatingHabits}
          label="Je ne sais pas"
          desc="Nous utiliserons une estimation moyenne"
          onClick={() => onChange({ heatingHabits: undefined })}
        />
      </div>

      {/* Hot water */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">
          Consommation d’eau chaude
        </h3>
        <HelperText>
          Les bains consomment 3 à 5 fois plus que les douches.
        </HelperText>

        <OptionRow
          selected={data.hotWaterUsage === "low"}
          label="Faible — douches courtes, peu fréquentes"
          onClick={() => onChange({ hotWaterUsage: "low" })}
        />
        <OptionRow
          selected={data.hotWaterUsage === "average"}
          label="Moyen — douches quotidiennes"
          onClick={() => onChange({ hotWaterUsage: "average" })}
        />
        <OptionRow
          selected={data.hotWaterUsage === "high"}
          label="Élevé — bains fréquents, longs"
          onClick={() => onChange({ hotWaterUsage: "high" })}
        />
        <OptionRow
          selected={!data.hotWaterUsage}
          label="Je ne sais pas"
          desc="Nous utiliserons une estimation moyenne"
          onClick={() => onChange({ hotWaterUsage: undefined })}
        />
      </div>
    </div>
  );
};

export default StepOccupancy;
