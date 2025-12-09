import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 文件/文件夹实体
 */
@Entity({ name: 'files', comment: '文件管理表' })
export class File extends BaseEntity {
  @ApiProperty({ description: '文件/文件夹名' })
  @Column({ length: 255, comment: '文件/文件夹名' })
  name: string;

  @ApiProperty({ description: '是否为文件夹' })
  @Column({ name: 'is_folder', default: false, comment: '是否为文件夹' })
  isFolder: boolean;

  @ApiProperty({ description: '父文件夹ID' })
  @Column({ name: 'parent_id', type: 'int', nullable: true, comment: '父文件夹ID' })
  parentId: number;

  @ApiProperty({ description: '文件URL' })
  @Column({ type: 'text', nullable: true, comment: 'OSS访问路径' })
  url: string;

  @ApiProperty({ description: 'OSS存储路径' })
  @Column({ name: 'storage_path', length: 500, nullable: true, comment: 'OSS存储路径' })
  storagePath: string;

  @ApiProperty({ description: '文件大小(字节)' })
  @Column({ type: 'bigint', default: 0, comment: '文件大小(字节)' })
  size: number;

  @ApiProperty({ description: '上传人ID' })
  @Column({ name: 'uploaded_by', type: 'int', nullable: true, comment: '上传人ID' })
  uploadedBy: number;
}
