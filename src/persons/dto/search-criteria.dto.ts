import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsMongoId,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class SearchCriteriaDto {
  @ApiProperty()
  @IsMongoId()
  readonly office: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(2)
  readonly name?: string;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  readonly phone?: number;
  
  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  readonly qqPersonId?: number;
}
