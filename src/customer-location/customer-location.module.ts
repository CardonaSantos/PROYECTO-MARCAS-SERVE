import { Module } from '@nestjs/common';
import { CustomerLocationService } from './customer-location.service';
import { CustomerLocationController } from './customer-location.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [CustomerLocationController],
  providers: [CustomerLocationService, PrismaService],
})
export class CustomerLocationModule {}
