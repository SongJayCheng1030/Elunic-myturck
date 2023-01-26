import { Controller } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@rewiko/crud';
import {
  ApiPaginationMeta,
  asResponse,
  DataResponse,
  getDataResponseForCrudMany,
} from 'shared/nestjs';

import {
  ENDPOINT_QUERY_CACHE_TIME,
  ENDPOINT_RESULT_DEFAULT_QUERY_ITEMS,
  ENDPOINT_RESULT_QUERY_LIMIT,
} from '../definitions';
import { MachineAlertEntity } from './machine-alert.entity';
import { MachineAlertService } from './machine-alert.service';
import { MachineAlertClassDto, MachineAlertDto, toExternal } from './MachineAlertDto';

@Crud({
  model: {
    type: MachineAlertEntity,
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
    only: ['createOneBase', 'deleteOneBase', 'getManyBase', 'getOneBase'],
  },
})
@Controller('machine-alert')
// @TenantIdAutoFilter()
@ApiTags('Machine Alert Controller')
export class MachineAlertController implements CrudController<MachineAlertEntity> {
  constructor(public service: MachineAlertService) {}

  get base(): CrudController<MachineAlertEntity> {
    return this;
  }

  @Override()
  @ApiOperation({ summary: 'Get Machine Alert' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({
    status: 200,
    description: 'Machine Alert are provided',
    type: MachineAlertClassDto,
    isArray: true,
  })
  async getMany(
    @ParsedRequest() req: CrudRequest,
  ): Promise<DataResponse<MachineAlertDto[], ApiPaginationMeta>> {
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    const ret = await this.base.getManyBase!(req);
    return getDataResponseForCrudMany<MachineAlertEntity, MachineAlertDto>(ret, toExternal);
  }

  @Override()
  @ApiOperation({ summary: 'Get Machine Alert by id' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'The Machine Alert is provided',
    type: MachineAlertClassDto,
  })
  @ApiParam({ name: 'id', type: String })
  async getOne(@ParsedRequest() req: CrudRequest): Promise<DataResponse<MachineAlertDto>> {
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    const result = await this.base.getOneBase!(req);
    return asResponse(toExternal(result));
  }
}
