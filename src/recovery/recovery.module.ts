import { Module } from '@nestjs/common';
import { RecoveryService } from './recovery.service';
import { RecoveryController } from './recovery.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [RecoveryController],
  providers: [RecoveryService, PrismaService],
})
export class RecoveryModule {}
