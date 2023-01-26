import { Body, Controller, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Crud, CrudController, Override } from '@rewiko/crud';
import { JoiPipe } from 'nestjs-joi';
import { TenantIdAutoFilter } from 'shared/nestjs';

import {
  ENDPOINT_QUERY_CACHE_TIME,
  ENDPOINT_RESULT_DEFAULT_QUERY_ITEMS,
  ENDPOINT_RESULT_QUERY_LIMIT,
} from '../definitions';
import {
  UpdateVariableDtoClassRequest,
  UpdateVariableDtoRequestSchema,
} from './dto/update-variable';
import { MachineVariableEntity } from './machine-variable.entity';
import { MachineVariableService } from './machine-variable.service';

@Crud({
  model: {
    type: MachineVariableEntity,
  },
  query: {
    alwaysPaginate: true,
    limit: ENDPOINT_RESULT_DEFAULT_QUERY_ITEMS,
    maxLimit: ENDPOINT_RESULT_QUERY_LIMIT,
    cache: ENDPOINT_QUERY_CACHE_TIME,
    filter: {},
  },
  params: {
    id: {
      field: 'id',
      type: 'uuid',
      primary: true,
    },
  },
  validation: false,
  routes: {
    only: ['createOneBase', 'deleteOneBase', 'replaceOneBase', 'getManyBase', 'getOneBase'],
  },
})
@TenantIdAutoFilter()
@Controller('machine-variables')
@ApiTags('Machine Variable Controller')
export class MachineVariableController implements CrudController<MachineVariableEntity> {
  constructor(public service: MachineVariableService) {}

  @Override('replaceOneBase')
  @ApiOperation({ summary: 'Update Variable' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid params' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'Variable is updated',
  })
  @ApiParam({ name: 'id', type: String })
  async updateVariable(
    @Body(new JoiPipe(UpdateVariableDtoRequestSchema)) dto: UpdateVariableDtoClassRequest,
    @Param('id') id: string,
  ) {
    const result = await this.service.updateMachineVariable(id, dto);

    return result;
  }
}
