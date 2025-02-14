import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // async createProduct(createProductDto: CreateProductDto) {
  //   const { nombre, descripcion, precio, categoriaIds, codigoProducto } =
  //     createProductDto;

  //   let precioInt = Number(precio);

  //   try {
  //     const product = await this.prisma.producto.create({
  //       data: {
  //         nombre,
  //         descripcion,
  //         precio: precioInt,
  //         codigoProducto,
  //         categorias: {
  //           create: categoriaIds.map((categoriaId) => ({
  //             categoria: { connect: { id: categoriaId } },
  //           })),
  //         },
  //       },
  //       include: {
  //         categorias: true,
  //       },
  //     });

  //     console.log('Producto creado: ', product);

  //     return product;
  //   } catch (error) {
  //     console.error(error);
  //     throw new InternalServerErrorException('Error al crear producto');
  //   }
  // }

  // async createProduct(createProductDto: CreateProductDto) {
  //   const { nombre, descripcion, precio, categoriaIds, codigoProducto, fotos } =
  //     createProductDto;

  //   let precioInt = Number(precio);

  //   console.log('El numero de fotos llegando es: ', fotos.length);

  //   // Subir imágenes a Cloudinary si son base64
  //   let imagenesData = [];

  //   if (fotos && fotos.length > 0) {
  //     try {
  //       const imagenesSubidas = await Promise.all(
  //         fotos.map(async (imagen) => {
  //           if (imagen.startsWith('data:image')) {
  //             const url = await this.cloudinaryService.subirImagen(imagen);
  //             return { url }; // Prisma necesita un objeto { url: '...' }
  //           }
  //           return { url: imagen }; // Si ya es una URL, se mantiene igual
  //         }),
  //       );

  //       imagenesData = imagenesSubidas;
  //       console.log('Las imagenes subidas a cloudinary son: ', imagenesData);
  //     } catch (error) {
  //       console.error('❌ Error al subir imágenes:', error);
  //       throw new InternalServerErrorException('Error al procesar imágenes');
  //     }
  //   }

  //   try {
  //     const product = await this.prisma.producto.create({
  //       data: {
  //         nombre,
  //         descripcion,
  //         precio: precioInt,
  //         codigoProducto,
  //         categorias: {
  //           create: categoriaIds.map((categoriaId) => ({
  //             categoria: { connect: { id: categoriaId } },
  //           })),
  //         },
  //         imagenes: {
  //           create: imagenesData.map((imagen) => ({
  //             url: imagen.url, // Aquí se aseguran de que se incluya el campo 'url'
  //             productoId: 0, // Inicializamos productoId en 0, se ajustará luego
  //           })),
  //         },
  //       },
  //       include: {
  //         categorias: true,
  //         imagenes: true, // Para devolver las imágenes junto con el producto
  //       },
  //     });

  //     // Después de la creación del producto, actualizamos las imágenes con el productoId correcto
  //     const updatedImagenes = await this.prisma.imagenProducto.updateMany({
  //       where: { productoId: 0 }, // Filtramos las imágenes que se crearon con productoId = 0
  //       data: { productoId: product.id }, // Actualizamos con el ID del producto creado
  //     });

  //     console.log('✅ Producto creado con imágenes asociadas:', product);
  //     return product;
  //   } catch (error) {
  //     console.error('❌ Error al crear producto:', error);
  //     throw new InternalServerErrorException('Error al crear producto');
  //   }
  // }

  async createProduct(createProductDto: CreateProductDto) {
    const { nombre, descripcion, precio, categoriaIds, codigoProducto, fotos } =
      createProductDto;

    let precioInt = Number(precio);

    console.log('El numero de fotos llegando es: ', fotos.length);

    // Subir imágenes a Cloudinary si son base64
    let imagenesData = [];

    if (fotos && fotos.length > 0) {
      try {
        const imagenesSubidas = await Promise.all(
          fotos.map(async (imagen) => {
            if (imagen.startsWith('data:image')) {
              const url = await this.cloudinaryService.subirImagen(imagen);
              return { url }; // Prisma necesita un objeto { url: '...' }
            }
            return { url: imagen }; // Si ya es una URL, se mantiene igual
          }),
        );

        imagenesData = imagenesSubidas;
        console.log('Las imagenes subidas a cloudinary son: ', imagenesData);
      } catch (error) {
        console.error('❌ Error al subir imágenes:', error);
        throw new InternalServerErrorException('Error al procesar imágenes');
      }
    }

    try {
      // Primero, creamos el producto sin las imágenes
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

      console.log('Producto creado:', product);

      // Después de la creación del producto, asociamos las imágenes con el producto creado
      const imagenesConProductoId = imagenesData.map((imagen) => ({
        url: imagen.url,
        productoId: product.id, // Usamos el ID del producto recién creado
      }));

      // Ahora creamos las imágenes con el `productoId` correcto
      const imagenesCreada = await this.prisma.imagenProducto.createMany({
        data: imagenesConProductoId,
      });

      console.log('Imágenes asociadas al producto:', imagenesCreada);

      // Devuelves el producto con las imágenes asociadas
      return {
        ...product,
        imagenes: imagenesConProductoId,
      };
    } catch (error) {
      console.error('❌ Error al crear producto:', error);
      throw new InternalServerErrorException('Error al crear producto');
    }
  }

  async findAllProducts(page: number = 1, limit: number = 10) {
    try {
      console.log('buscando todos los productos...');
      console.log('LOS PRODUCTOS BUSCADOS POR PAGE SON: ', page, ' ', limit);

      const offset = (page - 1) * limit;

      const products = await this.prisma.producto.findMany({
        include: {
          stock: true,
          ventas: true,
          entregas: true,
          imagenes: true,
          categorias: {
            select: {
              categoria: true,
            },
          },
        },
        orderBy: {
          actualizadoEn: 'desc',
        },
        skip: offset,
        take: limit,
      });

      const total = await this.prisma.producto.count();

      return {
        products,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al crear producto');
    }
  }

  async findAllProductToInventary() {
    try {
      console.log('buscando todos los productos del inventario...');

      const products = await this.prisma.producto.findMany({
        include: {
          stock: true,
          ventas: true,
          entregas: true,
          imagenes: true,
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

      return products;
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

  async updateImagesToProduct(productID: number, images: string[]) {
    console.log('El id del producto es: ', productID);
    console.log('La cantidad de imágenes es: ', images.length);

    const producto = await this.prisma.producto.findUnique({
      where: { id: productID },
    });

    if (!producto) {
      console.log('No hay producto');
      throw new BadRequestException('Producto no encontrado');
    }

    if (!images || images.length === 0) {
      console.log('Error: Imágenes insuficientes');
      throw new BadRequestException('Debe subir al menos una imagen');
    }

    try {
      const imagenesSubidas = await Promise.all(
        images.map(async (imagen) => {
          if (imagen.startsWith('data:image')) {
            const uploadedImageUrl =
              await this.cloudinaryService.subirImagen(imagen);
            return { url: uploadedImageUrl };
          }
          return null;
        }),
      );

      // Filtrar imágenes válidas
      const imagenesData = imagenesSubidas.filter((img) => img !== null);

      if (imagenesData.length === 0) {
        console.log('No se subieron imágenes válidas');
        throw new BadRequestException('No se pudieron procesar las imágenes');
      }

      // Insertar imágenes en la base de datos
      const imagenesFormatoDBCreateMany = imagenesData.map((img) => ({
        url: img!.url,
        productoId: productID,
      }));

      const imagenesAsociadas = await this.prisma.imagenProducto.createMany({
        data: imagenesFormatoDBCreateMany,
      });

      console.log('Las imágenes creadas son: ', imagenesAsociadas);
      return imagenesAsociadas;
    } catch (error) {
      console.error('Error al subir imágenes:', error);
      throw new BadRequestException('Error al añadir las nuevas imágenes');
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

  async removeOneImageProduct(
    productId: number,
    publicId: string,
    imageId: number,
  ) {
    console.log('removiendo imagen del producto: ', productId);
    console.log('ID IMAGEN CLOUDINARY: ', publicId);
    console.log('ID IMAGEN DB: ', imageId);

    if (!productId || !publicId || !imageId) {
      return;
    }

    const imageToDelete = await this.prisma.imagenProducto.findUnique({
      where: { id: imageId },
    });

    if (!imageToDelete) {
      console.log('NO HAY REGISTRO DE IMAGEN EN LA BD CON EL ID: ', imageId);
      return;
    }

    await this.prisma.imagenProducto.delete({
      where: {
        id: imageId,
      },
    });

    const borradoImage = await this.cloudinaryService.BorrarImagen(publicId);
    console.log('La imagen borrada es: ', borradoImage);
    return borradoImage;
  }
}
