import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { PrismaService } from 'src/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class SaleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationsService,
  ) {}

  async createSale(createSaleDto: CreateSaleDto) {
    console.log('los datos llegando son: ' + createSaleDto);
    console.log();

    try {
      // Inicia una transacción
      return await this.prisma.$transaction(async (prisma) => {
        // Verificar si hay stock para cada producto solicitado....
        for (const producto of createSaleDto.productos) {
          const productoEncontrado = await prisma.producto.findUnique({
            where: { id: producto.productoId },
          });

          if (!productoEncontrado) {
            throw new Error(
              `No se encontró el producto con ID: ${producto.productoId}`,
            );
          }

          const stockDeProducto = await prisma.stock.findUnique({
            where: { productoId: productoEncontrado.id },
          });

          //si no hay stock o es insuficiente
          if (
            !stockDeProducto ||
            stockDeProducto.cantidad < producto.cantidad
          ) {
            throw new Error(
              `Stock insuficiente para el producto con ID: ${productoEncontrado.id}`,
            );
          }
        }

        // Crear la venta y los productos relacionados
        const newSale = await prisma.venta.create({
          data: {
            clienteId: createSaleDto.clienteId,
            usuarioId: createSaleDto.vendedorId,
            descuento: createSaleDto.descuento || null, //nuevo para meter el descuento
            metodoPago: createSaleDto.metodoPago, //ENUM
            monto: createSaleDto.monto, //CAMPO PARA LA VENTA EN TOTAL SIN APLICAR EL DESUENTO
            montoConDescuento: createSaleDto.montoConDescuento, //VENTA TOTAL APLICANDO EL DESCUENTO
            productos: {
              create: createSaleDto.productos.map((prod) => ({
                producto: { connect: { id: prod.productoId } },
                cantidad: prod.cantidad,
                precio: prod.precio,
              })),
            },
          },
          include: {
            productos: {
              include: { producto: true }, // incluir detalles del producto
            },
          },
        });

        // Actualizar el stock
        for (const producto of createSaleDto.productos) {
          await prisma.stock.update({
            where: { productoId: producto.productoId },
            data: {
              cantidad: {
                decrement: producto.cantidad,
              },
            },
          });
        }
        console.log('La venta hecha es: ', newSale);

        //LANZAR NOTIFICACION

        const vendedor = await this.prisma.usuario.findUnique({
          where: {
            id: createSaleDto.vendedorId,
          },
        });
        const cliente = await this.prisma.cliente.findUnique({
          where: {
            id: createSaleDto.clienteId,
          },
        });

        // Enviar notificación
        await this.notificationService.createNotification({
          mensaje: `El vendedor ${vendedor.nombre} ha registrado una venta para el cliente ${cliente.nombre}`,
          remitenteId: vendedor.id, // EL REMITENTE ES EL CREADOR DEL EVENTO, ACCIONADOR
        });

        console.log('la nueva venta es: ', newSale);

        return newSale;
      });
    } catch (error) {
      console.error(error);
      throw new Error('Error al crear la venta: ' + error.message);
    }
  }

  // createSaleForRegist
  async createSaleForRegist(createSaleDto: CreateSaleDto) {
    console.log('los datos llegando son: ' + createSaleDto);
    console.log(
      'El id de la visita abierta es: ',
      createSaleDto.registroVisitaId,
    );

    try {
      return await this.prisma.$transaction(async (prisma) => {
        for (const producto of createSaleDto.productos) {
          const productoEncontrado = await prisma.producto.findUnique({
            where: { id: producto.productoId },
          });
          if (!productoEncontrado) {
            throw new Error(
              `No se encontró el producto con ID: ${producto.productoId}`,
            );
          }
          const stockDeProducto = await prisma.stock.findUnique({
            where: { productoId: productoEncontrado.id },
          });
          if (
            !stockDeProducto ||
            stockDeProducto.cantidad < producto.cantidad
          ) {
            throw new Error(
              `Stock insuficiente para el producto con ID: ${productoEncontrado.id}`,
            );
          }
        }

        const newSale = await prisma.venta.create({
          data: {
            clienteId: createSaleDto.clienteId,
            usuarioId: createSaleDto.vendedorId,
            descuento: createSaleDto.descuento || null, // nuevo para meter el descuento
            metodoPago: createSaleDto.metodoPago, // ENUM
            monto: createSaleDto.monto, // CAMPO PARA LA VENTA EN TOTAL SIN APLICAR EL DESCUENTO
            montoConDescuento: createSaleDto.montoConDescuento, // VENTA TOTAL APLICANDO EL DESCUENTO
            productos: {
              create: createSaleDto.productos.map((prod) => ({
                producto: { connect: { id: prod.productoId } },
                cantidad: prod.cantidad,
                precio: prod.precio,
              })),
            },
          },
          include: {
            productos: {
              include: { producto: true }, // incluir detalles del producto
            },
          },
        });

        console.log('La venta hecha es: ', newSale);

        // Actualizar el stock
        for (const producto of createSaleDto.productos) {
          await prisma.stock.update({
            where: { productoId: producto.productoId },
            data: {
              cantidad: { decrement: producto.cantidad },
            },
          });
        }

        console.log(
          'El id del registro de visita es: ',
          createSaleDto.registroVisitaId,
        );

        // ACTUALIZAR REGISTRO DE VISITA
        const registroVisitaActual = await prisma.visita.findFirst({
          where: {
            id: createSaleDto.registroVisitaId,
            fin: null,
          },
          include: { ventas: true },
        });

        console.log(
          'El registro de visita encontrado y abierto es: ',
          registroVisitaActual,
        );

        if (!registroVisitaActual) {
          throw new Error('No se encontró un registro de visita abierto.');
        }

        await prisma.visita.update({
          where: { id: registroVisitaActual.id },
          data: {
            ventas: { connect: { id: newSale.id } },
          },
        });

        //LANZAR NOTIFICACION
        const vendedor = await this.prisma.usuario.findUnique({
          where: {
            id: createSaleDto.vendedorId,
          },
        });
        const cliente = await this.prisma.cliente.findUnique({
          where: {
            id: createSaleDto.clienteId,
          },
        });

        // Enviar notificación
        await this.notificationService.createNotification({
          mensaje: `El vendedor ${vendedor.nombre} ha registrado una venta para el cliente ${cliente.nombre}`,
          remitenteId: vendedor.id, // EL REMITENTE ES EL CREADOR DEL EVENTO, ACCIONADOR
        });

        return newSale;
      });
    } catch (error) {
      console.error(error);
      throw new Error('Error al crear la venta: ' + error.message);
    }
  }

  async findAll() {
    try {
      const saleRegist = await this.prisma.venta.findMany({
        include: {
          cliente: true,
          productos: { include: { producto: true } },
          vendedor: true,
        },
        orderBy: {
          timestamp: 'desc',
        },
      });
      console.log('servicio de venta recuperacion');

      return saleRegist;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('No se encontraron registros de ventas');
    }
  }

  async findOne(id: number) {
    try {
      const saleRegist = await this.prisma.venta.findUnique({
        where: { id },
      });
      return saleRegist;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('No se encontraron registros de ventas');
    }
  }

  async findSimpleSales() {
    // try {
    //   const sales = await this.prisma.venta.findMany({
    //     where: {
    //       prospectoId: null, // Asegúrate de que sea prospectoId si estás usando el campo específico
    //     },
    //     include: {
    //       cliente: {
    //         select: {
    //           nombre: true,
    //         },
    //       },
    //     },
    //   });

    //   console.log(sales); // Añade un log para ver qué se está devolviendo
    //   return sales;
    // } catch (error) {
    //   console.log(error);
    //   throw new InternalServerErrorException(
    //     'No se encontraron ventas disponibles',
    //   );
    // }
    console.log('Servicio sales buscando sales simples ');
  }

  async findMySalesUser(idUSer: number) {
    try {
      const saleRegist = await this.prisma.venta.findMany({
        where: {
          usuarioId: idUSer,
        },
        include: {
          cliente: true,
          productos: { include: { producto: true } },
          vendedor: true,
        },
        orderBy: {
          timestamp: 'desc',
        },
      });
      console.log('servicio de venta recuperacion');

      return saleRegist;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('No se encontraron registros de ventas');
    }
  }

  async findCustomerSales(customerId: number) {
    try {
      const saleRegist = await this.prisma.venta.findMany({
        where: {
          clienteId: customerId,
        },
        include: {
          cliente: true,
          productos: { include: { producto: true } },
          vendedor: true,
        },
        orderBy: {
          timestamp: 'desc',
        },
      });
      console.log('servicio de venta recuperacion');

      return saleRegist;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('No se encontraron registros de ventas');
    }
  }

  async remove(id: number) {
    try {
      const saleRegist = await this.prisma.venta.delete({
        where: { id },
      });
      return saleRegist;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('No se encontraron registros de ventas');
    }
  }

  async removeAllRegist2() {
    try {
      const saleRegist = await this.prisma.venta.deleteMany({});
      return saleRegist;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('No se encontraron registros de ventas');
    }
  }

  //OBTENER ULTIMAS 5
  async findLastFiveSales() {
    try {
      const lastFiveSales = await this.prisma.venta.findMany({
        orderBy: {
          id: 'desc', // Ordenar por el ID en orden descendente para obtener las últimas ventas
        },
        take: 5, // Limitar a las últimas 5 ventas
        include: {
          cliente: {
            select: {
              nombre: true, // Solo seleccionamos el nombre del cliente
              correo: true, // El correo para mostrar algo superficial
              telefono: true, // Otras posibles opciones que puedes mostrar
            },
          },
          vendedor: {
            select: {
              nombre: true, // Solo el nombre del vendedor
              correo: true, // Correo del vendedor
            },
          },
          productos: {
            select: {
              id: true,
              cantidad: true,
            },
          },
        },
      });

      return lastFiveSales;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('No se encontraron registros de ventas');
    }
  }

  async getSaleToPDF(id: number) {
    try {
      const sale = await this.prisma.venta.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          timestamp: true,
          monto: true,
          montoConDescuento: true,
          descuento: true,
          metodoPago: true,
          cliente: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              telefono: true,
              correo: true,
              direccion: true,
            },
          },
          vendedor: {
            select: {
              id: true,
              nombre: true,
              correo: true,
            },
          },
          productos: {
            select: {
              cantidad: true,
              precio: true,
              producto: {
                select: {
                  id: true,
                  nombre: true,
                  descripcion: true,
                },
              },
            },
          },
        },
      });

      // Validación por si no se encuentra la venta
      if (!sale) {
        throw new BadRequestException(`La venta con ID ${id} no existe`);
      }

      return sale;

      // Agregar los totales calculados al resultado
    } catch (error) {
      console.error(`Error al generar el PDF de la venta ${id}:`, error);
      throw new BadRequestException('Error al conseguir la venta para el PDF');
    }
  }
}
