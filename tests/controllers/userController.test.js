"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const userController_1 = require("../../src/controllers/userController");
const db_1 = require("../../src/config/db");
jest.mock('../../src/config/db');
describe('User Controller', () => {
    let mockRequest;
    let mockResponse;
    let mockJson;
    let mockStatus;
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
            await (0, userController_1.createUser)(mockRequest, mockResponse);
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
            await (0, userController_1.createUser)(mockRequest, mockResponse);
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
            db_1.pool.execute.mockResolvedValue([{ insertId: 1 }]);
            await (0, userController_1.createUser)(mockRequest, mockResponse);
            expect(db_1.pool.execute).toHaveBeenCalledWith('INSERT INTO users (name, email) VALUES (?, ?)', ['John Doe', 'john@example.com']);
            expect(mockStatus).toHaveBeenCalledWith(201);
        });
    });
    describe('getUserById', () => {
        it('should return 404 if user not found', async () => {
            mockRequest = {
                params: { id: '999' },
            };
            db_1.pool.execute.mockResolvedValue([[]]);
            await (0, userController_1.getUserById)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({ message: 'User not found' });
        });
        it('should return user if found', async () => {
            mockRequest = {
                params: { id: '1' },
            };
            const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
            db_1.pool.execute.mockResolvedValue([[mockUser]]);
            await (0, userController_1.getUserById)(mockRequest, mockResponse);
            expect(db_1.pool.execute).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?', ['1']);
            expect(mockJson).toHaveBeenCalledWith(mockUser);
        });
    });
    describe('updateUser', () => {
        it('should return 400 if name is missing', async () => {
            mockRequest = {
                params: { id: '1' },
                body: { email: 'test@example.com' },
            };
            await (0, userController_1.updateUser)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(400);
        });
        it('should return 404 if user not found', async () => {
            mockRequest = {
                params: { id: '999' },
                body: { name: 'Jane Doe', email: 'jane@example.com' },
            };
            db_1.pool.execute.mockResolvedValue([{ affectedRows: 0 }]);
            await (0, userController_1.updateUser)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({ message: 'User not found' });
        });
        it('should update user with valid inputs', async () => {
            mockRequest = {
                params: { id: '1' },
                body: { name: 'Jane Doe', email: 'jane@example.com' },
            };
            db_1.pool.execute.mockResolvedValue([{ affectedRows: 1 }]);
            await (0, userController_1.updateUser)(mockRequest, mockResponse);
            expect(db_1.pool.execute).toHaveBeenCalledWith('UPDATE users SET name = ?, email = ? WHERE id = ?', ['Jane Doe', 'jane@example.com', '1']);
            expect(mockStatus).toHaveBeenCalledWith(200);
        });
    });
    describe('deleteUser', () => {
        it('should return 404 if user not found', async () => {
            mockRequest = {
                params: { id: '999' },
            };
            db_1.pool.execute.mockResolvedValue([{ affectedRows: 0 }]);
            await (0, userController_1.deleteUser)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({ message: 'User not found' });
        });
        it('should delete user successfully', async () => {
            mockRequest = {
                params: { id: '1' },
            };
            db_1.pool.execute.mockResolvedValue([{ affectedRows: 1 }]);
            await (0, userController_1.deleteUser)(mockRequest, mockResponse);
            expect(db_1.pool.execute).toHaveBeenCalledWith('DELETE FROM users WHERE id = ?', ['1']);
            expect(mockStatus).toHaveBeenCalledWith(204);
        });
    });
});
