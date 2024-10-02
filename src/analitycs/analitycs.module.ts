import { Module } from '@nestjs/common';
import { AnalitycsService } from './analitycs.service';
import { AnalitycsController } from './analitycs.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [AnalitycsController],
  providers: [AnalitycsService, PrismaService],
})
export class AnalitycsModule {}
