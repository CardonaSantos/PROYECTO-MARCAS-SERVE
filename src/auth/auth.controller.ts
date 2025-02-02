import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { loginDTO } from './dto/login-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async loginMyUser(@Body() usuarioLoginDto: loginDTO) {
    const user = await this.authService.validateMyUser(usuarioLoginDto);
    if (!user) {
      throw new UnauthorizedException('Credenciales invalidas');
    }
    console.log('usuario logueado exitosamente');

    return this.authService.loginUser(user);
  }
}
