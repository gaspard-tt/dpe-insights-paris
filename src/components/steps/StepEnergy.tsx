import type { FormData, EnergySource } from "@/lib/types";
import { HelpCircle, Zap, Flame, Droplets, Leaf, Shuffle } from "lucide-react";

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

const StepEnergy = ({ data, onChange }: Props) => {
  const energySources: { value: EnergySource; label: string; icon: React.ElementType; desc: string }[] = [
    { value: "electricity", label: "Électricité", icon: Zap, desc: "Énergie la plus courante, facteur de conversion élevé" },
    { value: "gas", label: "Gaz naturel", icon: Flame, desc: "Moins cher que l'électricité pour le chauffage" },
    { value: "fuel", label: "Fioul", icon: Droplets, desc: "Énergie fossile, en voie d'interdiction" },
    { value: "renewable", label: "Énergies renouvelables", icon: Leaf, desc: "Bois, solaire, géothermie..." },
    { value: "hybrid", label: "Mixte / Hybride", icon: Shuffle, desc: "Combinaison de plusieurs sources" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-1 font-serif text-lg font-semibold text-foreground">
          Source d'énergie principale
        </h3>
        <HelperText>
          Le type d'énergie influence le DPE de deux façons : par son coût et par son facteur de conversion en énergie primaire.
          L'électricité a un facteur de 2.3 (elle consomme 2.3 kWh primaires pour 1 kWh livré), ce qui pénalise les logements tout-électrique dans le calcul DPE.
        </HelperText>
        <div className="mt-4 grid gap-3">
          {energySources.map((e) => {
            const Icon = e.icon;
            return (
              <button
                key={e.value}
                type="button"
                onClick={() => onChange({ energySource: e.value })}
                className={`flex items-start gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all ${
                  data.energySource === e.value
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
                }`}
              >
                <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  data.energySource === e.value ? "hero-gradient" : "bg-muted"
                }`}>
                  <Icon className={`h-5 w-5 ${
                    data.energySource === e.value ? "text-primary-foreground" : "text-muted-foreground"
                  }`} />
                </div>
                <div>
                  <span className={`text-sm font-semibold ${
                    data.energySource === e.value ? "text-primary" : "text-foreground"
                  }`}>
                    {e.label}
                  </span>
                  <p className="mt-0.5 text-xs text-muted-foreground">{e.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepEnergy;
