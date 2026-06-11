import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request, HttpCode, HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { ActivityFiltersDto } from './dto/activity-filters.dto';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { UpdateActivityDto } from './dto/update-activity.dto';

@ApiTags('activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Log a carbon activity' })
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreateActivityDto) {
    return this.activitiesService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get activity history with filters' })
  findAll(@Request() req: AuthenticatedRequest, @Query() filters: ActivityFiltersDto) {
    return this.activitiesService.findAll(req.user.id, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single activity' })
  findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.activitiesService.findOne(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an activity' })
  update(@Request() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: UpdateActivityDto) {
    return this.activitiesService.update(req.user.id, id, dto);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export all activities as CSV' })
  async exportCsv(@Request() req: AuthenticatedRequest): Promise<{ csv: string; filename: string }> {
    const csv = await this.activitiesService.exportCsv(req.user.id);
    return { csv, filename: 'carbon-activities.csv' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete activity' })
  remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.activitiesService.remove(req.user.id, id);
  }
}
