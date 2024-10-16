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
import { DiscountService } from './discount.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';

@Controller('discount')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Post()
  create(@Body() createDiscountDto: CreateDiscountDto) {
    return this.discountService.create(createDiscountDto);
  }

  @Post('/request-discount')
  async createSolicitudDescuento(
    @Body()
    requestData: {
      clienteId: number;
      justificacion: string;
      usuarioId: number;
      descuentoSolicitado: number;
      motivo: string;
    },
  ) {
    console.log('Datos recibidos:', requestData); // Verifica que los datos estén llegando correctamente
    return this.discountService.createSolicitudDescuento(requestData);
  }

  @Delete('/delete-all')
  removeAll() {
    return this.discountService.removeAll();
  }

  @Delete('/delete-all-request-discount')
  async deletAllRequestDiscount() {
    return this.discountService.deleteAllRequest();
  }

  //eliminar registro y notificar
  @Delete('/delete-one-request/:id')
  async deleOneDiscount(@Param('id', ParseIntPipe) id: number) {
    return this.discountService.deleOneDiscount(id);
  }

  @Get('/cliente/:clienteId')
  async getDiscountsByClienteId(
    @Param('clienteId', ParseIntPipe) clienteId: number,
  ) {
    return this.discountService.getDiscountsByClienteId(clienteId);
  }

  @Patch('/desactivate-discount/:id')
  updateDesactivate(@Param('id', ParseIntPipe) id: number) {
    return this.discountService.updateDesactivate(id);
  }

  @Get()
  findAll() {
    return this.discountService.findAll();
  }

  @Get('/solicitudes-descuento')
  findOne() {
    return this.discountService.findOne();
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateDiscountDto: UpdateDiscountDto,
  // ) {
  //   return this.discountService.update(+id, updateDiscountDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.discountService.remove(+id);
  }
}
