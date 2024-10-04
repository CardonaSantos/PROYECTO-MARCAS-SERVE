import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Rol } from '@prisma/client';

export class UpdateUserDto {
  @IsString()
  @IsOptional() // Hacemos el nombre opcional para la actualización
  nombre?: string;

  @IsString()
  @IsOptional() // El correo también debe ser opcional
  correo?: string;

  @IsString()
  @MinLength(8)
  @IsOptional() // La contraseña debe ser opcional y solo válida si se proporciona
  contrasena?: string;

  @IsString()
  @MinLength(8)
  @IsOptional() // La contraseña actual también es opcional
  contrasenaActual?: string;

  @IsEnum(Rol)
  @IsOptional() // El rol puede ser opcional
  rol?: Rol;
}
