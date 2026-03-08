import type { FormData } from "@/lib/types";
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
  desc?: string;
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
        {desc && <div className="text-xs text-muted-foreground">{desc}</div>}
      </div>
    </div>
  </button>
);

const StepOccupancy = ({ data, onChange }: Props) => {
  const { t } = useI18n();

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">{t("occupancy.count")}</h3>
        <HelperText>{t("occupancy.count.help")}</HelperText>
        <input
          type="number"
          value={data.occupants ?? ""}
          onChange={(e) => onChange({ occupants: e.target.value ? Number(e.target.value) : undefined })}
          min={1}
          max={10}
          placeholder="ex: 2"
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-base font-medium text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">{t("occupancy.heating_habits")}</h3>
        <HelperText>{t("occupancy.heating_habits.help")}</HelperText>
        <div className="space-y-2">
          <OptionRow selected={data.heatingHabits === "low"} label={t("occupancy.low")} onClick={() => onChange({ heatingHabits: "low" })} />
          <OptionRow selected={data.heatingHabits === "average"} label={t("occupancy.average")} onClick={() => onChange({ heatingHabits: "average" })} />
          <OptionRow selected={data.heatingHabits === "high"} label={t("occupancy.high")} onClick={() => onChange({ heatingHabits: "high" })} />
          <OptionRow selected={!data.heatingHabits} label={t("occupancy.idk")} desc={t("occupancy.idk.desc")} onClick={() => onChange({ heatingHabits: undefined })} />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">{t("occupancy.hot_water")}</h3>
        <HelperText>{t("occupancy.hot_water.help")}</HelperText>
        <div className="space-y-2">
          <OptionRow selected={data.hotWaterUsage === "low"} label={t("occupancy.hw_low")} onClick={() => onChange({ hotWaterUsage: "low" })} />
          <OptionRow selected={data.hotWaterUsage === "average"} label={t("occupancy.hw_average")} onClick={() => onChange({ hotWaterUsage: "average" })} />
          <OptionRow selected={data.hotWaterUsage === "high"} label={t("occupancy.hw_high")} onClick={() => onChange({ hotWaterUsage: "high" })} />
          <OptionRow selected={!data.hotWaterUsage} label={t("occupancy.idk")} desc={t("occupancy.idk.desc")} onClick={() => onChange({ hotWaterUsage: undefined })} />
        </div>
      </div>
    </div>
  );
};

export default StepOccupancy;
