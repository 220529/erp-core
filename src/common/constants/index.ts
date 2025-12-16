/**
 * 用户角色枚举
 */
export enum UserRole {
  ADMIN = 'admin', // 系统管理员
  DESIGNER = 'designer', // 设计师
  FOREMAN = 'foreman', // 工长
  FINANCE = 'finance', // 财务
}

/**
 * 客户状态枚举
 */
export enum CustomerStatus {
  NEW = 'new', // 新客户
  MEASURED = 'measured', // 已量房
  QUOTED = 'quoted', // 已报价
  SIGNED = 'signed', // 已签约
  COMPLETED = 'completed', // 已完工
}

/**
 * 客户跟进类型枚举
 */
export enum FollowType {
  CALL = 'call', // 电话沟通
  VISIT = 'visit', // 上门拜访
  MEASURE = 'measure', // 上门量房
  QUOTE = 'quote', // 报价沟通
}

/**
 * 订单状态枚举
 */
export enum OrderStatus {
  DRAFT = 'draft', // 草稿
  SIGNED = 'signed', // 已签约
  IN_PROGRESS = 'in_progress', // 施工中
  COMPLETED = 'completed', // 已完工
  CANCELLED = 'cancelled', // 已取消
}

/**
 * 订单明细类别枚举
 */
export enum OrderItemCategory {
  MAIN = 'main', // 主材
  AUXILIARY = 'auxiliary', // 辅材
  LABOR = 'labor', // 人工
  ADDITION = 'addition', // 增项
}

/**
 * 材料类别枚举
 */
export enum MaterialCategory {
  MAIN = 'main', // 主材（地板、瓷砖、橱柜等）
  AUXILIARY = 'auxiliary', // 辅材（水泥、沙子、电线等）
  LABOR = 'labor', // 人工
}

/**
 * 材料状态枚举
 */
export enum MaterialStatus {
  ACTIVE = 'active', // 启用
  INACTIVE = 'inactive', // 停用
}

/**
 * 收款类型枚举
 */
export enum PaymentType {
  DEPOSIT = 'deposit', // 定金
  CONTRACT = 'contract', // 合同款
  DESIGN_FEE = 'design_fee', // 设计费
  ADDITION = 'addition', // 增项款
}

/**
 * 收款状态枚举
 */
export enum PaymentStatus {
  PENDING = 'pending', // 待确认
  CONFIRMED = 'confirmed', // 已确认
  CANCELLED = 'cancelled', // 已取消
}

/**
 * 产品状态枚举
 */
export enum ProductStatus {
  ACTIVE = 'active', // 启用
  INACTIVE = 'inactive', // 停用
}

