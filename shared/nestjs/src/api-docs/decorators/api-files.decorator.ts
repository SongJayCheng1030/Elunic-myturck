import { ApiBody } from '@nestjs/swagger';

export const ApiFiles =
  (prop = 'file'): MethodDecorator =>
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
          [prop]: {
            type: 'array',
            items: {
              type: 'file',
              format: 'binary',
            },
          },
        },
      },
    })(target, propertyKey, descriptor);
  };
