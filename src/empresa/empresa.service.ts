import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { PrismaService } from 'src/prisma.service';
import { EmpresaDTO } from './dto/empresa.dto';
import { EmpresaUpdateDTO } from './dto/empresa-update.dto';

@Injectable()
export class EmpresaService {
  constructor(private readonly prisma: PrismaService) {}

  async createEmpresa(data: EmpresaDTO) {
    const existingEmpresa = await this.prisma.empresa.findFirst();
    if (existingEmpresa) {
      throw new Error(
        'Ya existe un registro de la empresa. Solo se permite uno.',
      );
    }
    return this.prisma.empresa.create({ data });
  }

  async createEmpresaToVerify() {
    try {
      // Verifica si ya existe un registro
      const existingEmpresa = await this.prisma.empresa.findFirst();
      if (existingEmpresa) {
        return existingEmpresa; // Retorna la empresa existente
      }

      // Crea la empresa con valores predeterminados
      const empresa = await this.prisma.empresa.create({
        data: {
          direccion: 'Ingresar dirección', // Cambiar después de la verificación
          email: 'Ingresar email', // Cambiar después de la verificación
          nombre: 'Nombre de la empresa',
          telefono: 'Teléfono',
          pbx: '',
          website: '',
        },
      });
      return empresa;
    } catch (error) {
      console.error('Error creando/verificando empresa:', error);
      throw new Error('Error al verificar o crear la empresa.');
    }
  }

  async getEmpresaInfo(id: number) {
    try {
      const info = await this.prisma.empresa.findUnique({
        where: {
          id,
        },
      });
      return info;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error al conseguir el registro');
    }
  }

  findAll() {
    try {
      const empresas = this.prisma.empresa.findMany({});
      return empresas;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error al conseguir registros');
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} empresa`;
  }

  update(id: number, updateEmpresaDto: EmpresaUpdateDTO) {
    try {
      const empresaUpdate = this.prisma.empresa.update({
        where: {
          id,
        },
        data: updateEmpresaDto,
      });
      return empresaUpdate;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error al actualiza registro');
    }
  }

  remove(id: number) {
    return `This action removes a #${id} empresa`;
  }
}
