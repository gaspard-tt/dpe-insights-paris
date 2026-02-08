import type {
  FormData,
  InsulationQuality,
  WindowType,
  Orientation,
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

const QualityBlock = ({
  title,
  value,
  onChange,
  helper,
}: {
  title: string;
  value: InsulationQuality;
  onChange: (v: InsulationQuality | undefined) => void;
  helper: string;
}) => {
  const options: {
    value: InsulationQuality | "unknown";
    label: string;
    desc: string;
  }[] = [
    { value: "none", label: "Aucune", desc: "Pas d’isolation connue" },
    { value: "poor", label: "Faible", desc: "Isolation ancienne ou partielle" },
    { value: "average", label: "Moyenne", desc: "Isolation standard" },
    { value: "good", label: "Bonne", desc: "Bonne performance thermique" },
    { value: "excellent", label: "Excellente", desc: "Isolation très performante" },
    {
      value: "unknown",
      label: "Je ne sais pas",
      desc: "Nous utiliserons une valeur moyenne pour estimer.",
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <HelperText>{helper}</HelperText>

      <div className="space-y-2">
        {options.map((o) => (
          <OptionRow
            key={o.value}
            selected={value === o.value}
            label={o.label}
            desc={o.desc}
            onClick={() =>
              onChange(o.value === "unknown" ? undefined : (o.value as InsulationQuality))
            }
          />
        ))}
      </div>
    </div>
  );
};

const StepEnvelope = ({ data, onChange }: Props) => {
  return (
    <div className="space-y-8">
      <QualityBlock
        title="Isolation des murs"
        value={data.wallInsulation}
        onChange={(v) => onChange({ wallInsulation: v })}
        helper="Les murs représentent 20 à 25% des pertes thermiques."
      />

      <QualityBlock
        title="Isolation de la toiture"
        value={data.roofInsulation}
        onChange={(v) => onChange({ roofInsulation: v })}
        helper="La toiture est le premier poste de déperdition thermique."
      />

      <QualityBlock
        title="Isolation du plancher"
        value={data.floorInsulation}
        onChange={(v) => onChange({ floorInsulation: v })}
        helper="Le plancher bas contribue aux pertes thermiques du logement."
      />

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Type de vitrage</h3>
        <HelperText>
          Le vitrage influence fortement les pertes thermiques et le confort.
        </HelperText>

        <OptionRow
          selected={data.windowType === "single"}
          label="Simple vitrage"
          desc="Très peu isolant"
          onClick={() => onChange({ windowType: "single" })}
        />
        <OptionRow
          selected={data.windowType === "double"}
          label="Double vitrage"
          desc="Standard actuel"
          onClick={() => onChange({ windowType: "double" })}
        />
        <OptionRow
          selected={data.windowType === "triple"}
          label="Triple vitrage"
          desc="Très performant"
          onClick={() => onChange({ windowType: "triple" })}
        />
        <OptionRow
          selected={!data.windowType}
          label="Je ne sais pas"
          desc="Nous utiliserons une valeur moyenne"
          onClick={() => onChange({ windowType: undefined })}
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">
          Orientation principale
        </h3>
        <HelperText>
          L’orientation sud permet de bénéficier des apports solaires en hiver.
        </HelperText>

        {(["north", "south", "east", "west"] as Orientation[]).map((o) => (
          <OptionRow
            key={o}
            selected={data.orientation === o}
            label={o.toUpperCase()}
            desc="Orientation principale du logement"
            onClick={() => onChange({ orientation: o })}
          />
        ))}
        <OptionRow
          selected={!data.orientation}
          label="Je ne sais pas"
          desc="Nous utiliserons une valeur moyenne"
          onClick={() => onChange({ orientation: undefined })}
        />
      </div>
    </div>
  );
};

export default StepEnvelope;
