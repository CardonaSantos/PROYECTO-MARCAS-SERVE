import { IsString } from 'class-validator';

export class CreateRecoveryDto {
  @IsString()
  correo: string;
}
