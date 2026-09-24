import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskItem } from '../TaskItem';
import { Task, TaskStatus } from '../../../types';

const task: Task = {
  id: 't1',
  title: 'Write tests',
  description: 'Cover the task item component',
  status: TaskStatus.PENDING,
  createdAt: new Date('2026-01-01').toISOString(),
  userId: 'user-1',
};

describe('TaskItem', () => {
  it('renders the title, description and pending badge', () => {
    render(
      <ul>
        <TaskItem task={task} canEdit onEdit={vi.fn()} onDelete={vi.fn()} onToggleStatus={vi.fn()} />
      </ul>,
    );

    expect(screen.getByText('Write tests')).toBeInTheDocument();
    expect(screen.getByText('Cover the task item component')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('calls onDelete with the task when the delete button is clicked', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();

    render(
      <ul>
        <TaskItem
          task={task}
          canEdit
          onEdit={vi.fn()}
          onDelete={onDelete}
          onToggleStatus={vi.fn()}
        />
      </ul>,
    );

    await user.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith(task);
  });

  it('hides edit/delete actions when the current user cannot edit the task', () => {
    render(
      <ul>
        <TaskItem
          task={task}
          canEdit={false}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onToggleStatus={vi.fn()}
        />
      </ul>,
    );

    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  });
});
