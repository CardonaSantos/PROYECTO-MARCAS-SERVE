import {
  IsInt,
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  IsNumber,
} from 'class-validator';
import { TipoCliente, EstadoProspecto } from '@prisma/client';

export class CreateProspectoDto {
  @IsString()
  nombreCompleto?: string;

  @IsString()
  empresaTienda?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  correo?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  // Se cambian `municipio` y `departamento` a relaciones por ID:
  @IsOptional()
  @IsInt() // Se valida como un número entero
  municipioId?: number;

  @IsOptional()
  @IsInt() // Se valida como un número entero
  departamentoId?: number;

  @IsInt()
  usuarioId: number;

  @IsOptional()
  @IsEnum(TipoCliente)
  tipoCliente?: TipoCliente;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoriasInteres?: string[];

  @IsOptional()
  @IsString()
  volumenCompra?: string;

  @IsOptional()
  @IsString()
  presupuestoMensual?: string;

  @IsOptional()
  @IsString()
  preferenciaContacto?: string;

  @IsOptional()
  @IsString()
  comentarios?: string;

  @IsOptional()
  @IsEnum(EstadoProspecto) // Agregado para validar el estado
  estado?: EstadoProspecto; // Campo nuevo para el estado

  //==================>
  // Se agregan los campos de ubicación:
  @IsOptional()
  @IsNumber()
  latitud?: number;

  @IsOptional()
  @IsNumber()
  longitud?: number;
}
