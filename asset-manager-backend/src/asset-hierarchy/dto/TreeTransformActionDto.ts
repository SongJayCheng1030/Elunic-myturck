import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export interface TreeTransformActionDto {
  actions: TransformAction[];

  /**
   * A reason for the tree transformation
   */
  description?: string;
}

export interface TransformAction {
  type: TransformType;

  /**
   * The id of the element which is the target of
   * the modifications
   */
  id: string;

  /**
   * The id of the element to append this element as
   * child to
   */
  childOf?: string;

  /**
   * (Flat) Ordered list of all direct children of the node
   * identified by `childOf` which defines the order of the
   * nodes
   */
  order?: string[];
}

export enum TransformType {
  DELETE = 'delete',
  CHILD_OF = 'childOf',
}

export const TreeTransformActionSchema = Joi.object({
  actions: Joi.array()
    .items(
      Joi.object({
        type: Joi.string()
          .allow(TransformType.CHILD_OF, TransformType.DELETE)
          .insensitive()
          .required(),
        id: Joi.string().uuid().required(),
        childOf: Joi.alternatives(Joi.string().uuid(), null).optional(),
        order: Joi.array().items(Joi.string().uuid()).optional(),
      }),
    )
    .min(1)
    .required(),
  description: Joi.string().min(1).max(4000).optional(),
});

export class TransformActionClass {
  @ApiProperty()
  type!: TransformType;

  /**
   * The id of the element which is the target of
   * the modifications
   */
  @ApiProperty()
  id!: string;

  /**
   * The id of the element to append this element as
   * child to
   */
  @ApiProperty()
  childOf?: string;

  /**
   * (Flat) Ordered list of all direct children of the node
   * identified by `childOf` which defines the order of the
   * nodes
   */
  @ApiProperty()
  order?: string[];
}

export class TreeTransformActionClassDto {
  @ApiProperty({ type: () => [TransformActionClass] })
  actions!: TransformActionClass[];

  /**
   * A reason for the tree transformation
   */
  @ApiProperty()
  description?: string;
}
