/**
 * Test task fixtures for E2E tests
 */

export interface TestTask {
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
}

export const testTasks: Record<string, TestTask> = {
  simpleTask: {
    title: 'Simple Test Task',
    description: 'This is a simple test task for E2E testing',
    status: 'todo',
  },
  urgentTask: {
    title: 'Urgent Bug Fix',
    description: 'Fix critical production bug ASAP',
    status: 'in_progress',
  },
  completedTask: {
    title: 'Completed Feature',
    description: 'This task has been completed',
    status: 'done',
  },
  longTask: {
    title: 'Task with Very Long Title to Test UI Handling of Long Text Content',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    status: 'todo',
  },
  specialCharsTask: {
    title: 'Task with <special> & "chars" \'test\'',
    description: 'Testing special characters: <>&"\'\n\t',
    status: 'todo',
  },
};

export const invalidTasks = {
  emptyTitle: {
    title: '',
    description: 'Task with no title',
    status: 'todo',
  },
  tooLongTitle: {
    title: 'A'.repeat(300),
    description: 'Task with title exceeding max length',
    status: 'todo',
  },
};
