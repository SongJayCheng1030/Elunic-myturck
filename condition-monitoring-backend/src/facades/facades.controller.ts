import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { asResponse } from 'shared/backend';

import { FacadeEntity } from './facade.entity';
import { FacadesService } from './facades.service';

@Controller('facades')
export class FacadesController {
  constructor(private readonly facadesService: FacadesService) {}

  @Get()
  async getFacades(@Req() req: Request) {
    const allFacades = await this.facadesService.findAll(req.auth);
    return asResponse(allFacades.map(f => FacadeEntity.toDto(f)));
  }
}
