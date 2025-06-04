class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  msg: string;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    // this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.status = "error";
    this.isOperational = true;
    this.msg = message;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
