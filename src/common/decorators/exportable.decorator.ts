import 'reflect-metadata';

export const EXPORTABLE_KEY = 'exportable';

export interface ExportableOptions {
  header: string; // 表头名称
  width?: number; // 列宽
  order?: number; // 排序（越小越靠前）
  transform?: (value: any, row: any) => any; // 值转换函数
}

/**
 * 可导出字段装饰器
 * @example @Exportable({ header: '客户姓名', width: 15, order: 1 })
 */
export function Exportable(options: ExportableOptions): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const existingFields =
      Reflect.getMetadata(EXPORTABLE_KEY, target.constructor) || [];
    existingFields.push({
      key: String(propertyKey),
      ...options,
    });
    Reflect.defineMetadata(EXPORTABLE_KEY, existingFields, target.constructor);
  };
}

/**
 * 从实体类获取导出配置
 */
export function getExportableFields(
  entity: new (...args: any[]) => any,
): (ExportableOptions & { key: string })[] {
  const fields = Reflect.getMetadata(EXPORTABLE_KEY, entity) || [];
  return fields.sort(
    (a: ExportableOptions, b: ExportableOptions) =>
      (a.order ?? 999) - (b.order ?? 999),
  );
}
