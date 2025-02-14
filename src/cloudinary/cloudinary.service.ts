import { Injectable } from '@nestjs/common';
import { CreateCloudinaryDto } from './dto/create-cloudinary.dto';
import { UpdateCloudinaryDto } from './dto/update-cloudinary.dto';
import { PrismaService } from 'src/prisma.service';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private readonly prisma: PrismaService) {}

  async subirImagen(image: string): Promise<string> {
    console.log('entrando al service de cloudinary');

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        image,
        {
          // folder: 'ProductosFotos',
          folder: 'ProductosFotos',
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result.secure_url);
          console.log('La imagen es: ', result.secure_url);
        },
      );
    });
  }

  async reemplazarUnaImagen(image: string): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        image,
        { folder: 'ProductosFotos' },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result.secure_url);
        },
      );
    });
  }

  async BorrarImagen(publicId: string): Promise<void> {
    console.log('El ID ES:', publicId);

    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error || result.result !== 'ok') {
          return reject(error || new Error('Failed to delete image'));
        }
        resolve();
      });
    });
  }

  create(createCloudinaryDto: CreateCloudinaryDto) {
    return 'This action adds a new cloudinary';
  }

  findAll() {
    return `This action returns all cloudinary`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cloudinary`;
  }

  update(id: number, updateCloudinaryDto: UpdateCloudinaryDto) {
    return `This action updates a #${id} cloudinary`;
  }

  remove(id: number) {
    return `This action removes a #${id} cloudinary`;
  }
}
