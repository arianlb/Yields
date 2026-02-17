import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class SourceObjectDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  readonly name: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  readonly color: string;
}

export class CreateOfficeDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  readonly name: string;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  readonly sebanda: number;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  readonly sources?: string[];

  @ApiProperty({ type: [SourceObjectDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SourceObjectDto)
  readonly sourceObjects: SourceObjectDto[];

  @ApiProperty()
  @IsOptional()
  @IsInt()
  readonly qqOfficeId?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly QQID?: string;
}
