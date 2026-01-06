import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { validate } from '../middleware/validate';
import { createTaskSchema, updateTaskSchema, taskFiltersSchema } from '../utils/validation';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../utils/db';

const router = Router();

const statusMap: Record<string, string> = {
  todo: 'TODO',
  in_progress: 'IN_PROGRESS',
  done: 'DONE',
};

const reverseStatusMap: Record<string, string> = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
};

router.get(
  '/',
  authenticate,
  validate(taskFiltersSchema, 'query'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { status, assigneeId, search, page = 1, limit = 10 } = req.query as any;

    const where: Prisma.TaskWhereInput = {};

    if (status) {
      where.status = statusMap[status] as any;
    }

    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.task.count({ where }),
    ]);

    const formattedTasks = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: reverseStatusMap[task.status],
      assigneeId: task.assigneeId,
      assignee: task.assignee,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }));

    res.json({
      data: formattedTasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  })
);

router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!task) {
      throw new AppError(404, 'Task not found', 'TASK_NOT_FOUND');
    }

    res.json({
      data: {
        id: task.id,
        title: task.title,
        description: task.description,
        status: reverseStatusMap[task.status],
        assigneeId: task.assigneeId,
        assignee: task.assignee,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      },
    });
  })
);

router.post(
  '/',
  authenticate,
  validate(createTaskSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const { title, description, assigneeId } = req.body;

    const assignee = await prisma.user.findUnique({
      where: { id: assigneeId },
    });

    if (!assignee) {
      throw new AppError(404, 'Assignee not found', 'ASSIGNEE_NOT_FOUND');
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        assigneeId,
        status: 'TODO',
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      data: {
        id: task.id,
        title: task.title,
        description: task.description,
        status: reverseStatusMap[task.status],
        assigneeId: task.assigneeId,
        assignee: task.assignee,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      },
    });
  })
);

router.patch(
  '/:id',
  authenticate,
  validate(updateTaskSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const updates = req.body;

    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      throw new AppError(404, 'Task not found', 'TASK_NOT_FOUND');
    }

    if (updates.assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: updates.assigneeId },
      });

      if (!assignee) {
        throw new AppError(404, 'Assignee not found', 'ASSIGNEE_NOT_FOUND');
      }
    }

    const dataToUpdate: any = { ...updates };
    if (updates.status) {
      dataToUpdate.status = statusMap[updates.status];
    }

    const task = await prisma.task.update({
      where: { id },
      data: dataToUpdate,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json({
      data: {
        id: task.id,
        title: task.title,
        description: task.description,
        status: reverseStatusMap[task.status],
        assigneeId: task.assigneeId,
        assignee: task.assignee,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      },
    });
  })
);

router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;

    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      throw new AppError(404, 'Task not found', 'TASK_NOT_FOUND');
    }

    await prisma.task.delete({
      where: { id },
    });

    res.status(204).send();
  })
);

export default router;
