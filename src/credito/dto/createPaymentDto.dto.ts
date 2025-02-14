import { MetodoPago } from '@prisma/client';
import { IsEnum, IsInt, IsString } from 'class-validator';

export class createPaymentDto {
  @IsInt()
  monto: number;

  @IsInt()
  empresaId: number;

  @IsInt()
  creditoId: number;
  @IsEnum(MetodoPago)
  metodoPago: MetodoPago; // Cómo se realizó el pago

  @IsString()
  password: string;

  @IsInt()
  userId: number;

  @IsInt()
  ventaId: number;
}
