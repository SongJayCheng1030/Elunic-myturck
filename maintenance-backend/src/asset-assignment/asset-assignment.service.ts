import { LogService } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthInfo } from 'shared/common/types';
import { SharedAssetService } from 'shared/nestjs/services/shared-asset.service';
import { EntityNotFoundError, IsNull, Repository } from 'typeorm';

import { ExecutionService } from '../maintenance-execution/maintenance-execution.service';
import { FindAssignmentOfProcedureParams } from '../maintenance-procedure/dto/assignment.dto';
import { ProcedureEntity } from '../maintenance-procedure/entities/maintenance-procedure.entity';
import { AssetAssignmentEntity } from './entities/asset-assignment.entity';

export interface AssetAssignmentFindOptions {
  assetId?: string;
  procedureId?: string;
}

@Injectable()
export class AssetAssignmentService {
  constructor(
    @InjectRepository(AssetAssignmentEntity)
    private assignmentRepo: Repository<AssetAssignmentEntity>,
    @InjectRepository(ProcedureEntity)
    private procedureRepo: Repository<ProcedureEntity>,
    @InjectLogger(AssetAssignmentService.name) private readonly logger: LogService,
    private executionService: ExecutionService,
    private assetService: SharedAssetService,
  ) {}

  async getMany(
    authInfo: AuthInfo,
    opts: AssetAssignmentFindOptions,
  ): Promise<AssetAssignmentEntity[]> {
    return this.assignmentRepo.find({
      where: {
        tenantId: authInfo.tenantId,
        ...(opts.procedureId
          ? { procedure: await this.getCurrentProcedure(authInfo, opts.procedureId) }
          : {}),
        ...(opts.assetId ? { assetId: opts.assetId } : {}),
        active: true,
      },
      relations: ['procedure', 'procedure.root'],
    });
  }

  async getOne(
    authInfo: AuthInfo,
    { assetId, id }: FindAssignmentOfProcedureParams,
  ): Promise<AssetAssignmentEntity> {
    const assignment = await this.assignmentRepo.findOneOrFail(
      {
        assetId,
        procedure: await this.getCurrentProcedure(authInfo, id),
        tenantId: authInfo.tenantId,
      },
      { relations: ['procedure', 'procedure.root'] },
    );
    return assignment;
  }

  async create(
    authInfo: AuthInfo,
    { assetId, id }: FindAssignmentOfProcedureParams,
  ): Promise<AssetAssignmentEntity> {
    const [asset, procedure] = await Promise.all([
      this.assetService.getById(authInfo, assetId),
      this.getCurrentProcedure(authInfo, id),
    ]);

    if (asset.assetType.id !== procedure.assetTypeId) {
      throw new BadRequestException(`Asset must have type "${procedure.assetTypeId}"`);
    }

    const assignment = await this.assignmentRepo.save({
      assetId: asset.id,
      procedure,
      tenantId: authInfo.tenantId,
      active: true,
    });

    await this.executionService.scheduleNextExecution(authInfo, assignment);

    return this.assignmentRepo.findOneOrFail(assignment.id, {
      relations: ['procedure', 'procedure.root'],
    });
  }

  async delete(
    authInfo: AuthInfo,
    { assetId, id }: FindAssignmentOfProcedureParams,
  ): Promise<void> {
    const procedure = await this.procedureRepo.findOneOrFail({
      id,
      tenantId: authInfo.tenantId,
    });

    await this.assignmentRepo.delete({
      assetId,
      procedure,
      tenantId: authInfo.tenantId,
    });
  }

  async createOrActivate(
    authInfo: AuthInfo,
    dto: FindAssignmentOfProcedureParams,
  ): Promise<AssetAssignmentEntity> {
    const assignment = await this.getOne(authInfo, dto).catch(e => {
      if (e instanceof EntityNotFoundError) {
        return null;
      }
      throw e;
    });

    if (assignment) {
      await this.activate(assignment);
      assignment.active = true;
      await this.executionService.scheduleNextExecution(authInfo, assignment);
      return this.getOne(authInfo, dto);
    }

    return this.create(authInfo, dto);
  }

  async deactivate(authInfo: AuthInfo, dto: FindAssignmentOfProcedureParams): Promise<void> {
    const assignment = await this.getOne(authInfo, dto);
    if (!assignment.active) {
      throw new BadRequestException('Assignment already deactivated');
    }

    await this.assignmentRepo.update(assignment.id, { active: false });
  }

  private async activate(assignment: AssetAssignmentEntity): Promise<void> {
    if (assignment.active) {
      throw new BadRequestException('Assignment already activated');
    }

    await this.assignmentRepo.update(assignment.id, { active: true });
  }

  private async getCurrentProcedure(authInfo: AuthInfo, id: string): Promise<ProcedureEntity> {
    const [root, current] = await Promise.all([
      this.procedureRepo.findOneOrFail({
        where: { id, tenantId: authInfo.tenantId, root: IsNull() },
      }),
      this.procedureRepo.findOne({
        tenantId: authInfo.tenantId,
        root: { id },
        outdatedSince: IsNull(),
      }),
    ]);

    return current || root;
  }
}
