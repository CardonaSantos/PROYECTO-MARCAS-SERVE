import { MetodoPago } from '@prisma/client';
import { IsEnum, IsInt, IsString } from 'class-validator';

export class deleteCreditDto {
  @IsInt()
  creditoId: number;
  @IsInt()
  userId: number;

  @IsString()
  adminPassword: string;

  @IsInt()
  empresaId: number;
}
