import { IsInt, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class DesactivateActivateDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  descuentoId: number; // Porcentaje del descuento

  //   @IsNotEmpty()
  //   @IsInt()
  //   clienteId: number; // ID del cliente al que se aplica el descuento
}
