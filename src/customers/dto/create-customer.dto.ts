import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  correo: string;

  @IsString()
  @IsNotEmpty()
  telefono: string;

  @IsString()
  @IsOptional()
  direccion: string;

  @IsNumber()
  @IsOptional() // Municipio es opcional
  municipioId?: number;

  @IsNumber()
  @IsOptional() // Departamento es opcional
  departamentoId?: number;

  @IsNumber()
  @IsOptional() // Ubicación es opcional
  ubicacionId?: number;

  @IsNumber()
  @IsOptional() // Ubicación es opcional
  latitud?: number;

  @IsNumber()
  @IsOptional() // Ubicación es opcional
  longitud?: number;
  //========================================

  // Nuevos campos:
  @IsString()
  @IsOptional() // Tipo de cliente es opcional
  tipoCliente?: string;

  @IsArray()
  @IsString({ each: true }) // Cada elemento del array debe ser string
  @IsOptional() // Categorías de interés es opcional
  categoriasInteres?: string[];

  @IsString()
  @IsOptional() // Volumen de compra es opcional
  volumenCompra?: string;

  @IsString()
  @IsOptional() // Presupuesto mensual es opcional
  presupuestoMensual?: string;

  @IsString()
  @IsOptional() // Preferencia de contacto es opcional
  preferenciaContacto?: string;

  @IsString()
  @IsOptional() // Comentarios es opcional
  comentarios?: string;
}
