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
import { CustomerLocationService } from './customer-location.service';
import { CreateCustomerLocationDto } from './dto/create-customer-location.dto';
import { UpdateCustomerLocationDto } from './dto/update-customer-location.dto';

@Controller('customer-location')
export class CustomerLocationController {
  constructor(
    private readonly customerLocationService: CustomerLocationService,
  ) {}

  @Post()
  create(@Body() createCustomerLocationDto: CreateCustomerLocationDto) {
    return this.customerLocationService.create(createCustomerLocationDto);
  }
  //METER
  @Get('/set-departamentos')
  setDepartamentos() {
    return this.customerLocationService.setDepartamentos();
  }
  @Get('/set-municipios')
  setMunicipios() {
    return this.customerLocationService.setMunicipios();
  }
  //SACAR

  @Get('/get-departamentos')
  getAll() {
    return this.customerLocationService.findAllDepartamentos();
  }

  @Get('/get-municipios')
  getAllMunicipios() {
    return this.customerLocationService.findAllMunicipios();
  }

  @Get('/get-municipios/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.customerLocationService.findOneMunicipio(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerLocationDto: UpdateCustomerLocationDto,
  ) {
    return this.customerLocationService.update(+id, updateCustomerLocationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerLocationService.remove(+id);
  }
}
