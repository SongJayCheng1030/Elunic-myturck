import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { JoiPipe } from 'nestjs-joi';
import { asResponse, DataResponse, getResponseFor } from 'shared/nestjs';

import { PostGeneralSettingsDto, PutGeneralSettingsDtoSchema } from './dto/PostGeneralSettingsDto';
import { GeneralEntity } from './general.entity';
import { GeneralService } from './general.service';

@Controller('general')
export class GeneralController {
  constructor(private readonly generalService: GeneralService) {}

  @Get('')
  @ApiResponse({ type: getResponseFor(GeneralEntity) })
  async getGeneralSetting(@Req() req: Request): Promise<DataResponse<GeneralEntity[]>> {
    let generalSettings = await this.generalService.getGeneralSettings(req.auth);
    if (!generalSettings || generalSettings.length === 0) {
      generalSettings = await this.generalService.createGeneralSetting(req.auth, [
        {
          key: 'primaryColor',
          value: '#B60025',
        },
        {
          key: 'bgColor',
          value: '#efefef',
        },
        {
          key: 'light',
          value: 'false',
        },
        {
          key: 'bgImage',
          value: '',
        },
        {
          key: 'logoImage',
          value: '',
        },
      ]);
    }

    if (!generalSettings.find(setting => setting.key === 'logoImage')) {
      generalSettings = await this.generalService.createGeneralSetting(req.auth, [
        { key: 'logoImage', value: '' },
      ]);
    }

    return asResponse(generalSettings);
  }

  @Post('/')
  @ApiResponse({ type: getResponseFor(GeneralEntity) })
  async postGeneralSetting(
    @Req() req: Request,
    @Body(new JoiPipe(PutGeneralSettingsDtoSchema)) generalSettingsDto: PostGeneralSettingsDto[],
  ): Promise<DataResponse<GeneralEntity[]>> {
    const generalSettings = await this.generalService.createGeneralSetting(
      req.auth,
      generalSettingsDto,
    );
    return asResponse(generalSettings);
  }

  // @Put('/:generalSettingId')
  // @ApiResponse({ type: getResponseFor(GeneralEntity) })
  // async putGeneralSetting(
  //     @Param('generalSettingId' ) generalSettingId: number,
  //     @Body(new JoiPipe(PostGeneralSettingsDtoSchema)) generalSettingsDto: PostGeneralSettingsDto[],
  // ): Promise<DataResponse<GeneralEntity[]>> {
  //     const generalSettings = await this.generalService.updateGeneralSetting(generalSettingsDto);

  //     return asResponse(generalSettings);
  // }
}
