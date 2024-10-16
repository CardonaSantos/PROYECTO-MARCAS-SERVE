import { PartialType } from '@nestjs/mapped-types';
import { CreateNotificationDto } from './create-notification.dto';
import { IsBoolean, IsNumber } from 'class-validator';

export class UpdateNotificationDto {
  @IsNumber()
  usuarioId: number;
}
