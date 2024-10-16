import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { PrismaService } from 'src/prisma.service';
import { LocationGateway } from './location.gateway';

@Injectable()
export class LocationService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => LocationGateway))
    private readonly locationGateway: LocationGateway,
  ) {}

  async createLocation(createLocationDto: CreateLocationDto) {
    try {
      const newLocation = await this.prisma.ubicacion.create({
        data: createLocationDto,
      });
      // No se pasa el cliente aquí, solo la nueva ubicación
      console.log('Localización creada...');
      console.log('Localizacion: ', newLocation);
      return newLocation;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error al crear ubicación');
    }
  }

  // location.service.ts
  // async findLocationByUserId(usuarioId: number) {
  //   const startOfDay = new Date();
  //   startOfDay.setHours(0, 0, 0, 0); // Inicio del día
  //   const endOfDay = new Date();
  //   endOfDay.setHours(23, 59, 59, 999); // Fin del día

  //   return this.prisma.ubicacion.findFirst({
  //     where: { usuarioId },
  //     include: {
  //       usuario: {
  //         select: {
  //           nombre: true,
  //           id: true,
  //           rol: true,
  //           prospectos: {
  //             take: 1, // Devuelve solo un prospecto en curso
  //             where: {
  //               estado: 'EN_PROSPECTO',
  //               fin: null, // Solo prospectos en curso
  //             },
  //             select: {
  //               estado: true,
  //               empresaTienda: true,
  //               nombreCompleto: true,
  //               inicio: true,
  //             },
  //           },
  //           registrosAsistencia: {
  //             take: 1, // Solo el último registro
  //             where: {
  //               AND: [
  //                 { fecha: { gte: startOfDay, lte: endOfDay } }, // Filtra por el día actual
  //                 { salida: null }, // Solo registros donde no ha marcado salida
  //               ],
  //             },
  //             orderBy: {
  //               entrada: 'desc', // Ordena por la última entrada
  //             },
  //             select: {
  //               entrada: true,
  //               salida: true,
  //             },
  //           },
  //         },
  //       },
  //     },
  //   });
  // }

  // location.service.ts
  async findLocationByUserId(usuarioId: number) {
    // Definir inicio y fin del día en UTC
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

    // Realizar la búsqueda de la ubicación y asociar la asistencia
    return this.prisma.ubicacion.findFirst({
      where: { usuarioId },
      include: {
        usuario: {
          select: {
            nombre: true,
            id: true,
            rol: true,
            prospectos: {
              take: 1, // Devuelve solo un prospecto en curso
              where: {
                estado: 'EN_PROSPECTO',
                fin: null, // Solo prospectos en curso
              },
              select: {
                estado: true,
                empresaTienda: true,
                nombreCompleto: true,
                inicio: true,
              },
            },
            registrosAsistencia: {
              take: 1, // Solo el último registro de asistencia del día actual
              where: {
                AND: [
                  { fecha: { gte: startOfDay, lte: endOfDay } }, // Filtrar por día actual en UTC
                  { salida: null }, // Solo registros sin salida
                ],
              },
              orderBy: {
                entrada: 'desc', // Ordena por la última entrada
              },
              select: {
                entrada: true,
                salida: true,
              },
            },
          },
        },
      },
    });
  }

  // async findLocationByUserId(usuarioId: number) {
  //   return this.prisma.ubicacion.findFirst({
  //     where: { usuarioId },
  //     include: {
  //       usuario: {
  //         select: {
  //           nombre: true,
  //           id: true,
  //           rol: true,
  //         },
  //         include: {
  //           prospectos: {
  //             where: {
  //               fin: null,
  //               estado: 'EN_PROSPECTO',
  //             },
  //             select: {
  //               estado: true,
  //               empresaTienda: true,
  //               nombreCompleto: true,
  //               inicio: true,
  //             },
  //           },
  //         },
  //       },
  //     },
  //   });
  // }
  async finUnique(usuarioId: number) {
    return this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        nombre: true,
        rol: true,
        prospectos: {
          take: 1, // Devuelve solo un prospecto en curso
          where: {
            estado: 'EN_PROSPECTO',
            fin: null, // Solo prospectos en curso
          },
          select: {
            estado: true,
            empresaTienda: true,
            nombreCompleto: true,
            inicio: true,
          },
        },
        registrosAsistencia: {
          take: 1, // Solo el último registro de asistencia del día
          where: {
            fecha: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)), // Filtrar el registro de hoy
              lte: new Date(new Date().setHours(23, 59, 59, 999)), // Hasta el final del día
            },
          },
          orderBy: {
            entrada: 'desc', // Ordenar por última entrada
          },
          select: {
            entrada: true,
            salida: true,
          },
        },
      },
    });
  }

  // location.service.ts
  async updateLocation(id: number, locationData: CreateLocationDto) {
    return this.prisma.ubicacion.update({
      where: { id },
      data: {
        latitud: locationData.latitud,
        longitud: locationData.longitud,
        timestamp: new Date(), // Si deseas actualizar el timestamp también
      },
    });
  }

  async findAll() {
    try {
      const locations = await this.prisma.ubicacion.findMany({});
      return locations;
    } catch (error) {
      console.log(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} location`;
  }

  update(id: number, updateLocationDto: UpdateLocationDto) {
    return `This action updates a #${id} location`;
  }

  async removeAll() {
    try {
      const deletLocation = await this.prisma.ubicacion.deleteMany({});
      return deletLocation;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'error en servicio al borrar ubicaciones',
      );
    }
  }

  remove(id: number) {
    return `This action removes a #${id} location`;
  }
  //=================================================>
  async createSolicitud(requestData: {
    clienteId: number;
    justificacion: string;
    usuarioId: number;
    descuentoSolicitado: number;
  }) {
    console.log('Llamada a createSolicitud con datos:', requestData);

    try {
      // Crear registro de solicitud de descuento
      const nuevaPeticionRegistro = await this.prisma.solicitudDescuento.create(
        {
          data: {
            porcentaje: requestData.descuentoSolicitado,
            clienteId: requestData.clienteId,
            estado: 'PENDIENTE',
            usuarioId: requestData.usuarioId,
            justificacion: requestData.justificacion,
          },
        },
      );

      console.log('Solicitud creada es:', nuevaPeticionRegistro);

      if (!nuevaPeticionRegistro) {
        throw new BadRequestException('Error al generar la solicitud');
      }

      // Obtener datos del vendedor y cliente
      const [vendedor, cliente] = await Promise.all([
        this.prisma.usuario.findUnique({
          where: { id: requestData.usuarioId },
        }),
        this.prisma.cliente.findUnique({
          where: { id: requestData.clienteId },
        }),
      ]);

      if (!vendedor || !cliente) {
        throw new NotFoundException('Vendedor o cliente no encontrado');
      }

      // Usar el servicio createNotification para crear la notificación
      await this.createNotification({
        mensaje: `El usuario ${vendedor.nombre} ha solicitado un descuento del ${nuevaPeticionRegistro.porcentaje}% para el cliente ${cliente.nombre}`,
        remitenteId: vendedor.id,
      });

      console.log('Notificación creada y emitida a los admins');
      return nuevaPeticionRegistro;
    } catch (error) {
      console.error('Error al crear solicitud de descuento:', error);
      throw new InternalServerErrorException('Error al procesar la solicitud');
    }
  }

  async createNotification(data: { mensaje: string; remitenteId: number }) {
    const nuevaNotificacion = await this.prisma.notificacion.create({
      data: {
        mensaje: data.mensaje,
        remitenteId: data.remitenteId,
      },
    });

    // Obtener los admins
    const admins = await this.prisma.usuario.findMany({
      where: {
        rol: 'ADMIN',
      },
    });

    // Crear notificación para cada admin
    for (const admin of admins) {
      await this.prisma.notificacionesLeidas.create({
        data: {
          notificacionId: nuevaNotificacion.id,
          usuarioId: admin.id,
          leido: false,
        },
      });
    }

    // Emitir notificación
    this.locationGateway.emitNotificationToAdmins(nuevaNotificacion);
  }

  async createDiscountFromRequest(
    porcentaje: number,
    clienteId: number,
    vendedorId: number,
    requestId: number,
  ) {
    try {
      // Crea un nuevo descuento
      console.log(`Creando descuento para clienteId: ${clienteId}`);

      const newDiscount = await this.prisma.descuento.create({
        data: {
          porcentaje: porcentaje,
          clienteId: clienteId, // Asegúrate de que clienteId no sea undefined
          // dePedido: true, // Marca el descuento como creado a partir de una solicitud
        },
      });

      console.log('La nueva instancia de descuento es: ', newDiscount);

      const cliente = await this.prisma.cliente.findUnique({
        where: {
          id: clienteId,
        },
      });

      // Enviar notificación al vendedor
      const nuevaNotificacion = {
        mensaje: `Tu solicitud de descuento ha sido aceptada y se ha creado un descuento de ${porcentaje}% para el cliente ${cliente.nombre}`,
        descuentoId: newDiscount.id,
      };
      console.log('esto debería emitir ');

      this.locationGateway.emitNotificationToEmployee(
        vendedorId,
        nuevaNotificacion,
      );

      console.log(
        'La nueva notificacion creada para el vendedor es: ',
        nuevaNotificacion,
      );

      //ELIMINAR LA SOLICITUD
      const deleteRequest = await this.prisma.solicitudDescuento.delete({
        where: {
          id: requestId,
        },
      });

      console.log('La request eliminada es: ', deleteRequest);

      return newDiscount;
    } catch (error) {
      console.log(error);
    }
  }

  //ELIMINAR EL REGISTRO DE REQUEST DISCOUNT
  async deleteDiscountRegist(vendedorId: number, requestId: number) {
    try {
      const requestRegist = await this.prisma.solicitudDescuento.delete({
        where: {
          id: requestId,
        },
      });
      const nuevaNotificacion = {
        mensaje: `El administrador ha denegado su petición`,
        // descuentoId: newDiscount.id,
      };

      console.log('esto debería emitir ');

      this.locationGateway.emitNotificationToEmployee(
        vendedorId,
        nuevaNotificacion,
      );

      return requestRegist;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error al eliminar el registro de descuento',
      );
    }
  }
}
