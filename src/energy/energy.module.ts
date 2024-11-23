import { Module } from '@nestjs/common';
import { EnergyService } from './energy.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [EnergyService],
  exports: [EnergyService], // Export EnergyService to make it available in other modules
})
export class EnergyModule {}
