import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Crud, CrudController, Override } from '@rewiko/crud';
import { Request } from 'express';
import { JoiPipe } from 'nestjs-joi';
import { getResponseForMany, TenantIdAutoFilter } from 'shared/nestjs';

import { AssetAssignmentService } from '../asset-assignment/asset-assignment.service';
import { AssetAssignmentEntity } from '../asset-assignment/entities/asset-assignment.entity';
import { ENDPOINT_QUERY_CACHE_TIME, ENDPOINT_RESULT_QUERY_LIMIT } from '../definitions';
import {
  CreateProcedureStepDto,
  STEP_VALIDATION_PIPES,
} from '../procedure-step/dto/procedure-step.dto';
import {
  FindAssignmentOfProcedureParams,
  FindAssignmentOfProcedureParamsSchema,
} from './dto/assignment.dto';
import {
  CreateProcedureDto,
  CreateProcedureSchema,
  UpdateProcedureDto,
  UpdateProcedureSchema,
} from './dto/procedure.dto';
import { ProcedureEntity } from './entities/maintenance-procedure.entity';
import { ProcedureService } from './maintenance-procedure.service';

@Crud({
  model: {
    type: ProcedureEntity,
  },
  query: {
    alwaysPaginate: true,
    exclude: ['tenantId'],
    maxLimit: ENDPOINT_RESULT_QUERY_LIMIT,
    cache: ENDPOINT_QUERY_CACHE_TIME,
    filter: [
      {
        field: 'outdatedSince',
        operator: '$isnull',
      },
    ],
    join: {
      steps: {
        eager: true,
      },
      ['steps.parent']: {
        eager: true,
      },
      root: {
        eager: true,
      },
    },
    sort: [
      {
        field: 'steps.position',
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
    getManyBase: {
      decorators: [ApiOkResponse({ type: getResponseForMany(ProcedureEntity) })],
    },
  },
  serialize: {
    // https://github.com/nestjsx/crud/issues/525
    // https://github.com/nestjsx/crud/pull/526
    getMany: ProcedureEntity,
  },
})
@ApiExtraModels(CreateProcedureStepDto)
@ApiTags('Maintenance procedure controller')
@TenantIdAutoFilter()
@Controller('procedures')
export class ProcedureController implements CrudController<ProcedureEntity> {
  constructor(
    public service: ProcedureService,
    private assignmentService: AssetAssignmentService,
  ) {}

  @Override('getOneBase')
  async getOne(@Req() req: Request, @Param('id') id: string): Promise<ProcedureEntity> {
    return this.service.getProcedure(req.auth, id);
  }

  @Override('createOneBase')
  async createOne(
    @Body(new JoiPipe(CreateProcedureSchema, { defaultValidationOptions: { allowUnknown: false } }))
    dto: CreateProcedureDto,
    @Req() req: Request,
  ): Promise<ProcedureEntity> {
    // Additional schema validation we cannot do with the original pipe.
    for (const step of dto.steps) {
      if (typeof step !== 'string') {
        STEP_VALIDATION_PIPES[step.type].transform(step, { type: 'body' });
      }
    }
    return this.service.createProcedure(req.auth, dto);
  }

  @Override('replaceOneBase')
  async updateOne(
    @Param('id') id: string,
    @Body(new JoiPipe(UpdateProcedureSchema, { defaultValidationOptions: { allowUnknown: false } }))
    dto: UpdateProcedureDto,
    @Req() req: Request,
  ): Promise<ProcedureEntity> {
    // Additional schema validation we cannot do with the original pipe.
    for (const step of dto.steps || []) {
      if (typeof step !== 'string') {
        STEP_VALIDATION_PIPES[step.type].transform(step, { type: 'body' });
      }
    }
    return this.service.updateProcedure(req.auth, id, dto);
  }

  @Override('deleteOneBase')
  async deleteOne(@Req() req: Request, @Param('id') id: string): Promise<void> {
    await this.service.deleteProcedure(req.auth, id);
  }

  @Get(':id/assignments')
  @ApiOkResponse({ type: getResponseForMany(AssetAssignmentEntity) })
  getAssignments(@Req() req: Request, @Param('id') id: string): Promise<AssetAssignmentEntity[]> {
    return this.assignmentService.getMany(req.auth, { procedureId: id });
  }

  @Post(':id/assign/:assetId')
  @ApiOkResponse({ type: AssetAssignmentEntity })
  assign(
    @Req() req: Request,
    @Param(
      new JoiPipe(FindAssignmentOfProcedureParamsSchema, {
        defaultValidationOptions: { allowUnknown: false },
      }),
    )
    dto: FindAssignmentOfProcedureParams,
  ): Promise<AssetAssignmentEntity> {
    return this.assignmentService.createOrActivate(req.auth, dto);
  }

  @Delete(':id/unassign/:assetId')
  @ApiOkResponse({ type: AssetAssignmentEntity })
  async unassign(
    @Req() req: Request,
    @Param(
      new JoiPipe(FindAssignmentOfProcedureParamsSchema, {
        defaultValidationOptions: { allowUnknown: false },
      }),
    )
    dto: FindAssignmentOfProcedureParams,
  ): Promise<void> {
    await this.assignmentService.deactivate(req.auth, dto);
  }
}
