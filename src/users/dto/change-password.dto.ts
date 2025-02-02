import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  adminId: number;

  @IsNotEmpty()
  adminPassword: string;

  @IsNotEmpty()
  @MinLength(6) // Mínimo 6 caracteres para seguridad
  newPassword: string;
}
