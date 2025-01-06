import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import { AnalitycsService } from './analitycs.service';
import { CreateAnalitycDto } from './dto/create-analityc.dto';
import { UpdateAnalitycDto } from './dto/update-analityc.dto';
import { Response } from 'express'; // Importar Response de Express

@Controller('analytics')
export class AnalitycsController {
  constructor(private readonly analitycsService: AnalitycsService) {}

  @Post()
  create(@Body() createAnalitycDto: CreateAnalitycDto) {
    return this.analitycsService.create(createAnalitycDto);
  }

  @Get('/get-ventas-excel/')
  async getVentasExcel(@Res() res: Response) {
    const buffer = await this.analitycsService.generarExcelVentasDiarias();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=ventas-diarias.xlsx',
    );

    res.send(buffer); // Enviar el archivo Excel al cliente
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

  //ANALITYCS
  @Get('/get-ventas-por-categoria')
  async getVentasPorCategoria() {
    return await this.analitycsService.getVentasPorCategoria();
  }
  //VISITAS POR MES
  @Get('/get-visitas-mes')
  async getVisitasPorMes() {
    return await this.analitycsService.getVisitasPorMes();
  }

  //MEJOR RENDIMIENTO
  @Get('/get-rendimiento-vendedores')
  async getRendimientoVendedores() {
    return await this.analitycsService.getRendimientoVendedores();
  }

  @Get('/get-ventas-por-zona')
  async getVentasPorZona() {
    return await this.analitycsService.getVentasPorZona();
  }

  @Get('/get-retention-data')
  async getRetentionData() {
    return await this.analitycsService.getRetentionData();
  }

  //TERMINAR AUN ===>
  @Get('/get-prospectos-por-estado')
  async getProspectoEstado() {
    return await this.analitycsService.getProspectosPorEstado();
  }

  //TIEMPO PROMEDIO
  @Get('/get-average-visit-time')
  async getAverageVisitTime() {
    return await this.analitycsService.getTiempoMedioVisitasPorSemana();
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
