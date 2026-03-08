import type { FormData, EnergySource } from "@/lib/types";
import { HelpCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface Props {
  data: FormData;
  onChange: (updates: Partial<FormData>) => void;
}

const HelperText = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
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
    className={`w-full rounded-lg border px-4 py-3 text-left transition-all ${
      selected
        ? "border-primary bg-primary/5 shadow-sm"
        : "border-border hover:border-primary/40 hover:bg-muted/30"
    }`}
  >
    <div className="flex items-start gap-3">
      <div
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          selected ? "border-primary bg-primary" : "border-muted-foreground/40"
        }`}
      >
        {selected && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
      </div>
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </div>
  </button>
);

const StepEnergy = ({ data, onChange }: Props) => {
  const { t } = useI18n();

  const energySources: {
    value: EnergySource | "unknown";
    labelKey: string;
    descKey: string;
  }[] = [
    { value: "electricity", labelKey: "energy.electricity", descKey: "energy.electricity.desc" },
    { value: "gas", labelKey: "energy.gas", descKey: "energy.gas.desc" },
    { value: "fuel", labelKey: "energy.fuel", descKey: "energy.fuel.desc" },
    { value: "renewable", labelKey: "energy.renewable", descKey: "energy.renewable.desc" },
    { value: "hybrid", labelKey: "energy.hybrid", descKey: "energy.hybrid.desc" },
    { value: "unknown", labelKey: "energy.unknown", descKey: "energy.unknown.desc" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{t("energy.title")}</h3>
        <HelperText>{t("energy.help")}</HelperText>
      </div>

      <div className="space-y-2">
        {energySources.map((e) => (
          <OptionRow
            key={e.value}
            selected={data.energySource === e.value}
            label={t(e.labelKey)}
            desc={t(e.descKey)}
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
