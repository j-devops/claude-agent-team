/**
 * Test user fixtures for E2E tests
 */

export interface TestUser {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
}

export const testUsers: Record<string, TestUser> = {
  admin: {
    email: 'admin@taskflow.test',
    password: 'AdminPass123!',
    name: 'Admin User',
    role: 'admin',
  },
  user1: {
    email: 'user1@taskflow.test',
    password: 'UserPass123!',
    name: 'Test User 1',
    role: 'user',
  },
  user2: {
    email: 'user2@taskflow.test',
    password: 'UserPass123!',
    name: 'Test User 2',
    role: 'user',
  },
  newUser: {
    email: 'newuser@taskflow.test',
    password: 'NewUserPass123!',
    name: 'New Test User',
    role: 'user',
  },
};

export const invalidUsers = {
  invalidEmail: {
    email: 'not-an-email',
    password: 'ValidPass123!',
    name: 'Invalid Email User',
  },
  weakPassword: {
    email: 'weak@taskflow.test',
    password: '123',
    name: 'Weak Password User',
  },
  emptyFields: {
    email: '',
    password: '',
    name: '',
  },
};
