import { forwardRef, Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { PrismaService } from 'src/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';
import { LocationModule } from 'src/location/location.module';

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService, PrismaService, NotificationsService],
  imports: [forwardRef(() => LocationModule)],
})
export class AttendanceModule {}
