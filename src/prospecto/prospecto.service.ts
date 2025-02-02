import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateProspectoDto } from './dto/create-prospecto.dto';
import { UpdateProspectoDto } from './dto/update-prospecto.dto';
import { PrismaService } from 'src/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class ProspectoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationsService,
  ) {}

  //----------------------------------------------------
  // En tu servicio prospecto.service.ts
  async create(createProspectoDto: CreateProspectoDto) {
    try {
      console.log('Los datos entrantes son: ', createProspectoDto);

      // Comienza creando el prospecto sin la ubicación
      const nuevoProspecto = await this.prisma.prospecto.create({
        data: {
          nombreCompleto: createProspectoDto.nombreCompleto,
          apellido: createProspectoDto.apellido,
          empresaTienda: createProspectoDto.empresaTienda,
          vendedor: {
            connect: { id: createProspectoDto.usuarioId }, // Conectando al vendedor por ID
          },
          telefono: createProspectoDto.telefono,
          correo: createProspectoDto.correo,
          direccion: createProspectoDto.direccion,
          municipio: createProspectoDto.municipioId
            ? { connect: { id: createProspectoDto.municipioId } }
            : undefined, // Conectando el municipio por ID si está presente
          departamento: createProspectoDto.departamentoId
            ? { connect: { id: createProspectoDto.departamentoId } }
            : undefined, // Conectando el departamento por ID si está presente
          tipoCliente: createProspectoDto.tipoCliente,
          categoriasInteres: createProspectoDto.categoriasInteres,
          volumenCompra: createProspectoDto.volumenCompra,
          presupuestoMensual: createProspectoDto.presupuestoMensual,
          preferenciaContacto: createProspectoDto.preferenciaContacto,
          comentarios: createProspectoDto.comentarios,
        },
      });

      if (createProspectoDto.latitud && createProspectoDto.longitud) {
        const nuevaUbicacion = await this.prisma.ubicacionProspecto.create({
          data: {
            latitud: createProspectoDto.latitud,
            longitud: createProspectoDto.longitud,
            prospectoId: nuevoProspecto.id, // Se asigna directamente el ID del prospecto
          },
        });

        // Retornar prospecto con ubicación
        return { ...nuevoProspecto, ubicacion: nuevaUbicacion };
      }

      const vendedor = await this.prisma.usuario.findUnique({
        where: {
          id: createProspectoDto.usuarioId,
        },
      });

      const prospectoCreado = await this.prisma.prospecto.findUnique({
        where: {
          id: nuevoProspecto.id,
        },
      });

      // Verifica que vendedor y prospectoCreado existen antes de crear la notificación
      if (vendedor && prospectoCreado) {
        console.log(
          'El vendedor para la notificacion y prospecto son: ',
          vendedor,
          prospectoCreado,
        );

        console.log('=======================================');

        const nombreProspecto =
          prospectoCreado.nombreCompleto && prospectoCreado.apellido
            ? `${prospectoCreado.nombreCompleto} ${prospectoCreado.apellido}`
            : prospectoCreado.empresaTienda || 'un cliente';

        const notify = await this.notificationService.createNotification({
          mensaje: `${vendedor.nombre} ha iniciado un prospecto con ${nombreProspecto}.`,

          remitenteId: vendedor.id,
        });

        console.log('Notificación creada: ', notify);
      } else {
        console.error('Error: No se encontró el vendedor o el prospecto.');
      }

      // Retornar prospecto sin ubicación
      return nuevoProspecto;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async findAll() {
    try {
      const prospectos = await this.prisma.prospecto.findMany({
        orderBy: {
          creadoEn: 'desc',
        },
        include: {
          vendedor: {
            select: {
              correo: true,
              id: true,
              nombre: true,
              rol: true,
            },
          },

          departamento: {
            select: {
              nombre: true,
              id: true,
            },
          },
          municipio: {
            select: {
              id: true,
              nombre: true,
            },
          },
          ubicacion: true,
        },
      });
      return prospectos;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error al recuperar los prospectos',
      );
    }
  }
  async findAllMyCancelProspects(id: number) {
    try {
      console.log('Mis prospectos cancelados', id);

      const prospectos = await this.prisma.prospecto.findMany({
        where: {
          usuarioId: id, //el usuario que lo registró
          estado: 'CERRADO',
        },
        orderBy: {
          creadoEn: 'desc',
        },
        include: {
          vendedor: {
            select: {
              correo: true,
              id: true,
              nombre: true,
              rol: true,
            },
          },

          departamento: {
            select: {
              nombre: true,
              id: true,
            },
          },
          municipio: {
            select: {
              id: true,
              nombre: true,
            },
          },
          ubicacion: true,
        },
      });

      return prospectos;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error al recuperar los prospectos',
      );
    }
  }

  async ultimoProspectoAbierto(venddorId: number) {
    try {
      const prospectoAbierto = await this.prisma.prospecto.findFirst({
        where: {
          vendedor: {
            id: venddorId,
          },
          fin: null,
          estado: 'EN_PROSPECTO',
        },
        include: {
          departamento: true,
          municipio: true,
        },
      });
      console.log(
        'El prospecto abierto por el empleado: ',
        venddorId,
        ' Es: ',
        prospectoAbierto,
      );

      return prospectoAbierto;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'No se encontraron prospectos abiertos',
      );
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} prospecto`;
  }

  async updateProspecto(
    prospectoId: number,
    updateProspectoDto: UpdateProspectoDto,
  ) {
    try {
      console.log(
        'La data de la longitud y latitud es: ',
        updateProspectoDto.longitud,
        ' ',
        updateProspectoDto.latitud,
      );

      // Obtener la fecha/hora actual directamente (ya incluye la hora local del servidor)
      const fechaHoraGuatemala = new Date().toLocaleString('en-US', {
        timeZone: 'America/Guatemala',
      });

      // Convertirlo a un objeto Date de JS
      const fechaHoraFin = new Date(fechaHoraGuatemala);

      let nuevaUbicacionProspectoId: number | null = null;

      // Verificar si se proporcionaron latitud y longitud
      if (updateProspectoDto.latitud && updateProspectoDto.longitud) {
        const nuevaUbicacionProspecto =
          await this.prisma.ubicacionProspecto.create({
            data: {
              latitud: updateProspectoDto.latitud,
              longitud: updateProspectoDto.longitud,
              prospectoId, // Asociar con el prospecto
            },
          });
        console.log(
          'La ubicación creada por la actualización de prospecto es: ',
          nuevaUbicacionProspecto,
        );
        nuevaUbicacionProspectoId = nuevaUbicacionProspecto.id;
      }

      // Actualizar el prospecto
      const prospectoUpdate = await this.prisma.prospecto.update({
        where: {
          id: prospectoId,
        },
        data: {
          nombreCompleto: updateProspectoDto.nombreCompleto,
          apellido: updateProspectoDto.apellido,
          empresaTienda: updateProspectoDto.empresaTienda,
          telefono: updateProspectoDto.telefono,
          correo: updateProspectoDto.correo,
          direccion: updateProspectoDto.direccion,
          tipoCliente: updateProspectoDto.tipoCliente,
          categoriasInteres: updateProspectoDto.categoriasInteres,
          volumenCompra: updateProspectoDto.volumenCompra,
          presupuestoMensual: updateProspectoDto.presupuestoMensual,
          preferenciaContacto: updateProspectoDto.preferenciaContacto,
          comentarios: updateProspectoDto.comentarios,
          fin: fechaHoraFin,
          estado: updateProspectoDto.estado,
          departamento: {
            connect: { id: updateProspectoDto.departamentoId },
          },
          municipio: {
            connect: { id: updateProspectoDto.municipioId },
          },
          ubicacion: nuevaUbicacionProspectoId
            ? {
                connect: { id: nuevaUbicacionProspectoId },
              }
            : undefined,
        },
      });

      const vendedor = await this.prisma.usuario.findUnique({
        where: {
          id: prospectoUpdate.usuarioId,
        },
      });

      const prospectoCreado = await this.prisma.prospecto.findUnique({
        where: {
          id: prospectoUpdate.id,
        },
      });

      // Verifica que vendedor y prospectoCreado existen antes de crear la notificación
      if (vendedor && prospectoCreado) {
        console.log(
          'El vendedor para la notificacion y prospecto son: ',
          vendedor,
          prospectoCreado,
        );

        const nombreProspecto =
          prospectoCreado.nombreCompleto && prospectoCreado.apellido
            ? `${prospectoCreado.nombreCompleto} ${prospectoCreado.apellido}`
            : prospectoCreado.empresaTienda || 'un cliente';

        const notify = await this.notificationService.createNotification({
          mensaje: `${vendedor.nombre} ha finalizado un prospecto con ${nombreProspecto}.`,
          remitenteId: vendedor.id,
        });

        console.log('Notificación creada: ', notify);
      } else {
        console.error('Error: No se encontró el vendedor o el prospecto.');
      }

      return prospectoUpdate;
    } catch (error) {
      console.error('Error al actualizar el prospecto:', error);
      throw error; // Propagar el error para que pueda ser manejado en el controlador
    }
  }

  async removeAll() {
    try {
      const prospectosToDelete = await this.prisma.prospecto.deleteMany({});
      return prospectosToDelete;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error al eliminar los registros de prospectos',
      );
    }
  }

  async getUbicationesProspecto() {
    return this.prisma.ubicacionProspecto.findMany({});
  }

  remove(id: number) {
    return `This action removes a #${id} prospecto`;
  }

  async cancelarProspecto(
    prospectoId: number,
    updateProspectoDto: UpdateProspectoDto,
  ) {
    try {
      console.log(
        'Datos recibidos para cancelar el prospecto:',
        updateProspectoDto,
      );

      // Obtener la fecha/hora actual directamente (ya incluye la hora local del servidor)
      const fechaHoraGuatemala = new Date().toLocaleString('en-US', {
        timeZone: 'America/Guatemala',
      });

      // Convertirlo a un objeto Date de JS
      const fechaHoraFin = new Date(fechaHoraGuatemala);

      let nuevaUbicacionProspectoId: number | null = null;

      // Verificar si se proporcionaron latitud y longitud
      if (updateProspectoDto.latitud && updateProspectoDto.longitud) {
        const nuevaUbicacionProspecto =
          await this.prisma.ubicacionProspecto.create({
            data: {
              latitud: updateProspectoDto.latitud,
              longitud: updateProspectoDto.longitud,
              prospectoId, // Asociar con el prospecto
            },
          });
        console.log(
          'Ubicación creada al cancelar el prospecto:',
          nuevaUbicacionProspecto,
        );
        nuevaUbicacionProspectoId = nuevaUbicacionProspecto.id;
      }

      // Actualizar el prospecto
      const prospectoCancelado = await this.prisma.prospecto.update({
        where: {
          id: prospectoId,
        },
        data: {
          nombreCompleto: updateProspectoDto.nombreCompleto || undefined,
          apellido: updateProspectoDto.apellido || undefined,
          empresaTienda: updateProspectoDto.empresaTienda || undefined,
          telefono: updateProspectoDto.telefono || undefined,
          correo: updateProspectoDto.correo || undefined,
          direccion: updateProspectoDto.direccion || undefined,
          tipoCliente: updateProspectoDto.tipoCliente || undefined,
          categoriasInteres: updateProspectoDto.categoriasInteres || undefined,
          volumenCompra: updateProspectoDto.volumenCompra || undefined,
          presupuestoMensual:
            updateProspectoDto.presupuestoMensual || undefined,
          preferenciaContacto:
            updateProspectoDto.preferenciaContacto || undefined,
          comentarios: updateProspectoDto.comentarios || undefined,
          fin: fechaHoraFin, // Establecer la fecha de cancelación
          estado: 'CERRADO', // Cambiar el estado a CANCELADO
          departamento: updateProspectoDto.departamentoId
            ? {
                connect: { id: updateProspectoDto.departamentoId },
              }
            : undefined,
          municipio: updateProspectoDto.municipioId
            ? {
                connect: { id: updateProspectoDto.municipioId },
              }
            : undefined,
          ubicacion: nuevaUbicacionProspectoId
            ? {
                connect: { id: nuevaUbicacionProspectoId },
              }
            : undefined,
        },
      });

      console.log('El prospecto cancelado es: ', prospectoCancelado);
      const prospectoCanceladoActualizado =
        await this.prisma.prospecto.findUnique({
          where: {
            id: prospectoCancelado.id,
          },
        });
      const vendedor = await this.prisma.usuario.findUnique({
        where: {
          id: prospectoCancelado.usuarioId,
        },
      });
      // Verifica que vendedor y prospectoCreado existen antes de crear la notificación
      if (vendedor && prospectoCanceladoActualizado) {
        const nombreProspecto =
          prospectoCanceladoActualizado.nombreCompleto &&
          prospectoCanceladoActualizado.apellido
            ? `${prospectoCanceladoActualizado.nombreCompleto} ${prospectoCanceladoActualizado.apellido}`
            : prospectoCanceladoActualizado.empresaTienda || 'un cliente';

        const notify = await this.notificationService.createNotification({
          mensaje: `${vendedor.nombre} ha cancelado un prospecto con ${nombreProspecto}.`,
          remitenteId: vendedor.id,
        });

        console.log('Notificación creada: ', notify);
      } else {
        console.error('Error: No se encontró el vendedor o el prospecto.');
      }

      return prospectoCancelado;
    } catch (error) {
      console.error('Error al cancelar el prospecto:', error);
      throw new InternalServerErrorException(
        'Error al cancelar el prospecto. Por favor, inténtelo nuevamente.',
      );
    }
  }
}
