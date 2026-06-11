import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ActivityCategory } from '@carbon/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatKg(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`;
  return `${kg.toFixed(1)}kg`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  [ActivityCategory.TRANSPORTATION]: '#40916C',
  [ActivityCategory.HOME_ENERGY]: '#F4A261',
  [ActivityCategory.FOOD]: '#52B788',
  [ActivityCategory.SHOPPING]: '#0077B6',
  [ActivityCategory.WASTE]: '#95D5B2',
};

export const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  [ActivityCategory.TRANSPORTATION]: 'Transport',
  [ActivityCategory.HOME_ENERGY]: 'Home Energy',
  [ActivityCategory.FOOD]: 'Food',
  [ActivityCategory.SHOPPING]: 'Shopping',
  [ActivityCategory.WASTE]: 'Waste',
};

export const CATEGORY_ICONS: Record<ActivityCategory, string> = {
  [ActivityCategory.TRANSPORTATION]: '🚗',
  [ActivityCategory.HOME_ENERGY]: '🏠',
  [ActivityCategory.FOOD]: '🥗',
  [ActivityCategory.SHOPPING]: '🛒',
  [ActivityCategory.WASTE]: '♻️',
};

export const SUBCATEGORIES: Record<ActivityCategory, { value: string; label: string; unit: string }[]> = {
  [ActivityCategory.TRANSPORTATION]: [
    { value: 'CAR_PETROL', label: 'Petrol Car', unit: 'km' },
    { value: 'CAR_DIESEL', label: 'Diesel Car', unit: 'km' },
    { value: 'CAR_ELECTRIC', label: 'Electric Car', unit: 'km' },
    { value: 'MOTORCYCLE', label: 'Motorcycle', unit: 'km' },
    { value: 'BUS', label: 'Bus', unit: 'km' },
    { value: 'TRAIN', label: 'Train', unit: 'km' },
    { value: 'FLIGHT_SHORT', label: 'Short-haul Flight', unit: 'km' },
    { value: 'FLIGHT_LONG', label: 'Long-haul Flight', unit: 'km' },
    { value: 'CYCLING', label: 'Cycling', unit: 'km' },
    { value: 'WALKING', label: 'Walking', unit: 'km' },
  ],
  [ActivityCategory.HOME_ENERGY]: [
    { value: 'ELECTRICITY', label: 'Electricity', unit: 'kWh' },
    { value: 'NATURAL_GAS', label: 'Natural Gas', unit: 'm³' },
    { value: 'HEATING_OIL', label: 'Heating Oil', unit: 'L' },
    { value: 'WOOD', label: 'Wood Burning', unit: 'kg' },
    { value: 'SOLAR', label: 'Solar Panel', unit: 'kWh' },
  ],
  [ActivityCategory.FOOD]: [
    { value: 'BEEF', label: 'Beef', unit: 'kg' },
    { value: 'LAMB', label: 'Lamb', unit: 'kg' },
    { value: 'PORK', label: 'Pork', unit: 'kg' },
    { value: 'CHICKEN', label: 'Chicken', unit: 'kg' },
    { value: 'FISH', label: 'Fish', unit: 'kg' },
    { value: 'DAIRY', label: 'Dairy', unit: 'kg' },
    { value: 'VEGETABLES', label: 'Vegetables', unit: 'kg' },
    { value: 'FRUITS', label: 'Fruits', unit: 'kg' },
  ],
  [ActivityCategory.SHOPPING]: [
    { value: 'CLOTHING', label: 'Clothing', unit: 'USD' },
    { value: 'ELECTRONICS', label: 'Electronics', unit: 'USD' },
    { value: 'FURNITURE', label: 'Furniture', unit: 'USD' },
    { value: 'APPLIANCES', label: 'Appliances', unit: 'USD' },
    { value: 'GENERAL', label: 'General Shopping', unit: 'USD' },
  ],
  [ActivityCategory.WASTE]: [
    { value: 'LANDFILL', label: 'Landfill Waste', unit: 'kg' },
    { value: 'RECYCLING', label: 'Recycling', unit: 'kg' },
    { value: 'COMPOSTING', label: 'Composting', unit: 'kg' },
  ],
};
