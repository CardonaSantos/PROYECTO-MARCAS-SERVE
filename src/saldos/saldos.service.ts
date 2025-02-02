import { Injectable } from '@nestjs/common';
import { CreateSaldoDto } from './dto/create-saldo.dto';
import { UpdateSaldoDto } from './dto/update-saldo.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SaldosService {
  constructor(private readonly prisma: PrismaService) {}

  async initSaldos(empresaId: number) {
    const existing = await this.prisma.ingresosEmpresa.findUnique({
      where: { empresaId },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.ingresosEmpresa.create({
      data: {
        empresaId,
        // saldoActual: 0,        // DF
        // ingresosTotales: 0,    // DF
        // egresosTotales: 0,     // DF
        // numeroVentas: 0,       // DF
        // todo con default(0)    // DF
      },
    });
  }

  async getSaldos(empresaId: number) {
    return this.prisma.ingresosEmpresa.findUnique({
      where: { empresaId },
    });
  }

  async addIngreso(empresaId: number, monto: number) {
    // Podrías hacer un update así:
    return this.prisma.ingresosEmpresa.update({
      where: { empresaId },
      data: {
        saldoActual: { increment: monto },
        ingresosTotales: { increment: monto },
        numeroVentas: { increment: 1 },
      },
    });
  }

  async addEgreso(empresaId: number, monto: number) {
    // Podrías hacer un update así:
    return this.prisma.ingresosEmpresa.update({
      where: { empresaId },
      data: {
        saldoActual: { decrement: monto },
        egresosTotales: { increment: monto },
      },
    });
  }
}
