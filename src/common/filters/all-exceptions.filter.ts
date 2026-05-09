import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const request = host.switchToHttp().getRequest();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const errorResponse = exception instanceof HttpException ? exception.getResponse() : 'Internal server error';

    response.status(status).json({
      success: false,
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      error: typeof errorResponse === 'string' ? errorResponse : errorResponse
    });
  }
}
