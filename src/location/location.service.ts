import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
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
  async findLocationByUserId(usuarioId: number) {
    return this.prisma.ubicacion.findFirst({
      where: { usuarioId },
      include: {
        usuario: {
          select: {
            nombre: true,
            id: true,
            rol: true,
            // Incluye prospectos aquí
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

  async finUnique(id: number) {
    try {
      const userInfo = await this.prisma.usuario.findUnique({
        where: {
          id,
        },
        select: {
          nombre: true,
          rol: true,
        },
      });
      return userInfo;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('No se encontró el usuario');
    }
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
}
