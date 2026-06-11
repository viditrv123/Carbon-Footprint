// ─── Enums ────────────────────────────────────────────────────────────────────

export enum ActivityCategory {
  TRANSPORTATION = 'TRANSPORTATION',
  HOME_ENERGY = 'HOME_ENERGY',
  FOOD = 'FOOD',
  SHOPPING = 'SHOPPING',
  WASTE = 'WASTE',
}

export enum TransportationType {
  CAR_PETROL = 'CAR_PETROL',
  CAR_DIESEL = 'CAR_DIESEL',
  CAR_ELECTRIC = 'CAR_ELECTRIC',
  MOTORCYCLE = 'MOTORCYCLE',
  BUS = 'BUS',
  TRAIN = 'TRAIN',
  FLIGHT_SHORT = 'FLIGHT_SHORT',
  FLIGHT_LONG = 'FLIGHT_LONG',
  CYCLING = 'CYCLING',
  WALKING = 'WALKING',
}

export enum HomeEnergyType {
  ELECTRICITY = 'ELECTRICITY',
  NATURAL_GAS = 'NATURAL_GAS',
  HEATING_OIL = 'HEATING_OIL',
  WOOD = 'WOOD',
  SOLAR = 'SOLAR',
}

export enum FoodType {
  BEEF = 'BEEF',
  LAMB = 'LAMB',
  PORK = 'PORK',
  CHICKEN = 'CHICKEN',
  FISH = 'FISH',
  DAIRY = 'DAIRY',
  EGGS = 'EGGS',
  VEGETABLES = 'VEGETABLES',
  FRUITS = 'FRUITS',
  GRAINS = 'GRAINS',
  FOOD_WASTE = 'FOOD_WASTE',
}

export enum ShoppingType {
  CLOTHING = 'CLOTHING',
  ELECTRONICS = 'ELECTRONICS',
  FURNITURE = 'FURNITURE',
  APPLIANCES = 'APPLIANCES',
  GENERAL = 'GENERAL',
}

export enum WasteType {
  LANDFILL = 'LANDFILL',
  RECYCLING = 'RECYCLING',
  COMPOSTING = 'COMPOSTING',
}

export enum InsightType {
  TIP = 'TIP',
  WARNING = 'WARNING',
  ACHIEVEMENT = 'ACHIEVEMENT',
  COMPARISON = 'COMPARISON',
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  country?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: UserProfile;
  tokens: AuthTokens;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  country: string;
  avatarUrl?: string;
  createdAt: string;
  monthlyGoalKg?: number;
}

export interface UpdateProfileDto {
  name?: string;
  country?: string;
  avatarUrl?: string;
  monthlyGoalKg?: number;
}

// ─── Activity ─────────────────────────────────────────────────────────────────

export interface Activity {
  id: string;
  userId: string;
  category: ActivityCategory;
  subcategory: string;
  value: number;
  unit: string;
  carbonKg: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface CreateActivityDto {
  category: ActivityCategory;
  subcategory: string;
  value: number;
  unit: string;
  date?: string;
  notes?: string;
}

export interface ActivityFilters {
  category?: ActivityCategory;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedActivities {
  data: Activity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalCarbonKg: number;
  totalCarbonThisMonth: number;
  totalCarbonLastMonth: number;
  percentageChange: number;
  dailyAverage: number;
  categoryBreakdown: CategoryBreakdown[];
  weeklyTrend: WeeklyTrend[];
  streakDays: number;
  monthlyGoalKg?: number;
  goalProgress?: number;
}

export interface CategoryBreakdown {
  category: ActivityCategory;
  carbonKg: number;
  percentage: number;
  count: number;
}

export interface WeeklyTrend {
  date: string;
  carbonKg: number;
}

// ─── Insights ─────────────────────────────────────────────────────────────────

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  category?: ActivityCategory;
  potentialSavingKg?: number;
  actionLabel?: string;
  actionUrl?: string;
  icon: string;
}

export interface CarbonComparison {
  userMonthlyKg: number;
  globalAverageMonthlyKg: number;
  countryAverageMonthlyKg: number;
  percentileRank: number;
}

// ─── Emission Factors (kg CO2e per unit) ──────────────────────────────────────

export const EMISSION_FACTORS: Record<string, number> = {
  // Transportation (per km)
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

  // Home Energy
  ELECTRICITY: 0.233, // per kWh (UK average, adjust by country)
  NATURAL_GAS: 2.04,  // per m³
  HEATING_OIL: 2.68,  // per litre
  WOOD: 0.016,        // per kg (sustainable)
  SOLAR: 0,

  // Food (per kg consumed)
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

  // Shopping (per GBP/USD spent)
  CLOTHING: 0.009,
  ELECTRONICS: 0.03,
  FURNITURE: 0.012,
  APPLIANCES: 0.025,
  GENERAL: 0.007,

  // Waste (per kg)
  LANDFILL: 0.58,
  RECYCLING: -0.12, // negative = carbon saved
  COMPOSTING: -0.08,
};

// Global average: ~4,500 kg CO2e/month (54,000/year)
export const GLOBAL_AVERAGE_MONTHLY_KG = 4500;

// Country averages (kg CO2e/month)
export const COUNTRY_AVERAGES: Record<string, number> = {
  US: 5000,
  GB: 2917,
  DE: 3500,
  FR: 2500,
  IN: 583,
  CN: 1750,
  AU: 4167,
  CA: 4583,
  DEFAULT: 4500,
};
