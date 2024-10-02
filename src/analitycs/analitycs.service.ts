import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAnalitycDto } from './dto/create-analityc.dto';
import { UpdateAnalitycDto } from './dto/update-analityc.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AnalitycsService {
  constructor(private readonly prisma: PrismaService) {}
  create(createAnalitycDto: CreateAnalitycDto) {
    return 'This action adds a new analityc';
  }

  findAll() {
    return `This action returns all analitycs`;
  }
  //PARA CHART
  async getVentasAnuales() {
    try {
      const añoActual = new Date().getFullYear(); // Año actual
      const startYear = new Date(añoActual, 0, 1); // 1 de enero del año actual
      const endYear = new Date(añoActual, 11, 31); // 31 de diciembre del año actual

      const ventasAnuales = await this.prisma.venta.findMany({
        where: {
          timestamp: {
            gte: startYear, // Usar el objeto Date para el inicio del año
            lte: endYear, // Usar el objeto Date para el fin del año
          },
        },
      });

      // Inicializar el objeto para almacenar ventas por mes
      const ventasPorMes = Array(12).fill(0); // Crear un array con 12 ceros

      // Iterar sobre las ventas anuales
      ventasAnuales.forEach((venta) => {
        const fecha = new Date(venta.timestamp); // Convertir timestamp a Date
        const mes = fecha.getMonth(); // Obtener el mes (0-11)
        ventasPorMes[mes] += 1; // Sumar el monto al mes correspondiente
      });

      // Construir el array final con el formato deseado
      const yearlyData = ventasPorMes.map((ventas, index) => ({
        name: new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(
          new Date(0, index),
        ),
        ventas: ventas || 0, // Sumar 0 si no hay ventas para ese mes
      }));

      return yearlyData; // Devolver los datos anuales en el formato requerido
    } catch (error) {
      console.error(error); // Manejo de errores
      throw new InternalServerErrorException(
        'No se encontraron ventas en todo el año',
      );
    }
  }
  //PARA CHART
  async getVentasMes() {
    try {
      const añoActual = new Date().getFullYear();
      const mesActual = new Date().getMonth();

      const inicioMes = new Date(añoActual, mesActual, 1); // Primer día del mes
      const finMes = new Date(añoActual, mesActual + 1, 0); // Último día del mes

      const getVentasMensuales = await this.prisma.venta.findMany({
        where: {
          timestamp: {
            gte: inicioMes,
            lte: finMes,
          },
        },
      });

      // Obtener la cantidad de días del mes actual
      const diasEnMes = new Date(añoActual, mesActual + 1, 0).getDate();

      // Crear un array con tantos ceros como días tiene el mes
      const ventasPorDia = Array(diasEnMes).fill(0);

      // Iterar sobre las ventas mensuales y contar las ventas por día
      getVentasMensuales.forEach((venta) => {
        const fechaVenta = new Date(venta.timestamp);
        const diaVenta = fechaVenta.getDate(); // Obtener el día del mes (1-31)
        ventasPorDia[diaVenta - 1] += 1; // Sumar la venta al día correspondiente
      });

      // Construir el array final con el formato deseado
      const ventasMes = ventasPorDia.map((ventas, index) => ({
        fecha: index + 1, // El día del mes (1 a 31)
        ventas: ventas || 0, // Cantidad de ventas para ese día
      }));

      return ventasMes;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error al conseguir los registros del mes',
      );
    }
  }
  //PARA CHART
  async getVentasSemanales() {
    try {
      // Obtener la fecha actual
      const fechaActual = new Date();

      // Obtener el día actual (0 es domingo, 1 es lunes, etc.)
      const diaActual = fechaActual.getDay();

      // Calcular el primer día de la semana (domingo anterior o lunes)
      const inicioSemana = new Date(fechaActual);
      inicioSemana.setDate(fechaActual.getDate() - diaActual); // Retroceder al primer día de la semana

      // Calcular el último día de la semana (sábado o domingo)
      const finSemana = new Date(inicioSemana);
      finSemana.setDate(inicioSemana.getDate() + 6); // Avanzar 6 días para obtener el último día de la semana

      // Obtener las ventas de la semana actual
      const getVentasSemanales = await this.prisma.venta.findMany({
        where: {
          timestamp: {
            gte: inicioSemana,
            lte: finSemana,
          },
        },
      });

      // Crear un array con 7 ceros (un valor por cada día de la semana)
      const ventasPorDia = Array(7).fill(0);

      // Iterar sobre las ventas semanales y contar las ventas por día
      getVentasSemanales.forEach((venta) => {
        const fechaVenta = new Date(venta.timestamp);
        const diaVenta = fechaVenta.getDay(); // Obtener el día de la semana (0 es domingo, 6 es sábado)
        ventasPorDia[diaVenta] += 1; // Sumar la venta al día correspondiente
      });

      // Construir el array final con el formato deseado
      const ventasSemana = ventasPorDia.map((ventas, index) => ({
        dia: new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(
          new Date(0, 0, index + 4),
        ), // Genera el nombre del día (lun, mar, etc.)
        ventas: ventas || 0, // Cantidad de ventas para ese día
      }));

      console.log(ventasSemana);

      return ventasSemana; // Devolver el array con las ventas por día
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error al conseguir los registros de la semana',
      );
    }
  }

  //VENTAS DEL MES TOTAL TOMANDO EN CUENTA EL DESCUENTO
  async getTotalVentasMonto() {
    const añoActual = new Date().getFullYear();
    const mesActual = new Date().getMonth();
    const primerDia = new Date(añoActual, mesActual, 1);
    const ultimoDia = new Date(añoActual, mesActual + 1, 0);

    try {
      let montoTotalMes = 0;

      const ventasTotalMonto = await this.prisma.venta.findMany({
        where: {
          timestamp: {
            gte: primerDia,
            lte: ultimoDia,
          },
        },
        select: {
          montoConDescuento: true,
        },
      });

      ventasTotalMonto.forEach((venta) => {
        montoTotalMes += venta.montoConDescuento;
      });

      return montoTotalMes;
    } catch (error) {}
  }

  //VENTAS DEL DIA TOTAL
  async getTotalVentasMontoDia() {
    // Obtener la fecha actual
    const fechaActual = new Date();

    // Calcular el inicio y fin del día actual (desde las 00:00 hasta las 23:59)
    const inicioDia = new Date(
      fechaActual.getFullYear(),
      fechaActual.getMonth(),
      fechaActual.getDate(),
      0,
      0,
      0,
    );
    const finDia = new Date(
      fechaActual.getFullYear(),
      fechaActual.getMonth(),
      fechaActual.getDate(),
      23,
      59,
      59,
    );

    try {
      let montoTotalDia = 0;

      // Consultar las ventas del día actual
      const ventasTotalMonto = await this.prisma.venta.findMany({
        where: {
          timestamp: {
            gte: inicioDia,
            lte: finDia,
          },
        },
        select: {
          montoConDescuento: true,
        },
      });

      ventasTotalMonto.forEach((venta) => {
        montoTotalDia += venta.montoConDescuento;
      });

      return montoTotalDia; // Devolver el monto total del día
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error al calcular el monto total de ventas del día',
      );
    }
  }

  async getTotalVentasMontoSemana() {
    // Obtener la fecha actual
    const fechaActual = new Date();

    // Calcular el primer día de la semana (asumiendo que la semana empieza el lunes)
    const primerDiaSemana = new Date(
      fechaActual.setDate(fechaActual.getDate() - fechaActual.getDay() + 1),
    ); // Lunes de esta semana
    primerDiaSemana.setHours(0, 0, 0, 0); // Establecer la hora al inicio del día

    // Calcular el último día de la semana (domingo)
    const ultimoDiaSemana = new Date(
      fechaActual.setDate(primerDiaSemana.getDate() + 6),
    ); // Domingo de esta semana
    ultimoDiaSemana.setHours(23, 59, 59, 999); // Establecer la hora al final del día

    try {
      let montoTotalSemana = 0;

      // Consultar las ventas de la semana
      const ventasTotalMonto = await this.prisma.venta.findMany({
        where: {
          timestamp: {
            gte: primerDiaSemana,
            lte: ultimoDiaSemana,
          },
        },
        select: {
          montoConDescuento: true,
        },
      });

      // Sumar los montos de las ventas
      ventasTotalMonto.forEach((venta) => {
        montoTotalSemana += venta.montoConDescuento;
      });

      return montoTotalSemana; // Devolver el monto total de la semana
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error al calcular el monto total de ventas de la semana',
      );
    }
  }

  async getTotalClientes() {
    try {
      let totalClientes = 0;

      const clientes = await this.prisma.cliente.findMany({});
      totalClientes = clientes.length;
      return totalClientes;
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException(
        'Error al verificar cantidad de clientes',
      );
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} analityc`;
  }

  update(id: number, updateAnalitycDto: UpdateAnalitycDto) {
    return `This action updates a #${id} analityc`;
  }

  remove(id: number) {
    return `This action removes a #${id} analityc`;
  }
}
