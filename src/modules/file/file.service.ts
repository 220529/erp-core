import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { File } from '../../entities/file.entity';
import { QueryFileDto } from './dto/file.dto';
import OSS from 'ali-oss';
import * as path from 'path';

@Injectable()
export class FileService {
  private ossClient: OSS;

  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    private configService: ConfigService,
  ) {
    this.ossClient = new OSS({
      region: this.configService.get<string>('OSS_REGION', ''),
      accessKeyId: this.configService.get<string>('OSS_ACCESS_KEY_ID', ''),
      accessKeySecret: this.configService.get<string>('OSS_ACCESS_KEY_SECRET', ''),
      bucket: this.configService.get<string>('OSS_BUCKET', ''),
      secure: true, // 强制使用 https
    });
  }

  /**
   * 上传文件/文件夹
   */
  async upload(
    files: Express.Multer.File[],
    paths: string[],
    parentId?: number,
    userId?: number,
  ): Promise<File[]> {
    const folderCache = new Map<string, number>();

    const getOrCreateFolder = async (folderPath: string, rootParentId?: number): Promise<number> => {
      if (folderCache.has(folderPath)) return folderCache.get(folderPath)!;

      const parts = folderPath.split('/').filter(Boolean);
      let currentParentId = rootParentId;

      for (let i = 0; i < parts.length; i++) {
        const name = parts[i];
        const pathKey = parts.slice(0, i + 1).join('/');

        if (folderCache.has(pathKey)) {
          currentParentId = folderCache.get(pathKey);
          continue;
        }

        let folder = await this.fileRepository.findOne({
          where: { name, isFolder: true, parentId: currentParentId ?? IsNull() },
        });

        if (!folder) {
          folder = await this.fileRepository.save(
            this.fileRepository.create({ name, isFolder: true, parentId: currentParentId, uploadedBy: userId }),
          );
        }

        folderCache.set(pathKey, folder.id);
        currentParentId = folder.id;
      }
      return currentParentId!;
    };

    const results: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const relativePath = paths[i] || file.originalname;
      const pathParts = relativePath.split('/');
      const fileName = pathParts.pop()!;
      const folderPath = pathParts.join('/');

      let fileParentId = parentId;
      if (folderPath) {
        fileParentId = await getOrCreateFolder(folderPath, parentId);
      }

      const dateDir = new Date().toISOString().slice(0, 10).replace(/-/g, '/');
      const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(fileName)}`;
      const ossPath = `files/${dateDir}/${uniqueName}`;

      const ossResult = await this.ossClient.put(ossPath, file.buffer, {
        headers: {
          'Content-Type': file.mimetype,
        },
      });

      const fileEntity = await this.fileRepository.save(
        this.fileRepository.create({
          name: fileName,
          isFolder: false,
          parentId: fileParentId,
          url: ossResult.url,
          storagePath: ossPath,
          size: file.size,
          uploadedBy: userId,
        }),
      );
      results.push(fileEntity);
    }
    return results;
  }


  /**
   * 查询文件列表
   */
  async findList(query: QueryFileDto) {
    const { page = 1, pageSize = 20, parentId } = query;

    const queryBuilder = this.fileRepository.createQueryBuilder('file');

    if (parentId !== undefined && parentId !== null) {
      queryBuilder.andWhere('file.parentId = :parentId', { parentId });
    } else {
      queryBuilder.andWhere('file.parentId IS NULL');
    }

    queryBuilder.orderBy('file.isFolder', 'DESC').addOrderBy('file.createdAt', 'DESC');

    const [list, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  /**
   * 删除文件/文件夹
   */
  async remove(id: number): Promise<void> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) throw new NotFoundException('文件不存在');

    if (file.isFolder) {
      await this.removeFolderRecursive(id);
    } else if (file.storagePath) {
      try {
        await this.ossClient.delete(file.storagePath);
        console.log(`OSS 删除成功: ${file.storagePath}`);
      } catch (e) {
        console.error(`OSS 删除失败: ${file.storagePath}`, e);
      }
    }

    await this.fileRepository.remove(file);
  }

  private async removeFolderRecursive(folderId: number): Promise<void> {
    const children = await this.fileRepository.find({ where: { parentId: folderId } });

    for (const child of children) {
      if (child.isFolder) {
        await this.removeFolderRecursive(child.id);
      } else if (child.storagePath) {
        try {
          await this.ossClient.delete(child.storagePath);
          console.log(`OSS 删除成功: ${child.storagePath}`);
        } catch (e) {
          console.error(`OSS 删除失败: ${child.storagePath}`, e);
        }
      }
      await this.fileRepository.remove(child);
    }
  }
}
