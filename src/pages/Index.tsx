import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Lightbulb,
  Shield,
  TrendingDown,
  Wrench,
  BarChart3,
  Thermometer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import DPEScale from "@/components/DPEScale";
import heroImage from "@/assets/hero-house.jpg";

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
};

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Illustration d'une maison et sa performance énergétique"
            className="h-full w-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        <div className="container relative z-10 mx-auto px-4 pb-20 pt-16 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
                <Thermometer className="h-3.5 w-3.5 text-primary" />
                Simulateur DPE gratuit
              </span>

              <h1 className="mt-6 font-serif text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Comprenez la performance{" "}
                <span className="text-gradient">énergétique</span>{" "}
                de votre logement
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                Estimez votre classe DPE, identifiez les points faibles de votre habitat
                et découvrez les rénovations les plus efficaces pour réduire vos factures.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  variant="hero"
                  size="xl"
                  onClick={() => navigate("/questionnaire")}
                  className="gap-3"
                >
                  Lancer mon diagnostic
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  Gratuit · 5 minutes · Sans inscription
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What is DPE */}
      <section className="border-t bg-card py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <motion.div {...fadeInUp} transition={{ duration: 0.5 }} className="mb-12 text-center">
            <h2 className="font-serif text-3xl font-bold text-foreground">
              Qu'est-ce que le DPE ?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Le Diagnostic de Performance Énergétique classe les logements de A (très performant)
              à G (très énergivore). Il est obligatoire pour vendre ou louer un bien en France.
            </p>
          </motion.div>

          <motion.div {...fadeInUp} transition={{ duration: 0.5, delay: 0.1 }} className="mx-auto max-w-md">
            <DPEScale size="md" />
          </motion.div>
        </div>
      </section>

      {/* Why it matters */}
      <section className="py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <motion.div {...fadeInUp} transition={{ duration: 0.5 }} className="mb-12 text-center">
            <h2 className="font-serif text-3xl font-bold text-foreground">
              Pourquoi c'est important
            </h2>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: TrendingDown,
                title: "Réduire vos factures",
                desc: "Un logement classe G consomme jusqu'à 6 fois plus qu'un logement classe A. Comprendre votre DPE, c'est identifier où partent vos euros.",
              },
              {
                icon: Shield,
                title: "Anticiper la réglementation",
                desc: "Depuis 2025, les logements classe G sont interdits à la location. Les classes F suivront en 2028, puis les E en 2034.",
              },
              {
                icon: Building2,
                title: "Valoriser votre bien",
                desc: "Un bon DPE augmente la valeur de votre logement. L'écart de prix entre une classe D et une classe B peut atteindre 10 à 15%.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                {...fadeInUp}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="card-elevated rounded-xl border bg-card p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg hero-gradient">
                  <item.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What this tool does */}
      <section className="border-t bg-card py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <motion.div {...fadeInUp} transition={{ duration: 0.5 }} className="mb-12 text-center">
            <h2 className="font-serif text-3xl font-bold text-foreground">
              Ce que cet outil vous apporte
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Plus qu'un simple score : un diagnostic complet et des recommandations personnalisées.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: BarChart3,
                title: "Estimation de votre classe DPE",
                desc: "Un score basé sur les caractéristiques réelles de votre logement.",
              },
              {
                icon: TrendingDown,
                title: "Analyse des déperditions",
                desc: "Identifiez précisément où et pourquoi votre logement perd de l'énergie.",
              },
              {
                icon: Wrench,
                title: "Recommandations de rénovation",
                desc: "Des priorités claires, classées par rapport coût/efficacité.",
              },
              {
                icon: Lightbulb,
                title: "Contenu éducatif",
                desc: "Comprenez les mécanismes pour prendre des décisions éclairées.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                {...fadeInUp}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-start gap-4 rounded-xl border bg-background p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <motion.div {...fadeInUp} transition={{ duration: 0.5 }}>
            <h2 className="font-serif text-3xl font-bold text-foreground">
              Prêt à comprendre votre logement ?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              En 6 étapes simples, obtenez une analyse complète de la performance
              énergétique de votre habitat et des pistes concrètes d'amélioration.
            </p>
            <Button
              variant="hero"
              size="xl"
              onClick={() => navigate("/questionnaire")}
              className="mt-8 gap-3"
            >
              Commencer mon analyse
              <ArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>
            Cet outil fournit une estimation indicative. Il ne remplace pas un DPE officiel
            réalisé par un diagnostiqueur certifié.
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} Mon DPE — Simulateur éducatif de performance énergétique
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
