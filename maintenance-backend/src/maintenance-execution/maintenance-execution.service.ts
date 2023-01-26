import { LogService } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import {
  ExecutionState,
  MAINTENANCE_INTERVAL_CALCULATION_SETTING_KEY,
  MAINTENANCE_INTERVAL_SETTING,
  StepResultStatus,
} from 'shared/common/models';
import { AuthInfo } from 'shared/common/types';
import { DataResponse, ResponsePagingMeta, SharedApiService, SharedService } from 'shared/nestjs';
import { EntityManager, In, IsNull, LessThan, Not, Repository } from 'typeorm';
import NodeCache = require('node-cache');

import { AssetAssignmentEntity } from '../asset-assignment/entities/asset-assignment.entity';
import { ProcedureStepEntity } from '../procedure-step/entities/maintenance-procedure-step.entity';
import { FindExecutionsQuery } from './dto/execution.dto';
import { CreateStepResultDto } from './dto/step-result.dto';
import { ExecutionEntity } from './entities/maintenance-execution.entity';
import { ExecutionStepResultEntity } from './entities/maintenance-execution-step-result.entity';

const DUE_SOON_THRESHOLD_HOURS = 24;
// 10 minutes in seconds
const INTERVAL_SETTINGS_CACHE_TTL = 600;

@Injectable()
export class ExecutionService implements OnModuleInit {
  private intervalSettingsCache: NodeCache;

  constructor(
    @InjectRepository(ExecutionEntity)
    private readonly executionRepo: Repository<ExecutionEntity>,
    @InjectEntityManager() private entityManager: EntityManager,
    @InjectLogger(ExecutionService.name) private readonly logger: LogService,
    private readonly apiService: SharedApiService,
  ) {
    this.intervalSettingsCache = new NodeCache({ stdTTL: INTERVAL_SETTINGS_CACHE_TTL });
  }

  async onModuleInit() {
    await this.updateExecutionStates();
    await this.checkOverDueExecutions();
  }

  async getMany(
    { tenantId }: AuthInfo,
    { assetId, completed, limit, page }: FindExecutionsQuery,
  ): Promise<{ result: ExecutionEntity[]; meta: ResponsePagingMeta }> {
    const [result, total] = await this.executionRepo.findAndCount({
      where: {
        tenantId,
        ...(typeof completed === 'boolean'
          ? { completedAt: completed ? Not(IsNull()) : IsNull() }
          : {}),
        ...(assetId
          ? { assignment: { assetId: Array.isArray(assetId) ? In(assetId) : assetId } }
          : {}),
      },
      order: {
        updatedAt: 'DESC',
      },
      take: limit,
      skip: (page - 1) * limit,
      relations: [
        'assignment',
        'assignment.procedure',
        'assignment.procedure.steps',
        'assignment.procedure.steps.parent',
        'stepResults',
        'stepResults.step',
      ],
    });

    return {
      result,
      meta: {
        page,
        pageCount: Math.ceil(total / limit),
        total,
        count: result.length,
      },
    };
  }

  async getOne({ tenantId }: AuthInfo, id: string): Promise<ExecutionEntity> {
    return this.executionRepo.findOneOrFail({
      where: {
        id,
        tenantId,
      },
      relations: [
        'assignment',
        'assignment.procedure',
        'assignment.procedure.root',
        'assignment.procedure.root.derivatives',
        'assignment.procedure.steps',
        'assignment.procedure.steps.parent',
        'stepResults',
        'stepResults.step',
      ],
    });
  }

  async setComplete(auth: AuthInfo, id: string): Promise<ExecutionEntity> {
    return this.entityManager.transaction(async manager => {
      const repo = manager.getRepository(ExecutionEntity);
      const procedureStepRepo = manager.getRepository(ProcedureStepEntity);

      const execution = await repo.findOneOrFail(
        { id, tenantId: auth.tenantId },
        {
          relations: ['assignment', 'assignment.procedure', 'stepResults', 'stepResults.step'],
        },
      );

      if (execution.completedAt) {
        throw new BadRequestException('Execution already completed');
      }

      // Enable if needed.
      // if (execution.dueDate.getTime() > Date.now()) {
      //   throw new BadRequestException('Maintenance not due yet');
      // }

      const steps = await procedureStepRepo.find({
        tenantId: auth.tenantId,
        procedure: execution.assignment.procedure,
      });

      const mandatorySteps = steps.filter(s => s.mandatory);

      // Check if all mandatory steps are executed.
      for (const step of mandatorySteps) {
        const result = execution.stepResults
          .filter(s => s.status === StepResultStatus.OK || s.status === StepResultStatus.ERROR)
          .find(s => s.step.id === step.id);
        if (!result) {
          throw new BadRequestException(`Step "${step.name}" has not been completed`);
        }
      }

      const maintenanceCompleted = execution.stepResults.find(
        s => s.status !== StepResultStatus.SKIPPED,
      );

      // Update execution state depending if steps were skipped
      await repo.update(
        { id, tenantId: auth.tenantId },
        {
          completedAt: new Date(),
          completedBy: auth.id,
          state: maintenanceCompleted
            ? ExecutionState.COMPLETED
            : ExecutionState.PARTIALLY_COMPLETED,
        },
      );
      await this.scheduleNextExecution(auth, execution.assignment, execution, manager);
      return repo.findOneOrFail(execution.id, {
        relations: [
          'assignment',
          'assignment.procedure',
          'assignment.procedure.steps',
          'assignment.procedure.steps.parent',
          'stepResults',
          'stepResults.step',
        ],
      });
    });
  }

  async upsertStep(
    { tenantId }: AuthInfo,
    id: string,
    stepId: string,
    { value, status }: CreateStepResultDto,
  ): Promise<ExecutionStepResultEntity> {
    return this.entityManager.transaction(async manager => {
      const executionStepResultRepo = manager.getRepository(ExecutionStepResultEntity);

      const existing = await executionStepResultRepo.findOne({
        where: {
          tenantId,
          step: { id: stepId },
          execution: { id },
        },
        relations: ['step', 'execution'],
      });
      if (existing) {
        await executionStepResultRepo.update(existing.id, {
          value,
          status,
        });
        return executionStepResultRepo.findOneOrFail({
          where: { id: existing.id },
          relations: ['step', 'execution'],
        });
      }

      const procedureStepRepo = manager.getRepository(ProcedureStepEntity);
      const executionRepo = manager.getRepository(ExecutionEntity);

      const step = await procedureStepRepo.findOneOrFail({ id: stepId, tenantId });
      const execution = await executionRepo.findOneOrFail({ id, tenantId });

      const created = await executionStepResultRepo.save({
        tenantId,
        execution,
        step,
        value,
        status,
      });

      return executionStepResultRepo.findOneOrFail({
        where: { id: created.id },
        relations: ['step', 'execution'],
      });
    });
  }

  async scheduleNextExecution(
    auth: AuthInfo,
    assignment: AssetAssignmentEntity,
    previousExecution?: ExecutionEntity,
    manager?: EntityManager,
  ): Promise<void> {
    if (
      !assignment.active ||
      assignment.outdated ||
      (previousExecution && !previousExecution.latestExecution)
    ) {
      return;
    }

    let dueDate: Date;
    const { interval, intervalUnit } = assignment.procedure;

    if ((await this.tenantHasStrictInterval(auth.tenantId)) && previousExecution) {
      dueDate = moment(previousExecution?.dueDate)
        .add(interval, intervalUnit)
        .toDate();
    } else {
      dueDate = moment()
        .add(interval, intervalUnit)
        .toDate();
    }

    const func = async (m: EntityManager) => {
      const repo = m.getRepository(ExecutionEntity);

      const { id } = await repo.save({
        tenantId: auth.tenantId,
        assignment,
        dueDate,
        latestExecution: true,
      });
      const execution = await repo.findOneOrFail(id, {
        relations: ['assignment', 'assignment.procedure'],
      });

      const state = this.executionStateForExecution(execution);

      if (previousExecution) {
        await repo.update(previousExecution.id, { latestExecution: false });
      }

      await repo.update(id, { state });
    };

    return manager ? func(manager) : this.entityManager.transaction(m => func(m));
  }

  @Cron('*/30 * * * *')
  private async updateExecutionStates() {
    const now = new Date();
    try {
      await this.entityManager.transaction(async manager => {
        const repo = manager.getRepository(ExecutionEntity);
        await this.updateExecutionsByState(
          repo,
          now,
          ExecutionState.OPEN,
          ExecutionState.DUE_SOON,
          DUE_SOON_THRESHOLD_HOURS,
        );
        await this.updateExecutionsByState(
          repo,
          now,
          ExecutionState.DUE_SOON,
          ExecutionState.OVER_DUE,
          0,
        );
      });
    } catch (e) {
      this.logger.error('Could not update execution states', e);
    }
  }

  private async updateExecutionsByState(
    repo: Repository<ExecutionEntity>,
    now: Date,
    state: ExecutionState,
    nextState: ExecutionState,
    threshold: number,
  ) {
    const executions = await repo.find({
      where: { state },
      relations: ['assignment', 'assignment.procedure'],
    });
    const updates = executions.filter(e => moment(e.dueDate).diff(now, 'hours') < threshold);

    if (updates.length) {
      await repo
        .createQueryBuilder()
        .update()
        .set({ state: nextState })
        .where({ id: In(updates.map(e => e.id)) })
        .execute();
    }
  }

  @Cron('*/30 * * * *')
  private async checkOverDueExecutions() {
    const now = new Date();
    const executions = await this.executionRepo.find({
      where: {
        dueDate: LessThan(now),
        latestExecution: true,
      },
      relations: ['assignment', 'assignment.procedure'],
    });

    await executions.forEach(async execution => {
      try {
        await this.createExecutionWhenStrictInterval(execution);
      } catch (e) {
        this.logger.error(
          `Error creating new execution for due execution with ID ${execution.id}`,
          e,
        );
      }
    });
  }

  private async createExecutionWhenStrictInterval(execution: ExecutionEntity): Promise<void> {
    if (!execution.assignment.active || execution.assignment.outdated) {
      return;
    }

    if (await this.tenantHasStrictInterval(execution.tenantId)) {
      const { interval, intervalUnit } = execution.assignment.procedure;

      const dueDate = moment(execution.dueDate)
        .add(interval, intervalUnit)
        .toDate();
      await this.entityManager.transaction(async manager => {
        const repo = manager.getRepository(ExecutionEntity);
        repo.update(execution.id, { latestExecution: false });

        const newExecution = await repo.save({
          tenantId: execution.tenantId,
          assignment: execution.assignment,
          dueDate,
          latestExecution: true,
        });

        const state = this.executionStateForExecution(newExecution);

        await repo.update(newExecution.id, { state });
      });
    }
  }

  private async tenantHasStrictInterval(tenantId: string): Promise<boolean> {
    const cachedResult = await this.intervalSettingsCache.get<boolean>(tenantId);
    if (cachedResult !== undefined) {
      return cachedResult;
    }

    const authInfo = this.apiService.createInternalAuthInfo(tenantId);

    try {
      const res = await this.apiService.httpGetOrFail<DataResponse<{ value: string }>>(
        authInfo,
        SharedService.USER_SERVICE,
        `v1/tenant-settings/${MAINTENANCE_INTERVAL_CALCULATION_SETTING_KEY}`,
      );
      const isStrictInterval = res.data.data.value === MAINTENANCE_INTERVAL_SETTING.STRICT_INTERVAL;
      this.intervalSettingsCache.set(tenantId, isStrictInterval);
      return isStrictInterval;
    } catch (ex) {
      this.logger.error(
        `Could not fetch tenant setting for ${MAINTENANCE_INTERVAL_CALCULATION_SETTING_KEY}, falling back to ${MAINTENANCE_INTERVAL_SETTING.ON_EXECUTION}`,
      );
    }
    return false;
  }

  private executionStateForExecution(execution: ExecutionEntity): ExecutionState {
    const now = new Date();
    if (this.isDueSoon(execution, now)) {
      return ExecutionState.DUE_SOON;
    } else if (this.isOverDue(execution, now)) {
      return ExecutionState.OVER_DUE;
    }
    return ExecutionState.OPEN;
  }

  private isDueSoon(execution: ExecutionEntity, now: Date) {
    return moment(execution.dueDate).diff(now, 'hours') < DUE_SOON_THRESHOLD_HOURS;
  }

  private isOverDue(execution: ExecutionEntity, now: Date) {
    return moment(execution.dueDate).diff(now, 'hours') < 0;
  }
}
