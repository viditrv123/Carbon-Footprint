import { IsEnum, IsNumber, IsString, IsOptional, IsDateString, Min, Max, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityCategory } from '@prisma/client';

/**
 * All fields optional — only provided fields will be updated.
 */
export class UpdateActivityDto {
  @ApiPropertyOptional({ enum: ActivityCategory })
  @IsOptional()
  @IsEnum(ActivityCategory)
  category?: ActivityCategory;

  @ApiPropertyOptional({ example: 'CAR_PETROL' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  subcategory?: string;

  @ApiPropertyOptional({ example: 25.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000000)
  value?: number;

  @ApiPropertyOptional({ example: 'km' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

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
