import type {
  FormData,
  ConstructionPeriod,
} from "@/lib/types";
import { HelpCircle, Home, Building2 } from "lucide-react";
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

const CardOption = ({
  selected,
  label,
  icon: Icon,
  onClick,
}: {
  selected: boolean;
  label: string;
  icon: React.ElementType;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center gap-2 rounded-lg border px-6 py-4 transition-all ${
      selected
        ? "border-primary bg-primary/5 shadow-sm"
        : "border-border hover:border-primary/40 hover:bg-muted/30"
    }`}
  >
    <Icon className={`h-6 w-6 ${selected ? "text-primary" : "text-muted-foreground"}`} />
    <span className="text-sm font-medium text-foreground">{label}</span>
  </button>
);

const StepGeneralInfo = ({ data, onChange }: Props) => {
  const { t } = useI18n();

  const constructionPeriods: ConstructionPeriod[] = [
    "before1948",
    "1948-1974",
    "1975-1988",
    "1989-2000",
    "2001-2012",
    "after2012",
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">{t("general.housing_type")}</h3>
        <HelperText>{t("general.housing_type.help")}</HelperText>
        <div className="grid grid-cols-2 gap-3">
          <CardOption selected={data.housingType === "apartment"} label={t("general.apartment")} icon={Building2} onClick={() => onChange({ housingType: "apartment" })} />
          <CardOption selected={data.housingType === "house"} label={t("general.house")} icon={Home} onClick={() => onChange({ housingType: "house" })} />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">{t("general.surface")}</h3>
        <HelperText>{t("general.surface.help")}</HelperText>
        <input
          type="number"
          value={data.surfaceArea ?? ""}
          onChange={(e) => onChange({ surfaceArea: e.target.value ? Number(e.target.value) : undefined })}
          min={10}
          max={500}
          placeholder="ex: 65"
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-base font-medium text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">{t("general.construction")}</h3>
        <HelperText>{t("general.construction.help")}</HelperText>
        <div className="space-y-2">
          {constructionPeriods.map((p) => (
            <OptionRow key={p} selected={data.constructionPeriod === p} label={p.replace("-", " – ")} onClick={() => onChange({ constructionPeriod: p })} />
          ))}
          <OptionRow selected={!data.constructionPeriod} label={t("general.idk")} desc={t("general.idk.desc")} onClick={() => onChange({ constructionPeriod: undefined })} />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">{t("general.climate")}</h3>
        <HelperText>{t("general.climate.help")}</HelperText>
        <div className="space-y-2">
          <OptionRow selected={data.climateZone === "H1"} label={t("general.h1")} desc={t("general.h1.desc")} onClick={() => onChange({ climateZone: "H1" })} />
          <OptionRow selected={data.climateZone === "H2"} label={t("general.h2")} desc={t("general.h2.desc")} onClick={() => onChange({ climateZone: "H2" })} />
          <OptionRow selected={data.climateZone === "H3"} label={t("general.h3")} desc={t("general.h3.desc")} onClick={() => onChange({ climateZone: "H3" })} />
          <OptionRow selected={!data.climateZone} label={t("general.idk")} desc={t("general.idk.desc")} onClick={() => onChange({ climateZone: undefined })} />
        </div>
      </div>
    </div>
  );
};

export default StepGeneralInfo;
