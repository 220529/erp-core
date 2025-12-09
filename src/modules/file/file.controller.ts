import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
  Req,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import type { Request } from 'express';
import { FileService } from './file.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QueryFileDto } from './dto/file.dto';

@ApiTags('file')
@Controller('file')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @ApiOperation({ summary: '上传文件/文件夹' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
        paths: { type: 'array', items: { type: 'string' }, description: '文件相对路径（上传文件夹时需要）' },
        parentId: { type: 'number', description: '父文件夹ID' },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 100, { limits: { fileSize: 50 * 1024 * 1024 } }))
  async upload(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('paths') paths: string | string[],
    @Body('parentId') parentId: string,
    @Req() req: Request,
  ) {
    const userId = (req as any).user?.id;
    const pid = parentId ? parseInt(parentId, 10) : undefined;
    const pathArray = Array.isArray(paths) ? paths : paths ? [paths] : [];
    return await this.fileService.upload(files, pathArray, pid, userId);
  }

  @Get('list')
  @ApiOperation({ summary: '查询文件列表' })
  async findList(@Query() query: QueryFileDto) {
    return await this.fileService.findList(query);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除文件/文件夹' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.fileService.remove(id);
    return { message: '删除成功' };
  }
}
