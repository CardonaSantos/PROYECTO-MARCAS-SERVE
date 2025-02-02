import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MetodoPago } from '@prisma/client';

class ProductSaleDto {
  @IsInt()
  productoId: number;

  @IsString()
  codigoProducto: string;

  @IsInt()
  cantidad: number;

  @IsPositive()
  precio: number; // Precio unitario para este producto en esta venta
}

export class CreateSaleDto {
  @IsInt()
  empresaId: number;

  @IsInt()
  clienteId: number;

  @IsInt()
  vendedorId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductSaleDto)
  productos: ProductSaleDto[];

  @IsNumber()
  descuento: number;

  @IsPositive()
  monto: number;

  @IsOptional()
  @IsInt()
  registroVisitaId?: number;

  @IsNotEmpty()
  @IsEnum(MetodoPago)
  metodoPago: MetodoPago;

  @IsPositive()
  @IsNotEmpty()
  montoConDescuento: number;

  // **Campos para crédito**
  @IsOptional()
  @IsNumber()
  @IsPositive()
  creditoInicial?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  numeroCuotas?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  interes?: number;

  @IsInt()
  @IsPositive()
  diasEntrePagos: number;

  @IsOptional()
  @IsString()
  dpi?: string;

  @IsOptional()
  comentario?: string;

  @IsOptional()
  testigos?: any; // JSON con la información de los testigos
}
