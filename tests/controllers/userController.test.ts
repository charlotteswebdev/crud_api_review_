import { createUser, getUserById, updateUser, deleteUser, getUsers } from '../../src/controllers/userController';
import { pool } from '../../src/config/db';
import { Request, Response } from 'express';

jest.mock('../../src/config/db');

describe('User Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn().mockReturnValue(undefined);
    mockStatus = jest.fn().mockReturnValue({ json: mockJson, send: jest.fn() });
    mockRequest = {};
    mockResponse = {
      status: mockStatus,
      json: mockJson,
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should return 400 if name is missing', async () => {
      mockRequest = {
        body: {
          email: 'test@example.com',
        },
      };

      await createUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'name is required and must be a non-empty string',
      });
    });

    it('should return 400 if email is missing', async () => {
      mockRequest = {
        body: {
          name: 'John Doe',
        },
      };

      await createUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'email is required and must be a non-empty string',
      });
    });

    it('should create user with valid inputs', async () => {
      mockRequest = {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      };

      (pool.execute as jest.Mock).mockResolvedValue([{ insertId: 1 }]);

      await createUser(mockRequest as Request, mockResponse as Response);

      expect(pool.execute).toHaveBeenCalledWith(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        ['John Doe', 'john@example.com']
      );
      expect(mockStatus).toHaveBeenCalledWith(201);
    });
  });

  describe('getUserById', () => {
    it('should return 404 if user not found', async () => {
      mockRequest = {
        params: { id: '999' },
      };

      (pool.execute as jest.Mock).mockResolvedValue([[]]);

      await getUserById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return user if found', async () => {
      mockRequest = {
        params: { id: '1' },
      };

      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
      (pool.execute as jest.Mock).mockResolvedValue([[mockUser]]);

      await getUserById(mockRequest as Request, mockResponse as Response);

      expect(pool.execute).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE id = ?',
        ['1']
      );
      expect(mockJson).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('updateUser', () => {
    it('should return 400 if name is missing', async () => {
      mockRequest = {
        params: { id: '1' },
        body: { email: 'test@example.com' },
      };

      await updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
    });

    it('should return 404 if user not found', async () => {
      mockRequest = {
        params: { id: '999' },
        body: { name: 'Jane Doe', email: 'jane@example.com' },
      };

      (pool.execute as jest.Mock).mockResolvedValue([{ affectedRows: 0 }]);

      await updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should update user with valid inputs', async () => {
      mockRequest = {
        params: { id: '1' },
        body: { name: 'Jane Doe', email: 'jane@example.com' },
      };

      (pool.execute as jest.Mock).mockResolvedValue([{ affectedRows: 1 }]);

      await updateUser(mockRequest as Request, mockResponse as Response);

      expect(pool.execute).toHaveBeenCalledWith(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        ['Jane Doe', 'jane@example.com', '1']
      );
      expect(mockStatus).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteUser', () => {
    it('should return 404 if user not found', async () => {
      mockRequest = {
        params: { id: '999' },
      };

      (pool.execute as jest.Mock).mockResolvedValue([{ affectedRows: 0 }]);

      await deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should delete user successfully', async () => {
      mockRequest = {
        params: { id: '1' },
      };

      (pool.execute as jest.Mock).mockResolvedValue([{ affectedRows: 1 }]);

      await deleteUser(mockRequest as Request, mockResponse as Response);

      expect(pool.execute).toHaveBeenCalledWith(
        'DELETE FROM users WHERE id = ?',
        ['1']
      );
      expect(mockStatus).toHaveBeenCalledWith(204);
    });
  });
});
