import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

const WizardProgress = ({ currentStep, totalSteps, stepLabels }: WizardProgressProps) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Étape {currentStep + 1} / {totalSteps}
        </span>
        <span className="text-sm font-semibold text-primary">
          {stepLabels[currentStep]}
        </span>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="mt-3 flex justify-between">
        {stepLabels.map((label, index) => (
          <motion.div
            key={label}
            className={`flex flex-col items-center ${
              index <= currentStep ? "text-primary" : "text-muted-foreground/40"
            }`}
            initial={false}
            animate={{
              scale: index === currentStep ? 1.1 : 1,
            }}
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                index < currentStep
                  ? "bg-primary text-primary-foreground"
                  : index === currentStep
                  ? "hero-gradient text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {index < currentStep ? "✓" : index + 1}
            </div>
            <span className="mt-1 hidden text-[10px] font-medium md:block">
              {label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WizardProgress;
