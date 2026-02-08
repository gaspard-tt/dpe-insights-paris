import type {
  FormData,
  DPEResult,
  DPEClass,
  EnergyBreakdown,
  Weakness,
  Recommendation,
} from "./types";

// --- Base consumption by construction period (kWh/m²/an) ---
const BASE_CONSUMPTION: Record<string, number> = {
  before1948: 380,
  "1948-1974": 330,
  "1975-1988": 250,
  "1989-2000": 190,
  "2001-2012": 130,
  after2012: 70,
};

// --- Climate zone multiplier ---
const CLIMATE_MULTIPLIER: Record<string, number> = {
  H1: 1.15, // Nord, continental
  H2: 1.0,  // Atlantique, tempéré
  H3: 0.8,  // Méditerranéen
};

// --- Insulation coefficients (lower = better) ---
const INSULATION_COEFF: Record<string, number> = {
  none: 1.4,
  poor: 1.2,
  average: 1.0,
  good: 0.75,
  excellent: 0.55,
};

// --- Window type coefficient ---
const WINDOW_COEFF: Record<string, number> = {
  single: 1.35,
  double: 1.0,
  triple: 0.8,
};

// --- Heating system efficiency ---
const HEATING_EFFICIENCY: Record<string, number> = {
  electric_convector: 1.3,
  electric_radiant: 1.1,
  gas_boiler: 1.0,
  gas_condensing: 0.82,
  fuel_boiler: 1.2,
  heat_pump: 0.55,
  wood: 0.9,
};

// --- Heating age multiplier ---
const HEATING_AGE_MULT: Record<string, number> = {
  less5: 0.9,
  "5to15": 1.0,
  "15to25": 1.15,
  more25: 1.35,
};

// --- Distribution system ---
const DISTRIBUTION_COEFF: Record<string, number> = {
  radiators: 1.0,
  floor_heating: 0.88,
};

// --- Ventilation impact ---
const VENTILATION_COEFF: Record<string, number> = {
  natural: 1.2,
  vmc_simple: 1.0,
  vmc_double: 0.78,
};

// --- Air leakage ---
const LEAKAGE_COEFF: Record<string, number> = {
  none: 0.95,
  slight: 1.0,
  moderate: 1.12,
  significant: 1.3,
};

// --- Usage behavior ---
const USAGE_COEFF: Record<string, number> = {
  low: 0.85,
  average: 1.0,
  high: 1.2,
};

// --- Orientation bonus (south gets solar gains) ---
const ORIENTATION_COEFF: Record<string, number> = {
  south: 0.92,
  east: 0.97,
  west: 0.97,
  north: 1.05,
};

// --- DPE class thresholds (kWh/m²/an) ---
function getDPEClass(consumption: number): DPEClass {
  if (consumption <= 70) return "A";
  if (consumption <= 110) return "B";
  if (consumption <= 180) return "C";
  if (consumption <= 250) return "D";
  if (consumption <= 330) return "E";
  if (consumption <= 420) return "F";
  return "G";
}

// --- Calculate consumption ---
function calculateConsumption(data: FormData): number {
  const base = BASE_CONSUMPTION[data.constructionPeriod];
  const climate = CLIMATE_MULTIPLIER[data.climateZone];

  // Envelope factor = weighted average of insulation qualities
  const wallWeight = 0.4;
  const roofWeight = 0.3;
  const floorWeight = 0.15;
  const windowWeight = 0.15;

  const envelopeFactor =
    INSULATION_COEFF[data.wallInsulation] * wallWeight +
    INSULATION_COEFF[data.roofInsulation] * roofWeight +
    INSULATION_COEFF[data.floorInsulation] * floorWeight +
    WINDOW_COEFF[data.windowType] * windowWeight;

  // Window surface ratio impact
  const windowRatio = data.windowSurface / data.surfaceArea;
  const windowSurfaceImpact = windowRatio > 0.2 ? 0.95 : windowRatio < 0.1 ? 1.05 : 1.0;

  // Heating system
  const heatingFactor =
    HEATING_EFFICIENCY[data.heatingType] *
    HEATING_AGE_MULT[data.heatingAge] *
    DISTRIBUTION_COEFF[data.distributionSystem];

  // Ventilation
  const ventilationFactor =
    VENTILATION_COEFF[data.ventilationType] *
    LEAKAGE_COEFF[data.airLeakage];

  // Usage
  const usageFactor =
    (USAGE_COEFF[data.heatingHabits] * 0.6 + USAGE_COEFF[data.hotWaterUsage] * 0.4);

  // Orientation
  const orientationFactor = ORIENTATION_COEFF[data.orientation];

  const consumption =
    base * climate * envelopeFactor * windowSurfaceImpact *
    heatingFactor * ventilationFactor * usageFactor * orientationFactor;

  return Math.round(consumption);
}

// --- Break down energy by category ---
function calculateBreakdown(total: number, data: FormData): EnergyBreakdown {
  const envelopeShare =
    (INSULATION_COEFF[data.wallInsulation] +
      INSULATION_COEFF[data.roofInsulation] +
      WINDOW_COEFF[data.windowType]) / 3;

  const heatingShare = HEATING_EFFICIENCY[data.heatingType];
  const hotWaterShare = USAGE_COEFF[data.hotWaterUsage] * 0.3;

  const totalShares = envelopeShare + heatingShare + hotWaterShare;

  return {
    heating: Math.round((heatingShare / totalShares) * total),
    hotWater: Math.round((hotWaterShare / totalShares) * total),
    envelopeLosses: Math.round((envelopeShare / totalShares) * total),
    total,
  };
}

// --- Identify weaknesses ---
function identifyWeaknesses(data: FormData): Weakness[] {
  const weaknesses: Weakness[] = [];

  // Envelope weaknesses
  if (data.wallInsulation === "none" || data.wallInsulation === "poor") {
    weaknesses.push({
      id: "wall_insulation",
      label: "Isolation des murs insuffisante",
      category: "envelope",
      severity: data.wallInsulation === "none" ? "high" : "medium",
      description:
        "Les murs sont responsables de 20 à 25% des pertes thermiques d'un logement. Une mauvaise isolation entraîne des déperditions importantes et un inconfort thermique (parois froides).",
      impactScore: data.wallInsulation === "none" ? 90 : 70,
    });
  }

  if (data.roofInsulation === "none" || data.roofInsulation === "poor") {
    weaknesses.push({
      id: "roof_insulation",
      label: "Isolation de la toiture insuffisante",
      category: "envelope",
      severity: data.roofInsulation === "none" ? "high" : "high",
      description:
        "La toiture représente jusqu'à 30% des pertes de chaleur. C'est souvent le premier poste de déperdition thermique, surtout dans les maisons individuelles.",
      impactScore: data.roofInsulation === "none" ? 95 : 80,
    });
  }

  if (data.floorInsulation === "none" || data.floorInsulation === "poor") {
    weaknesses.push({
      id: "floor_insulation",
      label: "Isolation du plancher insuffisante",
      category: "envelope",
      severity: "medium",
      description:
        "Le plancher bas contribue à environ 7 à 10% des pertes thermiques. Un plancher mal isolé provoque une sensation de froid au sol.",
      impactScore: data.floorInsulation === "none" ? 50 : 35,
    });
  }

  if (data.windowType === "single") {
    weaknesses.push({
      id: "windows",
      label: "Simple vitrage — pertes thermiques élevées",
      category: "envelope",
      severity: "high",
      description:
        "Le simple vitrage laisse passer 3 à 4 fois plus de chaleur que le double vitrage. C'est aussi une source majeure d'inconfort (sensation de froid, condensation).",
      impactScore: 85,
    });
  }

  // Heating weaknesses
  if (data.heatingType === "electric_convector") {
    weaknesses.push({
      id: "heating_type",
      label: "Chauffage par convecteurs électriques",
      category: "heating",
      severity: "high",
      description:
        "Les convecteurs électriques sont le mode de chauffage le moins efficace. Ils assèchent l'air et créent des variations de température importantes.",
      impactScore: 80,
    });
  }

  if (data.heatingType === "fuel_boiler") {
    weaknesses.push({
      id: "heating_fuel",
      label: "Chaudière fioul — énergie carbonée et coûteuse",
      category: "heating",
      severity: "high",
      description:
        "Le fioul est l'une des énergies les plus polluantes et les plus chères. Les chaudières fioul seront progressivement interdites dans les années à venir.",
      impactScore: 85,
    });
  }

  if (data.heatingAge === "more25" || data.heatingAge === "15to25") {
    weaknesses.push({
      id: "heating_age",
      label: "Système de chauffage vieillissant",
      category: "heating",
      severity: data.heatingAge === "more25" ? "high" : "medium",
      description:
        "Un système de chauffage ancien perd en efficacité avec le temps. Son rendement diminue et ses émissions augmentent. Un remplacement peut réduire significativement la consommation.",
      impactScore: data.heatingAge === "more25" ? 75 : 50,
    });
  }

  // Ventilation weaknesses
  if (data.ventilationType === "natural") {
    weaknesses.push({
      id: "ventilation",
      label: "Ventilation naturelle — incontrôlée",
      category: "ventilation",
      severity: "medium",
      description:
        "Sans ventilation mécanique, le renouvellement d'air est incontrôlé. Cela entraîne des pertes thermiques et peut provoquer des problèmes d'humidité et de qualité d'air.",
      impactScore: 60,
    });
  }

  if (data.airLeakage === "significant" || data.airLeakage === "moderate") {
    weaknesses.push({
      id: "air_leakage",
      label: "Fuites d'air importantes",
      category: "ventilation",
      severity: data.airLeakage === "significant" ? "high" : "medium",
      description:
        "Les infiltrations d'air parasites augmentent considérablement les besoins de chauffage. Elles sont souvent localisées autour des fenêtres, des portes et des passages de gaines.",
      impactScore: data.airLeakage === "significant" ? 70 : 45,
    });
  }

  // Sort by impact
  weaknesses.sort((a, b) => b.impactScore - a.impactScore);
  return weaknesses;
}

// --- Generate recommendations ---
function generateRecommendations(data: FormData, weaknesses: Weakness[]): Recommendation[] {
  const recommendations: Recommendation[] = [];

  const weaknessIds = new Set(weaknesses.map((w) => w.id));

  if (weaknessIds.has("roof_insulation")) {
    recommendations.push({
      id: "insulate_roof",
      name: "Isoler la toiture / les combles",
      priority: "high",
      reason:
        "La toiture est le premier poste de déperdition. L'isoler est le geste le plus rentable.",
      dpeImpact: "Gain potentiel de 1 à 2 classes",
      comfortImpact: "Forte amélioration du confort thermique en hiver et en été",
      billImpact: "Réduction estimée de 20 à 30% sur la facture de chauffage",
      explanation:
        "L'air chaud monte naturellement. Sans isolation efficace en toiture, une grande partie de la chaleur produite s'échappe directement. L'isolation des combles (perdus ou aménagés) est souvent le travail le plus simple et le plus rentable.",
      estimatedSaving: 25,
    });
  }

  if (weaknessIds.has("wall_insulation")) {
    recommendations.push({
      id: "insulate_walls",
      name: "Améliorer l'isolation des murs",
      priority: "high",
      reason:
        "Les murs sont la deuxième source de pertes. L'isolation par l'intérieur ou l'extérieur transforme le confort.",
      dpeImpact: "Gain potentiel de 1 classe",
      comfortImpact: "Suppression de l'effet paroi froide, confort homogène",
      billImpact: "Réduction estimée de 15 à 25% sur la facture",
      explanation:
        "Des murs mal isolés laissent passer la chaleur en continu. L'isolation thermique par l'extérieur (ITE) est la solution la plus performante car elle supprime les ponts thermiques. L'isolation par l'intérieur (ITI) est une alternative moins coûteuse.",
      estimatedSaving: 20,
    });
  }

  if (weaknessIds.has("windows")) {
    recommendations.push({
      id: "replace_windows",
      name: "Remplacer le simple vitrage",
      priority: "high",
      reason:
        "Le simple vitrage multiplie par 3-4 les pertes par les fenêtres.",
      dpeImpact: "Gain modéré (0.5 à 1 classe selon surface vitrée)",
      comfortImpact: "Forte amélioration : fin des courants d'air froid, moins de condensation",
      billImpact: "Réduction estimée de 10 à 15%",
      explanation:
        "Le double vitrage à isolation renforcée (VIR) divise par 3 les pertes thermiques par les fenêtres. Le triple vitrage est recommandé uniquement en zone froide ou pour les façades nord.",
      estimatedSaving: 12,
    });
  }

  if (weaknessIds.has("heating_type") || weaknessIds.has("heating_fuel")) {
    recommendations.push({
      id: "upgrade_heating",
      name: "Remplacer le système de chauffage",
      priority: "high",
      reason:
        "Votre système actuel consomme bien plus que les alternatives modernes.",
      dpeImpact: "Gain de 1 à 2 classes possible",
      comfortImpact: "Chaleur plus homogène, meilleure régulation",
      billImpact: "Réduction estimée de 30 à 50% sur le poste chauffage",
      explanation:
        "Une pompe à chaleur air/eau offre un rendement 3 à 4 fois supérieur à un convecteur électrique. Une chaudière gaz à condensation est également un bon compromis. L'important est de dimensionner correctement le nouveau système à l'enveloppe du bâtiment.",
      estimatedSaving: 35,
    });
  } else if (weaknessIds.has("heating_age")) {
    recommendations.push({
      id: "modernize_heating",
      name: "Moderniser le système de chauffage",
      priority: "medium",
      reason:
        "Votre système vieillit et perd en efficacité.",
      dpeImpact: "Gain de 0.5 à 1 classe",
      comfortImpact: "Meilleure régulation et fiabilité",
      billImpact: "Réduction estimée de 10 à 20%",
      explanation:
        "Même sans changer de technologie, un équipement récent offre un meilleur rendement. Pensez aussi à la régulation (thermostat programmable, robinets thermostatiques) pour optimiser la consommation.",
      estimatedSaving: 15,
    });
  }

  if (weaknessIds.has("ventilation")) {
    recommendations.push({
      id: "install_vmc",
      name: "Installer une VMC",
      priority: "medium",
      reason:
        "La ventilation naturelle ne permet pas de contrôler les pertes d'air.",
      dpeImpact: "Impact modéré sur le DPE",
      comfortImpact: "Meilleure qualité de l'air, moins d'humidité",
      billImpact: "Réduction de 5 à 10% (VMC double flux : jusqu'à 15%)",
      explanation:
        "Une VMC simple flux hygroréglable adapte le débit d'air à l'humidité. Une VMC double flux récupère la chaleur de l'air sortant pour préchauffer l'air entrant, ce qui réduit les pertes de ventilation de 70 à 90%.",
      estimatedSaving: 8,
    });
  }

  if (weaknessIds.has("air_leakage")) {
    recommendations.push({
      id: "seal_air_leaks",
      name: "Traiter les fuites d'air parasites",
      priority: "medium",
      reason:
        "Les infiltrations augmentent les besoins de chauffage de façon invisible.",
      dpeImpact: "Impact modéré mais effet immédiat",
      comfortImpact: "Suppression des courants d'air, meilleur confort",
      billImpact: "Réduction estimée de 5 à 10%",
      explanation:
        "L'étanchéité à l'air se traite en jointant les fenêtres, en calfeutrant les passages de gaines et en vérifiant les coffres de volets roulants. C'est souvent peu coûteux et très efficace.",
      estimatedSaving: 7,
    });
  }

  if (weaknessIds.has("floor_insulation")) {
    recommendations.push({
      id: "insulate_floor",
      name: "Isoler le plancher bas",
      priority: "low",
      reason:
        "Le plancher contribue modérément aux pertes mais l'isolation améliore le confort.",
      dpeImpact: "Gain faible à modéré",
      comfortImpact: "Sol moins froid, confort amélioré",
      billImpact: "Réduction estimée de 5 à 7%",
      explanation:
        "L'isolation du plancher bas est souvent simple à réaliser si vous avez un vide sanitaire ou une cave. Elle supprime la sensation de sol froid et réduit les déperditions par le bas du bâtiment.",
      estimatedSaving: 6,
    });
  }

  // If no major weaknesses, suggest optimization
  if (recommendations.length === 0) {
    recommendations.push({
      id: "optimize",
      name: "Optimiser la régulation et les usages",
      priority: "low",
      reason: "Votre logement est globalement bien équipé.",
      dpeImpact: "Maintien ou léger gain",
      comfortImpact: "Optimisation du confort existant",
      billImpact: "Réduction de 5 à 10% par les comportements",
      explanation:
        "Installez un thermostat programmable, réglez la température à 19°C en journée et 16°C la nuit. Entretenez régulièrement votre système de chauffage et vérifiez l'étanchéité de vos menuiseries.",
      estimatedSaving: 5,
    });
  }

  return recommendations;
}

// --- Main calculation function ---
export function calculateDPE(data: FormData): DPEResult {
  const consumption = calculateConsumption(data);
  const dpeClass = getDPEClass(consumption);
  const energyBreakdown = calculateBreakdown(consumption, data);
  const weaknesses = identifyWeaknesses(data);
  const recommendations = generateRecommendations(data, weaknesses);

  return {
    dpeClass,
    consumption,
    energyBreakdown,
    weaknesses,
    recommendations,
  };
}

// --- DPE class metadata ---
export const DPE_CLASSES: { class: DPEClass; label: string; max: number; color: string }[] = [
  { class: "A", label: "≤ 70", max: 70, color: "dpe-a" },
  { class: "B", label: "71–110", max: 110, color: "dpe-b" },
  { class: "C", label: "111–180", max: 180, color: "dpe-c" },
  { class: "D", label: "181–250", max: 250, color: "dpe-d" },
  { class: "E", label: "251–330", max: 330, color: "dpe-e" },
  { class: "F", label: "331–420", max: 420, color: "dpe-f" },
  { class: "G", label: "> 420", max: 9999, color: "dpe-g" },
];
