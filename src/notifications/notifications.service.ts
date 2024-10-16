import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { PrismaService } from 'src/prisma.service';
import { LocationGateway } from 'src/location/location.gateway';

interface NotificacionVentaCuerpo {
  evento: string;
  clienteNombre: string;
  clienteId: number;
  empleadoNombre: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private locationGateway: LocationGateway,
  ) {}

  async createNotification(data: { mensaje: string; remitenteId: number }) {
    const nuevaNotificacion = await this.prisma.notificacion.create({
      data: {
        mensaje: data.mensaje,
        remitenteId: data.remitenteId,
      },
    });

    //encontrar mis admimistradores
    const admins = await this.prisma.usuario.findMany({
      where: {
        rol: 'ADMIN',
      },
    });

    for (const admin of admins) {
      await this.prisma.notificacionesLeidas.create({
        data: {
          notificacionId: nuevaNotificacion.id,
          usuarioId: admin.id, //la asociamos al admin que está pasando
          leido: false,
        },
      });
    }

    //ANTES DE TERMINAR EMITIR EL EVENTO
    this.locationGateway.emitNotificationToAdmins(nuevaNotificacion);

    return nuevaNotificacion; //RETORNAMOS LA NOTIFICACION FINAL XD
  }

  async emitirRegistroDescuento(registroDescuento: any) {
    try {
      this.locationGateway.emitDiscountRequestToAdmins(registroDescuento);
    } catch (error) {
      console.log(error);
    }
  }

  create(createNotificationDto: CreateNotificationDto) {
    return 'This action adds a new notification';
  }

  async findAll() {
    try {
      const notifications = await this.prisma.notificacion.findMany({
        orderBy: {
          creadoEn: 'desc',
        },
      });
      return notifications;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Eror');
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  async findNotificationsForMyAdmin(adminId: number) {
    try {
      // Buscar en NotificacionesLeidas las notificaciones del administrador
      const notificationsForAdmin =
        await this.prisma.notificacionesLeidas.findMany({
          where: {
            usuarioId: adminId, // El ID del administrador que recibe las notificaciones
          },
          include: {
            notificacion: true, // Incluir la notificación completa (mensaje, etc.)
          },
          orderBy: {
            timestamp: 'desc',
          },
        });

      // DEVOLVER SOLO EL TIPO DE OBJETO QUE QUIERO
      const formattedNotifications = notificationsForAdmin.map((item) => ({
        id: item.notificacion.id,
        mensaje: item.notificacion.mensaje,
        leido: item.leido, // Tomamos el estado leido de NotificacionesLeidas
        remitenteId: item.notificacion.remitenteId,
        creadoEn: item.notificacion.creadoEn,
      }));

      console.log(
        'Las notifiaciones de mi admin son: ',
        formattedNotifications,
      );

      return formattedNotifications;
    } catch (error) {
      throw new Error(
        'Error al obtener las notificaciones para el administrador',
      );
    }
  }

  async updadateCheckedNotification(
    notificationId: number,
    updateNotificationDto: UpdateNotificationDto,
  ) {
    try {
      console.log('Cambiando estado de la notificacion');

      const notificationUpdated =
        await this.prisma.notificacionesLeidas.findFirst({
          where: {
            notificacionId: notificationId,
            usuarioId: updateNotificationDto.usuarioId,
          },
        });

      if (!notificationUpdated) {
        throw new BadRequestException(
          'Error al actualizar registro de notificacion',
        );
      }

      await this.prisma.notificacionesLeidas.update({
        where: {
          id: notificationUpdated.id,
        },
        data: {
          leido: true,
          leidoEn: new Date(),
        },
      });
      console.log('La notificacion actualizada es: ', notificationUpdated);

      await this.prisma.notificacionesLeidas.delete({
        where: {
          id: notificationUpdated.id,
        },
      });

      return notificationUpdated;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error al actualizar estado visto',
      );
    }
  }

  async deleteMyNotification(
    notificationId: number,
    updateNotificationDto: UpdateNotificationDto,
  ) {
    try {
      const notificationToDelete =
        await this.prisma.notificacionesLeidas.findFirst({
          where: {
            notificacionId: notificationId,
            usuarioId: updateNotificationDto.usuarioId,
          },
        });

      if (!notificationToDelete) {
        throw new BadRequestException(
          'Error al actualizar registro de notificacion',
        );
      }

      const notifyDeleted = await this.prisma.notificacionesLeidas.delete({
        where: {
          id: notificationToDelete.id,
        },
      });

      return notifyDeleted;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error al actualizar estado visto',
      );
    }
  }

  async deleteAllNotificatonsForMyAdmin(adminId: number) {
    //ELIMINAR NOTIFICACIONES SOLO, PARA ESTE ADMIN
    try {
      const notificationsForAdmin =
        await this.prisma.notificacionesLeidas.deleteMany({
          where: {
            usuarioId: adminId, // El ID del administrador que recibe las notificaciones
          },
        });

      return notificationsForAdmin;
    } catch (error) {
      throw new Error(
        'Error al obtener las notificaciones para el administrador',
      );
    }
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return `This action updates a #${id} notification`;
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }
}
