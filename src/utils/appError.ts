export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  errors?: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    statusCode: number,
    errors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}
