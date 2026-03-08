import type {
  FormData,
  DPEResult,
  DPEClass,
  EnergyBreakdown,
  Weakness,
  Recommendation,
  HeatingType,
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

// --- Climate zone multiplier (Paris = H1a) ---
const CLIMATE_MULTIPLIER: Record<string, number> = {
  H1: 1.15,
  H2: 1.0,
  H3: 0.8,
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

// --- Orientation bonus ---
const ORIENTATION_COEFF: Record<string, number> = {
  south: 0.92,
  east: 0.97,
  west: 0.97,
  north: 1.05,
};

// --- DPE class thresholds ---
function getDPEClass(consumption: number): DPEClass {
  if (consumption <= 70) return "A";
  if (consumption <= 110) return "B";
  if (consumption <= 180) return "C";
  if (consumption <= 250) return "D";
  if (consumption <= 330) return "E";
  if (consumption <= 420) return "F";
  return "G";
}

function getPrimaryHeatingType(data: FormData): HeatingType {
  if (data.heatingTypes && data.heatingTypes.length > 0) {
    return data.heatingTypes[0];
  }
  return "gas_boiler";
}

// --- Calculate consumption ---
function calculateConsumption(data: FormData): number {
  const base = BASE_CONSUMPTION[data.constructionPeriod || "1975-1988"];
  // Paris is always H1
  const climate = CLIMATE_MULTIPLIER[data.climateZone || "H1"];

  const wallWeight = 0.4;
  const roofWeight = 0.3;
  const floorWeight = 0.15;
  const windowWeight = 0.15;

  const envelopeFactor =
    INSULATION_COEFF[data.wallInsulation || "average"] * wallWeight +
    INSULATION_COEFF[data.roofInsulation || "average"] * roofWeight +
    INSULATION_COEFF[data.floorInsulation || "average"] * floorWeight +
    WINDOW_COEFF[data.windowType || "double"] * windowWeight;

  const surfaceArea = data.surfaceArea || 70;
  const windowSurface = data.windowSurface || 15;
  const windowRatio = windowSurface / surfaceArea;
  const windowSurfaceImpact = windowRatio > 0.2 ? 0.95 : windowRatio < 0.1 ? 1.05 : 1.0;

  const heatingTypes = data.heatingTypes || [];
  let heatingEfficiency = HEATING_EFFICIENCY["gas_boiler"];
  if (heatingTypes.length > 0) {
    heatingEfficiency = heatingTypes.reduce((sum, ht) => sum + (HEATING_EFFICIENCY[ht] || 1.0), 0) / heatingTypes.length;
  }

  const heatingFactor =
    heatingEfficiency *
    HEATING_AGE_MULT[data.heatingAge || "5to15"] *
    DISTRIBUTION_COEFF[data.distributionSystem || "radiators"];

  const ventilationFactor =
    VENTILATION_COEFF[data.ventilationType || "vmc_simple"] *
    LEAKAGE_COEFF[data.airLeakage || "slight"];

  // Use thermostat temp if available
  let usageFactor: number;
  if (data.thermostatTemp) {
    const tempCoeff = 1 + (data.thermostatTemp - 19) * 0.07;
    usageFactor = tempCoeff * 0.6 + USAGE_COEFF[data.hotWaterUsage || "average"] * 0.4;
  } else {
    usageFactor =
      USAGE_COEFF[data.heatingHabits || "average"] * 0.6 +
      USAGE_COEFF[data.hotWaterUsage || "average"] * 0.4;
  }

  const orientationFactor = ORIENTATION_COEFF[data.orientation || "south"];

  const consumption =
    base * climate * envelopeFactor * windowSurfaceImpact *
    heatingFactor * ventilationFactor * usageFactor * orientationFactor;

  return Math.round(consumption);
}

// --- Break down energy by category ---
function calculateBreakdown(total: number, data: FormData): EnergyBreakdown {
  const envelopeShare =
    (INSULATION_COEFF[data.wallInsulation || "average"] +
      INSULATION_COEFF[data.roofInsulation || "average"] +
      WINDOW_COEFF[data.windowType || "double"]) / 3;

  const primaryHT = getPrimaryHeatingType(data);
  const heatingShare = HEATING_EFFICIENCY[primaryHT];
  const hotWaterShare = USAGE_COEFF[data.hotWaterUsage || "average"] * 0.3;

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

  if (data.wallInsulation === "none" || data.wallInsulation === "poor") {
    weaknesses.push({
      id: "wall_insulation",
      label: "Isolation des murs insuffisante",
      category: "envelope",
      severity: data.wallInsulation === "none" ? "high" : "medium",
      description: "Les murs sont responsables de 20 à 25% des pertes thermiques. Dans les immeubles haussmanniens parisiens, les murs en pierre de 50 cm n'isolent que faiblement.",
      impactScore: data.wallInsulation === "none" ? 90 : 70,
    });
  }

  if (data.roofInsulation === "none" || data.roofInsulation === "poor") {
    weaknesses.push({
      id: "roof_insulation",
      label: "Isolation de la toiture insuffisante",
      category: "envelope",
      severity: "high",
      description: "La toiture représente jusqu'à 30% des pertes de chaleur — critique pour les derniers étages parisiens et les chambres de bonne.",
      impactScore: data.roofInsulation === "none" ? 95 : 80,
    });
  }

  if (data.floorInsulation === "none" || data.floorInsulation === "poor") {
    weaknesses.push({
      id: "floor_insulation",
      label: "Isolation du plancher insuffisante",
      category: "envelope",
      severity: "medium",
      description: "Le plancher bas contribue à environ 7 à 10% des pertes thermiques, surtout au rez-de-chaussée sur cave.",
      impactScore: data.floorInsulation === "none" ? 50 : 35,
    });
  }

  if (data.windowType === "single") {
    weaknesses.push({
      id: "windows",
      label: "Simple vitrage — pertes thermiques élevées",
      category: "envelope",
      severity: "high",
      description: "Courant dans le parc ancien parisien. Le simple vitrage laisse passer 3 à 4 fois plus de chaleur que le double vitrage.",
      impactScore: 85,
    });
  }

  const heatingTypes = data.heatingTypes || [];
  if (heatingTypes.includes("electric_convector")) {
    weaknesses.push({
      id: "heating_type",
      label: "Chauffage par convecteurs électriques",
      category: "heating",
      severity: "high",
      description: "Les convecteurs sont fréquents dans les studios parisiens mais représentent le mode de chauffage le moins efficace.",
      impactScore: 80,
    });
  }

  if (heatingTypes.includes("fuel_boiler")) {
    weaknesses.push({
      id: "heating_fuel",
      label: "Chaudière fioul — énergie carbonée et coûteuse",
      category: "heating",
      severity: "high",
      description: "Le fioul est l'une des énergies les plus polluantes. Son remplacement sera obligatoire à terme.",
      impactScore: 85,
    });
  }

  if (data.heatingAge === "more25" || data.heatingAge === "15to25") {
    weaknesses.push({
      id: "heating_age",
      label: "Système de chauffage vieillissant",
      category: "heating",
      severity: data.heatingAge === "more25" ? "high" : "medium",
      description: "Un système ancien perd en efficacité avec le temps, surtout les chaudières collectives fréquentes dans les copropriétés parisiennes.",
      impactScore: data.heatingAge === "more25" ? 75 : 50,
    });
  }

  if (data.ventilationType === "natural") {
    weaknesses.push({
      id: "ventilation",
      label: "Ventilation naturelle — incontrôlée",
      category: "ventilation",
      severity: "medium",
      description: "Sans ventilation mécanique, le renouvellement d'air est incontrôlé — problème fréquent dans les immeubles anciens.",
      impactScore: 60,
    });
  }

  if (data.airLeakage === "significant" || data.airLeakage === "moderate") {
    weaknesses.push({
      id: "air_leakage",
      label: "Fuites d'air importantes",
      category: "ventilation",
      severity: data.airLeakage === "significant" ? "high" : "medium",
      description: "Les infiltrations d'air parasites augmentent les besoins de chauffage. Les fenêtres anciennes et les cheminées sont les premiers responsables.",
      impactScore: data.airLeakage === "significant" ? 70 : 45,
    });
  }

  weaknesses.sort((a, b) => b.impactScore - a.impactScore);
  return weaknesses;
}

// --- Generate recommendations with Paris-specific info ---
function generateRecommendations(data: FormData, weaknesses: Weakness[]): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const weaknessIds = new Set(weaknesses.map((w) => w.id));
  const isParis = data.postalCode === "75";

  if (weaknessIds.has("roof_insulation")) {
    recommendations.push({
      id: "insulate_roof",
      name: "Isoler la toiture ou les combles",
      priority: "high",
      reason: "La toiture est le premier poste de déperdition. L'isoler est le geste le plus rentable.",
      dpeImpact: "Gain potentiel de 1 à 2 classes",
      comfortImpact: "Forte amélioration du confort en hiver et en été",
      billImpact: "Réduction estimée de 20 à 30% sur la facture de chauffage",
      explanation: "L'air chaud monte naturellement. Sans isolation en toiture, la chaleur s'échappe. Pour les derniers étages parisiens, c'est souvent le travail le plus impactant.",
      estimatedSaving: 25,
      estimatedCost: "30–60 €/m² (combles perdus) à 100–200 €/m² (toiture par l'extérieur)",
      parisAid: isParis
        ? "Éco-rénovons Paris+ : subvention de la Ville de Paris jusqu'à 30% du montant des travaux. MaPrimeRénov' : jusqu'à 25 €/m² pour les ménages modestes."
        : "MaPrimeRénov' : jusqu'à 25 €/m² selon revenus. CEE (Certificats d'économies d'énergie) cumulables.",
      providers: isParis
        ? ["CAUE de Paris (conseil gratuit)", "Agence Parisienne du Climat", "Espace Conseil France Rénov' Paris"]
        : ["Espace Conseil France Rénov' Île-de-France"],
    });
  }

  if (weaknessIds.has("wall_insulation")) {
    recommendations.push({
      id: "insulate_walls",
      name: "Améliorer l'isolation des murs",
      priority: "high",
      reason: "Les murs sont la deuxième source de pertes. L'isolation transforme le confort.",
      dpeImpact: "Gain potentiel de 1 classe",
      comfortImpact: "Suppression de l'effet paroi froide",
      billImpact: "Réduction estimée de 15 à 25%",
      explanation: isParis
        ? "Dans les immeubles haussmanniens, l'ITE (Isolation Thermique par l'Extérieur) est souvent soumise à l'accord de l'ABF. L'ITI (par l'intérieur) est plus simple mais réduit la surface habitable."
        : "L'ITE est la solution la plus performante, l'ITI est une alternative moins coûteuse.",
      estimatedSaving: 20,
      estimatedCost: "100–180 €/m² (ITI) à 150–250 €/m² (ITE)",
      parisAid: isParis
        ? "Éco-rénovons Paris+ : aide majorée en copropriété. MaPrimeRénov' Copropriétés : jusqu'à 25% du montant des travaux."
        : "MaPrimeRénov' : selon revenus et gain énergétique. Prime CEE cumulable.",
      providers: isParis
        ? ["Agence Parisienne du Climat (accompagnement gratuit)", "Architecte du CAUE de Paris", "Mon Accompagnateur Rénov'"]
        : ["Espace Conseil France Rénov'", "Mon Accompagnateur Rénov'"],
    });
  }

  if (weaknessIds.has("windows")) {
    recommendations.push({
      id: "replace_windows",
      name: "Remplacer le simple vitrage",
      priority: "high",
      reason: "Le simple vitrage multiplie par 3-4 les pertes par les fenêtres.",
      dpeImpact: "Gain modéré (0.5 à 1 classe)",
      comfortImpact: "Fin des courants d'air froid, moins de condensation",
      billImpact: "Réduction estimée de 10 à 15%",
      explanation: isParis
        ? "À Paris, le remplacement de fenêtres est soumis à l'accord de la copropriété et parfois de l'ABF (Architecte des Bâtiments de France) en secteur protégé. Privilégiez le double vitrage à isolation renforcée (VIR) avec un aspect proche de l'existant."
        : "Le double vitrage divise par 3 les pertes thermiques par les fenêtres.",
      estimatedSaving: 12,
      estimatedCost: "500–1 200 € par fenêtre standard",
      parisAid: isParis
        ? "MaPrimeRénov' : 40–100 € par équipement. Éco-rénovons Paris+ : aide complémentaire possible."
        : "MaPrimeRénov' : 40–100 € par équipement.",
      providers: isParis
        ? ["Agence Parisienne du Climat", "Demander à votre syndic les règles de la copropriété"]
        : ["Espace Conseil France Rénov'"],
    });
  }

  if (weaknessIds.has("heating_type") || weaknessIds.has("heating_fuel")) {
    recommendations.push({
      id: "upgrade_heating",
      name: "Remplacer le système de chauffage",
      priority: "high",
      reason: "Votre système actuel consomme bien plus que les alternatives modernes.",
      dpeImpact: "Gain de 1 à 2 classes possible",
      comfortImpact: "Chaleur plus homogène, meilleure régulation",
      billImpact: "Réduction estimée de 30 à 50% sur le poste chauffage",
      explanation: isParis
        ? "En appartement parisien, les pompes à chaleur air/air (climatisation réversible) sont les plus simples à installer. En maison ou rez-de-chaussée, une PAC air/eau est idéale. Pour le chauffage collectif fioul, la conversion en gaz condensation ou réseau de chaleur urbain (CPCU) est prioritaire."
        : "Une pompe à chaleur air/eau offre un rendement 3 à 4 fois supérieur à un convecteur électrique.",
      estimatedSaving: 35,
      estimatedCost: "2 000–5 000 € (PAC air/air) à 10 000–18 000 € (PAC air/eau)",
      parisAid: isParis
        ? "MaPrimeRénov' : 2 000–4 000 € pour une PAC. Coup de pouce chauffage : prime CEE bonifiée. Éco-rénovons Paris+ : aide complémentaire pour les copropriétés."
        : "MaPrimeRénov' : 2 000–4 000 € selon revenus. Prime CEE cumulable.",
      providers: isParis
        ? ["Agence Parisienne du Climat", "CPCU (réseau de chaleur urbain Paris)", "Espace Conseil France Rénov' Paris"]
        : ["Espace Conseil France Rénov'"],
    });
  } else if (weaknessIds.has("heating_age")) {
    recommendations.push({
      id: "modernize_heating",
      name: "Moderniser le système de chauffage",
      priority: "medium",
      reason: "Votre système vieillit et perd en efficacité.",
      dpeImpact: "Gain de 0.5 à 1 classe",
      comfortImpact: "Meilleure régulation et fiabilité",
      billImpact: "Réduction estimée de 10 à 20%",
      explanation: "Même sans changer de technologie, un équipement récent offre un meilleur rendement. Un thermostat connecté peut aussi faire gagner 10 à 15% immédiatement.",
      estimatedSaving: 15,
      estimatedCost: "3 000–8 000 € (chaudière gaz condensation)",
      parisAid: "MaPrimeRénov' : jusqu'à 1 200 € pour une chaudière gaz à très haute performance.",
      providers: isParis
        ? ["Agence Parisienne du Climat", "Votre syndic de copropriété"]
        : ["Espace Conseil France Rénov'"],
    });
  }

  if (weaknessIds.has("ventilation")) {
    recommendations.push({
      id: "install_vmc",
      name: "Installer une ventilation mécanique",
      priority: "medium",
      reason: "La ventilation naturelle ne permet pas de contrôler les pertes d'air.",
      dpeImpact: "Impact modéré sur le DPE",
      comfortImpact: "Meilleure qualité de l'air, moins d'humidité",
      billImpact: "Réduction de 5 à 10%",
      explanation: isParis
        ? "En copropriété parisienne, l'installation d'une VMC double flux est complexe (gaines dans les parties communes). Une VMC simple flux hygroréglable est souvent le meilleur compromis. Consultez votre syndic."
        : "Une VMC double flux récupère la chaleur de l'air sortant pour préchauffer l'air entrant.",
      estimatedSaving: 8,
      estimatedCost: "1 500–4 000 € (VMC simple flux) à 5 000–10 000 € (double flux)",
      parisAid: "MaPrimeRénov' : 2 500–4 000 € pour une VMC double flux selon revenus.",
      providers: isParis
        ? ["Agence Parisienne du Climat", "Votre syndic de copropriété"]
        : ["Espace Conseil France Rénov'"],
    });
  }

  if (weaknessIds.has("air_leakage")) {
    recommendations.push({
      id: "seal_air_leaks",
      name: "Traiter les fuites d'air",
      priority: "medium",
      reason: "Les infiltrations augmentent les besoins de chauffage de façon invisible.",
      dpeImpact: "Impact modéré mais effet immédiat",
      comfortImpact: "Suppression des courants d'air",
      billImpact: "Réduction estimée de 5 à 10%",
      explanation: "Jointez les fenêtres, calfeutrez les coffres de volets roulants, installez des boudins de porte et des trappes de cheminée. Souvent réalisable soi-même pour moins de 100 €.",
      estimatedSaving: 7,
      estimatedCost: "50–200 € (joints, boudins, calfeutrage) — réalisable soi-même",
    });
  }

  if (weaknessIds.has("floor_insulation")) {
    recommendations.push({
      id: "insulate_floor",
      name: "Isoler le plancher bas",
      priority: "low",
      reason: "Le plancher contribue modérément aux pertes mais améliore le confort.",
      dpeImpact: "Gain faible à modéré",
      comfortImpact: "Sol moins froid, confort amélioré",
      billImpact: "Réduction estimée de 5 à 7%",
      explanation: isParis
        ? "Simple si vous êtes au-dessus d'une cave ou d'un parking souterrain. L'isolation par le dessous du plancher est la méthode la moins invasive."
        : "L'isolation du plancher bas est souvent simple si vous avez un vide sanitaire ou une cave.",
      estimatedSaving: 6,
      estimatedCost: "25–50 €/m² (isolation par le dessous)",
      parisAid: "Prime CEE : aide pour l'isolation du plancher bas.",
    });
  }

  // Always add quick wins
  recommendations.push({
    id: "quick_wins",
    name: "Gestes immédiats sans travaux",
    priority: recommendations.length === 0 ? "high" : "low",
    reason: "Des actions simples et gratuites qui réduisent votre facture dès aujourd'hui.",
    dpeImpact: "Pas d'impact direct sur le DPE",
    comfortImpact: "Maintien du confort avec une consommation réduite",
    billImpact: "Réduction de 5 à 15% par les comportements",
    explanation: isParis
      ? "• Réglez le thermostat à 19°C (obligation réglementaire dans les logements)\n• Purgez vos radiateurs avant l'hiver\n• Installez des rideaux épais devant les fenêtres\n• Fermez les volets la nuit (gain de 1 à 2°C)\n• Utilisez des multiprises à interrupteur\n• Demandez un bilan gratuit à l'Agence Parisienne du Climat"
      : "• Réglez le thermostat à 19°C en journée et 16°C la nuit\n• Purgez vos radiateurs\n• Installez des rideaux épais\n• Fermez les volets la nuit\n• Utilisez des multiprises à interrupteur",
    estimatedSaving: 10,
    estimatedCost: "0 € — gratuit",
    parisAid: isParis
      ? "Rendez-vous gratuit avec un conseiller de l'Agence Parisienne du Climat : agenceparisienneclimat.fr"
      : undefined,
    providers: isParis
      ? ["Agence Parisienne du Climat (gratuit)", "ADIL 75 (droit au logement)", "Mairie de votre arrondissement"]
      : ["Espace Conseil France Rénov'"],
  });

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
