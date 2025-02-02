import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaClient, Usuario } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaClient) {}
  async createUser(createUserDto: CreateUserDto) {
    console.log('Los datos son: ', createUserDto);

    const empresa = await this.prisma.empresa.findUnique({
      where: {
        id: createUserDto.empresaId,
      },
    });
    console.log('La empresa es: ', empresa);

    if (!empresa) console.log('No hay empresa');

    try {
      const hashedPassword = await bcrypt.hash(createUserDto.contrasena, 10);
      const NewUser = await this.prisma.usuario.create({
        data: { ...createUserDto, contrasena: hashedPassword },
      });

      // const newUser = await this.prisma.usuario.create({ data: createUserDto });
      console.log('usuario creado exitosamente');
      console.log(NewUser);

      return NewUser;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al crear usuario');
    }
  }

  async findByEmail(email: string): Promise<Usuario> {
    try {
      const myUserFind = await this.prisma.usuario.findUnique({
        where: { correo: email },
      });

      return myUserFind;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Usuario no encontrado..');
    }
  }

  async findAllUsers() {
    try {
      const Users = await this.prisma.usuario.findMany({});
      return Users;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('No se encontraron usuarios');
    }
  }

  async findOneUser(id: number) {
    try {
      const user = await this.prisma.usuario.findUnique({
        where: {
          id: id,
        },
      });
      return user;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('No se encontró el usuarios');
    }
  }

  //CAMBIAR DATOS PRIMARIOS DEL USER
  async updateOneUser(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.prisma.usuario.findUnique({ where: { id } });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Eliminar cualquier intento de cambiar la contraseña desde el DTO
      delete updateUserDto.contrasena;
      delete updateUserDto.contrasenaActual;

      // Actualizar usuario con los nuevos datos
      const userToUpdate = await this.prisma.usuario.update({
        where: { id },
        data: {
          nombre: updateUserDto.nombre,
          rol: updateUserDto.rol,
          correo: updateUserDto.correo,
        },
      });

      return userToUpdate;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw new InternalServerErrorException('Error al actualizar usuario');
    }
  }

  //CAMBIAR CONTRASEÑA
  async changeUserPassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ) {
    try {
      const { adminId, adminPassword, newPassword } = changePasswordDto;
      const admin = await this.prisma.usuario.findUnique({
        where: { id: adminId },
      });

      if (!admin) {
        throw new Error('Administrador no encontrado');
      }

      if (admin.rol !== 'ADMIN') {
        throw new Error('No tienes permisos para realizar esta acción');
      }

      const isAdminPassValid = await bcrypt.compare(
        adminPassword,
        admin.contrasena,
      );
      if (!isAdminPassValid) {
        throw new Error('Contraseña de administrador incorrecta');
      }

      const user = await this.prisma.usuario.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updatedUser = await this.prisma.usuario.update({
        where: { id: userId },
        data: { contrasena: hashedPassword },
      });

      return {
        message: 'Contraseña actualizada correctamente',
        user: updatedUser,
      };
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
      throw new InternalServerErrorException('Error al cambiar la contraseña');
    }
  }

  async removeOneUser(id: number) {
    try {
      const userRemoved = await this.prisma.usuario.delete({
        where: { id: id },
      });
      return userRemoved;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Usuario no encontrado');
    }
  }

  async deleteAllUsers() {
    try {
      const usersToDelete = await this.prisma.usuario.deleteMany({});
      return usersToDelete;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al eliminar ususarios');
    }
  }
}
