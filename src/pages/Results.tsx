import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, CheckCircle, Info, Lightbulb, TrendingDown, Wrench, PartyPopper, Flame, Droplets, Layers, Wind, RefreshCw, Target, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import DPEScale from "@/components/DPEScale";
import type { DPEResult, FormData } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
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
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            {t("results.none.title")}
          </h1>
          <p className="mb-6 text-muted-foreground">
            {t("results.none.desc")}
          </p>
          <Button variant="hero" size="lg" onClick={() => navigate("/questionnaire")}>
            {t("results.none.cta")}
          </Button>
        </main>
      </div>
    );
  }

  const { result } = state;
  const { dpeClass, consumption, energyBreakdown, weaknesses, recommendations } = result;

  const priorityConfig = {
    high: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20", dot: "bg-destructive" },
    medium: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20", dot: "bg-warning" },
    low: { bg: "bg-success/10", text: "text-success", border: "border-success/20", dot: "bg-success" },
  };

  const priorityLabels = {
    high: t("results.priority.high"),
    medium: t("results.priority.medium"),
    low: t("results.priority.low"),
  };

  const severityConfig = {
    high: { border: "border-l-destructive", bg: "bg-destructive/5" },
    medium: { border: "border-l-warning", bg: "bg-warning/5" },
    low: { border: "border-l-muted", bg: "bg-muted/30" },
  };

  const categoryConfig: Record<string, { icon: React.ElementType; color: string }> = {
    envelope: { icon: Layers, color: "text-teal" },
    heating: { icon: Flame, color: "text-rose" },
    ventilation: { icon: Wind, color: "text-indigo" },
  };

  const categoryLabels = {
    envelope: t("results.cat.envelope"),
    heating: t("results.cat.heating"),
    ventilation: t("results.cat.ventilation"),
  };

  const impactLabels = {
    high: t("results.impact.high"),
    medium: t("results.impact.medium"),
    low: t("results.impact.low"),
  };

  const breakdownItems = [
    { label: t("results.breakdown.heating"), value: energyBreakdown.heating, icon: Flame, color: "text-rose", barColor: "bg-rose" },
    { label: t("results.breakdown.hotwater"), value: energyBreakdown.hotWater, icon: Droplets, color: "text-primary", barColor: "bg-primary" },
    { label: t("results.breakdown.envelope"), value: energyBreakdown.envelopeLosses, icon: Layers, color: "text-amber", barColor: "bg-amber" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        {/* DPE Result */}
        <motion.section {...fadeInUp} transition={{ delay: 0 }} className="mb-10">
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="hero-gradient px-6 py-5 sm:px-8">
              <h1 className="text-2xl font-bold text-primary-foreground">
                {t("results.title")}
              </h1>
              <p className="mt-1 text-sm text-primary-foreground/80">
                {t("results.subtitle")}
              </p>
            </div>
            <div className="p-6 sm:p-8">
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <DPEScale activeClass={dpeClass} size="md" />
                </div>
                <div className="flex flex-col justify-center">
                  <div className="mb-4 text-center md:text-left">
                    <span className="text-sm font-medium text-muted-foreground">
                      {t("results.class")}
                    </span>
                    <div className={`mt-1 inline-flex items-center gap-3 rounded-xl dpe-${dpeClass.toLowerCase()} px-6 py-3`}>
                      <span className="text-4xl font-bold">{dpeClass}</span>
                    </div>
                  </div>
                  <div className="mb-4 text-center md:text-left">
                    <span className="text-sm font-medium text-muted-foreground">
                      {t("results.consumption")}
                    </span>
                    <p className="text-3xl font-bold text-foreground">
                      {consumption}{" "}
                      <span className="text-base font-normal text-muted-foreground">
                        kWh/m²/an
                      </span>
                    </p>
                  </div>
                  <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                    <div className="flex items-start gap-2">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <p className="text-xs text-muted-foreground">
                        {t("results.disclaimer")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Energy Breakdown */}
        <motion.section {...fadeInUp} transition={{ delay: 0.1 }} className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
            <BarChart3 className="h-5 w-5 text-primary" />
            {t("results.breakdown")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {breakdownItems.map((item) => {
              const pct = Math.round((item.value / energyBreakdown.total) * 100);
              return (
                <div key={item.label} className="rounded-xl border bg-card p-5">
                  <div className="flex items-center gap-2">
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                    <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-foreground">{pct}%</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className={`h-full rounded-full ${item.barColor}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">~{item.value} kWh/m²/an</p>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Weaknesses */}
        <motion.section {...fadeInUp} transition={{ delay: 0.2 }} className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
            <AlertTriangle className="h-5 w-5 text-warning" />
            {t("results.weaknesses")}
          </h2>
          {weaknesses.length === 0 ? (
            <div className="rounded-xl border bg-success/5 p-6 text-center">
              <PartyPopper className="mx-auto mb-3 h-10 w-10 text-success" />
              <p className="text-sm font-medium text-foreground">
                {t("results.weaknesses.empty")}
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {weaknesses.map((w, index) => {
                const catCfg = categoryConfig[w.category] || categoryConfig.envelope;
                const sevCfg = severityConfig[w.severity];
                return (
                  <motion.div
                    key={w.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.08 }}
                    className={`rounded-xl border-l-4 p-4 ${sevCfg.border} ${sevCfg.bg}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                            <catCfg.icon className={`h-3 w-3 ${catCfg.color}`} />
                            {categoryLabels[w.category]}
                          </span>
                          <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            priorityConfig[w.severity].bg
                          } ${priorityConfig[w.severity].text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${priorityConfig[w.severity].dot}`} />
                            {impactLabels[w.severity]}
                          </span>
                        </div>
                        <h3 className="mt-1.5 text-sm font-semibold text-foreground">{w.label}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{w.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.section>

        {/* Recommendations */}
        <motion.section {...fadeInUp} transition={{ delay: 0.3 }} className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
            <Wrench className="h-5 w-5 text-teal" />
            {t("results.recommendations")}
          </h2>
          <div className="grid gap-4">
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="overflow-hidden rounded-xl border bg-card"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <span className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${priorityConfig[rec.priority].bg} ${priorityConfig[rec.priority].text} ${priorityConfig[rec.priority].border}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${priorityConfig[rec.priority].dot}`} />
                          {priorityLabels[rec.priority]}
                        </span>
                        <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                          ~{rec.estimatedSaving}% {t("results.saving")}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-foreground">{rec.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{rec.reason}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-lg bg-primary/5 px-3 py-2">
                      <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                        <BarChart3 className="h-3 w-3" />
                        {t("results.dpe_impact")}
                      </span>
                      <p className="mt-0.5 text-xs font-medium text-foreground">{rec.dpeImpact}</p>
                    </div>
                    <div className="rounded-lg bg-indigo/5 px-3 py-2">
                      <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-indigo">
                        <Target className="h-3 w-3" />
                        {t("results.comfort")}
                      </span>
                      <p className="mt-0.5 text-xs font-medium text-foreground">{rec.comfortImpact}</p>
                    </div>
                    <div className="rounded-lg bg-success/5 px-3 py-2">
                      <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-success">
                        <PiggyBank className="h-3 w-3" />
                        {t("results.bill")}
                      </span>
                      <p className="mt-0.5 text-xs font-medium text-foreground">{rec.billImpact}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg border bg-background/50 p-4">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
                      <p className="text-xs leading-relaxed text-muted-foreground">{rec.explanation}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Educational Section */}
        <motion.section {...fadeInUp} transition={{ delay: 0.4 }} className="mb-10">
          <div className="overflow-hidden rounded-2xl border bg-card">
            <div className="bg-primary/5 px-6 py-5 sm:px-8">
              <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                <CheckCircle className="h-5 w-5 text-primary" />
                {t("results.edu.title")}
              </h2>
            </div>
            <div className="space-y-5 p-6 sm:p-8">
              {[
                { n: 1, icon: Lightbulb, color: "text-amber" },
                { n: 2, icon: Target, color: "text-rose" },
                { n: 3, icon: PiggyBank, color: "text-success" },
              ].map(({ n, icon: EduIcon, color }) => (
                <div key={n} className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${color.replace("text-", "bg-")}/10`}>
                    <EduIcon className={`h-4 w-4 ${color}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {t(`results.edu.${n}.title`)}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {t(`results.edu.${n}.desc`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Back to questionnaire */}
        <div className="flex justify-center pb-12">
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
