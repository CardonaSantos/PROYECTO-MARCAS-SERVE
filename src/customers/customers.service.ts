import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from 'src/prisma.service';

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
      });
      return customers;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('No se encontraron clientes');
    }
  }

  async findOneCustomer(id: number) {
    try {
      const oneCustomer = await this.prisma.cliente.findUnique({
        where: {
          id: id,
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
      const customer = await this.prisma.cliente.update({
        where: { id: id },
        data: updateCustomerDto,
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
}
