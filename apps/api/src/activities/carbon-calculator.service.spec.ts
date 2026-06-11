import { Test, TestingModule } from '@nestjs/testing';
import { CarbonCalculatorService } from './carbon-calculator.service';

describe('CarbonCalculatorService', () => {
  let service: CarbonCalculatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CarbonCalculatorService],
    }).compile();
    service = module.get(CarbonCalculatorService);
  });

  it('calculates petrol car correctly', () => {
    expect(service.calculate('CAR_PETROL', 100)).toBe(21);
  });

  it('calculates electric car correctly', () => {
    expect(service.calculate('CAR_ELECTRIC', 100)).toBe(5.3);
  });

  it('returns 0 for cycling', () => {
    expect(service.calculate('CYCLING', 100)).toBe(0);
  });

  it('calculates beef correctly', () => {
    expect(service.calculate('BEEF', 1)).toBe(27);
  });

  it('returns 0 for unknown subcategory', () => {
    expect(service.calculate('UNKNOWN', 100)).toBe(0);
  });

  it('handles negative value for recycling (carbon saved)', () => {
    expect(service.calculate('RECYCLING', 10)).toBe(-1.2);
  });

  it('returns 0 when value is 0 for any subcategory', () => {
    expect(service.calculate('CAR_PETROL', 0)).toBe(0);
    expect(service.calculate('BEEF', 0)).toBe(0);
    expect(service.calculate('ELECTRICITY', 0)).toBe(0);
  });

  it('returns 0 for unknown subcategory (no DEFAULT factor)', () => {
    expect(service.calculate('COMPLETELY_UNKNOWN_SUB', 100)).toBe(0);
  });

  describe('getEmissionFactor', () => {
    it('returns the correct factor for a known subcategory', () => {
      expect(service.getEmissionFactor('CAR_PETROL')).toBe(0.21);
      expect(service.getEmissionFactor('BEEF')).toBe(27.0);
      expect(service.getEmissionFactor('RECYCLING')).toBe(-0.12);
    });

    it('returns 0 for an unknown subcategory', () => {
      expect(service.getEmissionFactor('UNKNOWN_SUB')).toBe(0);
    });

    it('is case-insensitive', () => {
      expect(service.getEmissionFactor('car_petrol')).toBe(0.21);
      expect(service.getEmissionFactor('Beef')).toBe(27.0);
    });
  });

  describe('getUnitForSubcategory', () => {
    it('returns km for TRANSPORTATION', () => {
      const { ActivityCategory } = require('@prisma/client');
      expect(service.getUnitForSubcategory('CAR_PETROL', ActivityCategory.TRANSPORTATION)).toBe('km');
    });

    it('returns kg for FOOD', () => {
      const { ActivityCategory } = require('@prisma/client');
      expect(service.getUnitForSubcategory('BEEF', ActivityCategory.FOOD)).toBe('kg');
    });

    it('returns m³ for NATURAL_GAS under HOME_ENERGY', () => {
      const { ActivityCategory } = require('@prisma/client');
      expect(service.getUnitForSubcategory('NATURAL_GAS', ActivityCategory.HOME_ENERGY)).toBe('m³');
    });

    it('returns L for HEATING_OIL under HOME_ENERGY', () => {
      const { ActivityCategory } = require('@prisma/client');
      expect(service.getUnitForSubcategory('HEATING_OIL', ActivityCategory.HOME_ENERGY)).toBe('L');
    });

    it('returns kWh for ELECTRICITY under HOME_ENERGY', () => {
      const { ActivityCategory } = require('@prisma/client');
      expect(service.getUnitForSubcategory('ELECTRICITY', ActivityCategory.HOME_ENERGY)).toBe('kWh');
    });

    it('returns USD for SHOPPING', () => {
      const { ActivityCategory } = require('@prisma/client');
      expect(service.getUnitForSubcategory('CLOTHING', ActivityCategory.SHOPPING)).toBe('USD');
    });

    it('returns kg for WASTE', () => {
      const { ActivityCategory } = require('@prisma/client');
      expect(service.getUnitForSubcategory('LANDFILL', ActivityCategory.WASTE)).toBe('kg');
    });
  });
});
