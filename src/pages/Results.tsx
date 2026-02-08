import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, CheckCircle, Info, Lightbulb, TrendingDown, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import DPEScale from "@/components/DPEScale";
import type { DPEResult, FormData } from "@/lib/types";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { result: DPEResult; formData: FormData } | null;

  if (!state) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-20 text-center">
          <AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground" />
          <h1 className="mb-2 font-serif text-2xl font-bold text-foreground">
            Aucun résultat disponible
          </h1>
          <p className="mb-6 text-muted-foreground">
            Vous devez d'abord compléter le questionnaire pour obtenir votre diagnostic.
          </p>
          <Button variant="hero" size="lg" onClick={() => navigate("/questionnaire")}>
            Commencer le diagnostic
          </Button>
        </main>
      </div>
    );
  }

  const { result } = state;
  const { dpeClass, consumption, energyBreakdown, weaknesses, recommendations } = result;

  const priorityColors = {
    high: "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-dpe-e/10 text-dpe-e border-dpe-e/20",
    low: "bg-dpe-b/10 text-dpe-b border-dpe-b/20",
  };

  const priorityLabels = {
    high: "Priorité haute",
    medium: "Priorité moyenne",
    low: "Priorité basse",
  };

  const severityColors = {
    high: "border-destructive/30 bg-destructive/5",
    medium: "border-dpe-e/30 bg-dpe-e/5",
    low: "border-muted bg-muted/30",
  };

  const categoryLabels = {
    envelope: "Enveloppe",
    heating: "Chauffage",
    ventilation: "Ventilation",
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        {/* DPE Result */}
        <motion.section {...fadeInUp} transition={{ delay: 0 }} className="mb-10">
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="hero-gradient px-6 py-5 sm:px-8">
              <h1 className="font-serif text-2xl font-bold text-primary-foreground">
                Votre diagnostic énergétique estimé
              </h1>
              <p className="mt-1 text-sm text-primary-foreground/80">
                Basé sur les caractéristiques de votre logement
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
                      Classe estimée
                    </span>
                    <div className={`mt-1 inline-flex items-center gap-3 rounded-xl dpe-${dpeClass.toLowerCase()} px-6 py-3`}>
                      <span className="text-4xl font-bold">{dpeClass}</span>
                    </div>
                  </div>
                  <div className="mb-4 text-center md:text-left">
                    <span className="text-sm font-medium text-muted-foreground">
                      Consommation estimée
                    </span>
                    <p className="text-3xl font-bold text-foreground">
                      {consumption}{" "}
                      <span className="text-base font-normal text-muted-foreground">
                        kWh/m²/an
                      </span>
                    </p>
                  </div>
                  <div className="rounded-lg border border-dpe-e/30 bg-dpe-e/5 px-4 py-3">
                    <div className="flex items-start gap-2">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-dpe-e" />
                      <p className="text-xs text-muted-foreground">
                        <strong>Estimation indicative.</strong> Ce résultat ne remplace pas un DPE officiel réalisé par un diagnostiqueur certifié. Il vous permet de comprendre les facteurs clés de votre performance énergétique.
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
          <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-bold text-foreground">
            <TrendingDown className="h-5 w-5 text-primary" />
            Répartition de la consommation
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Chauffage", value: energyBreakdown.heating, color: "bg-dpe-f" },
              { label: "Eau chaude", value: energyBreakdown.hotWater, color: "bg-dpe-d" },
              { label: "Pertes d'enveloppe", value: energyBreakdown.envelopeLosses, color: "bg-dpe-e" },
            ].map((item) => {
              const pct = Math.round((item.value / energyBreakdown.total) * 100);
              return (
                <div key={item.label} className="card-elevated rounded-xl border bg-card p-5">
                  <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                  <p className="mt-1 text-2xl font-bold text-foreground">
                    {pct}%
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className={`h-full rounded-full ${item.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    ~{item.value} kWh/m²/an
                  </p>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Weaknesses */}
        {weaknesses.length > 0 && (
          <motion.section {...fadeInUp} transition={{ delay: 0.2 }} className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-bold text-foreground">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Points faibles identifiés
            </h2>
            <div className="grid gap-3">
              {weaknesses.map((w, index) => (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.08 }}
                  className={`rounded-xl border-l-4 p-4 ${severityColors[w.severity]}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          {categoryLabels[w.category]}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          w.severity === "high"
                            ? "bg-destructive/10 text-destructive"
                            : w.severity === "medium"
                            ? "bg-dpe-e/10 text-dpe-e"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          Impact {w.severity === "high" ? "élevé" : w.severity === "medium" ? "moyen" : "faible"}
                        </span>
                      </div>
                      <h3 className="mt-1.5 text-sm font-semibold text-foreground">
                        {w.label}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {w.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Recommendations */}
        <motion.section {...fadeInUp} transition={{ delay: 0.3 }} className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-bold text-foreground">
            <Wrench className="h-5 w-5 text-primary" />
            Recommandations de rénovation
          </h2>
          <div className="grid gap-4">
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="card-elevated overflow-hidden rounded-xl border bg-card"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${priorityColors[rec.priority]}`}>
                          {priorityLabels[rec.priority]}
                        </span>
                        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                          ~{rec.estimatedSaving}% d'économies
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-foreground">{rec.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{rec.reason}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-lg bg-secondary/60 px-3 py-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Impact DPE
                      </span>
                      <p className="mt-0.5 text-xs font-medium text-foreground">{rec.dpeImpact}</p>
                    </div>
                    <div className="rounded-lg bg-secondary/60 px-3 py-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Confort
                      </span>
                      <p className="mt-0.5 text-xs font-medium text-foreground">{rec.comfortImpact}</p>
                    </div>
                    <div className="rounded-lg bg-secondary/60 px-3 py-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Facture
                      </span>
                      <p className="mt-0.5 text-xs font-medium text-foreground">{rec.billImpact}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg border bg-background/50 p-4">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {rec.explanation}
                      </p>
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
            <div className="bg-secondary/40 px-6 py-5 sm:px-8">
              <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-foreground">
                <CheckCircle className="h-5 w-5 text-accent" />
                Comprendre pour mieux rénover
              </h2>
            </div>
            <div className="space-y-5 p-6 sm:p-8">
              <div>
                <h3 className="font-serif text-base font-semibold text-foreground">
                  Le DPE est un indicateur, pas une fatalité
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Votre classe énergétique est déterminée par des facteurs identifiables et mesurables : l'enveloppe du bâtiment, le système de chauffage et vos usages. Chaque point faible peut être amélioré de façon ciblée.
                </p>
              </div>
              <div>
                <h3 className="font-serif text-base font-semibold text-foreground">
                  Ciblez le maillon le plus faible
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  La rénovation la plus efficace est celle qui s'attaque au plus gros point faible. Changer de chauffage sans isoler revient à chauffer l'extérieur. Inversement, une bonne isolation réduit les besoins et permet de dimensionner un système de chauffage plus petit et moins coûteux.
                </p>
              </div>
              <div>
                <h3 className="font-serif text-base font-semibold text-foreground">
                  Le meilleur investissement n'est pas le plus gros
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  L'isolation des combles ou le traitement des fuites d'air sont souvent les travaux les moins chers mais parmi les plus efficaces. Priorisez le rapport coût/efficacité plutôt que les travaux les plus visibles.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Back to questionnaire */}
        <div className="flex justify-center pb-12">
          <Button variant="outline" size="lg" onClick={() => navigate("/questionnaire")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Refaire le diagnostic
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Results;
