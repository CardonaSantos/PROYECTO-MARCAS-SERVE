import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { PrismaService } from 'src/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class DiscountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationsService,
  ) {}
  async create(
    createDiscountDto: CreateDiscountDto,
    // private discountGateway: DiscountGateway
  ) {
    try {
      console.log('Creando descuento: ');
      console.log(createDiscountDto);

      const newDiscount = await this.prisma.descuento.create({
        data: createDiscountDto,
      });
      console.log('Descuento creado: ', newDiscount);

      return newDiscount;
    } catch (error) {
      console.log(error);
    }
  }

  async createSolicitudDescuento(requestData: {
    clienteId: number;
    justificacion: string;
    usuarioId: number;
    descuentoSolicitado: number;
    motivo: string;
  }) {
    try {
      // Loguear los datos entrantes
      console.log('La data llegando es: ', requestData);

      // Crear el registro de la solicitud de descuento
      const nuevaSolicitud = await this.prisma.solicitudDescuento.create({
        data: {
          porcentaje: requestData.descuentoSolicitado,
          clienteId: requestData.clienteId,
          estado: 'PENDIENTE', // Puedes cambiar este estado si es necesario
          usuarioId: requestData.usuarioId,
          justificacion: requestData.justificacion,
          // Si tienes un campo para el motivo, puedes agregarlo aquí
        },
      });

      console.log('Solicitud de descuento creada:', nuevaSolicitud);

      if (!nuevaSolicitud) {
        throw new BadRequestException(
          'Error al generar la solicitud de descuento',
        );
      }

      // Obtener los datos del vendedor y cliente
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

      // Preparar el objeto completo para emitir
      const solicitudCompleta = {
        id: nuevaSolicitud.id,
        porcentaje: nuevaSolicitud.porcentaje,
        estado: nuevaSolicitud.estado,
        usuarioId: nuevaSolicitud.usuarioId,
        clienteId: nuevaSolicitud.clienteId,
        creadoEn: nuevaSolicitud.creadoEn,
        justificacion: nuevaSolicitud.justificacion,
        cliente: {
          id: cliente.id,
          nombre: cliente.nombre,
        },
        vendedor: {
          id: vendedor.id,
          nombre: vendedor.nombre,
        },
      };

      // Crear la notificación relacionada con la solicitud de descuento
      const notify = await this.notificationService.createNotification({
        mensaje: `El usuario ${vendedor.nombre} ha solicitado un descuento del ${nuevaSolicitud.porcentaje}% para el cliente ${cliente.nombre}`,
        remitenteId: vendedor.id,
      });

      console.log('Emitiendo notificacion', notify);

      console.log('La nueva solicitud es: ', solicitudCompleta);

      // Emitir el registro de la solicitud de descuento a los administradores
      await this.notificationService.emitirRegistroDescuento(solicitudCompleta);

      return solicitudCompleta; // Retornar el objeto completo
    } catch (error) {
      console.error('Error al crear la solicitud de descuento:', error);
      throw new InternalServerErrorException(
        'Error al procesar la solicitud de descuento',
      );
    }
  }

  async deleteAllRequest() {
    try {
      const allrequests = await this.prisma.solicitudDescuento.deleteMany({});
      return allrequests;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error al eliminar los registros ',
      );
    }
  }

  async deleOneDiscount(id: number) {
    try {
      // Buscar el descuento a eliminar basado en el ID
      const deleteDiscount = await this.prisma.descuento.delete({
        where: {
          id: id, // Usamos el id proporcionado para eliminar el descuento
        },
      });
      return deleteDiscount;
    } catch (error) {
      console.log('Error eliminando el descuento:', error);
      throw new Error('Error eliminando el descuento'); // Puedes ajustar este mensaje para manejar los errores de forma adecuada
    }
  }

  async getDiscountsByClienteId(clienteId: number) {
    try {
      // Buscar todos los descuentos asociados al cliente
      const discounts = await this.prisma.descuento.findMany({
        where: {
          clienteId: clienteId, // Filtramos los descuentos por clienteId
        },
        orderBy: {
          creadoEn: 'desc', // Opcional: ordenar los resultados por fecha de creación
        },
      });
      return discounts;
    } catch (error) {
      console.log('Error obteniendo descuentos por clienteId:', error);
      throw new Error('Error obteniendo descuentos para el cliente'); // Manejo adecuado del error
    }
  }

  findAll() {
    return `This action returns all discount`;
  }

  async findOne() {
    try {
      const requests = await this.prisma.solicitudDescuento.findMany({
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
            },
          },
          vendedor: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      });
      return requests;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error');
    }
  }

  async updateDesactivate(id: number) {
    try {
      const descuentoActual = await this.prisma.descuento.findUnique({
        where: {
          id: id,
        },
      });

      if (!descuentoActual) {
        throw new BadRequestException('error al encontrar el registro');
      }

      const nuevoEstado = !descuentoActual.activo;
      const discountToUpdate = await this.prisma.descuento.update({
        where: {
          id: id,
        },
        data: {
          activo: nuevoEstado,
        },
      });
      return discountToUpdate;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error al actualizar');
    }
  }

  async removeAll() {
    try {
      const discounts = await this.prisma.descuento.deleteMany({});
      return discounts;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error al eliminar todos los descuentos',
      );
    }
  }

  remove(id: number) {
    return `This action removes a #${id} discount`;
  }
  //---------------------------------------
  async createSolicitud(requestData: {
    clienteId: number;
    justificacion: string;
    usuarioId: number;
    descuentoSolicitado: number;
    motivo: string;
  }) {
    try {
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

      if (!nuevaPeticionRegistro) {
        throw new BadRequestException('error al generar solicitud');
      }

      this.notificationService.emitirRegistroDescuento(nuevaPeticionRegistro);

      return nuevaPeticionRegistro;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error');
    }
  }
}
