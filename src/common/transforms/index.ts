import { CustomerStatus } from '../constants';

/**
 * 通用转换函数
 */

// 客户状态转换
const STATUS_MAP: Record<CustomerStatus, string> = {
  [CustomerStatus.NEW]: '新客户',
  [CustomerStatus.MEASURED]: '已量房',
  [CustomerStatus.QUOTED]: '已报价',
  [CustomerStatus.SIGNED]: '已签约',
  [CustomerStatus.COMPLETED]: '已完工',
};

export const customerStatusTransform = (value: CustomerStatus): string =>
  STATUS_MAP[value] || value;

// 日期时间转换
export const dateTimeTransform = (value: Date | string): string =>
  value ? new Date(value).toLocaleString('zh-CN') : '';

// 日期转换（不含时间）
export const dateTransform = (value: Date | string): string =>
  value ? new Date(value).toLocaleDateString('zh-CN') : '';

// 布尔值转换
export const booleanTransform = (value: boolean): string =>
  value ? '是' : '否';
