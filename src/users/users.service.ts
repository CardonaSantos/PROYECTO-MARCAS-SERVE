import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaClient, Usuario } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaClient) {}
  async createUser(createUserDto: CreateUserDto) {
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

  //LOS UPDATE BUSCAN
  async updateOneUser(id: number, updateUserDto: UpdateUserDto) {
    try {
      // Buscar el usuario actual
      const user = await this.prisma.usuario.findUnique({
        where: { id: id },
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar si se está intentando cambiar la contraseña
      if (updateUserDto.contrasena && updateUserDto.contrasenaActual) {
        // Compara la contraseña actual con la almacenada
        const isMatch = await bcrypt.compare(
          updateUserDto.contrasenaActual,
          user.contrasena,
        );

        if (!isMatch) {
          throw new Error('La contraseña actual no es correcta');
        }

        // Si la contraseña actual es correcta, encriptar la nueva
        const hashedPassword = await bcrypt.hash(updateUserDto.contrasena, 10);
        updateUserDto.contrasena = hashedPassword;
      } else {
        // Eliminar la contraseña si no hay cambios
        delete updateUserDto.contrasena;
      }

      // Asegúrate de eliminar contrasenaActual del DTO para evitar el error
      delete updateUserDto.contrasenaActual;

      // Actualizar usuario
      const userToUpdate = await this.prisma.usuario.update({
        where: { id: id },
        data: updateUserDto,
      });

      return userToUpdate;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al actualizar usuario');
    }
  }

  //
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
