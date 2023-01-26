import { ApiResponseProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export abstract class BaseModel {
  @PrimaryGeneratedColumn('uuid')
  @ApiResponseProperty()
  id!: string;

  @ApiResponseProperty()
  @CreateDateColumn()
  createdAt!: Date;

  @ApiResponseProperty()
  @UpdateDateColumn()
  updatedAt!: Date;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'char', length: 36 })
  tenantId!: string;
}
