import { Body, Controller, Param, Req } from '@nestjs/common';
import { ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@rewiko/crud';
import { Request } from 'express';
import { JoiPipe } from 'nestjs-joi';
import { getResponseFor, getResponseForMany, TenantIdAutoFilter } from 'shared/nestjs';

import { ENDPOINT_QUERY_CACHE_TIME, ENDPOINT_RESULT_QUERY_LIMIT } from '../definitions';
import {
  CreateProcedureLibraryStepDto,
  CreateProcedureLibraryStepSchema,
  LIBRARY_STEP_VALIDATION_PIPES,
  UpdateProcedureLibraryStepDto,
  UpdateProcedureLibraryStepSchema,
} from './dto/procedure-library-step.dto';
import { ProcedureLibraryStepEntity } from './entities/maintenance-procedure-library-step.entity';
import { ProcedureStepService } from './procedure-step.service';

@Crud({
  model: {
    type: ProcedureLibraryStepEntity,
  },
  dto: {
    create: CreateProcedureLibraryStepDto,
  },
  query: {
    alwaysPaginate: true,
    exclude: ['tenantId'],
    maxLimit: ENDPOINT_RESULT_QUERY_LIMIT,
    cache: ENDPOINT_QUERY_CACHE_TIME,
    join: {
      tags: { eager: true },
    },
    sort: [
      {
        field: 'name',
        order: 'ASC',
      },
    ],
  },
  params: {
    id: {
      field: 'id',
      type: 'uuid',
      primary: true,
    },
  },
  routes: {
    only: ['createOneBase', 'getOneBase', 'getManyBase', 'replaceOneBase', 'deleteOneBase'],
    getOneBase: {
      decorators: [ApiOkResponse({ type: getResponseFor(ProcedureLibraryStepEntity) })],
    },
    getManyBase: {
      decorators: [ApiOkResponse({ type: getResponseForMany(ProcedureLibraryStepEntity) })],
    },
  },
  serialize: {
    // https://github.com/nestjsx/crud/issues/525
    // https://github.com/nestjsx/crud/pull/526
    getMany: ProcedureLibraryStepEntity,
  },
})
@ApiTags('Maintenance procedure steps controller')
@TenantIdAutoFilter()
@Controller('procedure-steps')
export class ProcedureStepController implements CrudController<ProcedureLibraryStepEntity> {
  constructor(public service: ProcedureStepService) {}

  @Override('createOneBase')
  @ApiResponse({
    status: 201,
    type: ProcedureLibraryStepEntity,
  })
  async createOne(
    @Req() req: Request,
    @ParsedRequest() crudReq: CrudRequest,
    @Body(
      new JoiPipe(CreateProcedureLibraryStepSchema, {
        defaultValidationOptions: { allowUnknown: false },
      }),
    )
    dto: CreateProcedureLibraryStepDto,
  ): Promise<ProcedureLibraryStepEntity> {
    // Additional schema validation we cannot do with the original pipe.
    LIBRARY_STEP_VALIDATION_PIPES[dto.type].transform(dto, { type: 'body' });
    return this.service.createStep(req.auth, dto);
  }

  @Override('replaceOneBase')
  @ApiResponse({
    status: 201,
    type: ProcedureLibraryStepEntity,
  })
  async updateOne(
    @Req() req: Request,
    @ParsedRequest() crudReq: CrudRequest,
    @Param('id') id: string,
    @Body(
      new JoiPipe(UpdateProcedureLibraryStepSchema, {
        defaultValidationOptions: { allowUnknown: false },
      }),
    )
    dto: UpdateProcedureLibraryStepDto,
  ): Promise<ProcedureLibraryStepEntity> {
    const { type } = await this.service.getOne(crudReq);
    // Additional schema validation we cannot do with the original pipe.
    // Keeping the original type of the step
    LIBRARY_STEP_VALIDATION_PIPES[type].transform({ ...dto, type }, { type: 'body' });
    return this.service.updateStep(req.auth, id, dto);
  }

  @Override('deleteOneBase')
  @ApiResponse({ status: 204 })
  async deleteOne(@Req() req: Request, @Param('id') id: string): Promise<void> {
    await this.service.deleteStep(req.auth, id);
  }
}
