import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { SaleService } from './sale.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';

@Controller('sale')
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Post()
  async create(@Body() createSaleDto: CreateSaleDto) {
    return await this.saleService.createSale(createSaleDto);
  }

  // HACER VENTA PARA REGISTRO DE VISITA
  @Post('/sale-for-regis')
  async createSaleForRegist(@Body() createSaleDto: CreateSaleDto) {
    return await this.saleService.createSaleForRegist(createSaleDto);
  }

  @Get()
  async findAll() {
    return await this.saleService.findAll();
  }

  @Get('/last-sales')
  async findAllLastSales() {
    return await this.saleService.findLastFiveSales();
  }

  @Get('/simple-sales')
  async findSimpleSales() {
    return await this.saleService.findSimpleSales();
  }

  @Get('/my-sales/user/:id')
  async findMySalesUser(@Param('id', ParseIntPipe) id: number) {
    return await this.saleService.findMySalesUser(id);
  }

  @Get('/customer-sales/:id')
  async findCustomerSales(@Param('id', ParseIntPipe) id: number) {
    return await this.saleService.findCustomerSales(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.saleService.findOne(+id);
  }

  @Get('/get-sale-to-pdf/:id')
  async getSaleToPDF(@Param('id', ParseIntPipe) id: number) {
    return await this.saleService.getSaleToPDF(id);
  }

  @Delete('/delete-all')
  // @HttpCode(204)
  async removeAllRegist() {
    console.log('Entrando a borrar todos los registros');

    return await this.saleService.removeAllRegist2();
  }

  @Delete(':id')
  async removeOneRegist(@Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException(
        'El ID proporcionado no es un número válido',
      );
    }
    return await this.saleService.remove(parsedId);
  }
}
