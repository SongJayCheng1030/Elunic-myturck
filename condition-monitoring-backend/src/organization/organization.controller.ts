import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { asResponse } from 'shared/backend';
import { DataResponse } from 'shared/nestjs';

import { OrganizationDto } from './organization.dto';
import { OrganizationService } from './organization.service';

@ApiTags('Organization')
@Controller('organizations')
export class OrganizationController {
  constructor(private readonly orgService: OrganizationService) {}

  @Get()
  async getOrgs(): Promise<DataResponse<OrganizationDto[]>> {
    const orgs = await this.orgService.getMany();
    return asResponse(orgs);
  }

  // @Post()
  // async createOrg(
  //   @Req() req: Request,
  //   @Body(new JoiPipe(CreateOrganizationSchema)) dto: CreateOrganizationDto,
  // ): Promise<DataResponse<OrganizationDto>> {
  //   const orgs = await this.orgService.createOne(req.auth, dto);
  //   return asResponse(orgs);
  // }
}
