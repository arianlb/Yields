import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsString, MaxLength, MinLength } from 'class-validator';

export class SetPasswordDto {
  @ApiProperty()
  @IsMongoId()
  userId: string;
  
  @ApiProperty()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string;
}
