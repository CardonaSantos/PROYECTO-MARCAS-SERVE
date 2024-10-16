import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AnalitycsService } from './analitycs.service';
import { CreateAnalitycDto } from './dto/create-analityc.dto';
import { UpdateAnalitycDto } from './dto/update-analityc.dto';

@Controller('analytics')
export class AnalitycsController {
  constructor(private readonly analitycsService: AnalitycsService) {}

  @Post()
  create(@Body() createAnalitycDto: CreateAnalitycDto) {
    return this.analitycsService.create(createAnalitycDto);
  }

  @Get()
  findAll() {
    return this.analitycsService.findAll();
  }

  @Get('/get-sales-year')
  async getVentasAnuales() {
    return await this.analitycsService.getVentasAnuales();
  }

  @Get('/get-sales-month')
  async getVentasMensuales() {
    return await this.analitycsService.getVentasMes();
  }

  @Get('/get-sales-weekly')
  async getVentasSemanales() {
    return await this.analitycsService.getVentasSemanales();
  }
  // ================================>
  @Get('/get-total-month')
  async getMontoTotalMes() {
    return await this.analitycsService.getTotalVentasMonto();
  }

  @Get('/get-total-weekly')
  async getMontoTotalSemana() {
    return await this.analitycsService.getTotalVentasMontoSemana();
  }

  @Get('/get-total-day')
  async getMontoTotalDia() {
    return await this.analitycsService.getTotalVentasMontoDia();
  }

  @Get('/get-total-clientes')
  async getTotalClientes() {
    return await this.analitycsService.getTotalClientes();
  }

  @Get('/get-total-month-monto')
  async getTotalMontoMes() {
    return await this.analitycsService.getVentasMesyTotal();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.analitycsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAnalitycDto: UpdateAnalitycDto,
  ) {
    return this.analitycsService.update(+id, updateAnalitycDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.analitycsService.remove(+id);
  }
}
