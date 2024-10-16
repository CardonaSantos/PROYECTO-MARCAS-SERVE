import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateDateDto } from './dto/create-date.dto';
import { UpdateDateDto } from './dto/update-date.dto';
import { PrismaService } from 'src/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class DateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationsService,
  ) {}
  async create(createDateDto: CreateDateDto) {
    {
      try {
        const newVisitRegist = await this.prisma.visita.create({
          data: {
            inicio: new Date(),
            cliente: {
              connect: {
                id: createDateDto.clienteId, // el cliente actual
              },
            },
            vendedor: {
              connect: {
                id: createDateDto.usuarioId, // vendedor
              },
            },
            estadoVisita: 'INICIADA',
            motivoVisita: createDateDto.motivoVisita,
            tipoVisita: createDateDto.tipoVisita,
            // observaciones pero eso se hará con la actualización del registro
          },
        });

        console.log('El nuevo registro de visita abierto es: ', newVisitRegist);

        // LLAMAR AL SERVICIO DE NOTIFICACIONES LIGADO AL GATEWAY
        const cliente = await this.prisma.cliente.findUnique({
          where: {
            id: createDateDto.clienteId,
          },
        });

        const empleado = await this.prisma.usuario.findUnique({
          where: {
            id: newVisitRegist.usuarioId,
          },
        });

        if (!cliente || !empleado) {
          throw new Error('Cliente o empleado no encontrado');
        }

        // Enviar notificación
        await this.notificationService.createNotification({
          mensaje: `El vendedor ${empleado.nombre} ha comenzado un registro de visita con el cliente ${cliente.nombre}`,
          remitenteId: newVisitRegist.usuarioId, // EL REMITENTE ES EL CREADOR DEL EVENTO, ACCIONADOR
        });

        return newVisitRegist;
      } catch (error) {
        console.error(error);
        throw new InternalServerErrorException(
          'Error al crear el inicio del registro de visita..',
        );
      }
    }
  }

  //FINALIZAR EL REGISTRO
  async updateVisitRegist(visitRegistId: number, updateDateDto: UpdateDateDto) {
    try {
      const visitToUpdate = await this.prisma.visita.update({
        where: {
          id: visitRegistId,
        },
        data: {
          fin: new Date(),
          observaciones: updateDateDto.observaciones,
          estadoVisita: 'FINALIZADA',
        },
      });

      //LANZAR NOTIFICACION
      const vendedor = await this.prisma.usuario.findUnique({
        where: {
          id: visitToUpdate.usuarioId,
        },
      });
      const cliente = await this.prisma.cliente.findUnique({
        where: {
          id: visitToUpdate.clienteId,
        },
      });

      // Enviar notificación
      await this.notificationService.createNotification({
        mensaje: `El vendedor ${vendedor.nombre} ha finalizado su registro de visita con el cliente ${cliente.nombre}`,
        remitenteId: vendedor.id, // EL REMITENTE ES EL CREADOR DEL EVENTO, ACCIONADOR
      });
      return visitToUpdate;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Error al actualizar el registro de visita..',
      );
    }
  }

  async cancelRegistVisit(visitRegistId: number, updateDateDto: UpdateDateDto) {
    try {
      const visitToUpdate = await this.prisma.visita.update({
        where: {
          id: visitRegistId,
        },
        data: {
          fin: new Date(),
          observaciones: updateDateDto.observaciones,
          estadoVisita: 'CANCELADA',
        },
      });

      //LANZAR NOTIFICACION
      const vendedor = await this.prisma.usuario.findUnique({
        where: {
          id: visitToUpdate.usuarioId,
        },
      });
      const cliente = await this.prisma.cliente.findUnique({
        where: {
          id: visitToUpdate.clienteId,
        },
      });

      // Enviar notificación
      await this.notificationService.createNotification({
        mensaje: `El vendedor ${vendedor.nombre} ha finalizado su registro de visita con el cliente ${cliente.nombre}`,
        remitenteId: vendedor.id, // EL REMITENTE ES EL CREADOR DEL EVENTO, ACCIONADOR
      });
      return visitToUpdate;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Error al actualizar el registro de visita..',
      );
    }
  }

  async getRegistOpen(usuarioId: number) {
    try {
      const registVisitOpen = await this.prisma.visita.findFirst({
        where: {
          usuarioId: usuarioId,
          fin: null,
        },
        include: {
          cliente: {
            select: {
              nombre: true,
              id: true,
              telefono: true,
              correo: true,
              direccion: true,
              creadoEn: true,
              actualizadoEn: true,
              descuentos: true, // Aquí simplemente añadimos 'descuentos' dentro del select
            },
          },
          ventas: true,
        },
      });
      console.log('Enviando el registro abierto que es: ', registVisitOpen);
      return registVisitOpen;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error al encontrar el registro abierto',
      );
    }
  }
  async findVisitsRegis() {
    try {
      const visitsRegists = await this.prisma.visita.findMany({
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              comentarios: true,
              correo: true,
              creadoEn: true,
              actualizadoEn: true,
              departamento: true,
              direccion: true,
              municipio: true,
              telefono: true,
              categoriasInteres: true,
              preferenciaContacto: true,
              presupuestoMensual: true,
              tipoCliente: true,
            },
          },
          ventas: true,
          vendedor: {
            select: {
              id: true,
              nombre: true,
              correo: true,
              creadoEn: true,
              rol: true,
            },
          },
        },
      });
      return visitsRegists;
    } catch (error) {
      console.error('Error al encontrar registros de visitas:', error);
      throw new InternalServerErrorException(
        'Error al encontrar registros de visitas',
      );
    }
  }

  //---
  findAll() {
    return `This action returns all date`;
  }

  findOne(id: number) {
    return `This action returns a #${id} date`;
  }

  update(id: number, updateDateDto: UpdateDateDto) {
    return `This action updates a #${id} date`;
  }

  remove(id: number) {
    return `This action removes a #${id} date`;
  }
}
