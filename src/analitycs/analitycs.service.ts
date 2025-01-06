import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAnalitycDto } from './dto/create-analityc.dto';
import { UpdateAnalitycDto } from './dto/update-analityc.dto';
import { PrismaService } from 'src/prisma.service';
import * as ExcelJS from 'exceljs';
import { EstadoProspecto } from '@prisma/client';

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

  //===============
  async generarExcelVentasDiarias(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Ventas Diarias');

    // Agregar encabezados
    sheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 20 },
      { header: 'Cliente', key: 'cliente', width: 30 },
      { header: 'Vendedor', key: 'vendedor', width: 30 },
      { header: 'Productos', key: 'productos', width: 50 },
      { header: 'Monto Total', key: 'monto', width: 15 },
      { header: 'Método de Pago', key: 'metodoPago', width: 20 },
    ];

    const ventas = await this.prisma.venta.findMany({
      include: {
        cliente: {
          select: {
            nombre: true,
          },
        },
        vendedor: {
          select: {
            nombre: true,
          },
        },
        productos: {
          select: {
            cantidad: true,
            producto: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
    });

    // Agregar datos
    ventas.forEach((venta) => {
      sheet.addRow({
        fecha: venta.timestamp?.toISOString() || 'Sin fecha',
        cliente: venta.cliente?.nombre || 'N/A',
        vendedor: venta.vendedor?.nombre || 'N/A',
        productos: venta.productos
          .map((p) => `${p.producto.nombre} (x${p.cantidad})`)
          .join(', '),
        monto: venta.monto ? venta.monto.toFixed(2) : '0.00',
        metodoPago: venta.metodoPago || 'N/A',
      });
    });

    // Escribir el archivo en un buffer y convertirlo
    const uint8Array = await workbook.xlsx.writeBuffer();
    const buffer = Buffer.from(uint8Array); // Convertir Uint8Array a Buffer de Node.js

    return buffer; // Devuelve el archivo como un Buffer
  }

  //ANALITYCS
  async getVentasPorCategoria(limit: number = 15) {
    try {
      // Obtener las categorías junto con los productos y las ventas asociadas
      const categorias = await this.prisma.categoria.findMany({
        include: {
          productos: {
            include: {
              producto: {
                include: {
                  ventas: {
                    select: {
                      cantidad: true, // Cantidad de productos vendidos
                      precio: true, // Precio para calcular el total en dinero
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Construir el resultado agrupado por categoría
      const ventasPorCategoria = categorias.map((categoria) => {
        let totalCantidad = 0;
        let totalDinero = 0;

        categoria.productos.forEach((productoCategoria) => {
          productoCategoria.producto.ventas.forEach((venta) => {
            totalCantidad += venta.cantidad; // Sumar la cantidad total vendida
            totalDinero += venta.cantidad * venta.precio; // Sumar el total en dinero
          });
        });

        return {
          categoria: categoria.nombre,
          totalCantidad, // Cantidad total vendida
          totalDinero, // Total generado en dinero
        };
      });

      // Ordenar por la cantidad total vendida (de mayor a menor)
      const categoriasOrdenadas = ventasPorCategoria.sort(
        (a, b) => b.totalCantidad - a.totalCantidad,
      );

      // Retornar solo las `limit` categorías más vendidas
      return categoriasOrdenadas.slice(0, limit);
    } catch (error) {
      console.error('Error obteniendo ventas por categoría:', error);
      throw new InternalServerErrorException(
        'Error al calcular las ventas por categoría',
      );
    }
  }

  //VISITAS POR MES
  async getVisitasPorMes() {
    try {
      const añoActual = new Date().getFullYear();

      // Array de nombres de los meses
      const meses = [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
      ];

      const visitasPorMes = [];

      // Iterar sobre los 12 meses del año actual
      for (let mes = 0; mes < 12; mes++) {
        const inicioMes = new Date(añoActual, mes, 1); // Primer día del mes
        const finMes = new Date(añoActual, mes + 1, 0); // Último día del mes

        // Consultar la cantidad de visitas realizadas en el mes
        const visitasMensuales = await this.prisma.visita.count({
          where: {
            inicio: {
              gte: inicioMes, // Desde el inicio del mes
              lte: finMes, // Hasta el final del mes
            },
          },
        });

        // Agregar los resultados al array
        visitasPorMes.push({
          periodo: meses[mes], // Nombre del mes
          visitas: visitasMensuales, // Total de visitas en el mes
        });
      }

      return visitasPorMes;
    } catch (error) {
      console.error('Error obteniendo visitas por mes:', error);
      throw new InternalServerErrorException(
        'Error al calcular las visitas por mes',
      );
    }
  }

  //MEJOR RENDIMIENTO
  async getRendimientoVendedores() {
    try {
      // Obtener todos los vendedores con sus ventas
      const vendedores = await this.prisma.usuario.findMany({
        // where: { rol: 'VENDEDOR' }, // Solo roles de vendedor
        include: {
          ventas: {
            select: {
              montoConDescuento: true, // Para calcular ingresos
            },
          },
        },
      });

      // Calcular el rendimiento por vendedor
      const rendimientoVendedores = vendedores.map((vendedor) => {
        const totalVentas = vendedor.ventas.length; // Número de ventas realizadas
        const totalIngresos = vendedor.ventas.reduce(
          (sum, venta) => sum + venta.montoConDescuento,
          0,
        ); // Total generado en ingresos

        return {
          nombre: `${vendedor.nombre}`, // Nombre del vendedor
          ventas: totalVentas, // Número total de ventas
          ingresos: totalIngresos, // Total generado en ingresos
        };
      });

      // Ordenar por ingresos en orden descendente
      const topVendedores = rendimientoVendedores.sort(
        (a, b) => b.ingresos - a.ingresos,
      );

      return topVendedores;
    } catch (error) {
      console.error('Error obteniendo rendimiento de vendedores:', error);
      throw new InternalServerErrorException(
        'Error al calcular el rendimiento de los vendedores',
      );
    }
  }
  //GET VENTAS POR ZONA
  async getVentasPorZona() {
    try {
      // Obtener los clientes con sus municipios, departamentos y ventas
      const clientes = await this.prisma.cliente.findMany({
        include: {
          municipio: true, // Incluye el municipio del cliente
          departamento: true, // Incluye el departamento del cliente
          ventas: {
            select: {
              id: true, // ID de la venta (puedes omitirlo si no lo necesitas)
            },
          },
        },
      });

      // Mapear las ventas por zona (puedes elegir entre municipio o departamento)
      const ventasPorZona: Record<string, number> = {};

      clientes.forEach((cliente) => {
        const zona =
          cliente.municipio?.nombre ||
          cliente.departamento?.nombre ||
          'Zona Desconocida'; // Nombre del municipio o departamento
        const cantidadVentas = cliente.ventas.length; // Número de ventas asociadas al cliente

        if (ventasPorZona[zona]) {
          ventasPorZona[zona] += cantidadVentas; // Sumar ventas si la zona ya existe
        } else {
          ventasPorZona[zona] = cantidadVentas; // Crear una nueva entrada para la zona
        }
      });

      // Convertir el objeto a un array para el formato del chart
      const ventasPorZonaArray = Object.entries(ventasPorZona).map(
        ([zona, cantidadVentas]) => ({
          zona,
          cantidadVentas,
        }),
      );

      // Ordenar por cantidad de ventas en orden descendente
      const topZonas = ventasPorZonaArray
        .sort((a, b) => b.cantidadVentas - a.cantidadVentas)
        .slice(0, 10); // Obtener solo las 10 primeras zonas

      return topZonas;
    } catch (error) {
      console.error('Error obteniendo ventas por zona:', error);
      throw new InternalServerErrorException(
        'Error al calcular las ventas por zona',
      );
    }
  }
  //RETENCION DATOS
  async getRetentionData() {
    try {
      // Obtener el rango de meses (por ejemplo, últimos 6 meses)
      const fechaActual = new Date();
      const meses = Array.from({ length: 6 }, (_, i) => {
        const fecha = new Date(fechaActual);
        fecha.setMonth(fechaActual.getMonth() - i);
        return fecha.toISOString().slice(0, 7); // Formato YYYY-MM
      }).reverse();

      // Inicializar los contadores
      const retentionData = meses.map((mes) => ({
        periodo: mes,
        nuevos: 0,
        recurrentes: 0,
      }));

      // Iterar sobre cada cliente y calcular los datos
      const clientes = await this.prisma.cliente.findMany({
        include: {
          ventas: {
            select: {
              timestamp: true, // Fecha de la venta
            },
          },
        },
      });

      clientes.forEach((cliente) => {
        const mesCreacion = cliente.creadoEn.toISOString().slice(0, 7); // Mes de creación del cliente
        const ventasPorMes = cliente.ventas.map((venta) =>
          venta.timestamp.toISOString().slice(0, 7),
        );

        retentionData.forEach((entry) => {
          const { periodo } = entry;
          if (mesCreacion === periodo) {
            entry.nuevos += 1; // Cliente nuevo si coincide el mes de creación
          } else if (ventasPorMes.includes(periodo)) {
            entry.recurrentes += 1; // Cliente recurrente si tiene ventas en el periodo
          }
        });
      });

      return retentionData;
    } catch (error) {
      console.error('Error obteniendo datos de retención:', error);
      throw new InternalServerErrorException(
        'Error al calcular los datos de retención de clientes',
      );
    }
  }

  //PROSPECTOS POR ESTADO-TERMINAR
  async getProspectosPorEstado() {
    try {
      // Estados que deseamos incluir
      const estadosInteres = ['FINALIZADO', 'CERRADO'] as EstadoProspecto[];

      // Agrupar los prospectos por estado
      const prospectosAgrupados = await this.prisma.prospecto.groupBy({
        by: ['estado'], // Agrupar por el estado
        where: {
          estado: {
            in: estadosInteres, // Usar enum directamente
          },
        },
        _count: {
          estado: true, // Contar el número de prospectos por estado
        },
      });

      // Mapear los resultados para el formato deseado
      const result = estadosInteres.map((estado) => {
        const encontrado = prospectosAgrupados.find(
          (item) => item.estado === estado,
        );
        return {
          estado, // Estado del prospecto
          cantidad: encontrado ? encontrado._count.estado : 0, // Cantidad de prospectos
        };
      });

      return result; // Devolver el formato esperado
    } catch (error) {
      console.error('Error obteniendo prospectos por estado:', error);
      throw new InternalServerErrorException(
        'Error al calcular los prospectos por estado',
      );
    }
  }

  //TIEMPO PROMEDIO DE VISITAS
  async getTiempoMedioVisitasPorSemana() {
    try {
      // Obtener todas las visitas con su inicio y fin
      const visitas = await this.prisma.visita.findMany({
        select: {
          inicio: true, // Fecha de inicio de la visita
          fin: true, // Fecha de fin de la visita
        },
      });

      // Agrupar visitas por semana
      const visitasPorSemana: Record<
        string,
        { totalDuracion: number; count: number }
      > = {};

      visitas.forEach((visita) => {
        if (visita.inicio && visita.fin) {
          const inicio = new Date(visita.inicio);
          const fin = new Date(visita.fin);

          // Calcular la duración en horas
          const duracionEnHoras =
            (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);

          // Determinar la semana del año
          const semana = `${inicio.getFullYear()}-${Math.ceil((inicio.getTime() - new Date(inicio.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}`;

          if (!visitasPorSemana[semana]) {
            visitasPorSemana[semana] = { totalDuracion: 0, count: 0 };
          }

          visitasPorSemana[semana].totalDuracion += duracionEnHoras;
          visitasPorSemana[semana].count += 1;
        }
      });

      // Calcular el tiempo promedio por semana
      const tiempoMedioVisitas = Object.entries(visitasPorSemana).map(
        ([semana, { totalDuracion, count }]) => ({
          semana,
          duracionPromedio: count > 0 ? totalDuracion / count : 0,
        }),
      );

      // Ordenar por semana
      tiempoMedioVisitas.sort((a, b) => (a.semana > b.semana ? 1 : -1));

      return tiempoMedioVisitas;
    } catch (error) {
      console.error('Error obteniendo tiempo medio de visitas:', error);
      throw new InternalServerErrorException(
        'Error al calcular el tiempo medio de visitas por semana',
      );
    }
  }
}
