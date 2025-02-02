import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CustomersModule } from './customers/customers.module';
import { ProductModule } from './product/product.module';
import { LocationModule } from './location/location.module';
import { DateModule } from './date/date.module';
import { SaleModule } from './sale/sale.module';
import { AttendanceModule } from './attendance/attendance.module';
import { StockModule } from './stock/stock.module';
import { ProviderModule } from './provider/provider.module';
import { CategoriesModule } from './categories/categories.module';
import { DeliveryStockModule } from './delivery-stock/delivery-stock.module';
import { DiscountModule } from './discount/discount.module';
import { LocationGateway } from './location/location.gateway';
import { ProspectoModule } from './prospecto/prospecto.module';
import { CustomerLocationModule } from './customer-location/customer-location.module';
import { AnalitycsModule } from './analitycs/analitycs.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EmpresaModule } from './empresa/empresa.module';
import { ReportsModule } from './reports/reports.module';
import { RecoveryModule } from './recovery/recovery.module';
import { CreditoModule } from './credito/credito.module';
import { SaldosModule } from './saldos/saldos.module';

@Module({
  imports: [
    UsersModule,
    NotificationsModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true, // Hace que ConfigService esté disponible en toda la aplicación
    }),
    CustomersModule,
    ProductModule,
    LocationModule,
    DateModule,
    SaleModule,
    AttendanceModule,
    StockModule,
    ProviderModule,
    CategoriesModule,
    DeliveryStockModule,
    DiscountModule,
    ProspectoModule,
    CustomerLocationModule,
    AnalitycsModule,
    ScheduleModule.forRoot(),
    EmpresaModule,
    ReportsModule,
    RecoveryModule,
    CreditoModule,
    SaldosModule,
  ],
  controllers: [],
  providers: [LocationGateway],
})
export class AppModule {}
