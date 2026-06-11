import { Injectable } from '@nestjs/common';
import { ActivityCategory } from '@prisma/client';

const EMISSION_FACTORS: Record<string, number> = {
  // Transportation (kg CO2e per km)
  CAR_PETROL: 0.21,
  CAR_DIESEL: 0.17,
  CAR_ELECTRIC: 0.053,
  MOTORCYCLE: 0.114,
  BUS: 0.089,
  TRAIN: 0.041,
  FLIGHT_SHORT: 0.255,
  FLIGHT_LONG: 0.195,
  CYCLING: 0,
  WALKING: 0,
  // Home Energy (kg CO2e per kWh or m³)
  ELECTRICITY: 0.233,
  NATURAL_GAS: 2.04,
  HEATING_OIL: 2.68,
  WOOD: 0.016,
  SOLAR: 0,
  // Food (kg CO2e per kg consumed)
  BEEF: 27.0,
  LAMB: 39.2,
  PORK: 12.1,
  CHICKEN: 6.9,
  FISH: 6.1,
  DAIRY: 3.2,
  EGGS: 4.8,
  VEGETABLES: 2.0,
  FRUITS: 1.1,
  GRAINS: 1.4,
  FOOD_WASTE: 2.5,
  // Shopping (kg CO2e per currency unit spent)
  CLOTHING: 0.009,
  ELECTRONICS: 0.03,
  FURNITURE: 0.012,
  APPLIANCES: 0.025,
  GENERAL: 0.007,
  // Waste (kg CO2e per kg waste)
  LANDFILL: 0.58,
  RECYCLING: -0.12,
  COMPOSTING: -0.08,
};

/**
 * Calculates carbon emissions (kg CO2e) for activities using predefined emission factors.
 */
@Injectable()
export class CarbonCalculatorService {
  calculate(subcategory: string, value: number): number {
    const factor = EMISSION_FACTORS[subcategory.toUpperCase()] ?? 0;
    const result = value * factor;
    return Math.round(result * 1000) / 1000; // round to 3dp
  }

  getEmissionFactor(subcategory: string): number {
    return EMISSION_FACTORS[subcategory.toUpperCase()] ?? 0;
  }

  getUnitForSubcategory(subcategory: string, category: ActivityCategory): string {
    switch (category) {
      case ActivityCategory.TRANSPORTATION: return 'km';
      case ActivityCategory.HOME_ENERGY:
        return subcategory === 'NATURAL_GAS' ? 'm³' : subcategory === 'HEATING_OIL' ? 'L' : 'kWh';
      case ActivityCategory.FOOD: return 'kg';
      case ActivityCategory.SHOPPING: return 'USD';
      case ActivityCategory.WASTE: return 'kg';
      default: return 'unit';
    }
  }
}
