import type { FormData } from "@/lib/types";
import { HelpCircle, Thermometer, Users, Droplets } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useI18n } from "@/lib/i18n";

interface Props {
  data: FormData;
  onChange: (updates: Partial<FormData>) => void;
}

const HelperText = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-2 rounded-lg bg-primary/5 p-3 text-xs text-muted-foreground">
    <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
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
  const occupants = data.occupants || 2;
  const thermostat = data.thermostatTemp || 19.5;

  // Map thermostat to usage level
  const getThermostatLevel = (temp: number) => {
    if (temp <= 18.5) return "low";
    if (temp <= 20) return "average";
    return "high";
  };

  const thermostatColor = thermostat <= 18.5
    ? "text-teal"
    : thermostat <= 20
    ? "text-primary"
    : thermostat <= 21.5
    ? "text-amber"
    : "text-rose";

  const thermostatHint = thermostat <= 18.5
    ? t("occupancy.thermo.eco")
    : thermostat <= 20
    ? t("occupancy.thermo.comfort")
    : thermostat <= 21.5
    ? t("occupancy.thermo.warm")
    : t("occupancy.thermo.hot");

  return (
    <div className="space-y-8">
      {/* Thermostat slider */}
      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Thermometer className="h-5 w-5 text-rose" />
          {t("occupancy.thermostat")}
        </h3>
        <HelperText>{t("occupancy.thermostat.help")}</HelperText>
        <div className="rounded-xl border bg-muted/20 p-5">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-sm text-muted-foreground">{t("occupancy.temperature")}</span>
            <span className={`text-3xl font-bold ${thermostatColor}`}>
              {thermostat.toFixed(1)} <span className="text-base font-normal text-muted-foreground">°C</span>
            </span>
          </div>
          <p className={`text-xs font-medium mb-4 ${thermostatColor}`}>{thermostatHint}</p>
          <Slider
            value={[thermostat]}
            onValueChange={([v]) => {
              onChange({
                thermostatTemp: v,
                heatingHabits: getThermostatLevel(v),
              });
            }}
            min={15}
            max={25}
            step={0.5}
            className="w-full"
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>15°C</span>
            <span className="text-primary font-medium">{t("occupancy.recommended")}</span>
            <span>25°C</span>
          </div>
        </div>
      </div>

      {/* Occupants slider */}
      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Users className="h-5 w-5 text-indigo" />
          {t("occupancy.count")}
        </h3>
        <HelperText>{t("occupancy.count.help")}</HelperText>
        <div className="rounded-xl border bg-muted/20 p-5">
          <div className="flex items-baseline justify-between mb-4">
            <span className="text-sm text-muted-foreground">{t("occupancy.people")}</span>
            <span className="text-3xl font-bold text-indigo">
              {occupants} <span className="text-base font-normal text-muted-foreground">{occupants > 1 ? t("occupancy.persons") : t("occupancy.person")}</span>
            </span>
          </div>
          <Slider
            value={[occupants]}
            onValueChange={([v]) => onChange({ occupants: v })}
            min={1}
            max={8}
            step={1}
            className="w-full"
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>1</span>
            <span className="text-primary font-medium">{t("occupancy.paris_avg")}</span>
            <span>8+</span>
          </div>
        </div>
      </div>

      {/* Hot water usage */}
      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Droplets className="h-5 w-5 text-primary" />
          {t("occupancy.hot_water")}
        </h3>
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
