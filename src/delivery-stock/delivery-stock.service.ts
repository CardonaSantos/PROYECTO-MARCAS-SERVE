import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateDeliveryStockDto } from './dto/update-delivery-stock.dto';
import { PrismaService } from 'src/prisma.service';
// import { CreateEntregaStockDto } from './dto/create-delivery-stock.dto';
import { CreateDeliveryStockDto } from './dto/create-delivery-stock.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DeliveryStockService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEntregaStockDto: CreateDeliveryStockDto) {
    console.log('hola');
  }

  async findAll() {
    try {
      const stockDeliveryRegist = await this.prisma.entregaStock.findMany({
        orderBy: {
          timestamp: 'desc',
        },
        include: {
          productos: {
            include: {
              producto: true,
            },
          },
          proveedor: true,
        },
      });
      return stockDeliveryRegist;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al pedir registros');
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} deliveryStock`;
  }

  update(id: number, updateDeliveryStockDto: UpdateDeliveryStockDto) {
    return `This action updates a #${id} deliveryStock`;
  }

  async removeAll() {
    try {
      const allDeliverys = await this.prisma.entregaStock.deleteMany({});
      return allDeliverys;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error al eliminar todos los registros',
      );
    }
  }

  remove(id: number) {
    return `This action removes a #${id} deliveryStock`;
  }
  // async removeOneRegist(registID: number, userId: number, password: string) {
  //   // Validamos el usuario y la contraseña
  //   const user = await this.prisma.usuario.findUnique({
  //     where: { id: userId },
  //     select: { contrasena: true },
  //   });

  //   if (!user) throw new NotFoundException('Usuario no encontrado');

  //   const isPasswordValid = await bcrypt.compare(password, user.contrasena);
  //   if (!isPasswordValid) throw new ForbiddenException('Contraseña incorrecta');

  //   // Buscar la entrega y los productos asociados
  //   const entrega = await this.prisma.entregaStock.findUnique({
  //     where: { id: registID },
  //     include: { productos: true }, // Traemos los productos asociados
  //   });

  //   if (!entrega) throw new NotFoundException('Entrega no encontrada');

  //   // Reducir el stock de los productos antes de eliminar la entrega
  //   for (const item of entrega.productos) {
  //     const stock = await this.prisma.stock.findUnique({
  //       where: { productoId: item.productoId },
  //       select: { cantidad: true },
  //     });

  //     if (!stock) continue; // Si no existe el stock, pasamos al siguiente producto

  //     // Evitamos que el stock quede en negativo
  //     const nuevaCantidad = stock.cantidad - item.cantidad;
  //     if (nuevaCantidad < 0) {
  //       console.warn(
  //         `No se puede reducir el stock del producto ${item.productoId}, cantidad insuficiente`,
  //       );
  //       continue; // No aplicamos la reducción si generaría un número negativo
  //     }

  //     await this.prisma.stock.update({
  //       where: { productoId: item.productoId },
  //       data: { cantidad: nuevaCantidad },
  //     });
  //   }

  //   // Ahora eliminamos la entrega
  //   await this.prisma.entregaStock.delete({
  //     where: { id: registID },
  //   });

  //   return { message: 'Registro eliminado con éxito y stock actualizado' };
  // }

  async removeOneRegist(registID: number, userId: number, password: string) {
    // Validamos el usuario y la contraseña
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: { contrasena: true },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    const isPasswordValid = await bcrypt.compare(password, user.contrasena);
    if (!isPasswordValid) throw new ForbiddenException('Contraseña incorrecta');

    // Buscar la entrega y los productos asociados
    const entrega = await this.prisma.entregaStock.findUnique({
      where: { id: registID },
      include: { productos: true },
    });

    if (!entrega) throw new NotFoundException('Entrega no encontrada');

    // Reducir el stock de los productos antes de eliminar la entrega
    for (const item of entrega.productos) {
      const productoStock = await this.prisma.stock.findUnique({
        where: { productoId: item.productoId },
        select: { cantidad: true },
      });

      if (productoStock) {
        const cantidadARestar = Math.min(productoStock.cantidad, item.cantidad); // No permitir negativos
        await this.prisma.stock.updateMany({
          where: { productoId: item.productoId },
          data: {
            cantidad: {
              decrement: cantidadARestar, // Restamos lo posible sin dejar negativo
            },
          },
        });
      }
    }

    // Ahora eliminamos la entrega
    await this.prisma.entregaStock.delete({
      where: { id: registID },
    });

    return { message: 'Registro eliminado con éxito y stock actualizado' };
  }
}
