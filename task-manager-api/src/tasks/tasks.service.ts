import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UserRole } from '../users/entities/user.entity';

interface RequestUser {
  id: string;
  role: UserRole;
}

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  async create(dto: CreateTaskDto, user: RequestUser): Promise<Task> {
    const task = this.tasksRepository.create({ ...dto, userId: user.id });
    return this.tasksRepository.save(task);
  }

  async findAllForUser(user: RequestUser): Promise<Task[]> {
    if (user.role === UserRole.ADMIN) {
      return this.tasksRepository.find({ order: { createdAt: 'DESC' } });
    }
    return this.tasksRepository.find({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneOrFail(id: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  private assertOwnership(task: Task, user: RequestUser) {
    if (user.role !== UserRole.ADMIN && task.userId !== user.id) {
      throw new ForbiddenException('You do not have access to this task');
    }
  }

  async update(id: string, dto: UpdateTaskDto, user: RequestUser): Promise<Task> {
    const task = await this.findOneOrFail(id);
    this.assertOwnership(task, user);
    Object.assign(task, dto);
    return this.tasksRepository.save(task);
  }

  async remove(id: string, user: RequestUser): Promise<void> {
    const task = await this.findOneOrFail(id);
    this.assertOwnership(task, user);
    await this.tasksRepository.remove(task);
  }
}
