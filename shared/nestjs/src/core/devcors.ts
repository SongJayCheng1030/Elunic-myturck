import { INestApplication } from '@nestjs/common';

export function enableDevCors(app: INestApplication): void {
  if (process.env.NODE_ENV === 'development') {
    console.warn('CORS for DEV enabled');
    app.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });
  }
}
