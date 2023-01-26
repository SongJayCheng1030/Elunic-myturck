import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { asResponse } from 'shared/backend';

import { toExternal } from '../machine-variable/MachineVariableDto';
import { GrafanaBuildingsetService } from './grafana-buildingset.service';
import Joi = require('joi');

@Controller('gf-buildingset')
export class GrafanaBuildingsetTileController {
  constructor(private readonly grafanaBuildingsetService: GrafanaBuildingsetService) {}

  @Get(':facadeId/tiles/asset/:assetId')
  async getByAsset(
    @Req() req: Request,
    @Param('assetId') assetId: string,
    @Param('facadeId') facadeId: string,
  ) {
    try {
      Joi.assert(assetId, Joi.string().uuid());
      Joi.assert(facadeId, Joi.string().uuid());
    } catch (ex) {
      throw new BadRequestException(`AssetId and FacadeId must be a UUIDv4`);
    }

    const tiles = await this.grafanaBuildingsetService.findByAssetId(req.auth, assetId, facadeId);
    return asResponse(
      await Promise.all(
        tiles.map(async tile => {
          try {
            const tileDto = await this.grafanaBuildingsetService.toTileDto(req.auth, tile, assetId);
            return tileDto;
          } catch (e) {
            return {
              id: tile.id,
              name: tile.name,
              machineVariable: tile?.machineVariable
                ? toExternal(tile?.machineVariable)
                : undefined,
              isOnAssetType: tile.assetTypeId !== null,
              isMagicTile: false,
              gfDashboardId: '',
              gfPanelId: tile.gfPanelId,
              width: tile.widthUnits,
              height: tile.heightUnits,
              order: tile.orderIndex,
              createdAt: tile.createdAt.toISOString(),
              updatedAt: tile.updatedAt.toISOString(),
              gfEmbed: {
                url: '',
                params: [],
              },
            };
          }
        }),
      ),
    );
  }

  @Get(':facadeId/tiles/asset-type/:assetTypeId')
  async getByAssetType(
    @Req() req: Request,
    @Param('assetTypeId') assetTypeId: string,
    @Param('facadeId') facadeId: string,
  ) {
    try {
      Joi.assert(assetTypeId, Joi.string().uuid());
      Joi.assert(facadeId, Joi.string().uuid());
    } catch (ex) {
      throw new BadRequestException(`AssetTypeId and FacadeId must be a UUIDv4`);
    }

    const tiles = await this.grafanaBuildingsetService.findByAssetTypeId(
      req.auth,
      assetTypeId,
      facadeId,
    );
    return asResponse(
      await Promise.all(
        tiles.map(async tile => {
          try {
            const tileDto = await this.grafanaBuildingsetService.toTileDto(
              req.auth,
              tile,
              assetTypeId,
            );
            return tileDto;
          } catch (e) {
            return {
              id: tile.id,
              name: tile.name,
              machineVariable: tile?.machineVariable
                ? toExternal(tile?.machineVariable)
                : undefined,
              isOnAssetType: tile.assetTypeId !== null,
              isMagicTile: false,
              gfDashboardId: '',
              gfPanelId: tile.gfPanelId,
              width: tile.widthUnits,
              height: tile.heightUnits,
              order: tile.orderIndex,
              createdAt: tile.createdAt.toISOString(),
              updatedAt: tile.updatedAt.toISOString(),
              gfEmbed: {
                url: '',
                params: [],
              },
            };
          }
        }),
      ),
    );
  }

  @Post(':facadeId/tiles/asset-type/:assetTypeId')
  async createTileByAssetTypeId(
    @Req() req: Request,
    @Param('assetTypeId') assetTypeId: string,
    @Body() data: any,
    @Param('facadeId') facadeId: string,
  ) {
    try {
      Joi.assert(assetTypeId, Joi.string().uuid());
      Joi.assert(facadeId, Joi.string().uuid());
    } catch (ex) {
      throw new BadRequestException(`AssetTypeId and FacadeId must be a UUIDv4`);
    }

    const tile = await this.grafanaBuildingsetService.createTileByAssetType(
      req.auth,
      assetTypeId,
      data,
      facadeId,
    );
    return asResponse(await this.grafanaBuildingsetService.toTileDto(req.auth, tile, assetTypeId));
  }

  @Put(':facadeId/tiles/:tileId/asset/:assetId')
  async updateTile(
    @Req() req: Request,
    @Param('assetId') assetId: string,
    @Param('tileId') tileId: string,
    @Body() data: any,
    @Param('facadeId') facadeId: string,
  ) {
    const tile = await this.grafanaBuildingsetService.updateTile(
      req.auth,
      assetId,
      tileId,
      data,
      facadeId,
    );
    return asResponse(await this.grafanaBuildingsetService.toTileDto(req.auth, tile, assetId));
  }

  @Delete(':facadeId/tiles/:tileId')
  async deleteTile(
    @Req() req: Request,
    @Param('tileId') tileId: string,
    @Param('facadeId') facadeId: string,
  ) {
    await this.grafanaBuildingsetService.deleteTileById(req.auth, tileId, facadeId);
    return {};
  }
}
