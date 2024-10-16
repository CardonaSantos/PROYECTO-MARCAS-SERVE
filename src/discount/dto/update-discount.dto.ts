import { PartialType } from '@nestjs/mapped-types';
import { CreateDiscountDto } from './create-discount.dto';
import { IsInt, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class UpdateDiscountDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  porcentaje: number; // Porcentaje del descuento

  @IsNotEmpty()
  @IsInt()
  clienteId: number; // ID del cliente al que se aplica el descuento
}
