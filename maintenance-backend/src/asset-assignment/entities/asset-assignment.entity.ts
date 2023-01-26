import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Column, Entity, ManyToOne, OneToMany, Unique } from 'typeorm';

import { TABLE_PREFIX } from '../../definitions';
import { ExecutionEntity } from '../../maintenance-execution/entities/maintenance-execution.entity';
import { ProcedureEntity } from '../../maintenance-procedure/entities/maintenance-procedure.entity';
import { BaseModel } from '../../shared/entities/base';

@Entity({ name: `${TABLE_PREFIX}_asset_assignment_entity` })
@Unique('UNIQ___asset_assignment_entity_asset_procedure', ['tenantId', 'assetId', 'procedure'])
export class AssetAssignmentEntity extends BaseModel {
  @ApiProperty()
  @Column()
  assetId!: string;

  @ApiProperty()
  @Column({ default: true })
  active!: boolean;

  @ManyToOne(
    () => ProcedureEntity,
    procedure => procedure.assignments,
  )
  @Exclude()
  procedure!: ProcedureEntity;

  @OneToMany(
    () => ExecutionEntity,
    execution => execution.assignment,
    { onDelete: 'CASCADE' },
  )
  @Exclude()
  executions!: ExecutionEntity[];

  @ApiResponseProperty({ type: String })
  @Expose()
  get procedureId() {
    return this.procedure._id;
  }

  @ApiResponseProperty({ type: String })
  @Expose()
  get procedureName() {
    return this.procedure.name;
  }

  get outdated() {
    return !!this.procedure.outdatedSince;
  }
}
