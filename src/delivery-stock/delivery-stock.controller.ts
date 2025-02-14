import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { DeliveryStockService } from './delivery-stock.service';
// import { CreateDeliveryStockDto } from './dto/create-delivery-stock.dto';
import { CreateDeliveryStockDto } from './dto/create-delivery-stock.dto';
import { UpdateDeliveryStockDto } from './dto/update-delivery-stock.dto';

@Controller('delivery-stock')
export class DeliveryStockController {
  constructor(private readonly deliveryStockService: DeliveryStockService) {}

  @Post()
  async create(@Body() createDeliveryStockDto: CreateDeliveryStockDto) {
    return await this.deliveryStockService.create(createDeliveryStockDto);
  }

  @Get()
  async findAll() {
    return await this.deliveryStockService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deliveryStockService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDeliveryStockDto: UpdateDeliveryStockDto,
  ) {
    return this.deliveryStockService.update(+id, updateDeliveryStockDto);
  }

  @Delete('/delete-all')
  removeAll(@Param('id') id: string) {
    return this.deliveryStockService.removeAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deliveryStockService.remove(+id);
  }

  @Delete('/delete-regist/:registID')
  async removeOneRegist(
    @Param('registID', ParseIntPipe) registID: number,
    @Body() body: { password: string; userId: number },
  ) {
    const { password, userId } = body;

    if (!password || !userId) {
      throw new BadRequestException('Se requiere contraseña y ID de usuario');
    }

    return this.deliveryStockService.removeOneRegist(
      registID,
      userId,
      password,
    );
  }
}
