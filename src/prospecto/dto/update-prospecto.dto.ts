import { PartialType } from '@nestjs/mapped-types';
import { CreateProspectoDto } from './create-prospecto.dto';
import { TipoCliente } from '@prisma/client';

export class UpdateProspectoDto extends PartialType(CreateProspectoDto) {
  nombreCompleto?: string;
  empresaTienda?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  municipioId?: number;
  departamentoId?: number;
  tipoCliente?: TipoCliente;
  categoriasInteres?: string[];
  volumenCompra?: string;
  presupuestoMensual?: string;
  preferenciaContacto?: string;
  comentarios?: string;
  // fin?: Date; // Cambiar a Date
  latitud?: number;
  longitud?: number;
}
