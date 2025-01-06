import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Query,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Response } from 'express'; // Importar Response de Express
import { EstadoProspecto, EstadoVisita, MotivoVisita } from '@prisma/client';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  //VENTAS REPORTE
  @Get('/ventas/excel')
  async getVentasExcel(
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('minTotal') minTotal?: string,
    @Query('maxTotal') maxTotal?: string,
    @Query('useDiscounted') useDiscounted?: string,
  ) {
    const min = parseFloat(minTotal || '0');
    const max = maxTotal ? parseFloat(maxTotal) : Infinity;

    if (isNaN(min) || isNaN(max)) {
      throw new BadRequestException(
        'Los valores de minTotal o maxTotal no son válidos.',
      );
    }

    const useDiscountedFlag = useDiscounted === 'true';

    const buffer = await this.reportsService.generarExcelVentas(
      from,
      to,
      min,
      max,
      useDiscountedFlag,
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=ventas-diarias.xlsx',
    );

    res.send(buffer);
  }

  //CLIENTES REPORTE
  @Get('/clientes/excel')
  async getClientesExcel(
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('minCompras') minCompras?: string,
    @Query('maxCompras') maxCompras?: string,
    @Query('minGastado') minGastado?: string,
    @Query('maxGastado') maxGastado?: string,
    @Query('municipio') municipio?: string,
    @Query('departamento') departamento?: string,
  ) {
    const buffer = await this.reportsService.generarExcelClientesFiltrados(
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
      minCompras ? parseInt(minCompras) : undefined,
      maxCompras ? parseInt(maxCompras) : undefined,
      minGastado ? parseFloat(minGastado) : undefined,
      maxGastado ? parseFloat(maxGastado) : undefined,
      municipio,
      departamento,
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=clientes-filtrados.xlsx',
    );

    res.send(buffer);
  }

  //PROSPECTOS REPORTE

  @Get('/prospectos/excel')
  async getProspectosExcel(
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('estado') estado?: EstadoProspecto,
  ) {
    try {
      // Validar las fechas
      const fromDate = from ? new Date(from) : undefined;
      const toDate = to ? new Date(to) : undefined;

      const buffer = await this.reportsService.generarExcelProspectos(
        fromDate,
        toDate,
        estado,
      );

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=prospectos.xlsx',
      );

      res.send(buffer);
    } catch (error) {
      console.error('Error generando reporte de prospectos:', error);
      throw new InternalServerErrorException(
        'Hubo un problema al generar el reporte de prospectos.',
      );
    }
  }

  //REPORT VISITAS
  @Get('/visitas/excel')
  async getVisitasExcel(
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('estado') estado?: EstadoVisita,
    @Query('motivo') motivo?: MotivoVisita,
  ) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    const buffer = await this.reportsService.generarExcelVisitas(
      fromDate,
      toDate,
      estado,
      motivo,
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=visitas.xlsx');

    res.send(buffer);
  }

  @Get('/inventario/excel')
  async getInventarioExcel(
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('categoria') categoria?: string,
    @Query('proveedor') proveedor?: string,
    @Query('minStock') minStock?: string,
    @Query('maxStock') maxStock?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    const buffer = await this.reportsService.generarExcelInventario(
      fromDate,
      toDate,
      categoria,
      proveedor,
      minStock ? parseInt(minStock) : undefined,
      maxStock ? parseInt(maxStock) : undefined,
      minPrice ? parseFloat(minPrice) : undefined,
      maxPrice ? parseFloat(maxPrice) : undefined,
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=inventario.xlsx',
    );

    res.send(buffer);
  }

  @Get('/entregas/excel')
  async getEntregasExcel(
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('proveedor') proveedorId?: string,
  ) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    const proveedor = proveedorId ? parseInt(proveedorId) : undefined;

    const buffer = await this.reportsService.generarExcelEntregas(
      fromDate,
      toDate,
      proveedor,
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=historial-entregas.xlsx',
    );

    res.send(buffer);
  }

  //CONSEGUIR REPORTE DE ASISTENCIAS
  @Get('/asistencias/excel')
  async getAsistenciasExcel(
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('proveedor') proveedorId?: string,
  ) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    const proveedor = proveedorId ? parseInt(proveedorId) : undefined;

    const buffer = await this.reportsService.generarAsistenciasReport(
      fromDate,
      toDate,
      // proveedor,
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=historial-entregas.xlsx',
    );

    res.send(buffer);
  }

  //CONSEGUIR REPORTE DE USUARIOS
  @Get('/usuarios/excel')
  async generarReporteUsuarios(
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    try {
      const fromDate = from ? new Date(from) : undefined;
      const toDate = to ? new Date(to) : undefined;

      const buffer = await this.reportsService.generarReporteUsuarios(
        fromDate,
        toDate,
      );

      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="reporte_usuarios.xlsx"`,
      });

      res.send(buffer);
    } catch (error) {
      console.error('Error al generar el reporte de usuarios:', error);
      res.status(500).send('Error al generar el reporte de usuarios.');
    }
  }
}
