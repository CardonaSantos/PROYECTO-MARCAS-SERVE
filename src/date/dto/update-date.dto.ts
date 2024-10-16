import { MotivoVisita, TipoVisita } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateDateDto {
  @IsDateString() // Valida que el campo sea una fecha en formato ISO (para el campo inicio)
  fin?: string;

  @IsString() // Valida que las observaciones sean un string
  @IsOptional() // Las observaciones son opcionales
  observaciones?: string;
}
