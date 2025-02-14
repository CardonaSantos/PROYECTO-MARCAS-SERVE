import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryController } from './cloudinary.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [CloudinaryController],
  providers: [CloudinaryService, PrismaService],
})
export class CloudinaryModule {}
