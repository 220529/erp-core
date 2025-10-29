import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 基础实体类 - 所有实体都应该继承此类
 * 注意：由于 TS 继承机制，这些字段会在子类字段之前
 */
export abstract class BaseEntity {
  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({ description: 'ID' })
  @PrimaryGeneratedColumn()
  id: number;
}

