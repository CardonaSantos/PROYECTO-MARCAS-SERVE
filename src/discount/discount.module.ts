import { forwardRef, Module } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { DiscountController } from './discount.controller';
import { PrismaService } from 'src/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { LocationModule } from 'src/location/location.module';

@Module({
  controllers: [DiscountController],
  providers: [DiscountService, PrismaService, NotificationsService],
  imports: [forwardRef(() => LocationModule)],
})
export class DiscountModule {}
