import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateCustomerLocationDto } from './dto/create-customer-location.dto';
import { UpdateCustomerLocationDto } from './dto/update-customer-location.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CustomerLocationService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCustomerLocationDto: CreateCustomerLocationDto) {
    return 'This action adds a new customerLocation';
  }

  async setDepartamentos() {
    try {
      const departamentos = [
        { nombre: 'Alta Verapaz' },
        { nombre: 'Baja Verapaz' },
        { nombre: 'Chimaltenango' },
        { nombre: 'Chiquimula' },
        { nombre: 'El Progreso' },
        { nombre: 'Escuintla' },
        { nombre: 'Guatemala' },
        { nombre: 'Huehuetenango' },
        { nombre: 'Izabal' },
        { nombre: 'Jalapa' },
        { nombre: 'Jutiapa' },
        { nombre: 'Petén' },
        { nombre: 'Quetzaltenango' },
        { nombre: 'Quiché' },
        { nombre: 'Retalhuleu' },
        { nombre: 'Sacatepéquez' },
        { nombre: 'San Marcos' },
        { nombre: 'Santa Rosa' },
        { nombre: 'Sololá' },
        { nombre: 'Suchitepéquez' },
        { nombre: 'Totonicapán' },
        { nombre: 'Zacapa' },
      ];

      const insertedDepartamentos = await this.prisma.departamento.createMany({
        data: departamentos,
        skipDuplicates: true, // Evita insertar duplicados
      });

      return {
        message: 'Departamentos insertados correctamente',
        insertedDepartamentos,
      };
    } catch (error) {
      console.error('Error al insertar departamentos:', error);
      throw new Error('No se pudieron insertar los departamentos');
    }
  }

  async setMunicipios() {
    try {
      const municipios = [
        // Huehuetenango
        { nombre: 'Aguacatán', departamentoId: 8 },
        { nombre: 'Chiantla', departamentoId: 8 },
        { nombre: 'Colotenango', departamentoId: 8 },
        { nombre: 'Concepción Huista', departamentoId: 8 },
        { nombre: 'Cuilco', departamentoId: 8 },
        { nombre: 'Huehuetenango', departamentoId: 8 },
        { nombre: 'Jacaltenango', departamentoId: 8 },
        { nombre: 'La Democracia', departamentoId: 8 },
        { nombre: 'La Libertad', departamentoId: 8 },
        { nombre: 'Malacatancito', departamentoId: 8 },
        { nombre: 'Nentón', departamentoId: 8 },
        { nombre: 'San Antonio Huista', departamentoId: 8 },
        { nombre: 'San Gaspar Ixchil', departamentoId: 8 },
        { nombre: 'San Ildefonso Ixtahuacán', departamentoId: 8 },
        { nombre: 'San Juan Atitán', departamentoId: 8 },
        { nombre: 'San Juan Ixcoy', departamentoId: 8 },
        { nombre: 'San Mateo Ixtatán', departamentoId: 8 },
        { nombre: 'San Miguel Acatán', departamentoId: 8 },
        { nombre: 'San Pedro Nécta', departamentoId: 8 },
        { nombre: 'San Pedro Soloma', departamentoId: 8 },
        { nombre: 'San Rafael La Independencia', departamentoId: 8 },
        { nombre: 'San Rafael Pétzal', departamentoId: 8 },
        { nombre: 'San Sebastián Coatán', departamentoId: 8 },
        { nombre: 'San Sebastián Huehuetenango', departamentoId: 8 },
        { nombre: 'Santa Ana Huista', departamentoId: 8 },
        { nombre: 'Santa Bárbara', departamentoId: 8 },
        { nombre: 'Santa Cruz Barillas', departamentoId: 8 },
        { nombre: 'Santa Eulalia', departamentoId: 8 },
        { nombre: 'Santiago Chimaltenango', departamentoId: 8 },
        { nombre: 'Tectitán', departamentoId: 8 },
        { nombre: 'Todos Santos Cuchumatán', departamentoId: 8 },
        { nombre: 'Unión Cantinil', departamentoId: 8 },
      ];

      const insertedMunicipios = await this.prisma.municipio.createMany({
        data: municipios,
        skipDuplicates: true,
      });

      return {
        message: 'Municipios insertados correctamente',
        insertedMunicipios,
      };
    } catch (error) {
      console.error('Error al insertar municipios:', error);
      throw new Error('No se pudieron insertar los municipios');
    }
  }

  async findAllDepartamentos() {
    try {
      const departamentos = await this.prisma.departamento.findMany({});
      return departamentos;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error al encontrar departamentos',
      );
    }
  }

  async findAllMunicipios() {
    try {
      const municipios = await this.prisma.municipio.findMany({});
      return municipios;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al encontrar municipios');
    }
  }

  async findOneMunicipio(id: number) {
    try {
      const municipio = await this.prisma.municipio.findMany({
        where: {
          departamento: {
            id,
          },
        },
      });
      return municipio;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al encontrar el municipio');
    }
  }

  update(id: number, updateCustomerLocationDto: UpdateCustomerLocationDto) {
    return `This action updates a #${id} customerLocation`;
  }

  remove(id: number) {
    return `This action removes a #${id} customerLocation`;
  }
}
