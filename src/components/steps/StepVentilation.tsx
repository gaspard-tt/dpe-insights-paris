import type { FormData, VentilationType, AirLeakage } from "@/lib/types";
import { HelpCircle, Wind } from "lucide-react";

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

const StepVentilation = ({ data, onChange }: Props) => {
  const ventilationTypes: { value: VentilationType; label: string; desc: string; efficiency: string }[] = [
    {
      value: "natural",
      label: "Ventilation naturelle",
      desc: "Pas de système mécanique, aération par les ouvertures",
      efficiency: "Pertes non contrôlées",
    },
    {
      value: "vmc_simple",
      label: "VMC simple flux",
      desc: "Extraction mécanique, entrée d'air passive",
      efficiency: "Standard, pertes modérées",
    },
    {
      value: "vmc_double",
      label: "VMC double flux",
      desc: "Récupère 70-90% de la chaleur de l'air sortant",
      efficiency: "Très performante",
    },
  ];

  const leakageLevels: { value: AirLeakage; label: string; desc: string; emoji: string }[] = [
    { value: "none", label: "Aucune", desc: "Logement bien étanche", emoji: "✅" },
    { value: "slight", label: "Légères", desc: "Quelques courants d'air mineurs", emoji: "🟡" },
    { value: "moderate", label: "Modérées", desc: "Courants d'air notables", emoji: "🟠" },
    { value: "significant", label: "Importantes", desc: "Infiltrations évidentes", emoji: "🔴" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-1 font-serif text-lg font-semibold text-foreground">
          Type de ventilation
        </h3>
        <HelperText>
          La ventilation renouvelle l'air intérieur mais représente 20 à 25% des pertes thermiques.
          Une VMC double flux récupère la chaleur de l'air sortant pour préchauffer l'air entrant.
        </HelperText>
        <div className="mt-4 grid gap-3">
          {ventilationTypes.map((v) => (
            <button
              key={v.value}
              type="button"
              onClick={() => onChange({ ventilationType: v.value })}
              className={`flex items-start gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all ${
                data.ventilationType === v.value
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
              }`}
            >
              <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                data.ventilationType === v.value ? "hero-gradient" : "bg-muted"
              }`}>
                <Wind className={`h-5 w-5 ${
                  data.ventilationType === v.value ? "text-primary-foreground" : "text-muted-foreground"
                }`} />
              </div>
              <div>
                <span className={`text-sm font-semibold ${
                  data.ventilationType === v.value ? "text-primary" : "text-foreground"
                }`}>
                  {v.label}
                </span>
                <p className="mt-0.5 text-xs text-muted-foreground">{v.desc}</p>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  data.ventilationType === v.value
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {v.efficiency}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-1 font-serif text-lg font-semibold text-foreground">
          Fuites d'air perçues
        </h3>
        <HelperText>
          Les infiltrations d'air parasites (autour des fenêtres, portes, prises électriques) peuvent augmenter la consommation de chauffage de 10 à 25%.
          Testez en passant la main autour des fenêtres par temps venteux.
        </HelperText>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {leakageLevels.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => onChange({ airLeakage: l.value })}
              className={`flex items-start gap-3 rounded-lg border-2 px-4 py-3 text-left transition-all ${
                data.airLeakage === l.value
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <span className="text-lg">{l.emoji}</span>
              <div>
                <span className={`text-sm font-semibold ${
                  data.airLeakage === l.value ? "text-primary" : "text-foreground"
                }`}>
                  {l.label}
                </span>
                <p className="text-xs text-muted-foreground">{l.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepVentilation;
