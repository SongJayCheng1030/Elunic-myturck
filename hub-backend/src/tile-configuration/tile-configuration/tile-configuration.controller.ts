import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { JoiPipe } from 'nestjs-joi';
import { asResponse, DataResponse, getResponseFor } from 'shared/nestjs';

import {
  PostTileConfigurationDto,
  PostTileConfigurationDtoSchema,
} from './dto/PostTileConfiguration';
import { TileConfigurationEntity } from './tile-configuration.entity';
import { TileConfigurationService } from './tile-configuration.service';

@Controller('tile-configuration')
export class TileConfigurationController {
  constructor(private readonly tileConfigurationService: TileConfigurationService) {}

  @Get()
  @ApiResponse({ type: getResponseFor(TileConfigurationEntity) })
  async getTileConfiguration(
    @Req() req: Request,
  ): Promise<DataResponse<TileConfigurationEntity[]>> {
    const tileConfiguration = await this.tileConfigurationService.getTileConfigurations(req.auth);
    return asResponse(tileConfiguration);
  }

  @Get(':id')
  @ApiResponse({ type: getResponseFor(TileConfigurationEntity) })
  async getTileConfigurationById(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<DataResponse<TileConfigurationEntity>> {
    const tileConfiguration = await this.tileConfigurationService.getTileConfigurationById(
      req.auth,
      id,
    );
    if (!tileConfiguration) {
      throw new NotFoundException(`Tile Configuration ${id} not found`);
    }

    return asResponse(tileConfiguration);
  }

  @Post('/')
  @ApiResponse({ type: getResponseFor(TileConfigurationEntity) })
  async postTileConfiguration(
    @Req() req: Request,
    @Body(new JoiPipe(PostTileConfigurationDtoSchema))
    tileConfigurationsDto: PostTileConfigurationDto,
  ): Promise<DataResponse<TileConfigurationEntity>> {
    const tileConfiguration = await this.tileConfigurationService.createTileConfiguration(
      req.auth,
      {
        tileName: tileConfigurationsDto.tileName,
        desc: tileConfigurationsDto.desc,
        appUrl: tileConfigurationsDto.appUrl,
        iconUrl: tileConfigurationsDto.iconUrl,
        tileColor: tileConfigurationsDto.tileColor,
        tileTextColor: tileConfigurationsDto.tileTextColor,
        order: tileConfigurationsDto.order,
        show: tileConfigurationsDto.show,
        integratedView: tileConfigurationsDto.integratedView,
      },
    );

    return asResponse(tileConfiguration);
  }

  @Put('/change-position')
  @ApiResponse({ type: getResponseFor(TileConfigurationEntity) })
  async changePositionGeneralSetting(
    @Req() req: Request,
    @Body()
    { fromId, toId }: { fromId: number; toId: number },
  ): Promise<DataResponse<TileConfigurationEntity>> {
    const tileConfigurations = await this.tileConfigurationService.changePosition(
      req.auth,
      fromId,
      toId,
    );

    return asResponse(tileConfigurations);
  }

  @Put('/:tileConfigurationId')
  @ApiResponse({ type: getResponseFor(TileConfigurationEntity) })
  async putGeneralSetting(
    @Req() req: Request,
    @Param('tileConfigurationId')
    tileConfigurationId: number,
    @Body(new JoiPipe(PostTileConfigurationDtoSchema))
    tileConfigurationsDto: PostTileConfigurationDto,
  ): Promise<DataResponse<TileConfigurationEntity>> {
    const tileConfigurations = await this.tileConfigurationService.updateTileConfiguration(
      req.auth,
      tileConfigurationId,
      tileConfigurationsDto,
    );

    return asResponse(tileConfigurations);
  }

  @Delete('/:tileConfigurationId')
  @ApiResponse({ type: getResponseFor(TileConfigurationEntity) })
  async deletePositionGeneralSetting(
    @Req() req: Request,
    @Param('tileConfigurationId')
    tileConfigurationId: number,
  ): Promise<DataResponse<boolean>> {
    const tileConfigurations = await this.tileConfigurationService.deleteTileConfiguration(
      req.auth,
      tileConfigurationId,
    );

    return asResponse(tileConfigurations);
  }
}
