# 产品套餐设计文档

> 补充业务闭环：标准化套餐快速报价

## 📌 为什么需要产品表？

根据老系统的实际业务流程：

```
客户详情 → 【选产品套餐】 → 转订单 → 订单详情（补充材料）
```

**关键发现**：老系统有"**选产品套餐**"环节！

### 业务痛点

如果没有产品套餐：
- ❌ 每次报价都要从零开始选物料
- ❌ 设计师效率低，容易遗漏项目
- ❌ 报价不标准，客户比价困难
- ❌ 成本控制难，利润不可预测

有了产品套餐：
- ✅ 标准化方案，快速报价
- ✅ 预设成本和售价，利润可控
- ✅ 客户可选择，决策更快
- ✅ 可微调，灵活应对个性化需求

---

## 🏗️ 数据库设计

### 新增的两张表

#### 1. products（产品套餐表）

```sql
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `code` varchar(50) NOT NULL UNIQUE COMMENT '产品编码(唯一)',
  `name` varchar(100) NOT NULL COMMENT '产品名称',
  `category` varchar(50) DEFAULT NULL COMMENT '产品分类：套餐、单项等',
  `room_type` varchar(100) DEFAULT NULL COMMENT '适用房型：一居、两居、三居等',
  `style` varchar(50) DEFAULT NULL COMMENT '装修风格：现代简约、北欧、中式等',
  `cost_price` decimal(10,2) DEFAULT 0 COMMENT '套餐成本价(元)',
  `sale_price` decimal(10,2) DEFAULT 0 COMMENT '套餐售价(元)',
  `description` text COMMENT '产品描述',
  `status` enum('active','inactive') DEFAULT 'active' COMMENT '产品状态',
  `sort` int DEFAULT 0 COMMENT '排序值，越大越靠前',
  `remark` text COMMENT '备注信息',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_code` (`code`),
  INDEX `idx_status` (`status`),
  INDEX `idx_category` (`category`)
) COMMENT='产品套餐表';
```

#### 2. product_materials（产品物料关联表）

```sql
CREATE TABLE `product_materials` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `product_id` int NOT NULL COMMENT '产品ID',
  `material_id` int DEFAULT NULL COMMENT '物料ID（可为空，支持自定义物料）',
  `material_name` varchar(100) NOT NULL COMMENT '物料名称',
  `category` varchar(50) NOT NULL COMMENT '物料类别：main-主材, labor-人工',
  `quantity` decimal(10,2) NOT NULL COMMENT '数量',
  `unit` varchar(20) NOT NULL COMMENT '单位',
  `price` decimal(10,2) NOT NULL COMMENT '单价(元)',
  `amount` decimal(10,2) NOT NULL COMMENT '小计金额(元)',
  `remark` text COMMENT '备注信息',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_product_id` (`product_id`),
  INDEX `idx_material_id` (`material_id`),
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) COMMENT='产品物料关联表';
```

---

## 📊 实体关系

### 更新后的 ER 图

```
                ┌───────────────┐
                │   Material    │
                │   (物料库)     │
                └───────┬───────┘
                        │
                        │ 可选关联
                        │
┌──────────┐    ┌───────▼────────┐    ┌──────────┐
│ Product  │ 1:N│ProductMaterial │N:1 │ Customer │
│(产品套餐) ├────▶│(产品物料关联)│    │  (客户)  │
└──────────┘    └────────────────┘    └─────┬────┘
                                            │
                                            │ 转订单
                                            ▼
                                      ┌──────────┐
                                      │  Order   │
                                      │ (订单)   │
                                      └─────┬────┘
                                            │
                                      ┌─────▼────────┐
                                      │OrderMaterial │
                                      │(订单物料明细)│
                                      └──────────────┘
```

### 业务流程

```
1. 管理员/设计师创建产品套餐（Product）
   ↓
2. 为套餐添加物料清单（ProductMaterial）
   ↓
3. 客户量房后，设计师选择合适的套餐
   ↓
4. 系统自动将套餐物料复制到订单明细（OrderMaterial）
   ↓
5. 设计师可微调订单明细（增删改物料、调整数量/价格）
   ↓
6. 生成最终报价，客户确认签约
```

---

## 🎬 完整业务案例

### 案例：张三的装修之旅（增加套餐环节）

#### Step 1: 管理员创建产品套餐

```javascript
// 调用：POST /api/code/run/product_create
{
  "params": {
    "name": "现代简约三居室标准套餐",
    "category": "package",
    "roomType": "三居",
    "style": "现代简约",
    "description": "适合90-120平米三居室，包含客厅、餐厅、卧室、厨卫全套装修",
    "costPrice": 80000,
    "salePrice": 120000,
    "materials": [
      {
        "materialId": 1,
        "materialName": "客厅地砖（800x800）",
        "category": "main",
        "quantity": 100,
        "unit": "平米",
        "price": 150
      },
      {
        "materialId": 2,
        "materialName": "卧室强化地板",
        "category": "main",
        "quantity": 60,
        "unit": "平米",
        "price": 200
      },
      {
        "materialName": "水电改造",
        "category": "labor",
        "quantity": 1,
        "unit": "项",
        "price": 15000
      },
      {
        "materialName": "泥工人工",
        "category": "labor",
        "quantity": 20,
        "unit": "天",
        "price": 400
      },
      {
        "materialName": "木工人工",
        "category": "labor",
        "quantity": 15,
        "unit": "天",
        "price": 450
      }
    ]
  }
}
```

**业务逻辑（在 erp-code 中实现）：**

```javascript
// 1. 生成产品编码
const code = 'PRD' + dayjs().format('YYYYMMDD') + '0001';

// 2. 创建产品
const product = await productRepository.save({
  code,
  name: params.name,
  category: params.category,
  roomType: params.roomType,
  style: params.style,
  description: params.description,
  costPrice: params.costPrice,
  salePrice: params.salePrice,
  status: 'active'
});

// 3. 创建产品物料清单
for (const material of params.materials) {
  await productMaterialRepository.save({
    productId: product.id,
    materialId: material.materialId || null,
    materialName: material.materialName,
    category: material.category,
    quantity: material.quantity,
    unit: material.unit,
    price: material.price,
    amount: material.quantity * material.price
  });
}

return {
  success: true,
  data: product,
  message: '产品套餐创建成功'
};
```

**数据变化：**

```sql
-- 插入产品表
INSERT INTO products (code, name, category, room_type, style, cost_price, sale_price, description, status)
VALUES ('PRD202510310001', '现代简约三居室标准套餐', 'package', '三居', '现代简约', 80000, 120000, '适合90-120平米...', 'active');

-- 插入产品物料表（5条）
INSERT INTO product_materials (product_id, material_id, material_name, category, quantity, unit, price, amount)
VALUES 
  (1, 1, '客厅地砖（800x800）', 'main', 100, '平米', 150, 15000),
  (1, 2, '卧室强化地板', 'main', 60, '平米', 200, 12000),
  (1, NULL, '水电改造', 'labor', 1, '项', 15000, 15000),
  (1, NULL, '泥工人工', 'labor', 20, '天', 400, 8000),
  (1, NULL, '木工人工', 'labor', 15, '天', 450, 6750);
```

---

#### Step 2: 客户量房后，设计师选择套餐创建订单

```javascript
// 调用：POST /api/code/run/order_create_from_product
{
  "params": {
    "customerId": 1,
    "productId": 1,  // 选择套餐
    "remark": "客户要求地砖升级到进口品牌"
  }
}
```

**业务逻辑：**

```javascript
// 1. 获取产品套餐信息
const product = await productRepository.findOne({ 
  where: { id: params.productId } 
});

// 2. 获取产品物料清单
const productMaterials = await productMaterialRepository.find({ 
  where: { productId: params.productId } 
});

// 3. 生成订单编号
const orderNo = 'ORD' + dayjs().format('YYYYMMDD') + '0001';

// 4. 创建订单（使用套餐价格）
const order = await orderRepository.save({
  orderNo,
  customerId: params.customerId,
  totalAmount: product.salePrice,  // 套餐售价
  costAmount: product.costPrice,   // 套餐成本
  status: 'draft',
  salesId: customer.salesId,
  designerId: customer.designerId,
  remark: params.remark
});

// 5. 将套餐物料复制到订单明细
for (const material of productMaterials) {
  await orderMaterialRepository.save({
    orderId: order.id,
    materialId: material.materialId,
    materialName: material.materialName,
    category: material.category,
    quantity: material.quantity,
    unit: material.unit,
    price: material.price,
    amount: material.amount
  });
}

// 6. 更新客户状态
await customerRepository.update(params.customerId, {
  status: 'quoted'
});

return {
  success: true,
  data: { order, materials: productMaterials },
  message: '订单创建成功，已自动导入套餐物料'
};
```

**数据变化：**

```sql
-- 插入订单表
INSERT INTO orders (order_no, customer_id, total_amount, cost_amount, status, sales_id, designer_id, remark)
VALUES ('ORD202510310001', 1, 120000, 80000, 'draft', 1001, 2001, '客户要求地砖升级...');

-- 插入订单明细表（5条，从套餐复制）
INSERT INTO order_materials (order_id, material_id, material_name, category, quantity, unit, price, amount)
SELECT 1, material_id, material_name, category, quantity, unit, price, amount
FROM product_materials
WHERE product_id = 1;

-- 更新客户状态
UPDATE customers SET status='quoted' WHERE id=1;
```

---

#### Step 3: 设计师微调订单明细（可选）

```javascript
// 调用：POST /api/code/run/order_material_update
{
  "params": {
    "orderMaterialId": 1,
    "price": 200,  // 地砖价格从 150 调整为 200
    "remark": "升级为进口品牌"
  }
}
```

**业务逻辑：**

```javascript
// 1. 更新订单明细
const orderMaterial = await orderMaterialRepository.findOne(params.orderMaterialId);
const newAmount = orderMaterial.quantity * params.price;

await orderMaterialRepository.update(params.orderMaterialId, {
  price: params.price,
  amount: newAmount,
  remark: params.remark
});

// 2. 重新计算订单总金额
const materials = await orderMaterialRepository.find({ 
  where: { orderId: orderMaterial.orderId } 
});
const totalAmount = materials.reduce((sum, m) => sum + m.amount, 0);

await orderRepository.update(orderMaterial.orderId, {
  totalAmount
});

return {
  success: true,
  message: '订单明细更新成功，订单总金额已重新计算'
};
```

**数据变化：**

```sql
-- 更新订单明细
UPDATE order_materials 
SET price=200, amount=20000, remark='升级为进口品牌' 
WHERE id=1;

-- 更新订单总金额（从 120000 调整为 125000）
UPDATE orders 
SET total_amount = (
  SELECT SUM(amount) FROM order_materials WHERE order_id=1
) 
WHERE id=1;
```

---

## 💡 产品套餐的优势

### 1. **效率提升**

| 场景 | 无套餐 | 有套餐 |
|------|-------|--------|
| 报价时间 | 30-60分钟 | 5-10分钟 ✅ |
| 选物料 | 从零开始选 | 一键导入 ✅ |
| 遗漏风险 | 高 | 低 ✅ |

### 2. **标准化管理**

```
套餐分类：
├─ 按房型：一居、两居、三居、四居
├─ 按风格：现代简约、北欧、中式、欧式
└─ 按档次：经济型、舒适型、豪华型
```

### 3. **成本控制**

```javascript
// 套餐预设成本和售价
product.costPrice = 80000;   // 成本价
product.salePrice = 120000;  // 售价
profit = salePrice - costPrice = 40000;  // 利润 40k
profitRate = 40000 / 80000 = 50%;        // 毛利率 50%
```

### 4. **灵活应对**

- 套餐作为基础，可以微调
- 增加个性化项目（增项）
- 删除不需要的项目
- 最终订单金额自动计算

---

## 🔑 关键业务规则

### 1. 产品套餐管理规则

```javascript
// 产品编码自动生成
productCode = 'PRD' + YYYYMMDD + 序号（4位）

// 套餐售价应大于成本价
product.salePrice >= product.costPrice

// 套餐总金额 = 所有物料金额之和
product.salePrice = sum(productMaterials.amount)

// 套餐状态
status: 'active' | 'inactive'  // 停用的套餐不可选择
```

### 2. 套餐转订单规则

```javascript
// 从套餐创建订单时
order.totalAmount = product.salePrice;  // 订单总额等于套餐售价
order.costAmount = product.costPrice;   // 订单成本等于套餐成本

// 订单明细从套餐物料复制
orderMaterials = productMaterials.map(pm => ({
  orderId: order.id,
  materialId: pm.materialId,
  materialName: pm.materialName,
  category: pm.category,
  quantity: pm.quantity,
  unit: pm.unit,
  price: pm.price,
  amount: pm.amount
}));

// 订单明细可以修改
// 修改后需重新计算订单总金额
```

---

## 📝 典型套餐示例

### 套餐 1：现代简约两居室经济套餐

```json
{
  "code": "PRD202510310001",
  "name": "现代简约两居室经济套餐",
  "category": "package",
  "roomType": "两居",
  "style": "现代简约",
  "costPrice": 50000,
  "salePrice": 75000,
  "description": "适合60-80平米两居室",
  "materials": [
    {"name": "客厅地砖", "category": "main", "quantity": 60, "unit": "平米", "price": 120},
    {"name": "卧室地板", "category": "main", "quantity": 40, "unit": "平米", "price": 180},
    {"name": "水电改造", "category": "labor", "quantity": 1, "unit": "项", "price": 10000},
    {"name": "人工费用", "category": "labor", "quantity": 20, "unit": "天", "price": 350}
  ]
}
```

### 套餐 2：北欧风格三居室舒适套餐

```json
{
  "code": "PRD202510310002",
  "name": "北欧风格三居室舒适套餐",
  "category": "package",
  "roomType": "三居",
  "style": "北欧",
  "costPrice": 100000,
  "salePrice": 150000,
  "description": "适合90-120平米三居室，包含定制家具",
  "materials": [
    {"name": "进口地板", "category": "main", "quantity": 80, "unit": "平米", "price": 300},
    {"name": "定制衣柜", "category": "main", "quantity": 10, "unit": "平米", "price": 800},
    {"name": "全屋定制", "category": "main", "quantity": 1, "unit": "套", "price": 30000},
    {"name": "水电改造", "category": "labor", "quantity": 1, "unit": "项", "price": 15000}
  ]
}
```

---

## 🚀 实施建议

### 阶段 1：创建标准套餐

1. 设计师/管理员根据历史订单，总结常见装修方案
2. 创建 3-5 个标准套餐（不同房型、风格）
3. 测试套餐转订单流程

### 阶段 2：推广使用

1. 培训销售/设计师使用套餐快速报价
2. 收集客户反馈，优化套餐内容
3. 根据季节/活动创建促销套餐

### 阶段 3：数据分析

1. 统计各套餐的选择率
2. 分析套餐利润率
3. 优化套餐组合，提高转化率

---

## 📊 对比：有无产品套餐

### 业务流程对比

| 环节 | 无套餐（简化前） | 有套餐（补充后） |
|------|----------------|----------------|
| 量房后 | 从零开始选物料 | 选择标准套餐 ✅ |
| 报价时间 | 30-60分钟 | 5-10分钟 ✅ |
| 报价准确性 | 容易遗漏 | 标准化，准确 ✅ |
| 客户决策 | 不好比较 | 清晰明了 ✅ |
| 成本控制 | 难以预测 | 预设利润率 ✅ |
| 个性化 | 完全自定义 | 套餐 + 微调 ✅ |

### 数据表对比

| 实体 | 无套餐 | 有套餐 |
|------|-------|--------|
| Customer | ✅ | ✅ |
| Material | ✅ | ✅ |
| **Product** | ❌ | ✅ **新增** |
| **ProductMaterial** | ❌ | ✅ **新增** |
| Order | ✅ | ✅ |
| OrderMaterial | ✅ | ✅ |
| Payment | ✅ | ✅ |

---

## ✅ 总结

### 产品套餐的价值

1. ✅ **补充业务闭环** - 与老系统流程完全一致（选套餐 → 转订单）
2. ✅ **提升工作效率** - 快速报价，减少重复劳动
3. ✅ **标准化管理** - 统一的装修方案模板
4. ✅ **灵活应对** - 套餐作为基础，可微调个性化需求
5. ✅ **成本可控** - 预设成本和售价，利润透明

### 简洁 + 闭环

```
简化设计：去除冗余的 Project 项目表 ✅
业务闭环：增加必要的 Product 套餐表 ✅

Customer → Product（选套餐）→ Order（可微调）→ Payment
完整闭环，麻雀虽小五脏俱全！
```

---

**版本**: v1.0  
**创建日期**: 2025-10-31  
**维护人**: ERP 开发团队


