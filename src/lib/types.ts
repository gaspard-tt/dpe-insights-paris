export type HousingType = "apartment" | "house";

export type ConstructionPeriod =
  | "before1948"
  | "1948-1974"
  | "1975-1988"
  | "1989-2000"
  | "2001-2012"
  | "after2012";

export type ClimateZone = "H1" | "H2" | "H3";

export type InsulationQuality = "none" | "poor" | "average" | "good" | "excellent";

export type WindowType = "single" | "double" | "triple";

export type Orientation = "north" | "south" | "east" | "west";

export type HeatingType =
  | "electric_convector"
  | "electric_radiant"
  | "gas_boiler"
  | "gas_condensing"
  | "fuel_boiler"
  | "heat_pump"
  | "wood";

export type HeatingAge = "less5" | "5to15" | "15to25" | "more25";

export type DistributionSystem = "radiators" | "floor_heating";

export type EnergySource = "electricity" | "gas" | "fuel" | "renewable" | "hybrid";

export type VentilationType = "natural" | "vmc_simple" | "vmc_double";

export type AirLeakage = "none" | "slight" | "moderate" | "significant";

export type UsageLevel = "low" | "average" | "high";

export type DPEClass = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export interface FormData {
  // Step 1: General
  housingType: HousingType;
  surfaceArea: number;
  constructionPeriod: ConstructionPeriod;
  climateZone: ClimateZone;

  // Step 2: Envelope
  wallInsulation: InsulationQuality;
  roofInsulation: InsulationQuality;
  floorInsulation: InsulationQuality;
  windowType: WindowType;
  windowSurface: number;
  orientation: Orientation;

  // Step 3: Heating
  heatingType: HeatingType;
  heatingAge: HeatingAge;
  distributionSystem: DistributionSystem;

  // Step 4: Energy
  energySource: EnergySource;

  // Step 5: Ventilation
  ventilationType: VentilationType;
  airLeakage: AirLeakage;

  // Step 6: Occupancy
  occupants: number;
  heatingHabits: UsageLevel;
  hotWaterUsage: UsageLevel;
}

export interface EnergyBreakdown {
  heating: number;
  hotWater: number;
  envelopeLosses: number;
  total: number;
}

export interface Weakness {
  id: string;
  label: string;
  category: "envelope" | "heating" | "ventilation";
  severity: "high" | "medium" | "low";
  description: string;
  impactScore: number;
}

export interface Recommendation {
  id: string;
  name: string;
  priority: "high" | "medium" | "low";
  reason: string;
  dpeImpact: string;
  comfortImpact: string;
  billImpact: string;
  explanation: string;
  estimatedSaving: number;
}

export interface DPEResult {
  dpeClass: DPEClass;
  consumption: number; // kWh/m²/an
  energyBreakdown: EnergyBreakdown;
  weaknesses: Weakness[];
  recommendations: Recommendation[];
}

export const DEFAULT_FORM_DATA: FormData = {
  housingType: "apartment",
  surfaceArea: 70,
  constructionPeriod: "1975-1988",
  climateZone: "H1",
  wallInsulation: "average",
  roofInsulation: "average",
  floorInsulation: "average",
  windowType: "double",
  windowSurface: 15,
  orientation: "south",
  heatingType: "gas_boiler",
  heatingAge: "5to15",
  distributionSystem: "radiators",
  energySource: "gas",
  ventilationType: "vmc_simple",
  airLeakage: "slight",
  occupants: 2,
  heatingHabits: "average",
  hotWaterUsage: "average",
};
