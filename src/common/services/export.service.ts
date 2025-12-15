import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { getExportableFields } from '../decorators/exportable.decorator';

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
  transform?: (value: any, row: any) => any;
}

/**
 * Excel 导出服务
 *
 * 两种使用方式：
 * 1. exportFromEntity - 从实体 @Exportable 装饰器读取配置（推荐）
 * 2. exportWithColumns - 手动指定列配置（用于报表、聚合数据等）
 */
@Injectable()
export class ExportService {
  /**
   * 从实体装饰器配置导出（推荐）
   */
  async exportFromEntity<T>(
    res: Response,
    entity: new (...args: any[]) => T,
    data: T[],
    filename: string,
  ): Promise<void> {
    const fields = getExportableFields(entity);
    if (fields.length === 0) {
      throw new Error(`实体 ${entity.name} 没有配置 @Exportable 装饰器`);
    }
    await this.doExport(res, data, fields, filename);
  }

  /**
   * 手动指定列配置导出（用于报表、聚合数据）
   */
  async exportWithColumns(
    res: Response,
    data: any[],
    columns: ExportColumn[],
    filename: string,
  ): Promise<void> {
    await this.doExport(res, data, columns, filename);
  }

  private async doExport(
    res: Response,
    data: any[],
    columns: ExportColumn[],
    filename: string,
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    worksheet.columns = columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width || 15,
    }));

    // 表头样式
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // 数据行
    data.forEach((item) => {
      const rowData: Record<string, any> = {};
      columns.forEach((col) => {
        const value = item[col.key];
        rowData[col.key] = col.transform ? col.transform(value, item) : value;
      });
      worksheet.addRow(rowData);
    });

    // 响应头
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(`${filename}.xlsx`)}`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}
