import type {
  FormData,
  HeatingType,
  HeatingAge,
  DistributionSystem,
} from "@/lib/types";
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

const StepHeating = ({ data, onChange }: Props) => {
  return (
    <div className="space-y-8">
      {/* Heating type */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">
          Type de chauffage principal
        </h3>
        <HelperText>
          Le système de chauffage a un impact majeur sur la consommation.
          Une pompe à chaleur peut consommer jusqu’à 3 fois moins que des convecteurs.
        </HelperText>

        <OptionRow
          selected={data.heatingType === "electric_convector"}
          label="Convecteurs électriques (grille-pain)"
          onClick={() => onChange({ heatingType: "electric_convector" })}
        />
        <OptionRow
          selected={data.heatingType === "electric_radiant"}
          label="Radiateurs électriques (inertie / rayonnant)"
          onClick={() => onChange({ heatingType: "electric_radiant" })}
        />
        <OptionRow
          selected={data.heatingType === "gas_boiler"}
          label="Chaudière gaz classique"
          onClick={() => onChange({ heatingType: "gas_boiler" })}
        />
        <OptionRow
          selected={data.heatingType === "gas_condensing"}
          label="Chaudière gaz à condensation"
          onClick={() => onChange({ heatingType: "gas_condensing" })}
        />
        <OptionRow
          selected={data.heatingType === "fuel_boiler"}
          label="Chaudière fioul"
          onClick={() => onChange({ heatingType: "fuel_boiler" })}
        />
        <OptionRow
          selected={data.heatingType === "heat_pump"}
          label="Pompe à chaleur"
          onClick={() => onChange({ heatingType: "heat_pump" })}
        />
        <OptionRow
          selected={data.heatingType === "wood"}
          label="Bois / granulés"
          onClick={() => onChange({ heatingType: "wood" })}
        />
        <OptionRow
          selected={!data.heatingType}
          label="Je ne sais pas"
          desc="Nous utiliserons une estimation moyenne"
          onClick={() => onChange({ heatingType: undefined })}
        />
      </div>

      {/* Heating age */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">
          Âge du système de chauffage
        </h3>
        <HelperText>
          Un système ancien peut consommer 20 à 40% de plus qu’un équipement récent.
        </HelperText>

        <OptionRow
          selected={data.heatingAge === "less5"}
          label="Moins de 5 ans"
          onClick={() => onChange({ heatingAge: "less5" })}
        />
        <OptionRow
          selected={data.heatingAge === "5to15"}
          label="5 à 15 ans"
          onClick={() => onChange({ heatingAge: "5to15" })}
        />
        <OptionRow
          selected={data.heatingAge === "15to25"}
          label="15 à 25 ans"
          onClick={() => onChange({ heatingAge: "15to25" })}
        />
        <OptionRow
          selected={data.heatingAge === "more25"}
          label="Plus de 25 ans"
          onClick={() => onChange({ heatingAge: "more25" })}
        />
        <OptionRow
          selected={!data.heatingAge}
          label="Je ne sais pas"
          desc="Nous utiliserons une estimation moyenne"
          onClick={() => onChange({ heatingAge: undefined })}
        />
      </div>

      {/* Distribution */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">
          Système de distribution
        </h3>
        <HelperText>
          Le plancher chauffant fonctionne à basse température et améliore le rendement.
        </HelperText>

        <OptionRow
          selected={data.distributionSystem === "radiators"}
          label="Radiateurs"
          onClick={() => onChange({ distributionSystem: "radiators" })}
        />
        <OptionRow
          selected={data.distributionSystem === "floor_heating"}
          label="Plancher chauffant"
          onClick={() => onChange({ distributionSystem: "floor_heating" })}
        />
        <OptionRow
          selected={!data.distributionSystem}
          label="Je ne sais pas"
          desc="Nous utiliserons une estimation moyenne"
          onClick={() => onChange({ distributionSystem: undefined })}
        />
      </div>
    </div>
  );
};

export default StepHeating;
