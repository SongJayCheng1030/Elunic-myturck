import { Body, Controller, Get, Put, Req } from '@nestjs/common';
import { Request } from 'express';
import { JoiPipe } from 'nestjs-joi';
import { asResponse } from 'shared/nestjs';

import { SetSettingsDto, SetSettingsDtoSchema } from './dto/SetSettingsDto';
import { SettingEntity } from './settings.entity';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings(@Req() req: Request) {
    const all = await this.settingsService.findAll(req.auth);
    return asResponse(all.map(a => SettingEntity.toExternal(a)));
  }

  @Put()
  async setSettings(
    @Body(new JoiPipe(SetSettingsDtoSchema)) data: SetSettingsDto,
    @Req() req: Request,
  ) {
    await this.settingsService.set(req.auth, data);
  }
}
