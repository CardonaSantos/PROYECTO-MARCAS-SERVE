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
      let diaActual = fechaActual.getDay();

      // Si es domingo, ajustamos `diaActual` a 7 para que la semana comience en lunes
      diaActual = diaActual === 0 ? 7 : diaActual;

      // Calcular el primer día de la semana (lunes)
      const inicioSemana = new Date(fechaActual);
      inicioSemana.setDate(fechaActual.getDate() - (diaActual - 1)); // Retroceder al lunes de la semana actual

      // Calcular el último día de la semana (domingo)
      const finSemana = new Date(inicioSemana);
      finSemana.setDate(inicioSemana.getDate() + 6); // Avanzar 6 días para obtener el domingo

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

        // Obtener el día de la semana, ajustando para que 0 sea lunes, 6 sea domingo
        let diaVenta = fechaVenta.getDay();
        diaVenta = diaVenta === 0 ? 6 : diaVenta - 1;

        ventasPorDia[diaVenta] += 1; // Sumar la venta al día correspondiente
      });

      // Construir el array final con el formato deseado
      const ventasSemana = ventasPorDia.map((ventas, index) => ({
        dia: new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(
          new Date(0, 0, index + 1), // Mapear correctamente los días de lunes a domingo
        ),
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
    try {
      // Obtener la fecha actual
      const fechaActual = new Date();

      // Calcular el primer día de la semana (lunes)
      const diaSemana = fechaActual.getDay();
      const diferencia = diaSemana === 0 ? -6 : 1 - diaSemana; // Si es domingo (0), retroceder 6 días; sino, calcular desde lunes
      const primerDiaSemana = new Date(
        fechaActual.setDate(fechaActual.getDate() + diferencia),
      );
      primerDiaSemana.setHours(0, 0, 0, 0); // Establecer hora al inicio del día (00:00)

      // Calcular el último día de la semana (domingo)
      const ultimoDiaSemana = new Date(primerDiaSemana);
      ultimoDiaSemana.setDate(primerDiaSemana.getDate() + 6);
      ultimoDiaSemana.setHours(23, 59, 59, 999); // Establecer hora al final del día (23:59:59)

      // Inicializar el monto total de la semana
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

  //VENTAS POR MES Y SU TOTAL
  // async getVentasMesyTotal() {
  //   try {
  //     const añoActual = new Date().getFullYear();
  //     const mesActual = new Date().getMonth();

  //     const inicioMes = new Date(añoActual, mesActual, 1); // Primer día del mes
  //     const finMes = new Date(añoActual, mesActual + 1, 0); // Último día del mes

  //     // Consultar todas las ventas del mes actual
  //     const getVentasMensuales = await this.prisma.venta.findMany({
  //       where: {
  //         timestamp: {
  //           gte: inicioMes,
  //           lte: finMes,
  //         },
  //       },
  //       select: {
  //         timestamp: true,
  //         montoConDescuento: true, // Supongo que tienes una propiedad 'total' que guarda el monto de la venta
  //       },
  //     });

  //     // Obtener la cantidad de días del mes actual
  //     const diasEnMes = new Date(añoActual, mesActual + 1, 0).getDate();

  //     // Inicializar ventas por día y el total de ventas
  //     const ventasPorDia = Array(diasEnMes).fill(0);
  //     let totalVentasMes = 0; // Para sumar el monto total de las ventas del mes
  //     let totalTransacciones = 0; // Contador de las ventas del mes

  //     // Iterar sobre las ventas mensuales para llenar ventas por día y sumar los totales
  //     getVentasMensuales.forEach((venta) => {
  //       const fechaVenta = new Date(venta.timestamp);
  //       const diaVenta = fechaVenta.getDate(); // Obtener el día del mes (1-31)
  //       ventasPorDia[diaVenta - 1] += 1; // Contar una venta en ese día
  //       totalVentasMes += venta.montoConDescuento; // Sumar el monto de la venta
  //       totalTransacciones += 1; // Incrementar el número de transacciones
  //     });

  //     // Obtener el nombre del mes actual
  //     const nombreMes = inicioMes.toLocaleString('es-ES', { month: 'long' });

  //     // Construir el array con el formato de ventas diarias
  //     const ventasMes = ventasPorDia.map((ventas, index) => ({
  //       fecha: index + 1, // El día del mes (1 a 31)
  //       ventas: ventas || 0, // Cantidad de ventas para ese día
  //     }));

  //     // Retornar el resultado con el total agregado
  //     return {
  //       mes: nombreMes, // Nombre del mes
  //       totalVentas: totalVentasMes, // Monto total del mes
  //       ventasTotales: totalTransacciones, // Cantidad total de ventas del mes
  //       ventasPorDia: ventasMes, // Ventas diarias
  //     };
  //   } catch (error) {
  //     console.error(error);
  //     throw new InternalServerErrorException(
  //       'Error al conseguir los registros del mes',
  //     );
  //   }
  // }

  async getVentasMesyTotal() {
    try {
      const añoActual = new Date().getFullYear();

      // Array de los nombres de los meses
      const meses = [
        'enero',
        'febrero',
        'marzo',
        'abril',
        'mayo',
        'junio',
        'julio',
        'agosto',
        'septiembre',
        'octubre',
        'noviembre',
        'diciembre',
      ];

      // Inicializamos un array para almacenar los resultados
      const ventasPorMes = [];

      // Iteramos sobre los 12 meses del año actual
      for (let mes = 0; mes < 12; mes++) {
        // Establecemos el inicio y fin de cada mes
        const inicioMes = new Date(añoActual, mes, 1);
        const finMes = new Date(añoActual, mes + 1, 0);

        // Obtenemos las ventas del mes actual
        const ventasMensuales = await this.prisma.venta.findMany({
          where: {
            timestamp: {
              gte: inicioMes,
              lte: finMes,
            },
          },
        });

        // Calculamos el total de ventas y el monto total generado en el mes
        const totalVentasMes = ventasMensuales.reduce(
          (total, venta) => total + venta.montoConDescuento,
          0,
        );

        // Guardamos los resultados en el array de ventas por mes
        ventasPorMes.push({
          mes: meses[mes], // Nombre del mes
          totalVentas: totalVentasMes, // Monto total generado
          ventasTotales: ventasMensuales.length, // Número total de ventas
        });
      }

      return ventasPorMes; // Retornamos el array con los resultados por mes
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error al conseguir los registros de ventas del año',
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
