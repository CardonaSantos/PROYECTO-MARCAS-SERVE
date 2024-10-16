import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post('/send-position')
  create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationService.createLocation(createLocationDto);
  }

  @Post('/create-discount-from-request')
  createDiscountFromRequest(
    @Body()
    body: {
      porcentaje: number;
      clienteId: number;
      vendedorId: number;
      requestId: number;
    },
  ) {
    const { porcentaje, clienteId, vendedorId, requestId } = body;
    return this.locationService.createDiscountFromRequest(
      porcentaje,
      clienteId,
      vendedorId,
      requestId,
    );
  }

  @Post('/delete-discount-regist')
  deleteDiscountRegist(
    @Body()
    body: {
      vendedorId: number;
      requestId: number;
    },
  ) {
    const { vendedorId, requestId } = body;
    return this.locationService.deleteDiscountRegist(vendedorId, requestId);
  }

  @Get()
  findAll() {
    return this.locationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.locationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    return this.locationService.update(+id, updateLocationDto);
  }

  @Delete('/delete-all')
  async removeAll() {
    return await this.locationService.removeAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.locationService.remove(+id);
  }
}
