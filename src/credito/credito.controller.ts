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
import { CreditoService } from './credito.service';
import { CreateCreditoDto } from './dto/create-credito.dto';
import { UpdateCreditoDto } from './dto/update-credito.dto';
import { createPaymentDto } from './dto/createPaymentDto.dto';
import { deleteCreditDto } from './dto/delete-credit.dto';

@Controller('credito')
export class CreditoController {
  constructor(private readonly creditoService: CreditoService) {}

  @Get()
  async getCredits() {
    return this.creditoService.getCredits();
  }

  @Get('/get-one-payment/:id')
  async getOnePaymentToPDF(@Param('id', ParseIntPipe) id: number) {
    return this.creditoService.getOnePaymentToPDF(id);
  }

  @Post('/regist-payment')
  createPaymetCredit(@Body() createPayment: createPaymentDto) {
    return this.creditoService.createPaymetCredit(createPayment);
  }

  @Post('/delete-credito-regist')
  deleteCreditRegist(@Body() deleteCreditDto: deleteCreditDto) {
    return this.creditoService.deleteCreditRegist(deleteCreditDto);
  }

  @Post('/delete-payment-regist')
  deletePaymentRegist(@Body() deletePaymentDto: createPaymentDto) {
    return this.creditoService.deletePaymetCredit(deletePaymentDto);
  }
}
