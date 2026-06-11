import {
  Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Request, HttpCode, HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { ActivityFiltersDto } from './dto/activity-filters.dto';

@ApiTags('activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Log a carbon activity' })
  create(@Request() req: any, @Body() dto: CreateActivityDto) {
    return this.activitiesService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get activity history with filters' })
  findAll(@Request() req: any, @Query() filters: ActivityFiltersDto) {
    return this.activitiesService.findAll(req.user.id, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single activity' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.activitiesService.findOne(req.user.id, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete activity' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.activitiesService.remove(req.user.id, id);
  }
}
