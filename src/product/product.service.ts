import {
  BadRequestException,
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
//PARA CARGA MASIVA
import { readFileSync } from 'fs';
import * as csv from 'csv-parser';
import { createReadStream } from 'fs';
import { promisify } from 'util';
import * as path from 'path';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    private readonly prisma: PrismaService,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createProduct(createProductDto: CreateProductDto) {
    const {
      nombre,
      descripcion,
      precio,
      categoriaIds,
      codigoProducto,
      precioCosto,
      fotos,
    } = createProductDto;

    const precioInt = Number(precio);

    console.log('El número de fotos llegando es:', fotos.length);

    // 1. Subir imágenes a Cloudinary si son base64
    let imagenesData = [];

    if (fotos && fotos.length > 0) {
      try {
        const imagenesSubidas = await Promise.all(
          fotos.map(async (imagen) => {
            if (imagen.startsWith('data:image')) {
              const url = await this.cloudinaryService.subirImagen(imagen);
              return { url };
            }
            return { url: imagen }; // Ya es URL
          }),
        );

        imagenesData = imagenesSubidas;
        console.log('✅ Imágenes subidas a Cloudinary:', imagenesData);
      } catch (error) {
        console.error('❌ Error al subir imágenes:', error);
        throw new InternalServerErrorException('Error al subir imágenes');
      }
    }

    // 2. Ejecutar todo en una transacción
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Crear el producto con sus categorías
        const product = await tx.producto.create({
          data: {
            nombre,
            descripcion,
            precio: precioInt,
            codigoProducto,
            costo: Number(precioCosto),
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

        console.log('✅ Producto creado:', product);

        // Asociar las imágenes con el producto
        if (imagenesData.length > 0) {
          const imagenesConProductoId = imagenesData.map((imagen) => ({
            url: imagen.url,
            productoId: product.id,
          }));

          await tx.imagenProducto.createMany({
            data: imagenesConProductoId,
          });

          return {
            ...product,
            imagenes: imagenesConProductoId,
          };
        }

        return {
          ...product,
          imagenes: [],
        };
      });
    } catch (error) {
      console.error('❌ Error al crear producto o asociar imágenes:', error);
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

  async limpiarProductos() {
    const productos = await this.prisma.producto.findMany({
      select: {
        id: true,
        nombre: true,
        codigoProducto: true,
      },
    });

    console.log(`Corrigiendo ${productos.length} productos...`);

    const updates = productos
      .map((producto) => {
        const nombreLimpio = producto.nombre.trim();
        const codigoLimpio = producto.codigoProducto.trim();

        if (
          producto.nombre !== nombreLimpio ||
          producto.codigoProducto !== codigoLimpio
        ) {
          return this.prisma.producto.update({
            where: { id: producto.id },
            data: {
              nombre: nombreLimpio,
              codigoProducto: codigoLimpio,
            },
          });
        }
        return null;
      })
      .filter(Boolean); // Eliminar los nulos (los que no necesitaban cambios)

    // Hacer todas las actualizaciones en paralelo
    await Promise.all(updates);

    console.log('¡Productos limpiados exitosamente!');
  }

  async updateOneProduct(id: number, updateProductDto: UpdateProductDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const {
          codigoProducto,
          nombre,
          descripcion,
          precio,
          precioCosto,
          categoriasIds,
        } = updateProductDto;

        // 🔁 Verifica si hay categorías nuevas
        if (categoriasIds && categoriasIds.length > 0) {
          const categoriasExistentes = await tx.categoria.findMany({
            where: { id: { in: categoriasIds } },
            select: { id: true },
          });

          if (categoriasExistentes.length !== categoriasIds.length) {
            throw new NotFoundException('Una o más categorías no existen.');
          }

          // 🧼 Elimina relaciones actuales
          await tx.productoCategoria.deleteMany({
            where: { productoId: id },
          });

          // 🔧 Actualiza producto con nuevas relaciones
          const productoActualizado = await tx.producto.update({
            where: { id },
            data: {
              codigoProducto,
              nombre,
              descripcion,
              precio,
              costo: Number(precioCosto),
              categorias: {
                create: categoriasIds.map((catId) => ({
                  categoria: { connect: { id: catId } },
                })),
              },
            },
            include: {
              categorias: {
                include: {
                  categoria: true,
                },
              },
            },
          });

          console.log(
            '✅ Producto actualizado con categorías:',
            productoActualizado,
          );
          return productoActualizado;
        } else {
          // 🔧 Solo se actualizan campos básicos, no categorías
          const productoActualizado = await tx.producto.update({
            where: { id },
            data: {
              codigoProducto,
              nombre,
              descripcion,
              precio,
              costo: Number(precioCosto),
            },
            include: {
              categorias: {
                include: {
                  categoria: true,
                },
              },
            },
          });

          console.log(
            '✅ Producto actualizado (sin cambio de categorías):',
            productoActualizado,
          );
          return productoActualizado;
        }
      });
    } catch (error) {
      console.error('❌ Error al actualizar producto:', error);
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

  //CARGA MASIVA
  async loadCSVandImportProducts(filePath: string, dryRun = false) {
    const results: any[] = [];

    const stream = createReadStream(filePath).pipe(csv());
    for await (const row of stream) {
      results.push(row);
    }

    this.logger.log(`Se leyeron ${results.length} productos del CSV.`);

    for (const [index, row] of results.entries()) {
      const nombre = row['Nombre']?.trim();
      const codigoProducto = row['Codidgo']?.trim();
      const precio = parseFloat(row['Precio']) || 0;
      const costo = parseFloat(row['Costo']) || 0;
      const cantidad = parseFloat(row['Cantidad']) || 0;
      const categoriaNombre = row['Categoria']?.trim() || 'Sin categoría';

      if (!nombre || !codigoProducto || !precio) {
        this.logger.warn(`Fila ${index + 1} ignorada por datos incompletos.`);
        continue;
      }

      try {
        let categoria = await this.prisma.categoria.findFirst({
          where: { nombre: categoriaNombre },
        });

        if (!categoria) {
          categoria = await this.prisma.categoria.create({
            data: { nombre: categoriaNombre },
          });
          this.logger.log(`✅ Categoría creada: ${categoria.nombre}`);
        }

        if (dryRun) {
          this.logger.log(`[DryRun] Producto listo para crear: ${nombre}`);
          continue;
        }

        const productoCreado = await this.prisma.producto.create({
          data: {
            nombre,
            descripcion: nombre,
            codigoProducto,
            precio,
            costo,
            categorias: {
              create: [{ categoria: { connect: { id: categoria.id } } }],
            },
          },
          include: {
            categorias: { include: { categoria: true } },
          },
        });

        // this.logger.log(`✅ Producto creado: ${productoCreado.nombre}`);

        // Crear el stock inicial si la cantidad es válida
        if (cantidad > 0) {
          await this.prisma.stock.create({
            data: {
              productoId: productoCreado.id,
              cantidad,
              proveedorId: 1, // Puedes modificar esto si tienes un proveedor por defecto
              costoTotal: cantidad * costo,
            },
          });

          // this.logger.log(
          //   `📦 Stock inicial creado para: ${productoCreado.nombre}, cantidad: ${cantidad}`,
          // );
        }
      } catch (error) {
        this.logger.error(`❌ Error en fila ${index + 1}: ${error.message}`);
      }
    }

    this.logger.log('📦 Importación de productos finalizada.');
  }

  //busqueda por params nombre y codigo:
  async searchProducts(
    query: string,
    categoria: string,
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;

    const conditions: any[] = [
      {
        OR: [
          {
            nombre: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            codigoProducto: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
    ];

    if (categoria && categoria !== 'Todas') {
      conditions.push({
        categorias: {
          some: {
            categoria: {
              nombre: {
                equals: categoria,
                mode: 'insensitive',
              },
            },
          },
        },
      });
    }

    const whereCondition = conditions.length > 0 ? { AND: conditions } : {};

    const [products, total] = await Promise.all([
      this.prisma.producto.findMany({
        where: whereCondition,
        include: {
          categorias: {
            include: {
              categoria: true,
            },
          },
          stock: true,
          imagenes: true,
        },
        skip,
        take: limit,
        orderBy: {
          nombre: 'asc',
        },
      }),
      this.prisma.producto.count({
        where: whereCondition,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      products,
      total,
      totalPages,
      currentPage: page,
    };
  }
}
