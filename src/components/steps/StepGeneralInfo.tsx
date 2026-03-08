import { useState, useMemo } from "react";
import type { FormData, ConstructionPeriod } from "@/lib/types";
import { HelpCircle, Home, Building2, MapPin, Search } from "lucide-react";
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

// Paris & Île-de-France postal codes
const IDF_DEPARTMENTS = [
  { code: "75", label: "Paris (75)" },
  { code: "77", label: "Seine-et-Marne (77)" },
  { code: "78", label: "Yvelines (78)" },
  { code: "91", label: "Essonne (91)" },
  { code: "92", label: "Hauts-de-Seine (92)" },
  { code: "93", label: "Seine-Saint-Denis (93)" },
  { code: "94", label: "Val-de-Marne (94)" },
  { code: "95", label: "Val-d'Oise (95)" },
];

const ARRONDISSEMENTS = Array.from({ length: 20 }, (_, i) => {
  const num = i + 1;
  const suffix = num === 1 ? "er" : "ème";
  return { value: `${num}`, label: `${num}${suffix} arrondissement` };
});

const StepGeneralInfo = ({ data, onChange }: Props) => {
  const { t } = useI18n();
  const [postalSearch, setPostalSearch] = useState(data.postalCode || "");

  const constructionPeriods: ConstructionPeriod[] = [
    "before1948",
    "1948-1974",
    "1975-1988",
    "1989-2000",
    "2001-2012",
    "after2012",
  ];

  const surfaceValue = data.surfaceArea || 40;
  const isParis = data.postalCode === "75";

  const filteredDepts = useMemo(() => {
    if (!postalSearch) return IDF_DEPARTMENTS;
    return IDF_DEPARTMENTS.filter(
      (d) => d.code.includes(postalSearch) || d.label.toLowerCase().includes(postalSearch.toLowerCase())
    );
  }, [postalSearch]);

  const handlePostalSelect = (code: string) => {
    onChange({ postalCode: code, arrondissement: undefined, climateZone: "H1" });
    setPostalSearch("");
  };

  return (
    <div className="space-y-8">
      {/* Housing type */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">{t("general.housing_type")}</h3>
        <HelperText>{t("general.housing_type.help")}</HelperText>
        <div className="grid grid-cols-2 gap-3">
          <CardOption selected={data.housingType === "apartment"} label={t("general.apartment")} icon={Building2} onClick={() => onChange({ housingType: "apartment" })} />
          <CardOption selected={data.housingType === "house"} label={t("general.house")} icon={Home} onClick={() => onChange({ housingType: "house" })} />
        </div>
      </div>

      {/* Surface with slider */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">{t("general.surface")}</h3>
        <HelperText>{t("general.surface.help")}</HelperText>
        <div className="rounded-xl border bg-muted/20 p-5">
          <div className="flex items-baseline justify-between mb-4">
            <span className="text-sm text-muted-foreground">{t("general.surface")}</span>
            <span className="text-3xl font-bold text-primary">{surfaceValue} <span className="text-base font-normal text-muted-foreground">m²</span></span>
          </div>
          <Slider
            value={[surfaceValue]}
            onValueChange={([v]) => onChange({ surfaceArea: v })}
            min={10}
            max={300}
            step={5}
            className="w-full"
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>10 m²</span>
            <span className="text-primary font-medium">{t("general.paris_avg")}</span>
            <span>300 m²</span>
          </div>
        </div>
      </div>

      {/* Location - Paris specific */}
      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <MapPin className="h-5 w-5 text-rose" />
          {t("general.location")}
        </h3>
        <HelperText>{t("general.location.help")}</HelperText>

        {/* Search / Filter */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={postalSearch}
            onChange={(e) => setPostalSearch(e.target.value)}
            placeholder={t("general.location.search")}
            className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {filteredDepts.map((dept) => (
            <button
              key={dept.code}
              type="button"
              onClick={() => handlePostalSelect(dept.code)}
              className={`rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-all ${
                data.postalCode === dept.code
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "border-border text-foreground hover:border-primary/40 hover:bg-muted/30"
              }`}
            >
              {dept.label}
            </button>
          ))}
        </div>

        {/* Arrondissement picker if Paris */}
        {isParis && (
          <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <h4 className="text-sm font-semibold text-primary">{t("general.arrondissement")}</h4>
            <div className="grid grid-cols-4 gap-2">
              {ARRONDISSEMENTS.map((arr) => (
                <button
                  key={arr.value}
                  type="button"
                  onClick={() => onChange({ arrondissement: arr.value })}
                  className={`rounded-lg border px-2 py-2 text-center text-xs font-medium transition-all ${
                    data.arrondissement === arr.value
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-card text-foreground hover:border-primary/40"
                  }`}
                >
                  {arr.value}{arr.value === "1" ? "er" : "e"}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Construction period */}
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
    </div>
  );
};

export default StepGeneralInfo;
