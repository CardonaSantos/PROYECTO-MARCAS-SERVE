import { PartialType } from '@nestjs/mapped-types';
import { CreateProspectoDto } from './create-prospecto.dto';
import { TipoCliente } from '@prisma/client';

export class UpdateProspectoDto extends PartialType(CreateProspectoDto) {
  nombreCompleto?: string;
  empresaTienda?: string;
  telefono?: string;
  correoElectronico?: string;
  direccion?: string;
  municipio?: string;
  departamento?: string;
  tipoCliente?: TipoCliente;
  categoriasInteres?: string[];
  volumenCompra?: string;
  presupuestoMensual?: string;
  preferenciaContacto?: string;
  comentarios?: string;
  fin: string;
}
