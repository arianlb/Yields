import { PartialType } from '@nestjs/swagger';
import { CreateQqcatalystDto } from './create-qqcatalyst.dto';

export class UpdateQqcatalystDto extends PartialType(CreateQqcatalystDto) {}
