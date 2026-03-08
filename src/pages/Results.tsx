import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle, ArrowRight, BarChart3, CheckCircle, 
  Info, Lightbulb, Wrench, Flame, Droplets,
  Layers, Wind, RefreshCw, Target, PiggyBank, Euro, MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import DPEScale from "@/components/DPEScale";
import type { DPEResult, FormData } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const state = location.state as { result: DPEResult; formData: FormData } | null;

  if (!state) {
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

  const { result } = state;
  const { dpeClass, consumption, energyBreakdown, weaknesses, recommendations } = result;

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-8 space-y-8">

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

        {/* ══════════════════════════════════════════════
            RECOMMENDATIONS — Primary section
            ══════════════════════════════════════════════ */}
        <motion.section {...fadeIn} transition={{ delay: 0.25 }}>
          <div className="overflow-hidden rounded-2xl border-2 border-primary/15 bg-card">
            {/* Section header */}
            <div className="border-b bg-primary/[0.03] px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <Wrench className="h-5 w-5 text-primary" />
                {t("results.recommendations")}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{t("results.recommendations.subtitle")}</p>
            </div>

            {/* Recommendation cards */}
            <div className="divide-y">
              {recommendations.map((rec, index) => (
                <motion.article
                  key={rec.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 + index * 0.08 }}
                  className="p-5 sm:p-6"
                >
                  {/* Title row */}
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

                  {/* Impact metrics */}
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

                  {/* Explanation */}
                  <div className="mt-3 rounded-lg border bg-muted/20 p-3">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber" />
                      <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line">{rec.explanation}</p>
                    </div>
                  </div>

                  {/* Cost & Aid row */}
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

                  {/* Providers */}
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
                </motion.article>
              ))}
            </div>
          </div>
        </motion.section>

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

        {/* ── Redo button ── */}
        <div className="flex justify-center pb-10">
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
