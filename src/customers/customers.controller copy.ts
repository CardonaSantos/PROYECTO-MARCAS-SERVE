import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreateCustomerFromProspectDto } from './dto/create-customer-from-prospect';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  async createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    return await this.customersService.create(createCustomerDto);
  }

  @Post('/create-customer-from-prospect')
  async createCustomerFromProspect(
    @Body() createCustomerDto: CreateCustomerFromProspectDto,
  ) {
    return await this.customersService.createClienteFromProspect(
      createCustomerDto,
    );
  }

  @Get()
  async findAllCustomers() {
    return await this.customersService.findAllCustomers();
  }

  @Get('/get-all-customers')
  async findCustomersAll() {
    return await this.customersService.findCustomerWithLocation();
  }

  @Get('/all-customers-with-discount')
  async findAllCustomersWithDiscount() {
    return await this.customersService.findOneCustomersWithDiscount();
  }

  @Get('/customer-simple')
  async SimpleCustomers() {
    return await this.customersService.findSimple();
  }

  @Get(':id')
  findOneCustomer(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.findOneCustomer(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    console.log('CONTROLLER:', updateCustomerDto);

    return await this.customersService.updateOneCustomer(id, updateCustomerDto);
  }

  @Delete('/delete-all')
  async removeAllCustomers() {
    return await this.customersService.removeAllCustomers();
  }
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.customersService.removeOneCustomer(id);
  }
}
