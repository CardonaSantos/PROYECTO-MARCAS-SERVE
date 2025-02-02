import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { SaldosService } from './saldos.service';
import { CreateSaldoDto } from './dto/create-saldo.dto';
import { UpdateSaldoDto } from './dto/update-saldo.dto';

@Controller('saldos')
export class SaldosController {
  constructor(private readonly saldosService: SaldosService) {}

  @Get('/init-saldos/:id')
  async findMySalesUser(@Param('id', ParseIntPipe) id: number) {
    return await this.saldosService.initSaldos(id);
  }

  @Get('/get-saldos/:id')
  async getSaldos(@Param('id', ParseIntPipe) id: number) {
    return await this.saldosService.getSaldos(id);
  }
}
