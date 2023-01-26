import { ApiBody } from '@nestjs/swagger';

export const ApiFile =
  (fileName = 'file'): MethodDecorator =>
  (
    target: typeof Object.prototype,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    ApiBody({
      required: true,
      schema: {
        type: 'object',
        properties: {
          [fileName]: {
            type: 'file',
            format: 'binary',
          },
        },
      },
    })(target, propertyKey, descriptor);
  };
