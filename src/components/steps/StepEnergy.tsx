import type { FormData, EnergySource } from "@/lib/types";
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
  desc: string;
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
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </div>
  </button>
);

const StepEnergy = ({ data, onChange }: Props) => {
  const energySources: {
    value: EnergySource | "unknown";
    label: string;
    desc: string;
  }[] = [
    {
      value: "electricity",
      label: "Électricité",
      desc: "Énergie la plus courante, pénalisée dans le calcul DPE (facteur 2.3).",
    },
    {
      value: "gas",
      label: "Gaz naturel",
      desc: "Moins pénalisant que l’électricité pour le chauffage.",
    },
    {
      value: "fuel",
      label: "Fioul",
      desc: "Énergie fossile en voie d’interdiction, très défavorable au DPE.",
    },
    {
      value: "renewable",
      label: "Énergies renouvelables",
      desc: "Bois, solaire, géothermie… très favorable au DPE.",
    },
    {
      value: "hybrid",
      label: "Mixte / Hybride",
      desc: "Combinaison de plusieurs sources d’énergie.",
    },
    {
      value: "unknown",
      label: "Je ne sais pas",
      desc: "Nous utiliserons la configuration la plus courante pour estimer votre situation.",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Source d’énergie principale du logement
        </h3>
        <HelperText>
          Le type d’énergie influence fortement le DPE, à cause du facteur de
          conversion en énergie primaire utilisé dans le calcul officiel.
        </HelperText>
      </div>

      <div className="space-y-2">
        {energySources.map((e) => (
          <OptionRow
            key={e.value}
            selected={data.energySource === e.value}
            label={e.label}
            desc={e.desc}
            onClick={() =>
              onChange({
                energySource:
                  e.value === "unknown" ? undefined : (e.value as EnergySource),
              })
            }
          />
        ))}
      </div>
    </div>
  );
};

export default StepEnergy;

