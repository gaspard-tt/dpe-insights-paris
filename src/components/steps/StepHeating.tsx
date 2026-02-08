import type { FormData, HeatingType, HeatingAge, DistributionSystem } from "@/lib/types";
import { HelpCircle, Flame, Zap, Leaf, Droplets } from "lucide-react";

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

const StepHeating = ({ data, onChange }: Props) => {
  const heatingTypes: { value: HeatingType; label: string; icon: React.ElementType; desc: string }[] = [
    { value: "electric_convector", label: "Convecteurs électriques", icon: Zap, desc: "Grille-pain, peu efficaces" },
    { value: "electric_radiant", label: "Radiateurs électriques", icon: Zap, desc: "Rayonnants ou à inertie" },
    { value: "gas_boiler", label: "Chaudière gaz classique", icon: Flame, desc: "Standard, bon rendement" },
    { value: "gas_condensing", label: "Chaudière gaz condensation", icon: Flame, desc: "Haut rendement" },
    { value: "fuel_boiler", label: "Chaudière fioul", icon: Droplets, desc: "Énergie fossile polluante" },
    { value: "heat_pump", label: "Pompe à chaleur", icon: Leaf, desc: "Très performante (COP > 3)" },
    { value: "wood", label: "Bois / Granulés", icon: Flame, desc: "Énergie renouvelable" },
  ];

  const heatingAges: { value: HeatingAge; label: string }[] = [
    { value: "less5", label: "Moins de 5 ans" },
    { value: "5to15", label: "5 à 15 ans" },
    { value: "15to25", label: "15 à 25 ans" },
    { value: "more25", label: "Plus de 25 ans" },
  ];

  const distributions: { value: DistributionSystem; label: string; desc: string }[] = [
    { value: "radiators", label: "Radiateurs", desc: "Montée en T° rapide, convection" },
    { value: "floor_heating", label: "Plancher chauffant", desc: "Confort optimal, basse T°" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-1 font-serif text-lg font-semibold text-foreground">
          Type de chauffage principal
        </h3>
        <HelperText>
          Le système de chauffage est le second facteur après l'isolation. Une pompe à chaleur peut diviser par 3 la consommation par rapport à des convecteurs.
        </HelperText>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {heatingTypes.map((h) => {
            const Icon = h.icon;
            return (
              <button
                key={h.value}
                type="button"
                onClick={() => onChange({ heatingType: h.value })}
                className={`flex items-start gap-3 rounded-lg border-2 px-4 py-3 text-left transition-all ${
                  data.heatingType === h.value
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${
                  data.heatingType === h.value ? "text-primary" : "text-muted-foreground"
                }`} />
                <div>
                  <span className={`text-sm font-semibold ${
                    data.heatingType === h.value ? "text-primary" : "text-foreground"
                  }`}>
                    {h.label}
                  </span>
                  <p className="text-xs text-muted-foreground">{h.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-1 font-serif text-lg font-semibold text-foreground">
          Âge du système de chauffage
        </h3>
        <HelperText>
          Un système de chauffage perd en efficacité avec le temps. Un équipement de plus de 15 ans peut consommer 20 à 40% de plus qu'un modèle neuf équivalent.
        </HelperText>
        <div className="mt-3 flex flex-wrap gap-2">
          {heatingAges.map((a) => (
            <button
              key={a.value}
              type="button"
              onClick={() => onChange({ heatingAge: a.value })}
              className={`rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all ${
                data.heatingAge === a.value
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "border-border bg-card text-foreground hover:border-primary/30"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-1 font-serif text-lg font-semibold text-foreground">
          Système de distribution
        </h3>
        <HelperText>
          Le plancher chauffant fonctionne à basse température, ce qui améliore le rendement du système de chauffage et offre un confort supérieur.
        </HelperText>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {distributions.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => onChange({ distributionSystem: d.value })}
              className={`flex flex-col items-center rounded-lg border-2 px-4 py-3 transition-all ${
                data.distributionSystem === d.value
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <span className={`text-sm font-semibold ${
                data.distributionSystem === d.value ? "text-primary" : "text-foreground"
              }`}>
                {d.label}
              </span>
              <span className="mt-0.5 text-xs text-muted-foreground">{d.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepHeating;
