import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsInt,
  IsMongoId,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreatePersonDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(2)
  readonly name?: string;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly phone?: number;

  @ApiProperty()
  @IsDate()
  readonly since: Date;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(1)
  readonly source?: string;

  @ApiProperty()
  @IsMongoId()
  readonly office: string;

  @ApiProperty()
  @IsOptional()
  readonly isCustomer?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsMongoId()
  readonly agent?: string;
}
