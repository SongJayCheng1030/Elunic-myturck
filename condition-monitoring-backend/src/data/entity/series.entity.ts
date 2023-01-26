import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'series' })
export class SeriesEntity {
  @PrimaryColumn({ type: 'char', length: 255 })
  deviceId!: string;

  @PrimaryColumn({ type: 'char', length: 255 })
  parameterId!: string;

  @PrimaryColumn({ type: 'char', length: 255 })
  aggregate!: string;

  @PrimaryColumn({ type: 'datetime' })
  time!: Date;

  @Column({ type: 'float' })
  value!: number;

  @Column({ type: 'char', length: 255, nullable: true })
  unit!: string;
}
