import { PartialType } from '@nestjs/swagger';
import { CreateMonthDto } from './create-month.dto';

export class UpdateMonthDto extends PartialType(CreateMonthDto) {}
