/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';
import { DomainError } from '../errors/domain.errors';
import { GraphQLError } from 'graphql';

type ErrorBody = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  correlationId: string;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const type = host.getType<'http' | 'graphql'>();

    if (type === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();

      const correlationId =
        request?.correlationId ||
        (request?.headers && typeof request.headers['x-correlation-id'] === 'string'
          ? request.headers['x-correlation-id']
          : 'unknown');

      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let body: ErrorBody = {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        correlationId,
      };

      if (exception instanceof DomainError) {
        status = exception.httpStatus;
        body = {
          code: exception.code,
          message: exception.message,
          details: exception.details,
          correlationId,
        };
        return response.status(status).json(body);
      }

      if (exception instanceof HttpException) {
        status = exception.getStatus();
        const res = exception.getResponse() as any;
        body = {
          code: status >= HttpStatus.INTERNAL_SERVER_ERROR ? 'INTERNAL_ERROR' : 'REQUEST_FAILED',
          message: typeof res === 'string' ? res : (res?.message ?? 'Request failed'),
          details: Array.isArray(res?.message) ? { messages: res.message } : undefined,
          correlationId,
        };
        return response.status(status).json(body);
      }

      return response.status(status).json(body);
    }

    if (type === 'graphql') {
      let message = 'Internal server error';
      let code = 'INTERNAL_ERROR';

      if (exception instanceof HttpException) {
        const status = exception.getStatus();
        const res = exception.getResponse() as any;

        if (Array.isArray(res?.message)) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          message = res.message.join(', ');
        } else if (res?.message) {
          message = res.message;
        } else {
          message = exception.message;
        }

        code = status >= 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST';
      } else if (exception instanceof DomainError) {
        message = exception.message;
        code = exception.code;
      }

      throw new GraphQLError(message, {
        extensions: { code },
      });
    }
  }
}
