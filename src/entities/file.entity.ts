import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 文件实体（简化版）
 */
@Entity({ name: 'files', comment: '文件管理表' })
export class File extends BaseEntity {
  @ApiProperty({ description: '文件名' })
  @Column({ length: 255, comment: '文件名' })
  name: string;

  @ApiProperty({ description: '文件URL' })
  @Column({ type: 'text', comment: '文件访问路径' })
  url: string;

  @ApiProperty({ description: '文件大小(字节)' })
  @Column({ type: 'bigint', comment: '文件大小(字节)' })
  size: number;

  @ApiProperty({ description: 'MIME类型' })
  @Column({ name: 'mime_type', length: 100, comment: 'MIME类型' })
  mimeType: string;

  @ApiProperty({ description: '上传人ID' })
  @Column({ name: 'uploaded_by', nullable: true, comment: '上传人ID' })
  uploadedBy: number;
}
