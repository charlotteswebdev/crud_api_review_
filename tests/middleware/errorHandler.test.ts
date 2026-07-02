import { errorHandler } from '../../src/middleware/errorHandler';
import { Request, Response, NextFunction } from 'express';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    mockJson = jest.fn().mockReturnValue(undefined);
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockRequest = {};
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('in development environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should expose detailed message for 5xx errors', () => {
      const error = new Error('Database connection failed');
      (error as any).statusCode = 500;

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Database connection failed',
      });
    });
  });

  describe('in production environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('should hide detailed message for 5xx errors', () => {
      const error = new Error('Database connection failed');
      (error as any).statusCode = 500;

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Internal Server Error',
      });
    });

    it('should expose detailed message for 4xx errors', () => {
      const error = new Error('Validation failed');
      (error as any).statusCode = 400;

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Validation failed',
      });
    });

    it('should expose detailed message for 404 errors', () => {
      const error = new Error('User not found');
      (error as any).statusCode = 404;

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });
  });

  it('should return default 500 with generic message when error has no message', () => {
    const error = { statusCode: undefined, status: undefined };

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      message: 'Internal Server Error',
    });
  });

  it('should prefer statusCode over status', () => {
    const error = new Error('Forbidden');
    (error as any).statusCode = 403;
    (error as any).status = 400;

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(403);
  });

  it('should fall back to status if statusCode is missing', () => {
    const error = new Error('Not found');
    (error as any).status = 404;

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({
      message: 'Not found',
    });
  });

  it('should handle unknown error objects', () => {
    const unknownError = 'Some string error';

    errorHandler(unknownError, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      message: 'Internal Server Error',
    });
  });
});
