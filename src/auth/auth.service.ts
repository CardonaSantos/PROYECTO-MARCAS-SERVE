import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import { loginDTO } from './dto/login-auth.dto';
import { Rol, Usuario } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateMyUser(loginDTO: loginDTO): Promise<any> {
    const user = await this.userService.findByEmail(loginDTO.correo);

    if (user && (await bcrypt.compare(loginDTO.contrasena, user.contrasena))) {
      const { contrasena, ...result } = user;
      return result;
    }
    return null;
  }

  async loginUser(usuario: Usuario) {
    // Construimos el payload con los campos que quieras almacenar en el token
    const payload = {
      sub: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      empresaId: usuario.empresaId,
      activo: usuario.activo,
    };

    // Retornamos el token y el usuario
    return {
      authToken: this.jwtService.sign(payload),
      usuario,
    };
  }
}
