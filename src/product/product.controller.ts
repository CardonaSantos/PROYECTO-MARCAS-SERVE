import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productService.createProduct(createProductDto);
  }

  // @Get()
  // async findAll() {
  //   return await this.productService.findAllProducts();
  // }

  @Get()
  async findAll(@Query('page') page = '1', @Query('limit') limit = '10') {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.productService.findAllProducts(pageNumber, limitNumber);
  }

  @Get('/get-product-to-inventary')
  async findAllProductToInventary() {
    return await this.productService.findAllProductToInventary();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.productService.findOneProduct(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    console.log('La data es: ', updateProductDto);
    return await this.productService.updateOneProduct(id, updateProductDto);
  }

  @Patch('/update-images-product/:productID')
  async updateImagesToProduct(
    @Param('productID', ParseIntPipe) productID: number,
    // @Body() images: string[],

    @Body('images') images: string[], // Extraemos solo el array de imágenes
  ) {
    console.log('La data es: ', images);
    return await this.productService.updateImagesToProduct(productID, images);
  }

  @Delete('/delete-all-products')
  async removeAllProducts() {
    return await this.productService.removeAllProducts();
  }

  @Delete('/delete-one-image-product/:id/image/:imageId')
  async removeOneImageProduct(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageId', ParseIntPipe) imageId: number,
    @Query('publicId') publicId: string, // Recibirlo desde query params
  ) {
    if (!publicId) {
      throw new BadRequestException('El publicId es requerido');
    }

    return await this.productService.removeOneImageProduct(
      id,
      publicId,
      imageId,
    );
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.productService.removeOneProduct(id);
  }
}
