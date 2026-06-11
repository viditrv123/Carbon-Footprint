import { Module } from '@nestjs/common';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { CarbonCalculatorService } from './carbon-calculator.service';

@Module({
  controllers: [ActivitiesController],
  providers: [ActivitiesService, CarbonCalculatorService],
  exports: [ActivitiesService, CarbonCalculatorService],
})
export class ActivitiesModule {}
