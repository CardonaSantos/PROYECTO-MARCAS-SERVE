import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { RecoveryService } from './recovery.service';
import { CreateRecoveryDto } from './dto/create-recovery.dto';
import { UpdateRecoveryDto } from './dto/update-recovery.dto';

@Controller('recovery')
export class RecoveryController {
  constructor(private readonly recoveryService: RecoveryService) {}

  @Post()
  async create(@Body() createRecoveryDto: CreateRecoveryDto) {
    const { correo } = createRecoveryDto;

    console.log(
      'Has entrado el controller de recuperacion con el correo: ',
      correo,
    );

    if (!correo) {
      throw new BadRequestException('Falta el correo del usuario');
    }

    try {
      await this.recoveryService.solicitarRecuperacion(correo);
      return { message: 'Correo de recuperación enviado exitosamente.' };
    } catch (error) {
      throw new BadRequestException('Error de correo electronico');
    }
  }

  @Post('/restablecer-contrasena')
  async restablecerContrasena(
    @Body('token') token: string,
    @Body('nuevaContrasena') nuevaContrasena: string,
  ): Promise<{ message: string }> {
    if (!token || !nuevaContrasena) {
      throw new BadRequestException(
        'El token y la nueva contraseña son obligatorios.',
      );
    }

    try {
      await this.recoveryService.restablecerContrasena(token, nuevaContrasena);
      return { message: 'Contraseña restablecida con éxito.' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al restablecer la contraseña.',
      );
    }
  }
}
