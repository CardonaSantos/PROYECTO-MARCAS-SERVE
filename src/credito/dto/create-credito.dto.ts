import {
  IsInt,
  IsNumber,
  IsEnum,
  IsNotEmpty,
  IsPositive,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCreditoDto {
  @IsInt()
  ventaId: number; // ID de la venta asociada

  @IsInt()
  clienteId: number; // Cliente asociado al crédito

  @IsNumber()
  @IsPositive()
  montoTotal: number; // Monto total del crédito antes de interés

  @IsNumber()
  // @Min(0)
  saldoPendiente: number; // Saldo restante por pagar

  @IsInt()
  @IsPositive()
  plazo: number; // Plazo en meses/quincenas

  @IsNumber()
  @IsPositive()
  interes: number; // Nivel de interés aplicado (en porcentaje)

  @IsNumber()
  @IsPositive()
  montoConInteres: number; // Calculado en base al interés
}
