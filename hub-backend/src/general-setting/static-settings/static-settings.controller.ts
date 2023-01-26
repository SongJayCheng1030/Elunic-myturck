import { Controller, Get, Param, Query } from '@nestjs/common';
import Joi = require('joi');
import { asResponse } from 'shared/backend';

import { StaticSettingsService } from './static-settings.service';

// TODO: FIXME remove v1 and make global for the service
@Controller('v1/static-settings')
export class StaticSettingsController {
  constructor(private readonly staticSettingsService: StaticSettingsService) {}

  @Get(':settingsKey')
  async getSetting(@Param('settingsKey') key: string, @Query('try') tryToGet: string) {
    Joi.assert(key, Joi.string().min(2).max(42));
    if (['1', 'on', 'true', 'yes', 'y'].includes(tryToGet)) {
      try {
        return asResponse(await this.staticSettingsService.getByKey(key));
      } catch (ex) {
        // Ignore the error
        return asResponse({}, { hasError: true });
      }
    } else {
      return asResponse(await this.staticSettingsService.getByKey(key));
    }
  }
}
