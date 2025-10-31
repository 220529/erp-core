import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  MaterialCategory,
  MaterialStatus,
  OrderStatus,
  OrderItemCategory,
  PaymentType,
  PaymentStatus,
  CustomerStatus,
  FollowType,
  ProductStatus,
  UserRole,
} from '../../common/constants';

@ApiTags('constants')
@Controller('constants')
export class ConstantsController {
  @Get('material-categories')
  @ApiOperation({ summary: '获取物料类别枚举' })
  getMaterialCategories() {
    return {
      data: [
        { label: '主材', value: MaterialCategory.MAIN, description: '地板、瓷砖、橱柜等' },
        { label: '辅材', value: MaterialCategory.AUXILIARY, description: '水泥、沙子、电线等' },
        { label: '人工', value: MaterialCategory.LABOR, description: '泥工、木工、油漆工等' },
      ],
    };
  }

  @Get('material-statuses')
  @ApiOperation({ summary: '获取物料状态枚举' })
  getMaterialStatuses() {
    return {
      data: [
        { label: '启用', value: MaterialStatus.ACTIVE },
        { label: '停用', value: MaterialStatus.INACTIVE },
      ],
    };
  }

  @Get('order-statuses')
  @ApiOperation({ summary: '获取订单状态枚举' })
  getOrderStatuses() {
    return {
      data: [
        { label: '草稿', value: OrderStatus.DRAFT },
        { label: '已签约', value: OrderStatus.SIGNED },
        { label: '施工中', value: OrderStatus.IN_PROGRESS },
        { label: '已完工', value: OrderStatus.COMPLETED },
        { label: '已取消', value: OrderStatus.CANCELLED },
      ],
    };
  }

  @Get('order-item-categories')
  @ApiOperation({ summary: '获取订单明细类别枚举' })
  getOrderItemCategories() {
    return {
      data: [
        { label: '主材', value: OrderItemCategory.MAIN },
        { label: '辅材', value: OrderItemCategory.AUXILIARY },
        { label: '人工', value: OrderItemCategory.LABOR },
        { label: '增项', value: OrderItemCategory.ADDITION },
      ],
    };
  }

  @Get('payment-types')
  @ApiOperation({ summary: '获取收款类型枚举' })
  getPaymentTypes() {
    return {
      data: [
        { label: '定金', value: PaymentType.DEPOSIT },
        { label: '合同款', value: PaymentType.CONTRACT },
        { label: '设计费', value: PaymentType.DESIGN_FEE },
        { label: '增项款', value: PaymentType.ADDITION },
      ],
    };
  }

  @Get('payment-statuses')
  @ApiOperation({ summary: '获取收款状态枚举' })
  getPaymentStatuses() {
    return {
      data: [
        { label: '待确认', value: PaymentStatus.PENDING },
        { label: '已确认', value: PaymentStatus.CONFIRMED },
        { label: '已取消', value: PaymentStatus.CANCELLED },
      ],
    };
  }

  @Get('customer-statuses')
  @ApiOperation({ summary: '获取客户状态枚举' })
  getCustomerStatuses() {
    return {
      data: [
        { label: '线索', value: CustomerStatus.LEAD },
        { label: '已量房', value: CustomerStatus.MEASURED },
        { label: '已报价', value: CustomerStatus.QUOTED },
        { label: '已签约', value: CustomerStatus.SIGNED },
        { label: '已完工', value: CustomerStatus.COMPLETED },
      ],
    };
  }

  @Get('follow-types')
  @ApiOperation({ summary: '获取跟进类型枚举' })
  getFollowTypes() {
    return {
      data: [
        { label: '电话沟通', value: FollowType.CALL },
        { label: '上门拜访', value: FollowType.VISIT },
        { label: '上门量房', value: FollowType.MEASURE },
        { label: '报价沟通', value: FollowType.QUOTE },
      ],
    };
  }

  @Get('product-statuses')
  @ApiOperation({ summary: '获取产品状态枚举' })
  getProductStatuses() {
    return {
      data: [
        { label: '启用', value: ProductStatus.ACTIVE },
        { label: '停用', value: ProductStatus.INACTIVE },
      ],
    };
  }

  @Get('user-roles')
  @ApiOperation({ summary: '获取用户角色枚举' })
  getUserRoles() {
    return {
      data: [
        { label: '系统管理员', value: UserRole.ADMIN },
        { label: '销售', value: UserRole.SALES },
        { label: '设计师', value: UserRole.DESIGNER },
        { label: '工长', value: UserRole.FOREMAN },
        { label: '财务', value: UserRole.FINANCE },
      ],
    };
  }

  @Get('all')
  @ApiOperation({ summary: '获取所有枚举常量' })
  getAllConstants() {
    return {
      data: {
        materialCategories: this.getMaterialCategories().data,
        materialStatuses: this.getMaterialStatuses().data,
        orderStatuses: this.getOrderStatuses().data,
        orderItemCategories: this.getOrderItemCategories().data,
        paymentTypes: this.getPaymentTypes().data,
        paymentStatuses: this.getPaymentStatuses().data,
        customerStatuses: this.getCustomerStatuses().data,
        followTypes: this.getFollowTypes().data,
        productStatuses: this.getProductStatuses().data,
        userRoles: this.getUserRoles().data,
      },
    };
  }
}

