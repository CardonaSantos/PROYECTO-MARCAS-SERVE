import { forwardRef, Module } from '@nestjs/common';
import { SaleService } from './sale.service';
import { SaleController } from './sale.controller';
import { PrismaService } from 'src/prisma.service';
import { LocationModule } from 'src/location/location.module';
import { NotificationsService } from 'src/notifications/notifications.service';

@Module({
  controllers: [SaleController],
  providers: [SaleService, PrismaService, NotificationsService],
  imports: [forwardRef(() => LocationModule)],
})
export class SaleModule {}
