import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { instanceToPlain } from 'class-transformer';
import { Request } from 'express';
import { JoiPipe } from 'nestjs-joi';
import { ApiManyPaginationData, getResponseFor, getResponseForManyPagination } from 'shared/nestjs';

import { FindExecutionsQuery, FindExecutionsQuerySchema } from './dto/execution.dto';
import { CreateStepResultDto, CreateStepResultSchema } from './dto/step-result.dto';
import { ExecutionEntity } from './entities/maintenance-execution.entity';
import { ExecutionStepResultEntity } from './entities/maintenance-execution-step-result.entity';
import { ExecutionService } from './maintenance-execution.service';

@ApiTags('Maintenance execution controller')
@Controller('executions')
export class ExecutionController {
  constructor(private maintenanceExecutionService: ExecutionService) {}

  @Get('')
  @ApiOkResponse({ type: getResponseForManyPagination(ExecutionEntity) })
  async getExecutions(
    @Req() req: Request,
    @Query(
      new JoiPipe(FindExecutionsQuerySchema, { defaultValidationOptions: { allowUnknown: false } }),
    )
    dto: FindExecutionsQuery,
  ): Promise<ApiManyPaginationData<ExecutionEntity>> {
    const { result, meta } = await this.maintenanceExecutionService.getMany(req.auth, dto);
    const mapped = instanceToPlain(result) as ExecutionEntity[];
    // Reduce the payload drastically be removing the results including the value property which can get quite big.
    return {
      data: mapped.map(
        // eslint-disable-next-line unused-imports/no-unused-vars-ts
        ({ stepResults, procedureSteps, ...execution }) => execution as ExecutionEntity,
      ),
      meta,
    };
  }

  @Get(':id')
  @ApiOkResponse({ type: getResponseFor(ExecutionEntity) })
  async getExecution(@Req() req: Request, @Param('id') id: string): Promise<ExecutionEntity> {
    return this.maintenanceExecutionService.getOne(req.auth, id);
  }

  @Post(':id/steps/:stepId')
  @ApiOkResponse({ type: getResponseFor(ExecutionStepResultEntity) })
  async createCheckStepResult(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('stepId') stepId: string,
    @Body(
      new JoiPipe(CreateStepResultSchema, { defaultValidationOptions: { allowUnknown: false } }),
    )
    dto: CreateStepResultDto,
  ): Promise<ExecutionStepResultEntity> {
    return this.maintenanceExecutionService.upsertStep(req.auth, id, stepId, dto);
  }

  @Post(':id/complete')
  @ApiOkResponse({ type: getResponseFor(ExecutionEntity) })
  completeExecution(@Req() req: Request, @Param('id') id: string): Promise<ExecutionEntity> {
    return this.maintenanceExecutionService.setComplete(req.auth, id);
  }
}
