import type { FormData, VentilationType, AirLeakage } from "@/lib/types";
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

const StepVentilation = ({ data, onChange }: Props) => {
  return (
    <div className="space-y-8">
      {/* Ventilation type */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">
          Type de ventilation
        </h3>
        <HelperText>
          La ventilation représente jusqu’à 25% des pertes thermiques. Une VMC double flux récupère la chaleur de l’air sortant.
        </HelperText>

        <OptionRow
          selected={data.ventilationType === "natural"}
          label="Ventilation naturelle"
          desc="Aération par ouverture des fenêtres, pertes non contrôlées"
          onClick={() => onChange({ ventilationType: "natural" })}
        />
        <OptionRow
          selected={data.ventilationType === "vmc_simple"}
          label="VMC simple flux"
          desc="Extraction mécanique, fonctionnement standard"
          onClick={() => onChange({ ventilationType: "vmc_simple" })}
        />
        <OptionRow
          selected={data.ventilationType === "vmc_double"}
          label="VMC double flux"
          desc="Récupération de 70–90% de la chaleur, très performante"
          onClick={() => onChange({ ventilationType: "vmc_double" })}
        />
        <OptionRow
          selected={!data.ventilationType}
          label="Je ne sais pas"
          desc="Nous utiliserons une estimation moyenne"
          onClick={() => onChange({ ventilationType: undefined })}
        />
      </div>

      {/* Air leakage */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">
          Fuites d’air perçues
        </h3>
        <HelperText>
          Les infiltrations d’air peuvent augmenter la consommation de chauffage de 10 à 25%.
        </HelperText>

        <OptionRow
          selected={data.airLeakage === "none"}
          label="Aucune — logement bien étanche"
          onClick={() => onChange({ airLeakage: "none" })}
        />
        <OptionRow
          selected={data.airLeakage === "slight"}
          label="Légères — quelques courants d’air"
          onClick={() => onChange({ airLeakage: "slight" })}
        />
        <OptionRow
          selected={data.airLeakage === "moderate"}
          label="Modérées — courants d’air notables"
          onClick={() => onChange({ airLeakage: "moderate" })}
        />
        <OptionRow
          selected={data.airLeakage === "significant"}
          label="Importantes — infiltrations évidentes"
          onClick={() => onChange({ airLeakage: "significant" })}
        />
        <OptionRow
          selected={!data.airLeakage}
          label="Je ne sais pas"
          desc="Nous utiliserons une estimation moyenne"
          onClick={() => onChange({ airLeakage: undefined })}
        />
      </div>
    </div>
  );
};

export default StepVentilation;
