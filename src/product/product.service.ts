import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(createProductDto: CreateProductDto) {
    const { nombre, descripcion, precio, categoriaIds, codigoProducto } =
      createProductDto;

    let precioInt = Number(precio);

    try {
      const product = await this.prisma.producto.create({
        data: {
          nombre,
          descripcion,
          precio: precioInt,
          codigoProducto,
          categorias: {
            create: categoriaIds.map((categoriaId) => ({
              categoria: { connect: { id: categoriaId } },
            })),
          },
        },
        include: {
          categorias: true,
        },
      });

      console.log('Producto creado: ', product);

      return product;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al crear producto');
    }
  }

  async findAllProducts() {
    try {
      const product = await this.prisma.producto.findMany({
        include: {
          stock: true,
          ventas: true,
          entregas: true,
          categorias: {
            select: {
              categoria: true,
            },
          },
        },
        orderBy: {
          actualizadoEn: 'desc',
        },
      });
      return product;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al crear producto');
    }
  }

  async findOneProduct(id: number) {
    try {
      const product = await this.prisma.producto.findUnique({
        where: { id },
      });
      return product;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Error al encontrar producto');
    }
  }

  async updateOneProduct(id: number, updateProductDto: UpdateProductDto) {
    try {
      // Si no se envían categoriasIds, solo actualiza los otros campos
      if (
        !updateProductDto.categoriasIds ||
        updateProductDto.categoriasIds.length === 0
      ) {
        const product = await this.prisma.producto.update({
          where: { id },
          data: {
            codigoProducto: updateProductDto.codigoProducto,
            nombre: updateProductDto.nombre,
            descripcion: updateProductDto.descripcion,
            precio: updateProductDto.precio,
          },
        });
        return product;
      } else {
        // Verifica que las categorías existan en la base de datos
        const categoriasExistentes = await this.prisma.categoria.findMany({
          where: { id: { in: updateProductDto.categoriasIds } },
          select: { id: true },
        });

        if (
          categoriasExistentes.length !== updateProductDto.categoriasIds.length
        ) {
          throw new NotFoundException('Una o más categorías no existen.');
        }

        // Actualiza el producto con las nuevas categorías
        const product = await this.prisma.producto.update({
          where: { id },
          data: {
            codigoProducto: updateProductDto.codigoProducto,
            nombre: updateProductDto.nombre,
            descripcion: updateProductDto.descripcion,
            precio: updateProductDto.precio,
            categorias: {
              deleteMany: {}, // elimina todas las relaciones existentes
              create: updateProductDto.categoriasIds.map((catId) => ({
                categoria: {
                  connect: { id: catId },
                },
              })),
            },
          },
        });
        return product;
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al actualizar producto');
    }
  }

  async removeOneProduct(id: number) {
    try {
      const product = await this.prisma.producto.delete({
        where: { id },
      });
      return product;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al eliminar producto');
    }
  }
  async removeAllProducts() {
    try {
      const products = await this.prisma.producto.deleteMany({});
      return products; // Esto devuelve la cantidad de productos eliminados
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al eliminar productos');
    }
  }
}
