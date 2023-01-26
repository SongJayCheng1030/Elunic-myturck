import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { INTERVAL_UNITS, IntervalUnit } from 'shared/common/models';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { AssetAssignmentEntity } from '../../asset-assignment/entities/asset-assignment.entity';
import { TABLE_PREFIX } from '../../definitions';
import { ProcedureStepEntity } from '../../procedure-step/entities/maintenance-procedure-step.entity';
import { BaseModel } from '../../shared/entities/base';

@Entity({ name: `${TABLE_PREFIX}_procedure_entity` })
export class ProcedureEntity extends BaseModel {
  @ApiProperty()
  @Column()
  name!: string;

  @ApiProperty()
  @Column()
  description!: string;

  @ApiProperty()
  @Column()
  assetTypeId!: string;

  @ApiProperty()
  @Column()
  interval!: number;

  @ApiProperty({ enum: INTERVAL_UNITS })
  @Column({ type: 'enum', enum: INTERVAL_UNITS })
  intervalUnit!: IntervalUnit;

  @Column()
  @Exclude()
  outdatedSince!: Date;

  @ApiProperty({ type: () => ProcedureStepEntity, isArray: true })
  @OneToMany(
    () => ProcedureStepEntity,
    step => step.procedure,
    { onDelete: 'CASCADE' },
  )
  steps!: ProcedureStepEntity[];

  @OneToMany(
    () => AssetAssignmentEntity,
    assignment => assignment.procedure,
    { onDelete: 'CASCADE' },
  )
  @Exclude()
  assignments!: AssetAssignmentEntity[];

  @ManyToOne(
    () => ProcedureEntity,
    procedure => procedure.derivatives,
    { onDelete: 'SET NULL', nullable: true },
  )
  @JoinColumn()
  @Exclude()
  root?: ProcedureEntity;

  @OneToMany(
    () => ProcedureEntity,
    procedure => procedure.root,
  )
  @Exclude()
  derivatives!: ProcedureEntity[];

  @Expose({ name: 'id' })
  get _id() {
    return this.root?.id || this.id;
  }

  @Expose({ name: 'steps' })
  sortedSteps() {
    return this.steps?.sort((a, b) => a.position - b.position);
  }
}
