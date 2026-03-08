import type {
  FormData,
  InsulationQuality,
  Orientation,
} from "@/lib/types";
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

const StepEnvelope = ({ data, onChange }: Props) => {
  const { t } = useI18n();

  const insulationOptions: {
    value: InsulationQuality | "unknown";
    labelKey: string;
    descKey: string;
  }[] = [
    { value: "none", labelKey: "envelope.insulation.none", descKey: "envelope.insulation.none.desc" },
    { value: "poor", labelKey: "envelope.insulation.poor", descKey: "envelope.insulation.poor.desc" },
    { value: "average", labelKey: "envelope.insulation.average", descKey: "envelope.insulation.average.desc" },
    { value: "good", labelKey: "envelope.insulation.good", descKey: "envelope.insulation.good.desc" },
    { value: "excellent", labelKey: "envelope.insulation.excellent", descKey: "envelope.insulation.excellent.desc" },
    { value: "unknown", labelKey: "envelope.insulation.idk", descKey: "envelope.insulation.idk.desc" },
  ];

  const QualityBlock = ({
    title,
    value,
    onChangeVal,
    helper,
  }: {
    title: string;
    value: InsulationQuality;
    onChangeVal: (v: InsulationQuality | undefined) => void;
    helper: string;
  }) => (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <HelperText>{helper}</HelperText>
      <div className="space-y-2">
        {insulationOptions.map((o) => (
          <OptionRow
            key={o.value}
            selected={value === o.value}
            label={t(o.labelKey)}
            desc={t(o.descKey)}
            onClick={() => onChangeVal(o.value === "unknown" ? undefined : (o.value as InsulationQuality))}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <QualityBlock
        title={t("envelope.wall")}
        value={data.wallInsulation}
        onChangeVal={(v) => onChange({ wallInsulation: v })}
        helper={t("envelope.wall.help")}
      />
      <QualityBlock
        title={t("envelope.roof")}
        value={data.roofInsulation}
        onChangeVal={(v) => onChange({ roofInsulation: v })}
        helper={t("envelope.roof.help")}
      />
      <QualityBlock
        title={t("envelope.floor")}
        value={data.floorInsulation}
        onChangeVal={(v) => onChange({ floorInsulation: v })}
        helper={t("envelope.floor.help")}
      />

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">{t("envelope.window_type")}</h3>
        <HelperText>{t("envelope.window_type.help")}</HelperText>
        <div className="space-y-2">
          <OptionRow selected={data.windowType === "single"} label={t("envelope.window.single")} desc={t("envelope.window.single.desc")} onClick={() => onChange({ windowType: "single" })} />
          <OptionRow selected={data.windowType === "double"} label={t("envelope.window.double")} desc={t("envelope.window.double.desc")} onClick={() => onChange({ windowType: "double" })} />
          <OptionRow selected={data.windowType === "triple"} label={t("envelope.window.triple")} desc={t("envelope.window.triple.desc")} onClick={() => onChange({ windowType: "triple" })} />
          <OptionRow selected={!data.windowType} label={t("envelope.window.idk")} desc={t("envelope.window.idk.desc")} onClick={() => onChange({ windowType: undefined })} />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">{t("envelope.orientation")}</h3>
        <HelperText>{t("envelope.orientation.help")}</HelperText>
        <div className="space-y-2">
          {(["north", "south", "east", "west"] as Orientation[]).map((o) => (
            <OptionRow
              key={o}
              selected={data.orientation === o}
              label={o.toUpperCase()}
              desc={t("envelope.orientation.desc")}
              onClick={() => onChange({ orientation: o })}
            />
          ))}
          <OptionRow selected={!data.orientation} label={t("envelope.orientation.idk")} desc={t("envelope.orientation.idk.desc")} onClick={() => onChange({ orientation: undefined })} />
        </div>
      </div>
    </div>
  );
};

export default StepEnvelope;
