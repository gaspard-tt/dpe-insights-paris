import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  AlertTriangle, ArrowRight, BarChart3, CheckCircle,
  Info, Lightbulb, Wrench, Flame, Droplets,
  Layers, Wind, RefreshCw, Target, PiggyBank, Euro, MapPin,
  TrendingUp, Zap, ShowerHead, ThermometerSun, Tv, Timer, Building2, Download, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import DPEScale from "@/components/DPEScale";
import type { DPEResult, FormData, DPEClass } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { calculateDPE, DPE_CLASSES } from "@/lib/dpe-calculator";

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const DPE_THRESHOLDS: Record<DPEClass, { min: number; max: number }> = {
  A: { min: 0, max: 70 },
  B: { min: 71, max: 110 },
  C: { min: 111, max: 180 },
  D: { min: 181, max: 250 },
  E: { min: 251, max: 330 },
  F: { min: 331, max: 420 },
  G: { min: 421, max: 600 },
};

const DPE_COLORS: Record<DPEClass, string> = {
  A: "bg-[#319834]",
  B: "bg-[#33a357]",
  C: "bg-[#cbdb2a]",
  D: "bg-[#ffed00]",
  E: "bg-[#f0b616]",
  F: "bg-[#ec6927]",
  G: "bg-[#e7221a]",
};

// Illustrative renovation companies (placeholder)
const ILLUSTRATIVE_COMPANIES: Record<string, { name: string; specialty: string }[]> = {
  insulate_roof: [
    { name: "Iso Combles Paris", specialty: "Isolation toiture & combles" },
    { name: "ThermoRénov' IDF", specialty: "Rénovation énergétique globale" },
    { name: "EcoBat Solutions", specialty: "Isolation écologique" },
  ],
  insulate_walls: [
    { name: "MurIsol Paris", specialty: "ITE & ITI spécialiste" },
    { name: "ThermoRénov' IDF", specialty: "Rénovation énergétique globale" },
    { name: "Façades & Isolation", specialty: "Ravalement & isolation" },
  ],
  replace_windows: [
    { name: "Fenêtres de Paris", specialty: "Menuiseries sur mesure" },
    { name: "VitroConfort", specialty: "Double & triple vitrage" },
    { name: "Lapeyre Pro", specialty: "Fenêtres & portes" },
  ],
  upgrade_heating: [
    { name: "ClimaConfort Paris", specialty: "PAC & climatisation" },
    { name: "GreenHeat IDF", specialty: "Pompes à chaleur" },
    { name: "ChaufExpert", specialty: "Chaudières & systèmes" },
  ],
  modernize_heating: [
    { name: "ChaufExpert", specialty: "Chaudières modernes" },
    { name: "ThermoService IDF", specialty: "Entretien & remplacement" },
    { name: "ClimaConfort Paris", specialty: "Systèmes de chauffage" },
  ],
  install_vmc: [
    { name: "AirPur Paris", specialty: "VMC simple & double flux" },
    { name: "VentiConfort", specialty: "Ventilation résidentielle" },
    { name: "ClimAir Solutions", specialty: "Qualité de l'air" },
  ],
  seal_air_leaks: [
    { name: "ÉtanchéPro", specialty: "Étanchéité à l'air" },
    { name: "JointExpert", specialty: "Calfeutrage & joints" },
    { name: "ConfortMaison", specialty: "Rénovation intérieure" },
  ],
  insulate_floor: [
    { name: "SolIsol Paris", specialty: "Isolation plancher bas" },
    { name: "ThermoRénov' IDF", specialty: "Rénovation énergétique" },
    { name: "EcoBat Solutions", specialty: "Isolation écologique" },
  ],
  quick_wins: [
    { name: "Agence Parisienne du Climat", specialty: "Conseil gratuit" },
    { name: "ADIL 75", specialty: "Information logement" },
    { name: "EDF & moi", specialty: "Suivi consommation" },
  ],
};

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const state = location.state as { result: DPEResult; formData: FormData } | null;
  const recRefs = useRef<Record<string, HTMLElement | null>>({});
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const recalculated = useMemo(() => {
    if (!state) return null;
    return calculateDPE(state.formData, lang);
  }, [state, lang]);

  const handleExportPDF = useCallback(async () => {
    if (!pdfRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - 20;
      }

      pdf.save(`diagnostic-dpe-${recalculated?.dpeClass || "resultat"}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setIsExporting(false);
    }
  }, [recalculated?.dpeClass]);

  const formData = state?.formData;
  const surfaceArea = formData?.surfaceArea || 70;
  const avgEnergyPricePerKwh = 0.21;
  const consumption = recalculated?.consumption || 0;

  // Use user-provided annual bill if available, otherwise estimate
  const currentAnnualBill = formData?.annualBill
    ? formData.annualBill
    : consumption * surfaceArea * avgEnergyPricePerKwh;

  const recommendations = recalculated?.recommendations || [];

  const roiItems = useMemo(() => {
    return recommendations
      .filter((r) => r.estimatedSaving > 5 && r.id !== "quick_wins")
      .slice(0, 5)
      .map((r) => {
        const annualSaving = currentAnnualBill * (r.estimatedSaving / 100);
        const costMatch = r.estimatedCost?.match(/[\d\s]+/g);
        const estimatedTotalCost = costMatch
          ? parseInt(costMatch[0].replace(/\s/g, "")) * (r.id.includes("window") ? 5 : surfaceArea * 0.3)
          : annualSaving * 12;
        const paybackYears = Math.round(estimatedTotalCost / annualSaving);
        return {
          id: r.id,
          name: r.name,
          annualSaving: Math.round(annualSaving),
          totalCost: Math.round(estimatedTotalCost),
          paybackYears: Math.min(paybackYears, 30),
          priority: r.priority,
          estimatedCost: r.estimatedCost,
        };
      });
  }, [recommendations, currentAnnualBill, surfaceArea]);

  const smallWins = useMemo(() => {
    const occupants = formData?.occupants || 2;
    return [
      {
        icon: ShowerHead,
        text: t("smallwins.shower"),
        saving: `~${Math.round(occupants * 15)} €/${t("smallwins.month")}`,
      },
      {
        icon: ThermometerSun,
        text: t("smallwins.thermostat"),
        saving: `~${Math.round(currentAnnualBill * 0.07 / 12)} €/${t("smallwins.month")}`,
      },
      {
        icon: Tv,
        text: t("smallwins.standby"),
        saving: `~${Math.round(occupants * 5)} €/${t("smallwins.month")}`,
      },
      {
        icon: Timer,
        text: t("smallwins.offpeak"),
        saving: `~${Math.round(currentAnnualBill * 0.05 / 12)} €/${t("smallwins.month")}`,
      },
    ];
  }, [formData, currentAnnualBill, t]);

  if (!state || !recalculated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-20 text-center">
          <AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground" />
          <h1 className="mb-2 text-2xl font-bold text-foreground">{t("results.none.title")}</h1>
          <p className="mb-6 text-muted-foreground">{t("results.none.desc")}</p>
          <Button variant="hero" size="lg" onClick={() => navigate("/questionnaire")}>
            {t("results.none.cta")}
          </Button>
        </main>
      </div>
    );
  }

  const { dpeClass, energyBreakdown, weaknesses } = recalculated;

  const scrollToRec = (recId: string) => {
    const el = recRefs.current[recId];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const priorityStyles = {
    high: { badge: "bg-destructive/10 text-destructive border-destructive/20", bar: "bg-destructive" },
    medium: { badge: "bg-warning/10 text-warning border-warning/20", bar: "bg-warning" },
    low: { badge: "bg-success/10 text-success border-success/20", bar: "bg-success" },
  };

  const priorityLabels = {
    high: t("results.priority.high"),
    medium: t("results.priority.medium"),
    low: t("results.priority.low"),
  };

  const severityStyles = {
    high: "border-l-destructive bg-destructive/5",
    medium: "border-l-warning bg-warning/5",
    low: "border-l-muted bg-muted/20",
  };

  const categoryIcons: Record<string, { icon: React.ElementType; color: string }> = {
    envelope: { icon: Layers, color: "text-teal" },
    heating: { icon: Flame, color: "text-rose" },
    ventilation: { icon: Wind, color: "text-indigo" },
  };

  const categoryLabels: Record<string, string> = {
    envelope: t("results.cat.envelope"),
    heating: t("results.cat.heating"),
    ventilation: t("results.cat.ventilation"),
  };

  const breakdownItems = [
    { label: t("results.breakdown.heating"), value: energyBreakdown.heating, icon: Flame, color: "text-rose", bar: "bg-rose" },
    { label: t("results.breakdown.hotwater"), value: energyBreakdown.hotWater, icon: Droplets, color: "text-primary", bar: "bg-primary" },
    { label: t("results.breakdown.envelope"), value: energyBreakdown.envelopeLosses, icon: Layers, color: "text-amber", bar: "bg-amber" },
  ];

  const hasCurrentDPE = !!formData?.currentDPE;
  const currentDPEClass = formData?.currentDPE;
  const currentDPEThreshold = currentDPEClass ? DPE_THRESHOLDS[currentDPEClass] : null;
  const currentDPEMid = currentDPEThreshold
    ? Math.round((currentDPEThreshold.min + currentDPEThreshold.max) / 2)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main ref={pdfRef} className="container mx-auto max-w-4xl px-4 py-8 space-y-8">

        {/* ── DPE Result Card ── */}
        <motion.section {...fadeIn}>
          <div className="overflow-hidden rounded-2xl border bg-card">
            <div className="hero-gradient px-6 py-5">
              <h1 className="text-2xl font-bold text-primary-foreground">{t("results.title")}</h1>
              <p className="mt-1 text-sm text-primary-foreground/80">{t("results.subtitle")}</p>
            </div>
            <div className="grid gap-8 p-6 md:grid-cols-2">
              <DPEScale activeClass={dpeClass} size="md" />
              <div className="flex flex-col justify-center gap-4">
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("results.class")}</span>
                  <div className={`mt-1 inline-flex items-center rounded-xl dpe-${dpeClass.toLowerCase()} px-5 py-2`}>
                    <span className="text-3xl font-bold">{dpeClass}</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("results.consumption")}</span>
                  <p className="text-2xl font-bold text-foreground">
                    {consumption} <span className="text-sm font-normal text-muted-foreground">{t("dpe.unit")}</span>
                  </p>
                </div>
                <div className="flex items-start gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2.5">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <p className="text-[11px] leading-relaxed text-muted-foreground">{t("results.disclaimer")}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── DPE Comparison ── */}
        {hasCurrentDPE && currentDPEClass && currentDPEMid && (
          <motion.section {...fadeIn} transition={{ delay: 0.07 }}>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-foreground">
              <TrendingUp className="h-4.5 w-4.5 text-primary" />
              {t("results.comparison.title")}
            </h2>
            <div className="rounded-2xl border bg-card p-5">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-muted-foreground">{t("results.comparison.assigned")}</span>
                    <span className="text-xs font-bold text-foreground">{t("currentdpe.class")} {currentDPEClass} · ~{currentDPEMid} {t("dpe.unit")}</span>
                  </div>
                  <div className="h-6 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className={`h-full rounded-full ${DPE_COLORS[currentDPEClass]} flex items-center justify-end pr-2`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((currentDPEMid / 600) * 100, 100)}%` }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                    >
                      <span className="text-[10px] font-bold text-white drop-shadow">{currentDPEClass}</span>
                    </motion.div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-muted-foreground">{t("results.comparison.estimated")}</span>
                    <span className="text-xs font-bold text-foreground">{t("currentdpe.class")} {dpeClass} · {consumption} {t("dpe.unit")}</span>
                  </div>
                  <div className="h-6 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className={`h-full rounded-full ${DPE_COLORS[dpeClass]} flex items-center justify-end pr-2`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((consumption / 600) * 100, 100)}%` }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                    >
                      <span className="text-[10px] font-bold text-white drop-shadow">{dpeClass}</span>
                    </motion.div>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-lg bg-primary/5 px-3 py-2.5">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {consumption > currentDPEMid
                      ? t("results.comparison.worse")
                      : consumption < currentDPEMid
                        ? t("results.comparison.better")
                        : t("results.comparison.same")}
                  </p>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* ── Consumption Breakdown ── */}
        <motion.section {...fadeIn} transition={{ delay: 0.1 }}>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-foreground">
            <BarChart3 className="h-4.5 w-4.5 text-primary" />
            {t("results.breakdown")}
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {breakdownItems.map((item) => {
              const pct = Math.round((item.value / energyBreakdown.total) * 100);
              return (
                <div key={item.label} className="rounded-xl border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                    <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                  </div>
                  <p className="mt-1 text-xl font-bold text-foreground">{pct}%</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className={`h-full rounded-full ${item.bar}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">~{item.value} {t("dpe.unit")}</p>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* ── Weaknesses ── */}
        <motion.section {...fadeIn} transition={{ delay: 0.15 }}>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-foreground">
            <AlertTriangle className="h-4.5 w-4.5 text-warning" />
            {t("results.weaknesses")}
          </h2>
          {weaknesses.length === 0 ? (
            <div className="rounded-xl border bg-success/5 p-5 text-center">
              <CheckCircle className="mx-auto mb-2 h-8 w-8 text-success" />
              <p className="text-sm font-medium text-foreground">{t("results.weaknesses.empty")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {weaknesses.map((w, i) => {
                const cat = categoryIcons[w.category] || categoryIcons.envelope;
                return (
                  <motion.div
                    key={w.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.06 }}
                    className={`rounded-lg border-l-[3px] p-3.5 ${severityStyles[w.severity]}`}
                  >
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        <cat.icon className={`h-2.5 w-2.5 ${cat.color}`} />
                        {categoryLabels[w.category]}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{w.label}</h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{w.description}</p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.section>

        {/* ── ROI Section ── */}
        {roiItems.length > 0 && (
          <motion.section {...fadeIn} transition={{ delay: 0.2 }}>
            <div className="overflow-hidden rounded-2xl border-2 border-success/20 bg-card">
              <div className="border-b bg-success/[0.04] px-6 py-4">
                <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                  <Euro className="h-5 w-5 text-success" />
                  {t("results.roi.title")}
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">{t("results.roi.subtitle")}</p>
              </div>
              <div className="p-5">
                <div className="mb-5 rounded-lg bg-muted/30 px-4 py-3">
                  <p className="text-xs text-muted-foreground">{t("results.roi.currentbill")}</p>
                  <p className="text-2xl font-bold text-foreground">
                    ~{Math.round(currentAnnualBill)} €<span className="text-sm font-normal text-muted-foreground">/{t("results.roi.year")}</span>
                    {formData?.annualBill && (
                      <span className="ml-2 text-xs font-normal text-primary">({t("results.roi.userprovided")})</span>
                    )}
                  </p>
                </div>

                {/* ROI table-like cards */}
                <div className="space-y-3">
                  {roiItems.map((item, i) => (
                    <motion.button
                      key={i}
                      type="button"
                      onClick={() => scrollToRec(item.id)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                      className="w-full text-left rounded-xl border p-4 hover:border-primary/40 hover:bg-primary/[0.02] transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                            {item.name}
                            <ArrowRight className="inline ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </h4>

                          {/* Cost + Savings + Payback row */}
                          <div className="mt-2 grid grid-cols-3 gap-2">
                            <div className="rounded-lg bg-muted/40 px-2.5 py-1.5">
                              <span className="block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{t("results.roi.cost")}</span>
                              <span className="block text-xs font-bold text-foreground">~{item.totalCost.toLocaleString()} €</span>
                            </div>
                            <div className="rounded-lg bg-success/10 px-2.5 py-1.5">
                              <span className="block text-[10px] font-medium uppercase tracking-wider text-success">{t("results.roi.saving")}</span>
                              <span className="block text-xs font-bold text-success">+{item.annualSaving} €/{t("results.roi.yr")}</span>
                            </div>
                            <div className="rounded-lg bg-primary/10 px-2.5 py-1.5">
                              <span className="block text-[10px] font-medium uppercase tracking-wider text-primary">{t("results.roi.payback")}</span>
                              <span className="block text-xs font-bold text-primary">{item.paybackYears} {t("results.roi.years_payback")}</span>
                            </div>
                          </div>
                        </div>

                        {/* Payback circle */}
                        <div className="flex flex-col items-center shrink-0">
                          <div className="relative h-14 w-14">
                            <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
                              <circle cx="18" cy="18" r="14" fill="none" className="stroke-muted" strokeWidth="3" />
                              <circle
                                cx="18" cy="18" r="14" fill="none"
                                className="stroke-success"
                                strokeWidth="3"
                                strokeDasharray={`${Math.min((1 / item.paybackYears) * 88, 88)} 88`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-foreground">
                              {item.paybackYears}{t("results.roi.yr")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="mt-4 flex items-start gap-2 rounded-lg bg-primary/5 px-3 py-2">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <p className="text-[11px] text-muted-foreground">{t("results.roi.disclaimer")}</p>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* ── Main content with recommendations + Small Wins sidebar ── */}
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">

          {/* ══ RECOMMENDATIONS ══ */}
          <motion.section {...fadeIn} transition={{ delay: 0.25 }}>
            <div className="overflow-hidden rounded-2xl border-2 border-primary/15 bg-card">
              <div className="border-b bg-primary/[0.03] px-6 py-4">
                <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                  <Wrench className="h-5 w-5 text-primary" />
                  {t("results.recommendations")}
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">{t("results.recommendations.subtitle")}</p>
              </div>
              <div className="divide-y">
                {recommendations.map((rec, index) => {
                  const companies = ILLUSTRATIVE_COMPANIES[rec.id] || ILLUSTRATIVE_COMPANIES.quick_wins;
                  return (
                    <motion.article
                      key={rec.id}
                      ref={(el) => { recRefs.current[rec.id] = el; }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.35 + index * 0.08 }}
                      className="p-5 sm:p-6"
                    >
                      <div className="flex flex-wrap items-start gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${priorityStyles[rec.priority].badge}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${priorityStyles[rec.priority].bar}`} />
                          {priorityLabels[rec.priority]}
                        </span>
                        <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                          ~{rec.estimatedSaving}% {t("results.saving")}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-foreground">{rec.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{rec.reason}</p>

                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        {[
                          { icon: BarChart3, label: t("results.dpe_impact"), value: rec.dpeImpact, color: "text-primary", bg: "bg-primary/5" },
                          { icon: Target, label: t("results.comfort"), value: rec.comfortImpact, color: "text-indigo", bg: "bg-indigo/5" },
                          { icon: PiggyBank, label: t("results.bill"), value: rec.billImpact, color: "text-success", bg: "bg-success/5" },
                        ].map((m) => (
                          <div key={m.label} className={`rounded-lg ${m.bg} px-3 py-2`}>
                            <span className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ${m.color}`}>
                              <m.icon className="h-3 w-3" />
                              {m.label}
                            </span>
                            <p className="mt-0.5 text-xs font-medium text-foreground">{m.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 rounded-lg border bg-muted/20 p-3">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber" />
                          <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line">{rec.explanation}</p>
                        </div>
                      </div>

                      {(rec.estimatedCost || rec.parisAid) && (
                        <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                          {rec.estimatedCost && (
                            <div className="flex items-start gap-2 rounded-lg bg-muted/30 px-3 py-2">
                              <Euro className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber" />
                              <div>
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t("results.cost")}</span>
                                <p className="text-xs text-foreground">{rec.estimatedCost}</p>
                              </div>
                            </div>
                          )}
                          {rec.parisAid && (
                            <div className="flex items-start gap-2 rounded-lg border border-success/10 bg-success/5 px-3 py-2">
                              <PiggyBank className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                              <div>
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-success">{t("results.aid")}</span>
                                <p className="text-xs text-foreground">{rec.parisAid}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {rec.providers && rec.providers.length > 0 && (
                        <div className="mt-2.5 rounded-lg bg-primary/[0.03] px-3 py-2">
                          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary mb-1">
                            <MapPin className="h-3 w-3" />
                            {t("results.providers")}
                          </span>
                          <ul className="space-y-0.5">
                            {rec.providers.map((p, i) => (
                              <li key={i} className="flex items-center gap-1.5 text-xs text-foreground">
                                <ArrowRight className="h-2.5 w-2.5 text-primary" />
                                {p}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Illustrative companies */}
                      <div className="mt-3 rounded-lg border border-primary/10 bg-primary/[0.02] p-3">
                        <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary mb-2">
                          <Building2 className="h-3 w-3" />
                          {t("results.companies")}
                        </span>
                        <div className="grid gap-2 sm:grid-cols-3">
                          {companies.map((c, ci) => (
                            <div key={ci} className="rounded-lg bg-card border px-3 py-2">
                              <p className="text-xs font-semibold text-foreground">{c.name}</p>
                              <p className="text-[10px] text-muted-foreground">{c.specialty}</p>
                            </div>
                          ))}
                        </div>
                        <p className="mt-2 text-[10px] text-muted-foreground italic">{t("results.companies.disclaimer")}</p>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            </div>
          </motion.section>

          {/* ══ SMALL WINS SIDEBAR ══ */}
          <motion.aside {...fadeIn} transition={{ delay: 0.3 }}>
            <div className="sticky top-24 rounded-2xl border bg-card overflow-hidden">
              <div className="bg-amber/10 px-4 py-3 border-b">
                <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Zap className="h-4 w-4 text-amber" />
                  {t("smallwins.title")}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">{t("smallwins.subtitle")}</p>
              </div>
              <div className="p-4 space-y-3">
                {smallWins.map((win, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-start gap-2.5"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber/10">
                      <win.icon className="h-3.5 w-3.5 text-amber" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground leading-snug">{win.text}</p>
                      <p className="text-[11px] font-semibold text-success mt-0.5">{win.saving}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.aside>
        </div>

        {/* ── Educational tips ── */}
        <motion.section {...fadeIn} transition={{ delay: 0.35 }}>
          <div className="rounded-2xl border bg-card">
            <div className="border-b px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <CheckCircle className="h-4.5 w-4.5 text-primary" />
                {t("results.edu.title")}
              </h2>
            </div>
            <div className="space-y-4 p-6">
              {[
                { n: 1, icon: Lightbulb, color: "text-amber" },
                { n: 2, icon: Target, color: "text-rose" },
                { n: 3, icon: PiggyBank, color: "text-success" },
              ].map(({ n, icon: EduIcon, color }) => (
                <div key={n} className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${color.replace("text-", "bg-")}/10`}>
                    <EduIcon className={`h-3.5 w-3.5 ${color}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{t(`results.edu.${n}.title`)}</h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{t(`results.edu.${n}.desc`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── Action buttons ── */}
        <div className="flex flex-wrap justify-center gap-3 pb-10">
          <Button onClick={handleExportPDF} disabled={isExporting} size="lg" className="gap-2">
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {t("results.export")}
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate("/questionnaire")} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {t("results.redo")}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Results;
