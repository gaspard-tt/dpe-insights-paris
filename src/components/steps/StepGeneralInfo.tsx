import type { FormData, HousingType, ConstructionPeriod, ClimateZone } from "@/lib/types";
import { Building2, Home, Ruler, CalendarDays, MapPin, HelpCircle } from "lucide-react";

interface Props {
  data: FormData;
  onChange: (updates: Partial<FormData>) => void;
}

const OptionCard = ({
  selected,
  onClick,
  icon: Icon,
  label,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  description?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all ${
      selected
        ? "border-primary bg-primary/5 shadow-md"
        : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
    }`}
  >
    <Icon className={`h-8 w-8 ${selected ? "text-primary" : "text-muted-foreground"}`} />
    <span className={`text-sm font-semibold ${selected ? "text-primary" : "text-foreground"}`}>
      {label}
    </span>
    {description && (
      <span className="text-xs text-muted-foreground">{description}</span>
    )}
  </button>
);

const HelperText = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-2 rounded-lg bg-secondary/60 p-3 text-xs text-muted-foreground">
    <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
    <span>{children}</span>
  </div>
);

const StepGeneralInfo = ({ data, onChange }: Props) => {
  const constructionPeriods: { value: ConstructionPeriod; label: string }[] = [
    { value: "before1948", label: "Avant 1948" },
    { value: "1948-1974", label: "1948 – 1974" },
    { value: "1975-1988", label: "1975 – 1988" },
    { value: "1989-2000", label: "1989 – 2000" },
    { value: "2001-2012", label: "2001 – 2012" },
    { value: "after2012", label: "Après 2012" },
  ];

  const climateZones: { value: ClimateZone; label: string; description: string }[] = [
    { value: "H1", label: "H1 — Nord & Est", description: "Continental, hivers froids" },
    { value: "H2", label: "H2 — Ouest & Centre", description: "Océanique, tempéré" },
    { value: "H3", label: "H3 — Sud & Méditerranée", description: "Chaud, hivers doux" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-1 font-serif text-lg font-semibold text-foreground">
          Type de logement
        </h3>
        <HelperText>
          Le type de logement influence fortement les pertes thermiques : une maison a plus de surfaces en contact avec l'extérieur qu'un appartement.
        </HelperText>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <OptionCard
            selected={data.housingType === "apartment"}
            onClick={() => onChange({ housingType: "apartment" })}
            icon={Building2}
            label="Appartement"
          />
          <OptionCard
            selected={data.housingType === "house"}
            onClick={() => onChange({ housingType: "house" })}
            icon={Home}
            label="Maison"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-1 font-serif text-lg font-semibold text-foreground">
          Surface habitable
        </h3>
        <HelperText>
          La surface en m² est essentielle pour calculer la consommation d'énergie rapportée au mètre carré, base du classement DPE.
        </HelperText>
        <div className="mt-3 flex items-center gap-3">
          <Ruler className="h-5 w-5 text-muted-foreground" />
          <input
            type="number"
            value={data.surfaceArea}
            onChange={(e) => onChange({ surfaceArea: Number(e.target.value) || 0 })}
            min={10}
            max={500}
            className="w-32 rounded-lg border bg-card px-4 py-2.5 text-center text-lg font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <span className="text-sm text-muted-foreground">m²</span>
        </div>
      </div>

      <div>
        <h3 className="mb-1 font-serif text-lg font-semibold text-foreground">
          Année de construction
        </h3>
        <HelperText>
          Les réglementations thermiques ont évolué au fil du temps. Un bâtiment construit avant 1974 n'a probablement aucune isolation d'origine.
        </HelperText>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {constructionPeriods.map((period) => (
            <button
              key={period.value}
              type="button"
              onClick={() => onChange({ constructionPeriod: period.value })}
              className={`flex items-center justify-center gap-2 rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all ${
                data.constructionPeriod === period.value
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "border-border bg-card text-foreground hover:border-primary/30"
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              {period.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-1 font-serif text-lg font-semibold text-foreground">
          Zone climatique
        </h3>
        <HelperText>
          La France est divisée en 3 zones climatiques. Le climat impacte directement les besoins de chauffage : un logement dans le Nord consomme plus qu'un logement identique dans le Sud.
        </HelperText>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {climateZones.map((zone) => (
            <button
              key={zone.value}
              type="button"
              onClick={() => onChange({ climateZone: zone.value })}
              className={`flex flex-col items-start rounded-lg border-2 px-4 py-3 text-left transition-all ${
                data.climateZone === zone.value
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className={`text-sm font-semibold ${
                  data.climateZone === zone.value ? "text-primary" : "text-foreground"
                }`}>
                  {zone.label}
                </span>
              </div>
              <span className="mt-1 text-xs text-muted-foreground">
                {zone.description}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepGeneralInfo;
