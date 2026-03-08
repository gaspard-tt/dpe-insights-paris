import type {
  FormData,
  DPEResult,
  DPEClass,
  EnergyBreakdown,
  Weakness,
  Recommendation,
  HeatingType,
} from "./types";
import type { Language } from "./i18n";

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

// --- Bilingual text helper ---
function txt(lang: Language, fr: string, en: string): string {
  return lang === "fr" ? fr : en;
}

// --- Calculate consumption ---
function calculateConsumption(data: FormData): number {
  const base = BASE_CONSUMPTION[data.constructionPeriod || "1975-1988"];
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
function identifyWeaknesses(data: FormData, lang: Language): Weakness[] {
  const weaknesses: Weakness[] = [];

  if (data.wallInsulation === "none" || data.wallInsulation === "poor") {
    weaknesses.push({
      id: "wall_insulation",
      label: txt(lang, "Isolation des murs insuffisante", "Insufficient wall insulation"),
      category: "envelope",
      severity: data.wallInsulation === "none" ? "high" : "medium",
      description: txt(lang,
        "Les murs sont responsables de 20 à 25% des pertes thermiques. Dans les immeubles haussmanniens parisiens, les murs en pierre de 50 cm n'isolent que faiblement.",
        "Walls account for 20–25% of heat losses. In Haussmann-era Parisian buildings, 50 cm stone walls provide very limited insulation."
      ),
      impactScore: data.wallInsulation === "none" ? 90 : 70,
    });
  }

  if (data.roofInsulation === "none" || data.roofInsulation === "poor") {
    weaknesses.push({
      id: "roof_insulation",
      label: txt(lang, "Isolation de la toiture insuffisante", "Insufficient roof insulation"),
      category: "envelope",
      severity: "high",
      description: txt(lang,
        "La toiture représente jusqu'à 30% des pertes de chaleur — critique pour les derniers étages parisiens et les chambres de bonne.",
        "The roof accounts for up to 30% of heat losses — critical for top-floor Parisian flats and chambres de bonne."
      ),
      impactScore: data.roofInsulation === "none" ? 95 : 80,
    });
  }

  if (data.floorInsulation === "none" || data.floorInsulation === "poor") {
    weaknesses.push({
      id: "floor_insulation",
      label: txt(lang, "Isolation du plancher insuffisante", "Insufficient floor insulation"),
      category: "envelope",
      severity: "medium",
      description: txt(lang,
        "Le plancher bas contribue à environ 7 à 10% des pertes thermiques, surtout au rez-de-chaussée sur cave.",
        "The ground floor contributes about 7–10% of heat losses, especially above cellars."
      ),
      impactScore: data.floorInsulation === "none" ? 50 : 35,
    });
  }

  if (data.windowType === "single") {
    weaknesses.push({
      id: "windows",
      label: txt(lang, "Simple vitrage — pertes thermiques élevées", "Single glazing — high heat losses"),
      category: "envelope",
      severity: "high",
      description: txt(lang,
        "Courant dans le parc ancien parisien. Le simple vitrage laisse passer 3 à 4 fois plus de chaleur que le double vitrage.",
        "Common in older Parisian buildings. Single glazing lets through 3–4 times more heat than double glazing."
      ),
      impactScore: 85,
    });
  }

  const heatingTypes = data.heatingTypes || [];
  if (heatingTypes.includes("electric_convector")) {
    weaknesses.push({
      id: "heating_type",
      label: txt(lang, "Chauffage par convecteurs électriques", "Electric convector heating"),
      category: "heating",
      severity: "high",
      description: txt(lang,
        "Les convecteurs sont fréquents dans les studios parisiens mais représentent le mode de chauffage le moins efficace.",
        "Convectors are common in Parisian studios but are the least efficient heating method."
      ),
      impactScore: 80,
    });
  }

  if (heatingTypes.includes("fuel_boiler")) {
    weaknesses.push({
      id: "heating_fuel",
      label: txt(lang, "Chaudière fioul — énergie carbonée et coûteuse", "Oil boiler — carbon-heavy and expensive"),
      category: "heating",
      severity: "high",
      description: txt(lang,
        "Le fioul est l'une des énergies les plus polluantes. Son remplacement sera obligatoire à terme.",
        "Fuel oil is one of the most polluting energy sources. Its replacement will become mandatory."
      ),
      impactScore: 85,
    });
  }

  if (data.heatingAge === "more25" || data.heatingAge === "15to25") {
    weaknesses.push({
      id: "heating_age",
      label: txt(lang, "Système de chauffage vieillissant", "Ageing heating system"),
      category: "heating",
      severity: data.heatingAge === "more25" ? "high" : "medium",
      description: txt(lang,
        "Un système ancien perd en efficacité avec le temps, surtout les chaudières collectives fréquentes dans les copropriétés parisiennes.",
        "An old system loses efficiency over time, especially collective boilers common in Parisian co-ownerships."
      ),
      impactScore: data.heatingAge === "more25" ? 75 : 50,
    });
  }

  if (data.ventilationType === "natural") {
    weaknesses.push({
      id: "ventilation",
      label: txt(lang, "Ventilation naturelle — incontrôlée", "Natural ventilation — uncontrolled"),
      category: "ventilation",
      severity: "medium",
      description: txt(lang,
        "Sans ventilation mécanique, le renouvellement d'air est incontrôlé — problème fréquent dans les immeubles anciens.",
        "Without mechanical ventilation, air renewal is uncontrolled — a common issue in older buildings."
      ),
      impactScore: 60,
    });
  }

  if (data.airLeakage === "significant" || data.airLeakage === "moderate") {
    weaknesses.push({
      id: "air_leakage",
      label: txt(lang, "Fuites d'air importantes", "Significant air leaks"),
      category: "ventilation",
      severity: data.airLeakage === "significant" ? "high" : "medium",
      description: txt(lang,
        "Les infiltrations d'air parasites augmentent les besoins de chauffage. Les fenêtres anciennes et les cheminées sont les premiers responsables.",
        "Parasitic air infiltrations increase heating needs. Old windows and chimneys are the main culprits."
      ),
      impactScore: data.airLeakage === "significant" ? 70 : 45,
    });
  }

  weaknesses.sort((a, b) => b.impactScore - a.impactScore);
  return weaknesses;
}

// --- Generate recommendations with Paris-specific info ---
function generateRecommendations(data: FormData, weaknesses: Weakness[], lang: Language): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const weaknessIds = new Set(weaknesses.map((w) => w.id));
  const isParis = data.postalCode === "75";

  if (weaknessIds.has("roof_insulation")) {
    recommendations.push({
      id: "insulate_roof",
      name: txt(lang, "Isoler la toiture ou les combles", "Insulate the roof or loft"),
      priority: "high",
      reason: txt(lang,
        "La toiture est le premier poste de déperdition. L'isoler est le geste le plus rentable.",
        "The roof is the main source of heat loss. Insulating it is the most cost-effective measure."
      ),
      dpeImpact: txt(lang, "Gain potentiel de 1 à 2 classes", "Potential gain of 1–2 classes"),
      comfortImpact: txt(lang, "Forte amélioration du confort en hiver et en été", "Major improvement in winter and summer comfort"),
      billImpact: txt(lang, "Réduction estimée de 20 à 30% sur la facture de chauffage", "Estimated 20–30% reduction on heating bills"),
      explanation: txt(lang,
        "L'air chaud monte naturellement. Sans isolation en toiture, la chaleur s'échappe. Pour les derniers étages parisiens, c'est souvent le travail le plus impactant.",
        "Hot air rises naturally. Without roof insulation, heat escapes. For top-floor Parisian flats, this is often the most impactful work."
      ),
      estimatedSaving: 25,
      estimatedCost: txt(lang, "30–60 €/m² (combles perdus) à 100–200 €/m² (toiture par l'extérieur)", "€30–60/m² (loft) to €100–200/m² (external roof)"),
      parisAid: isParis
        ? txt(lang,
          "Éco-rénovons Paris+ : subvention de la Ville de Paris jusqu'à 30% du montant des travaux. MaPrimeRénov' : jusqu'à 25 €/m² pour les ménages modestes.",
          "Éco-rénovons Paris+: City of Paris grant up to 30% of works. MaPrimeRénov': up to €25/m² for low-income households."
        )
        : txt(lang,
          "MaPrimeRénov' : jusqu'à 25 €/m² selon revenus. CEE (Certificats d'économies d'énergie) cumulables.",
          "MaPrimeRénov': up to €25/m² depending on income. CEE (energy savings certificates) can be combined."
        ),
      providers: isParis
        ? ["CAUE de Paris", "Agence Parisienne du Climat", "Espace Conseil France Rénov' Paris"]
        : ["Espace Conseil France Rénov' Île-de-France"],
    });
  }

  if (weaknessIds.has("wall_insulation")) {
    recommendations.push({
      id: "insulate_walls",
      name: txt(lang, "Améliorer l'isolation des murs", "Improve wall insulation"),
      priority: "high",
      reason: txt(lang,
        "Les murs sont la deuxième source de pertes. L'isolation transforme le confort.",
        "Walls are the second biggest source of heat loss. Insulation transforms comfort."
      ),
      dpeImpact: txt(lang, "Gain potentiel de 1 classe", "Potential gain of 1 class"),
      comfortImpact: txt(lang, "Suppression de l'effet paroi froide", "Elimination of cold wall effect"),
      billImpact: txt(lang, "Réduction estimée de 15 à 25%", "Estimated 15–25% reduction"),
      explanation: isParis
        ? txt(lang,
          "Dans les immeubles haussmanniens, l'ITE (Isolation Thermique par l'Extérieur) est souvent soumise à l'accord de l'ABF. L'ITI (par l'intérieur) est plus simple mais réduit la surface habitable.",
          "In Haussmann buildings, external insulation (ITE) often requires ABF approval. Internal insulation (ITI) is simpler but reduces living space."
        )
        : txt(lang,
          "L'ITE est la solution la plus performante, l'ITI est une alternative moins coûteuse.",
          "External insulation is the most effective solution, internal insulation is a cheaper alternative."
        ),
      estimatedSaving: 20,
      estimatedCost: txt(lang, "100–180 €/m² (ITI) à 150–250 €/m² (ITE)", "€100–180/m² (ITI) to €150–250/m² (ITE)"),
      parisAid: isParis
        ? txt(lang,
          "Éco-rénovons Paris+ : aide majorée en copropriété. MaPrimeRénov' Copropriétés : jusqu'à 25% du montant des travaux.",
          "Éco-rénovons Paris+: increased aid for co-ownerships. MaPrimeRénov' Copropriétés: up to 25% of works."
        )
        : txt(lang,
          "MaPrimeRénov' : selon revenus et gain énergétique. Prime CEE cumulable.",
          "MaPrimeRénov': based on income and energy gain. CEE bonus combinable."
        ),
      providers: isParis
        ? ["Agence Parisienne du Climat", "CAUE de Paris", "Mon Accompagnateur Rénov'"]
        : ["Espace Conseil France Rénov'", "Mon Accompagnateur Rénov'"],
    });
  }

  if (weaknessIds.has("windows")) {
    recommendations.push({
      id: "replace_windows",
      name: txt(lang, "Remplacer le simple vitrage", "Replace single glazing"),
      priority: "high",
      reason: txt(lang,
        "Le simple vitrage multiplie par 3-4 les pertes par les fenêtres.",
        "Single glazing multiplies window heat losses by 3–4."
      ),
      dpeImpact: txt(lang, "Gain modéré (0.5 à 1 classe)", "Moderate gain (0.5–1 class)"),
      comfortImpact: txt(lang, "Fin des courants d'air froid, moins de condensation", "No more cold draughts, less condensation"),
      billImpact: txt(lang, "Réduction estimée de 10 à 15%", "Estimated 10–15% reduction"),
      explanation: isParis
        ? txt(lang,
          "À Paris, le remplacement de fenêtres est soumis à l'accord de la copropriété et parfois de l'ABF (Architecte des Bâtiments de France) en secteur protégé. Privilégiez le double vitrage à isolation renforcée (VIR) avec un aspect proche de l'existant.",
          "In Paris, window replacement requires co-ownership approval and sometimes ABF (heritage architect) approval in protected areas. Choose reinforced double glazing (VIR) matching existing appearance."
        )
        : txt(lang,
          "Le double vitrage divise par 3 les pertes thermiques par les fenêtres.",
          "Double glazing reduces window heat losses by a factor of 3."
        ),
      estimatedSaving: 12,
      estimatedCost: txt(lang, "500–1 200 € par fenêtre standard", "€500–1,200 per standard window"),
      parisAid: isParis
        ? txt(lang,
          "MaPrimeRénov' : 40–100 € par équipement. Éco-rénovons Paris+ : aide complémentaire possible.",
          "MaPrimeRénov': €40–100 per unit. Éco-rénovons Paris+: additional aid possible."
        )
        : txt(lang, "MaPrimeRénov' : 40–100 € par équipement.", "MaPrimeRénov': €40–100 per unit."),
      providers: isParis
        ? ["Agence Parisienne du Climat", txt(lang, "Votre syndic de copropriété", "Your co-ownership manager")]
        : ["Espace Conseil France Rénov'"],
    });
  }

  if (weaknessIds.has("heating_type") || weaknessIds.has("heating_fuel")) {
    recommendations.push({
      id: "upgrade_heating",
      name: txt(lang, "Remplacer le système de chauffage", "Replace the heating system"),
      priority: "high",
      reason: txt(lang,
        "Votre système actuel consomme bien plus que les alternatives modernes.",
        "Your current system consumes far more than modern alternatives."
      ),
      dpeImpact: txt(lang, "Gain de 1 à 2 classes possible", "Possible gain of 1–2 classes"),
      comfortImpact: txt(lang, "Chaleur plus homogène, meilleure régulation", "More even heat, better regulation"),
      billImpact: txt(lang, "Réduction estimée de 30 à 50% sur le poste chauffage", "Estimated 30–50% reduction on heating costs"),
      explanation: isParis
        ? txt(lang,
          "En appartement parisien, les pompes à chaleur air/air (climatisation réversible) sont les plus simples à installer. En maison ou rez-de-chaussée, une PAC air/eau est idéale. Pour le chauffage collectif fioul, la conversion en gaz condensation ou réseau de chaleur urbain (CPCU) est prioritaire.",
          "In a Parisian flat, air/air heat pumps (reversible AC) are easiest to install. For houses or ground floors, air/water heat pumps are ideal. For collective oil heating, converting to condensing gas or the urban heat network (CPCU) is the priority."
        )
        : txt(lang,
          "Une pompe à chaleur air/eau offre un rendement 3 à 4 fois supérieur à un convecteur électrique.",
          "An air/water heat pump offers 3–4 times better efficiency than an electric convector."
        ),
      estimatedSaving: 35,
      estimatedCost: txt(lang, "2 000–5 000 € (PAC air/air) à 10 000–18 000 € (PAC air/eau)", "€2,000–5,000 (air/air HP) to €10,000–18,000 (air/water HP)"),
      parisAid: isParis
        ? txt(lang,
          "MaPrimeRénov' : 2 000–4 000 € pour une PAC. Coup de pouce chauffage : prime CEE bonifiée. Éco-rénovons Paris+ : aide complémentaire pour les copropriétés.",
          "MaPrimeRénov': €2,000–4,000 for a heat pump. 'Coup de pouce chauffage': enhanced CEE bonus. Éco-rénovons Paris+: additional aid for co-ownerships."
        )
        : txt(lang,
          "MaPrimeRénov' : 2 000–4 000 € selon revenus. Prime CEE cumulable.",
          "MaPrimeRénov': €2,000–4,000 depending on income. CEE bonus combinable."
        ),
      providers: isParis
        ? ["Agence Parisienne du Climat", "CPCU (réseau de chaleur urbain Paris)", "Espace Conseil France Rénov' Paris"]
        : ["Espace Conseil France Rénov'"],
    });
  } else if (weaknessIds.has("heating_age")) {
    recommendations.push({
      id: "modernize_heating",
      name: txt(lang, "Moderniser le système de chauffage", "Modernise the heating system"),
      priority: "medium",
      reason: txt(lang,
        "Votre système vieillit et perd en efficacité.",
        "Your system is ageing and losing efficiency."
      ),
      dpeImpact: txt(lang, "Gain de 0.5 à 1 classe", "Gain of 0.5–1 class"),
      comfortImpact: txt(lang, "Meilleure régulation et fiabilité", "Better regulation and reliability"),
      billImpact: txt(lang, "Réduction estimée de 10 à 20%", "Estimated 10–20% reduction"),
      explanation: txt(lang,
        "Même sans changer de technologie, un équipement récent offre un meilleur rendement. Un thermostat connecté peut aussi faire gagner 10 à 15% immédiatement.",
        "Even without changing technology, newer equipment offers better efficiency. A smart thermostat can also save 10–15% immediately."
      ),
      estimatedSaving: 15,
      estimatedCost: txt(lang, "3 000–8 000 € (chaudière gaz condensation)", "€3,000–8,000 (condensing gas boiler)"),
      parisAid: txt(lang,
        "MaPrimeRénov' : jusqu'à 1 200 € pour une chaudière gaz à très haute performance.",
        "MaPrimeRénov': up to €1,200 for a very high-performance gas boiler."
      ),
      providers: isParis
        ? ["Agence Parisienne du Climat", txt(lang, "Votre syndic de copropriété", "Your co-ownership manager")]
        : ["Espace Conseil France Rénov'"],
    });
  }

  if (weaknessIds.has("ventilation")) {
    recommendations.push({
      id: "install_vmc",
      name: txt(lang, "Installer une ventilation mécanique", "Install mechanical ventilation"),
      priority: "medium",
      reason: txt(lang,
        "La ventilation naturelle ne permet pas de contrôler les pertes d'air.",
        "Natural ventilation does not allow control over air losses."
      ),
      dpeImpact: txt(lang, "Impact modéré sur le DPE", "Moderate DPE impact"),
      comfortImpact: txt(lang, "Meilleure qualité de l'air, moins d'humidité", "Better air quality, less humidity"),
      billImpact: txt(lang, "Réduction de 5 à 10%", "5–10% reduction"),
      explanation: isParis
        ? txt(lang,
          "En copropriété parisienne, l'installation d'une VMC double flux est complexe (gaines dans les parties communes). Une VMC simple flux hygroréglable est souvent le meilleur compromis. Consultez votre syndic.",
          "In a Parisian co-ownership, installing dual-flow ventilation is complex (ducts in common areas). A humidity-controlled single-flow system is often the best compromise. Consult your co-ownership manager."
        )
        : txt(lang,
          "Une VMC double flux récupère la chaleur de l'air sortant pour préchauffer l'air entrant.",
          "A dual-flow system recovers heat from outgoing air to pre-heat incoming air."
        ),
      estimatedSaving: 8,
      estimatedCost: txt(lang, "1 500–4 000 € (VMC simple flux) à 5 000–10 000 € (double flux)", "€1,500–4,000 (single-flow) to €5,000–10,000 (dual-flow)"),
      parisAid: txt(lang,
        "MaPrimeRénov' : 2 500–4 000 € pour une VMC double flux selon revenus.",
        "MaPrimeRénov': €2,500–4,000 for dual-flow ventilation depending on income."
      ),
      providers: isParis
        ? ["Agence Parisienne du Climat", txt(lang, "Votre syndic de copropriété", "Your co-ownership manager")]
        : ["Espace Conseil France Rénov'"],
    });
  }

  if (weaknessIds.has("air_leakage")) {
    recommendations.push({
      id: "seal_air_leaks",
      name: txt(lang, "Traiter les fuites d'air", "Seal air leaks"),
      priority: "medium",
      reason: txt(lang,
        "Les infiltrations augmentent les besoins de chauffage de façon invisible.",
        "Air infiltrations invisibly increase heating needs."
      ),
      dpeImpact: txt(lang, "Impact modéré mais effet immédiat", "Moderate impact but immediate effect"),
      comfortImpact: txt(lang, "Suppression des courants d'air", "Elimination of draughts"),
      billImpact: txt(lang, "Réduction estimée de 5 à 10%", "Estimated 5–10% reduction"),
      explanation: txt(lang,
        "Jointez les fenêtres, calfeutrez les coffres de volets roulants, installez des boudins de porte et des trappes de cheminée. Souvent réalisable soi-même pour moins de 100 €.",
        "Seal window joints, draught-proof roller shutter boxes, install door draught excluders and chimney caps. Often DIY for under €100."
      ),
      estimatedSaving: 7,
      estimatedCost: txt(lang, "50–200 € (joints, boudins, calfeutrage) — réalisable soi-même", "€50–200 (seals, draught excluders) — DIY possible"),
    });
  }

  if (weaknessIds.has("floor_insulation")) {
    recommendations.push({
      id: "insulate_floor",
      name: txt(lang, "Isoler le plancher bas", "Insulate the ground floor"),
      priority: "low",
      reason: txt(lang,
        "Le plancher contribue modérément aux pertes mais améliore le confort.",
        "The floor contributes moderately to losses but improves comfort."
      ),
      dpeImpact: txt(lang, "Gain faible à modéré", "Low to moderate gain"),
      comfortImpact: txt(lang, "Sol moins froid, confort amélioré", "Warmer floors, improved comfort"),
      billImpact: txt(lang, "Réduction estimée de 5 à 7%", "Estimated 5–7% reduction"),
      explanation: isParis
        ? txt(lang,
          "Simple si vous êtes au-dessus d'une cave ou d'un parking souterrain. L'isolation par le dessous du plancher est la méthode la moins invasive.",
          "Simple if you're above a cellar or underground parking. Insulating from below is the least invasive method."
        )
        : txt(lang,
          "L'isolation du plancher bas est souvent simple si vous avez un vide sanitaire ou une cave.",
          "Ground floor insulation is often simple if you have a crawl space or cellar."
        ),
      estimatedSaving: 6,
      estimatedCost: txt(lang, "25–50 €/m² (isolation par le dessous)", "€25–50/m² (insulation from below)"),
      parisAid: txt(lang, "Prime CEE : aide pour l'isolation du plancher bas.", "CEE bonus: aid for ground floor insulation."),
    });
  }

  // Always add quick wins
  recommendations.push({
    id: "quick_wins",
    name: txt(lang, "Gestes immédiats sans travaux", "Immediate actions without works"),
    priority: recommendations.length === 0 ? "high" : "low",
    reason: txt(lang,
      "Des actions simples et gratuites qui réduisent votre facture dès aujourd'hui.",
      "Simple, free actions that reduce your bills starting today."
    ),
    dpeImpact: txt(lang, "Pas d'impact direct sur le DPE", "No direct DPE impact"),
    comfortImpact: txt(lang, "Maintien du confort avec une consommation réduite", "Maintain comfort with lower consumption"),
    billImpact: txt(lang, "Réduction de 5 à 15% par les comportements", "5–15% reduction through behaviour changes"),
    explanation: isParis
      ? txt(lang,
        "• Réglez le thermostat à 19°C (obligation réglementaire dans les logements)\n• Purgez vos radiateurs avant l'hiver\n• Installez des rideaux épais devant les fenêtres\n• Fermez les volets la nuit (gain de 1 à 2°C)\n• Utilisez des multiprises à interrupteur\n• Demandez un bilan gratuit à l'Agence Parisienne du Climat",
        "• Set thermostat to 19°C (regulatory requirement)\n• Bleed radiators before winter\n• Install thick curtains over windows\n• Close shutters at night (1–2°C gain)\n• Use power strips with switches\n• Request a free assessment from Agence Parisienne du Climat"
      )
      : txt(lang,
        "• Réglez le thermostat à 19°C en journée et 16°C la nuit\n• Purgez vos radiateurs\n• Installez des rideaux épais\n• Fermez les volets la nuit\n• Utilisez des multiprises à interrupteur",
        "• Set thermostat to 19°C during the day and 16°C at night\n• Bleed radiators\n• Install thick curtains\n• Close shutters at night\n• Use power strips with switches"
      ),
    estimatedSaving: 10,
    estimatedCost: txt(lang, "0 € — gratuit", "€0 — free"),
    parisAid: isParis
      ? txt(lang,
        "Rendez-vous gratuit avec un conseiller de l'Agence Parisienne du Climat : agenceparisienneclimat.fr",
        "Free appointment with an advisor at Agence Parisienne du Climat: agenceparisienneclimat.fr"
      )
      : undefined,
    providers: isParis
      ? ["Agence Parisienne du Climat", "ADIL 75", txt(lang, "Mairie de votre arrondissement", "Your arrondissement town hall")]
      : ["Espace Conseil France Rénov'"],
  });

  return recommendations;
}

// --- Main calculation function ---
export function calculateDPE(data: FormData, lang: Language = "fr"): DPEResult {
  const consumption = calculateConsumption(data);
  const dpeClass = getDPEClass(consumption);
  const energyBreakdown = calculateBreakdown(consumption, data);
  const weaknesses = identifyWeaknesses(data, lang);
  const recommendations = generateRecommendations(data, weaknesses, lang);

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
