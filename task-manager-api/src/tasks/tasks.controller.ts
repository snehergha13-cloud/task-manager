import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UserRole } from '../users/entities/user.entity';

interface RequestUser {
  id: string;
  role: UserRole;
}

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // Create a task for the currently authenticated user
  @Post()
  create(@Body() dto: CreateTaskDto, @CurrentUser() user: RequestUser) {
    return this.tasksService.create(dto, user);
  }

  // Users see only their own tasks; admins see all tasks
  @Get()
  findAll(@CurrentUser() user: RequestUser) {
    return this.tasksService.findAllForUser(user);
  }

  // Owner or admin only (enforced in the service)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.tasksService.update(id, dto, user);
  }

  // Owner or admin only (enforced in the service)
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    await this.tasksService.remove(id, user);
    return { message: 'Task deleted successfully' };
  }
}
