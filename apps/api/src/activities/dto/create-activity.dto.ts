import { IsEnum, IsNumber, IsString, IsOptional, IsDateString, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityCategory } from '@prisma/client';

export class CreateActivityDto {
  @ApiProperty({ enum: ActivityCategory })
  @IsEnum(ActivityCategory)
  category: ActivityCategory;

  @ApiProperty({ example: 'CAR_PETROL' })
  @IsString()
  @MaxLength(50)
  subcategory: string;

  @ApiProperty({ example: 25.5 })
  @IsNumber()
  @Min(0)
  @Max(1000000)
  value: number;

  @ApiProperty({ example: 'km' })
  @IsString()
  @MaxLength(20)
  unit: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
