import type {
  FormData,
  ConstructionPeriod,
} from "@/lib/types";
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
        <OptionRow selected={data.housingType === "apartment"} label={t("general.apartment")} onClick={() => onChange({ housingType: "apartment" })} />
        <OptionRow selected={data.housingType === "house"} label={t("general.house")} onClick={() => onChange({ housingType: "house" })} />
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">{t("general.surface")}</h3>
        <HelperText>{t("general.surface.help")}</HelperText>
        <input
          type="number"
          value={data.surfaceArea}
          onChange={(e) => onChange({ surfaceArea: Number(e.target.value) || 0 })}
          min={10}
          max={500}
          className="w-40 rounded border px-4 py-2 text-lg font-semibold text-foreground focus:border-primary focus:outline-none"
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">{t("general.construction")}</h3>
        <HelperText>{t("general.construction.help")}</HelperText>
        {constructionPeriods.map((p) => (
          <OptionRow key={p} selected={data.constructionPeriod === p} label={p.replace("-", " – ")} onClick={() => onChange({ constructionPeriod: p })} />
        ))}
        <OptionRow selected={!data.constructionPeriod} label={t("general.idk")} desc={t("general.idk.desc")} onClick={() => onChange({ constructionPeriod: undefined })} />
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">{t("general.climate")}</h3>
        <HelperText>{t("general.climate.help")}</HelperText>
        <OptionRow selected={data.climateZone === "H1"} label={t("general.h1")} desc={t("general.h1.desc")} onClick={() => onChange({ climateZone: "H1" })} />
        <OptionRow selected={data.climateZone === "H2"} label={t("general.h2")} desc={t("general.h2.desc")} onClick={() => onChange({ climateZone: "H2" })} />
        <OptionRow selected={data.climateZone === "H3"} label={t("general.h3")} desc={t("general.h3.desc")} onClick={() => onChange({ climateZone: "H3" })} />
        <OptionRow selected={!data.climateZone} label={t("general.idk")} desc={t("general.idk.desc")} onClick={() => onChange({ climateZone: undefined })} />
      </div>
    </div>
  );
};

export default StepGeneralInfo;
