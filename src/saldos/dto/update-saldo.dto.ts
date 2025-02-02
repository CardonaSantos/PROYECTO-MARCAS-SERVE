import { PartialType } from '@nestjs/mapped-types';
import { CreateSaldoDto } from './create-saldo.dto';

export class UpdateSaldoDto extends PartialType(CreateSaldoDto) {}
