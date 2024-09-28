import { Module } from '@nestjs/common';
import { ProspectoService } from './prospecto.service';
import { ProspectoController } from './prospecto.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ProspectoController],
  providers: [ProspectoService, PrismaService],
})
export class ProspectoModule {}
