import type { FormData } from "@/lib/types";
import { HelpCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

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
  const { t } = useI18n();

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">{t("occupancy.count")}</h3>
        <HelperText>{t("occupancy.count.help")}</HelperText>
        {[1, 2, 3, 4, 5].map((n) => (
          <OptionRow
            key={n}
            selected={data.occupants === n}
            label={`${n} ${n > 1 ? t("occupancy.persons") : t("occupancy.person")}`}
            onClick={() => onChange({ occupants: n })}
          />
        ))}
        <OptionRow selected={data.occupants === 6} label={t("occupancy.6plus")} onClick={() => onChange({ occupants: 6 })} />
        <OptionRow selected={!data.occupants} label={t("occupancy.idk")} desc={t("occupancy.idk.desc")} onClick={() => onChange({ occupants: undefined })} />
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">{t("occupancy.heating_habits")}</h3>
        <HelperText>{t("occupancy.heating_habits.help")}</HelperText>
        <OptionRow selected={data.heatingHabits === "low"} label={t("occupancy.low")} onClick={() => onChange({ heatingHabits: "low" })} />
        <OptionRow selected={data.heatingHabits === "average"} label={t("occupancy.average")} onClick={() => onChange({ heatingHabits: "average" })} />
        <OptionRow selected={data.heatingHabits === "high"} label={t("occupancy.high")} onClick={() => onChange({ heatingHabits: "high" })} />
        <OptionRow selected={!data.heatingHabits} label={t("occupancy.idk")} desc={t("occupancy.idk.desc")} onClick={() => onChange({ heatingHabits: undefined })} />
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">{t("occupancy.hot_water")}</h3>
        <HelperText>{t("occupancy.hot_water.help")}</HelperText>
        <OptionRow selected={data.hotWaterUsage === "low"} label={t("occupancy.hw_low")} onClick={() => onChange({ hotWaterUsage: "low" })} />
        <OptionRow selected={data.hotWaterUsage === "average"} label={t("occupancy.hw_average")} onClick={() => onChange({ hotWaterUsage: "average" })} />
        <OptionRow selected={data.hotWaterUsage === "high"} label={t("occupancy.hw_high")} onClick={() => onChange({ hotWaterUsage: "high" })} />
        <OptionRow selected={!data.hotWaterUsage} label={t("occupancy.idk")} desc={t("occupancy.idk.desc")} onClick={() => onChange({ hotWaterUsage: undefined })} />
      </div>
    </div>
  );
};

export default StepOccupancy;
