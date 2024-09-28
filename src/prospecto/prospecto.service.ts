import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateProspectoDto } from './dto/create-prospecto.dto';
import { UpdateProspectoDto } from './dto/update-prospecto.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ProspectoService {
  constructor(private readonly prisma: PrismaService) {}
  //----------------------------------------------------
  // En tu servicio prospecto.service.ts
  async create(createProspectoDto: CreateProspectoDto) {
    try {
      const nuevoProspecto = await this.prisma.prospecto.create({
        data: {
          nombreCompleto: createProspectoDto.nombreCompleto,
          empresaTienda: createProspectoDto.empresaTienda,
          vendedor: {
            // Cambiar esto
            connect: { id: createProspectoDto.usuarioId }, // Conectando al vendedor por ID
          },
          telefono: createProspectoDto.telefono,
          correo: createProspectoDto.correo,
          direccion: createProspectoDto.direccion,
          municipio: createProspectoDto.municipio,
          departamento: createProspectoDto.departamento,
          tipoCliente: createProspectoDto.tipoCliente,
          categoriasInteres: createProspectoDto.categoriasInteres,
          volumenCompra: createProspectoDto.volumenCompra,
          presupuestoMensual: createProspectoDto.presupuestoMensual,
          preferenciaContacto: createProspectoDto.preferenciaContacto,
          comentarios: createProspectoDto.comentarios,
        },
      });
      console.log('Prospecto creado: ', nuevoProspecto);

      return nuevoProspecto;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAll() {
    try {
      const prospectos = await this.prisma.prospecto.findMany({
        include: {
          vendedor: {
            select: {
              correo: true,
              id: true,
              nombre: true,
              rol: true,
            },
          },
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
      });
      console.log(
        'El prospecto abierto por el empleado: ',
        venddorId,
        ' Es: ',
        prospectoAbierto,
      );

      return prospectoAbierto;
      return;
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
      // Obtener la fecha/hora actual directamente (ya incluye la hora local del servidor)
      const fechaHoraGuatemala = new Date().toLocaleString('en-US', {
        timeZone: 'America/Guatemala',
      });

      // Simplemente convertirlo a un objeto Date de JS
      const fechaHoraFin = new Date(fechaHoraGuatemala);

      // Actualizar el prospecto con la fecha actual de finalización
      const prospectoUpdate = await this.prisma.prospecto.update({
        where: {
          id: prospectoId,
        },
        data: {
          ...updateProspectoDto,
          fin: fechaHoraFin, // Registrar la fecha/hora actual en `fin`
        },
      });

      console.log(
        'Desde el service, el prospecto actualizado es: ',
        prospectoUpdate,
      );

      return prospectoUpdate;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al actualizar prospecto');
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

  remove(id: number) {
    return `This action removes a #${id} prospecto`;
  }
}
