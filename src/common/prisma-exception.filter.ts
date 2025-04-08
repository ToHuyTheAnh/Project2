import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let message = 'Internal server error';
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception.code === 'P2002') {
      message = `Trường ${exception.meta?.target as string} đã tồn tại`;
      statusCode = HttpStatus.CONFLICT;
    }
    response.status(statusCode).json({
      statusCode,
      message,
    });
  }
}
