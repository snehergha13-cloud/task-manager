import { Test } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { Task, TaskStatus } from './entities/task.entity';
import { UserRole } from '../users/entities/user.entity';

describe('TasksService', () => {
  let tasksService: TasksService;
  let taskRepo: Record<string, jest.Mock>;

  const ownerUser = { id: 'user-1', role: UserRole.USER };
  const otherUser = { id: 'user-2', role: UserRole.USER };
  const adminUser = { id: 'admin-1', role: UserRole.ADMIN };

  beforeEach(async () => {
    taskRepo = {
      create: jest.fn((data) => data),
      save: jest.fn(async (data) => ({ id: 'task-1', ...data })),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: taskRepo },
      ],
    }).compile();

    tasksService = moduleRef.get(TasksService);
  });

  it('creates a task owned by the requesting user', async () => {
    const task = await tasksService.create(
      { title: 'Write tests', status: TaskStatus.PENDING },
      ownerUser,
    );
    expect(task.userId).toBe(ownerUser.id);
  });

  it('prevents a user from updating a task they do not own', async () => {
    (taskRepo.findOne as jest.Mock).mockResolvedValue({
      id: 'task-1',
      userId: ownerUser.id,
      title: 'Original',
      status: TaskStatus.PENDING,
    });

    await expect(
      tasksService.update('task-1', { title: 'Hacked' }, otherUser),
    ).rejects.toThrow(ForbiddenException);
  });

  it('allows an admin to update any task', async () => {
    (taskRepo.findOne as jest.Mock).mockResolvedValue({
      id: 'task-1',
      userId: ownerUser.id,
      title: 'Original',
      status: TaskStatus.PENDING,
    });

    const updated = await tasksService.update(
      'task-1',
      { title: 'Updated by admin' },
      adminUser,
    );
    expect(updated.title).toBe('Updated by admin');
  });

  it('throws NotFoundException for a missing task', async () => {
    (taskRepo.findOne as jest.Mock).mockResolvedValue(null);
    await expect(tasksService.findOneOrFail('missing-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('prevents a user from deleting a task they do not own', async () => {
    (taskRepo.findOne as jest.Mock).mockResolvedValue({
      id: 'task-1',
      userId: ownerUser.id,
    });

    await expect(tasksService.remove('task-1', otherUser)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
