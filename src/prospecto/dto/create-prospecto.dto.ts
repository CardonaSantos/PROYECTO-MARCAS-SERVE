import { IsInt, IsOptional, IsString, IsEnum, IsArray } from 'class-validator';
import { TipoCliente } from '@prisma/client';
import { EstadoProspecto } from '@prisma/client';

export class CreateProspectoDto {
  @IsString()
  nombreCompleto: string;

  @IsString()
  empresaTienda: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  correo?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  municipio?: string;

  @IsOptional()
  @IsString()
  departamento?: string;

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
}
