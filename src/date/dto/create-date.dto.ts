// export class CreateDateDto {}
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';
import { MotivoVisita, TipoVisita } from '@prisma/client'; // Importa los enums si los usas en Prisma

export class CreateDateDto {
  @IsDateString() // Valida que el campo sea una fecha en formato ISO (para el campo inicio)
  inicio?: string;

  @IsInt() // Valida que usuarioId sea un número entero
  usuarioId: number;

  @IsInt() // Valida que clienteId sea un número entero
  clienteId: number;

  @IsEnum(MotivoVisita) // Valida que el valor provenga del enum MotivoVisita
  @IsOptional() // El motivo de la visita es opcional
  motivoVisita?: MotivoVisita;

  @IsEnum(TipoVisita) // Valida que el valor provenga del enum TipoVisita
  @IsOptional() // El tipo de visita es opcional
  tipoVisita?: TipoVisita;

  @IsString() // Valida que las observaciones sean un string
  @IsOptional() // Las observaciones son opcionales
  observaciones?: string;
}
