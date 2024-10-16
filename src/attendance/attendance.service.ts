import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { PrismaService } from 'src/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationsService,
  ) {}

  async createCheckIn(createAttendanceDto: CreateAttendanceDto) {
    try {
      // Convertimos la fecha de hoy a formato "YYYY-MM-DD"
      const today = new Date().toISOString().split('T')[0];

      // Buscamos si ya existe un registro de entrada para el mismo usuario en la fecha de hoy
      const entradaDeHoy = await this.prisma.asistencia.findFirst({
        where: {
          usuarioId: createAttendanceDto.usuarioId,
          fecha: {
            equals: today + 'T00:00:00.000Z', // Comparamos solo con la fecha
          },
        },
      });

      if (entradaDeHoy) {
        console.log('Ya hay una marca de entrada');

        throw new BadRequestException('Ya se ha marcado la entrada de hoy');
      }

      // SOLO MARCAMOS LA ENTRADA
      const nuevaAsistencia = await this.prisma.asistencia.create({
        data: {
          fecha: today + 'T00:00:00.000Z', // Guardamos la fecha como "YYYY-MM-DDT00:00:00.000Z"
          entrada: createAttendanceDto.entrada,
          usuarioId: createAttendanceDto.usuarioId,
        },
      });

      const userNotification = await this.prisma.usuario.findUnique({
        where: {
          id: nuevaAsistencia.usuarioId,
        },
      });

      //LLAMAR AL SERVICIO DE NOTIFICACIONES LIGADO AL GATEWAY
      await this.notificationService.createNotification({
        mensaje: `El usuario ${userNotification.nombre} ha registrado su entrada`,
        remitenteId: nuevaAsistencia.usuarioId,
      });

      return nuevaAsistencia;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al crear asistencia');
    }
  }

  async createCheckOut(
    updateAttendanceDto: UpdateAttendanceDto,
    asistenciaId: number,
  ) {
    try {
      //Terminar de marcar la salida
      const marcarSalida = await this.prisma.asistencia.update({
        where: { id: asistenciaId },
        data: updateAttendanceDto,
      });

      const userNotification = await this.prisma.usuario.findUnique({
        where: {
          id: marcarSalida.usuarioId,
        },
      });

      //LLAMAR AL SERVICIO DE NOTIFICACIONES LIGADO AL GATEWAY
      await this.notificationService.createNotification({
        mensaje: `El usuario ${userNotification.nombre} ha registrado su salida`,
        remitenteId: marcarSalida.usuarioId,
      });
      return marcarSalida;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al crear asistencia');
    }
  }

  async findAll() {
    try {
      const Attendances = await this.prisma.asistencia.findMany({
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              correo: true,
              rol: true,
            },
          },
        },
      });
      return Attendances;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al crear asistencia');
    }
  }

  async findOne(id: number) {
    try {
      const today = new Date();
      const startOfDay = new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate(),
          0,
          0,
          0,
        ),
      ); // Inicio del día en UTC
      const endOfDay = new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate(),
          23,
          59,
          59,
          999,
        ),
      ); // Fin del día en UTC

      console.log('Inicio del día:', startOfDay);
      console.log('Fin del día:', endOfDay);
      const AttendanceToday = await this.prisma.asistencia.findFirst({
        where: {
          usuarioId: id,
          fecha: {
            gte: startOfDay,
            lte: endOfDay,
          },
          salida: null,
        },
      });

      console.log('El id de hoy es: ', id);
      console.log('El registro de hoy es: ', AttendanceToday);

      return AttendanceToday;
    } catch (error) {
      console.log('Error al buscar asistencia:', error);
      throw new InternalServerErrorException('Error al conseguir asistencias');
    }
  }

  update(id: number, updateAttendanceDto: UpdateAttendanceDto) {
    return `This action updates a #${id} attendance`;
  }

  async removeAll() {
    try {
      const AttendancesRemove = await this.prisma.asistencia.deleteMany({});
      return AttendancesRemove;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error al eliminar todas las asistencia',
      );
    }
  }

  async remove(id: number) {
    try {
      const Attendance = await this.prisma.asistencia.delete({
        where: { id },
      });
      return Attendance;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al eliminar la asistencia');
    }
  }
}
