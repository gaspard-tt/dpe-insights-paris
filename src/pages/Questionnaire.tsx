import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, BarChart3, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import WizardProgress from "@/components/WizardProgress";
import StepGeneralInfo from "@/components/steps/StepGeneralInfo";
import StepEnvelope from "@/components/steps/StepEnvelope";
import StepHeating from "@/components/steps/StepHeating";
import StepEnergy from "@/components/steps/StepEnergy";
import StepVentilation from "@/components/steps/StepVentilation";
import StepOccupancy from "@/components/steps/StepOccupancy";
import Header from "@/components/Header";
import type { FormData } from "@/lib/types";
import { DEFAULT_FORM_DATA } from "@/lib/types";
import { calculateDPE } from "@/lib/dpe-calculator";
import { useI18n } from "@/lib/i18n";

const Questionnaire = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
  const [direction, setDirection] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);

  const STEP_LABELS = [
    t("step.general"),
    t("step.envelope"),
    t("step.heating"),
    t("step.energy"),
    t("step.ventilation"),
    t("step.usage"),
  ];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < STEP_LABELS.length - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSubmit = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const result = calculateDPE(formData);
      navigate("/resultats", { state: { result, formData } });
    }, 2000);
  };

  const isLastStep = currentStep === STEP_LABELS.length - 1;

  const renderStep = () => {
    const props = { data: formData, onChange: updateFormData };
    switch (currentStep) {
      case 0: return <StepGeneralInfo {...props} />;
      case 1: return <StepEnvelope {...props} />;
      case 2: return <StepHeating {...props} />;
      case 3: return <StepEnergy {...props} />;
      case 4: return <StepVentilation {...props} />;
      case 5: return <StepOccupancy {...props} />;
      default: return null;
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  if (isCalculating) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              {t("loading.title")}
            </h2>
            <p className="max-w-md text-muted-foreground">
              {t("loading.desc")}
            </p>
            <div className="mt-4 h-2 w-64 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full hero-gradient"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <WizardProgress
          currentStep={currentStep}
          totalSteps={STEP_LABELS.length}
          stepLabels={STEP_LABELS}
        />

        <div className="overflow-hidden rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* Privacy note */}
          <div className="mt-6 flex items-center justify-center gap-1.5 rounded-lg bg-muted/40 px-4 py-2.5 text-center text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            {t("footer.privacy")}
          </div>

          <div className="mt-6 flex items-center justify-between border-t pt-6">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("wizard.prev")}
            </Button>

            {isLastStep ? (
              <Button variant="hero" size="lg" onClick={handleSubmit} className="gap-2">
                <BarChart3 className="h-4 w-4" />
                {t("wizard.submit")}
              </Button>
            ) : (
              <Button onClick={nextStep} className="gap-2">
                {t("wizard.next")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Questionnaire;
