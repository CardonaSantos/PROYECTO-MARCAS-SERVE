import { PartialType } from '@nestjs/mapped-types';
import { CreateAnalitycDto } from './create-analityc.dto';

export class UpdateAnalitycDto extends PartialType(CreateAnalitycDto) {}
