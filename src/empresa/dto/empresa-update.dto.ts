import {
  IsString,
  IsOptional,
  IsEmail,
  IsDate,
  IsNotEmpty,
} from 'class-validator';

export class EmpresaUpdateDTO {
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  nombre: string; // Nombre de la empresa

  @IsString()
  @IsNotEmpty()
  telefono: string; // Teléfono principal

  @IsString()
  @IsOptional()
  pbx?: string; // PBX (opcional)

  @IsString()
  @IsNotEmpty()
  direccion: string; // Dirección de la empresa

  @IsEmail()
  @IsNotEmpty()
  email: string; // Correo electrónico único

  @IsString()
  @IsOptional()
  website?: string; // Página web (opcional)

  @IsDate()
  createdAt: Date; // Fecha de creación

  @IsDate()
  updatedAt: Date; // Fecha de última actualización
}
