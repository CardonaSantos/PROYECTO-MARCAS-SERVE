import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from 'src/prisma.service';
import { CreateCustomerFromProspectDto } from './dto/create-customer-from-prospect';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    try {
      // Crear el cliente primero
      const newCustomer = await this.prisma.cliente.create({
        data: {
          nombre: createCustomerDto.nombre,
          correo: createCustomerDto.correo,
          direccion: createCustomerDto.direccion,
          telefono: createCustomerDto.telefono,
          categoriasInteres: createCustomerDto.categoriasInteres,
          departamentoId: createCustomerDto.departamentoId,
          municipioId: createCustomerDto.municipioId,
          preferenciaContacto: createCustomerDto.preferenciaContacto,
          presupuestoMensual: createCustomerDto.presupuestoMensual,
          tipoCliente: createCustomerDto.tipoCliente,
          volumenCompra: createCustomerDto.volumenCompra,
          comentarios: createCustomerDto.comentarios,
        },
      });

      const { latitud, longitud } = createCustomerDto;

      // Verificar si hay latitud y longitud
      if (latitud && longitud && newCustomer) {
        console.log(
          'Parámetros para localización disponibles, creando registro',
        );

        // Crear la ubicación del cliente y obtener el nuevo ID
        const newLocationCustomer = await this.prisma.ubicacionCliente.create({
          data: {
            latitud: latitud,
            longitud: longitud,
            clienteId: newCustomer.id,
          },
        });

        // Actualizar el cliente con la ubicación creada
        if (newLocationCustomer) {
          console.log('Cliente disponible, actualizando con localización');

          await this.prisma.cliente.update({
            where: {
              id: newCustomer.id,
            },
            data: {
              ubicacionId: newLocationCustomer.id,
            },
          });
        }
      }

      return newCustomer;
    } catch (error) {
      // Manejo de errores
      console.error('Error al crear el cliente: ', error);
      throw new BadRequestException('Error al crear cliente');
    }
  }

  async findAllCustomers() {
    try {
      const customers = await this.prisma.cliente.findMany({
        include: {
          ventas: true,
        },
      });
      return customers;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('No se encontraron clientes');
    }
  }

  async findCustomerWithLocation() {
    try {
      const customers = await this.prisma.cliente.findMany({
        include: {
          ventas: true,
          ubicacion: {
            select: {
              id: true,
              latitud: true,
              longitud: true,
            },
          },
          departamento: true,
          municipio: true,
        },
        orderBy: {
          creadoEn: 'desc',
        },
      });
      return customers;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('No se encontraron clientes');
    }
  }

  // findCustomerTovisit

  async findOneCustomer(id: number) {
    try {
      const oneCustomer = await this.prisma.cliente.findUnique({
        where: {
          id: id,
        },
        include: {
          ubicacion: {
            select: {
              latitud: true,
              longitud: true,
            },
          },
          departamento: {
            select: {
              id: true,
              nombre: true,
            },
          },
          municipio: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      });
      return oneCustomer;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Cliente no encontrado');
    }
  }

  async findOneCustomersWithDiscount() {
    try {
      const oneCustomer = await this.prisma.cliente.findMany({
        include: {
          descuentos: true,
        },
      });
      return oneCustomer;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Cliente no encontrado');
    }
  }

  async findSimple() {
    try {
      const oneCustomer = await this.prisma.cliente.findMany({
        include: {},
      });
      return oneCustomer;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Cliente no encontrado');
    }
  }

  async updateOneCustomer(id: number, updateCustomerDto: UpdateCustomerDto) {
    try {
      // Crear un objeto para los datos de actualización
      const updateData: any = {
        nombre: updateCustomerDto.nombre,
        correo: updateCustomerDto.correo,
        telefono: updateCustomerDto.telefono,
        direccion: updateCustomerDto.direccion,
        tipoCliente: updateCustomerDto.tipoCliente,
        categoriasInteres: updateCustomerDto.categoriasInteres,
        volumenCompra: updateCustomerDto.volumenCompra,
        presupuestoMensual: updateCustomerDto.presupuestoMensual,
        preferenciaContacto: updateCustomerDto.preferenciaContacto,
        comentarios: updateCustomerDto.comentarios,
        // ubicacion: updateCustomerDto.ubicacion, // Se asume que esto es un objeto adecuado
        // ...otros campos que quieras incluir
      };
      // Crear la ubicación del cliente y obtener el nuevo ID
      //  const newLocationCustomer = await this.prisma.ubicacionCliente.create({
      //   data: {
      //     latitud: latitud,
      //     longitud: longitud,
      //     clienteId: newCustomer.id,
      //   },
      // });

      // Verificar si se proporcionaron IDs válidos para municipio y departamento
      if (updateCustomerDto.departamentoId > 0) {
        updateData.departamentoId = updateCustomerDto.departamentoId;
      }
      if (updateCustomerDto.municipioId > 0) {
        updateData.municipioId = updateCustomerDto.municipioId;
      }

      const customer = await this.prisma.cliente.update({
        where: { id: id },
        data: updateData,
      });

      return customer;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al actualizar cliente');
    }
  }

  async removeOneCustomer(id: number) {
    try {
      const customer = await this.prisma.cliente.delete({
        where: { id },
      });
      return customer;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('No se pudo eliminar el cliente');
    }
  }

  async removeAllCustomers() {
    try {
      const customers = await this.prisma.cliente.deleteMany({});
      return customers;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('No se pudo eliminar el cliente');
    }
  }

  //--------------CREAR CLIENTE A BASE DE PROSPECTO:
  async createClienteFromProspect(
    createCustomerDto: CreateCustomerFromProspectDto,
  ) {
    try {
      // Crear el cliente primero
      const newCustomer = await this.prisma.cliente.create({
        data: {
          nombre: createCustomerDto.nombre,
          correo: createCustomerDto.correo,
          direccion: createCustomerDto.direccion,
          telefono: createCustomerDto.telefono,
          categoriasInteres: createCustomerDto.categoriasInteres,
          departamentoId: createCustomerDto.departamentoId,
          municipioId: createCustomerDto.municipioId,
          preferenciaContacto: createCustomerDto.preferenciaContacto,
          presupuestoMensual: createCustomerDto.presupuestoMensual,
          tipoCliente: createCustomerDto.tipoCliente,
          volumenCompra: createCustomerDto.volumenCompra,
          comentarios: createCustomerDto.comentarios,
        },
      });

      // ACTUALIZAR EL PROSPECTO CON EL ID DEL CLIENTE PARA YA NO VOLVER A CREAR OTRO
      const prospectoActualizar = await this.prisma.prospecto.update({
        where: { id: createCustomerDto.prospectoId },
        data: {
          cliente: {
            connect: {
              id: newCustomer.id, // Vincular el prospecto con el cliente recién creado
            },
          },
        },
      });

      const { latitud, longitud } = createCustomerDto;

      // Verificar si hay latitud y longitud
      if (latitud && longitud && newCustomer) {
        console.log(
          'Parámetros para localización disponibles, creando registro',
        );

        // Crear la ubicación del cliente y obtener el nuevo ID
        const newLocationCustomer = await this.prisma.ubicacionCliente.create({
          data: {
            latitud: latitud,
            longitud: longitud,
            clienteId: newCustomer.id,
          },
        });

        // Actualizar el cliente con la ubicación creada
        if (newLocationCustomer) {
          console.log('Cliente disponible, actualizando con localización');

          await this.prisma.cliente.update({
            where: {
              id: newCustomer.id,
            },
            data: {
              ubicacionId: newLocationCustomer.id,
            },
          });
        }
      }

      return newCustomer;
    } catch (error) {
      // Manejo de errores
      console.error('Error al crear el cliente: ', error);
      throw new BadRequestException('Error al crear cliente');
    }
  }
}
