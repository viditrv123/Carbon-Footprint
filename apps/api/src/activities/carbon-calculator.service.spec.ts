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
});
