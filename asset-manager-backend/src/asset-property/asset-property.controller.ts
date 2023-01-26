import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JoiPipe } from 'nestjs-joi';
import { asResponse, DataResponse } from 'shared/nestjs';

import { AssetPropertyService } from './asset-property.service';
import {
  CreatePropertyDefReqClassDto,
  CreatePropertyDefReqSchema,
} from './dto/CreatePropertyDefReqDto';
import { UnitedPropertyDto } from './dto/UnitedPropertyDto';
import {
  UpdatePropertyDefReqClassDto,
  UpdatePropertyDefReqSchema,
} from './dto/UpdatePropertyDefReqDto';
import {
  UpdatePropertyValReqClassDto,
  UpdatePropertyValReqSchema,
} from './dto/UpdatePropertyValReqDto';
import { performVariableSubstitution } from './property-variable-substitution';

@Controller('properties')
@ApiTags('Asset Properties Controller')
export class AssetPropertyController {
  constructor(private readonly propService: AssetPropertyService) {}

  // ------------------------------------------------------------------
  // ------ ASET TYPES ------------------------------------------------
  // ------------------------------------------------------------------

  @Get('/asset-type/:assetTypeId')
  @ApiOperation({ summary: 'Get Properties for Asset Type by assetTypeId' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'Properties for Asset Type is provided',
    type: UnitedPropertyDto,
    isArray: true,
  })
  @ApiParam({ name: 'assetTypeId', type: String })
  async getPropertiesForAssetType(
    @Param('assetTypeId') assetTypeId: string,
    @Req() rawRequest: Request,
  ): Promise<DataResponse<UnitedPropertyDto[]>> {
    const props = await this.propService.getPropertiesByAssetTypeId(rawRequest.auth, assetTypeId);
    return asResponse(performVariableSubstitution(props));
  }

  @Post('/asset-type/:assetTypeId')
  @ApiOperation({ summary: 'Create Properties for Asset Type by assetTypeId' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid params' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({
    status: 201,
    description: 'Properties for Asset Type is created',
    type: UnitedPropertyDto,
  })
  @ApiParam({ name: 'assetTypeId', type: String })
  async createProperty(
    @Param('assetTypeId') assetTypeId: string,
    @Body(new JoiPipe(CreatePropertyDefReqSchema)) data: CreatePropertyDefReqClassDto,
    @Req() rawRequest: Request,
  ): Promise<DataResponse<UnitedPropertyDto>> {
    const prop = await this.propService.createProperty(rawRequest.auth, data, assetTypeId);
    return asResponse(prop);
  }

  @Patch(':propertyId/asset-type/:assetTypeId')
  @ApiOperation({ summary: 'Update Property for Asset Type by assetTypeId and propertyId' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Invalid params' })
  @ApiResponse({
    status: 200,
    description: 'Property for Asset Type is updated',
    type: UnitedPropertyDto,
  })
  @ApiParam({ name: 'assetTypeId', type: String })
  @ApiParam({ name: 'propertyId', type: String })
  async updatePropertyIdByAssetTypeId(
    @Param('propertyId') propertyId: string,
    @Param('assetTypeId') assetTypeId: string,
    @Body(new JoiPipe(UpdatePropertyDefReqSchema)) data: UpdatePropertyDefReqClassDto,
    @Req() rawRequest: Request,
  ): Promise<DataResponse<UnitedPropertyDto>> {
    const prop = await this.propService.patchPropertyByIdAndAssetTypeId(
      rawRequest.auth,
      propertyId,
      assetTypeId,
      data,
    );
    return asResponse(prop);
  }

  @Delete(':propertyId/asset-type/:assetTypeId')
  @ApiOperation({ summary: 'Delete Property for Asset Type by assetTypeId and propertyId' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'Property for Asset Type is deleted',
  })
  @ApiParam({ name: 'assetTypeId', type: String })
  @ApiParam({ name: 'propertyId', type: String })
  async deletePropertyByAssetType(
    @Param('propertyId') propertyId: string,
    @Param('assetTypeId') assetTypeId: string,
    @Req() rawRequest: Request,
  ): Promise<void> {
    await this.propService.deletePropertyDefinitionByIdAndAssetTypeId(
      rawRequest.auth,
      propertyId,
      assetTypeId,
    );
  }

  // ------------------------------------------------------------------
  // ------ ASET ------------------------------------------------------
  // ------------------------------------------------------------------

  @Get('/asset/:assetId')
  @ApiOperation({ summary: 'Get Properties for Asset by assetId' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'Properties for Asset is provided',
    type: UnitedPropertyDto,
    isArray: true,
  })
  @ApiParam({ name: 'assetId', type: String })
  async getPropertiesForAssetById(
    @Param('assetId') assetId: string,
    @Query('filterKey') filterKey: string | undefined | null,
    @Query('filterType') filterType: string | undefined | null,
    @Req() rawRequest: Request,
  ) {
    const props = await this.propService.getPropertiesByAssetId(rawRequest.auth, assetId);
    return asResponse(performVariableSubstitution(props));
  }

  @Patch(':propertyId/asset/:assetId')
  @ApiOperation({ summary: 'Update Property for Asset by assetId and propertyId' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Invalid params' })
  @ApiResponse({
    status: 200,
    description: 'Property for Asset is updated',
    type: UnitedPropertyDto,
  })
  @ApiParam({ name: 'assetId', type: String })
  @ApiParam({ name: 'propertyId', type: String })
  async updatePropertyForAssetById(
    @Param('propertyId') propertyId: string,
    @Param('assetId') assetId: string,
    @Body(new JoiPipe(UpdatePropertyValReqSchema)) data: UpdatePropertyValReqClassDto,
    @Req() rawRequest: Request,
  ) {
    const prop = await this.propService.patchPropertyByIdAndAssetId(
      rawRequest.auth,
      propertyId,
      assetId,
      data,
    );
    return asResponse(prop);
  }

  @Delete(':propertyId/asset/:assetId')
  @ApiOperation({ summary: 'Delete Property for Asset by assetId and propertyId' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'Property for Asset is deleted',
  })
  @ApiParam({ name: 'assetId', type: String })
  @ApiParam({ name: 'propertyId', type: String })
  async deletePropertyForAssetById(
    @Param('propertyId') propertyId: string,
    @Param('assetId') assetId: string,
    @Req() rawRequest: Request,
  ) {
    await this.propService.deletePropertyOverwriteByIdAndAssetId(
      rawRequest.auth,
      propertyId,
      assetId,
    );
  }
}
