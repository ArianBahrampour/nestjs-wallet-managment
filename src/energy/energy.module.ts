import { Module } from '@nestjs/common';
import { EnergyService } from './energy.service';

@Module({
  providers: [EnergyService],
  exports: [EnergyService], // Export EnergyService to make it available in other modules
})
export class EnergyModule {}
