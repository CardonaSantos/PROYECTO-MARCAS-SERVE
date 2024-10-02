import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomerLocationDto } from './create-customer-location.dto';

export class UpdateCustomerLocationDto extends PartialType(CreateCustomerLocationDto) {}
