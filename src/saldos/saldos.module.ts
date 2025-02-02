import { Module } from '@nestjs/common';
import { SaldosService } from './saldos.service';
import { SaldosController } from './saldos.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [SaldosController],
  providers: [SaldosService, PrismaService],
})
export class SaldosModule {}
