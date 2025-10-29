/**
 * 统一响应接口
 */
export interface IResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp?: number;
}

/**
 * 分页查询参数
 */
export interface IPaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * 分页响应数据
 */
export interface IPaginationResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * JWT Payload
 */
export interface IJwtPayload {
  sub: number; // 用户ID
  username: string;
  role: string;
  companyId?: number;
  departmentId?: number;
}

