import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, BarChart3 } from "lucide-react";
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

const STEP_LABELS = [
  "Général",
  "Enveloppe",
  "Chauffage",
  "Énergie",
  "Ventilation",
  "Usages",
];

const Questionnaire = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
  const [direction, setDirection] = useState(1);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < STEP_LABELS.length - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = () => {
    const result = calculateDPE(formData);
    navigate("/resultats", { state: { result, formData } });
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

          <div className="mt-8 flex items-center justify-between border-t pt-6">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Précédent
            </Button>

            {isLastStep ? (
              <Button variant="hero" size="lg" onClick={handleSubmit} className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Voir mes résultats
              </Button>
            ) : (
              <Button onClick={nextStep} className="gap-2">
                Suivant
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
