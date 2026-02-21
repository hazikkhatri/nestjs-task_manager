import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepo: Repository<Task>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async create(dto: CreateTaskDto, createdBy: User): Promise<Task> {
    const assignedTo = await this.usersRepo.findOne({ where: { id: dto.assignedToId } });
    if (!assignedTo) throw new NotFoundException(`User ${dto.assignedToId} not found`);

    const task = this.tasksRepo.create({
      title: dto.title,
      description: dto.description,
      deadline: new Date(dto.deadline),
      assignedTo,
      createdBy,
    });

    return this.tasksRepo.save(task);
  }

  // Admins see all tasks; regular users see only their own
  async findAll(user: User): Promise<Task[]> {
    if (user.role === UserRole.ADMIN) {
      return this.tasksRepo.find();
    }
    return this.tasksRepo.find({ where: { assignedTo: { id: user.id } } });
  }

  async findOne(id: string, user: User): Promise<Task> {
    const task = await this.tasksRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException(`Task ${id} not found`);

    if (user.role !== UserRole.ADMIN && task.assignedTo.id !== user.id) {
      throw new ForbiddenException('You cannot access this task');
    }

    return task;
  }

  async update(id: string, dto: UpdateTaskDto, user: User): Promise<Task> {
    const task = await this.findOne(id, user);

    if (dto.assignedToId) {
      const assignedTo = await this.usersRepo.findOne({ where: { id: dto.assignedToId } });
      if (!assignedTo) throw new NotFoundException(`User ${dto.assignedToId} not found`);
      task.assignedTo = assignedTo;
    }

    if (dto.title) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description ?? '';
    if (dto.status) task.status = dto.status;
    if (dto.deadline) task.deadline = new Date(dto.deadline);

    return this.tasksRepo.save(task);
  }

  async remove(id: string, user: User): Promise<void> {
    const task = await this.findOne(id, user);
    await this.tasksRepo.remove(task);
  }
}
