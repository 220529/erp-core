# 客户-订单-项目业务流转详解

> 从客户线索到项目完工的完整流程与数据流转

---

## 📊 三者关系总览

```
┌─────────────┐
│  Customer   │  1:N  ┌─────────────┐  1:N  ┌─────────────┐
│   客户表     │ ────▶ │   Order     │ ────▶ │  Project    │
│             │       │   订单表     │       │   项目表     │
└─────────────┘       └─────────────┘       └─────────────┘
      │                      │                      │
      │                      │                      │
      ▼                      ▼                      ▼
  客户状态               订单状态               项目状态
  5个阶段                5个阶段                4个阶段
```

### 数据库关联

```typescript
// Customer → Order (一对多)
customer.orders = Order[]  // 一个客户可以有多个订单

// Order → Project (一对多)
order.projects = Project[] // 一个订单可以拆分多个项目

// Project 同时关联 Order 和 Customer
project.orderId → Order
project.customerId → Customer
```

---

## 🎬 完整业务流程实例

### 案例：张三的装修之旅

让我们跟踪一个真实的业务场景，看数据如何流转：

---

## 阶段 1️⃣：客户线索录入

### 业务场景
销售小王接到一个电话，客户张三想装修房子。

### 操作步骤
```javascript
// 调用：POST /api/code/run/customer_create
{
  "params": {
    "name": "张三",
    "mobile": "13800138000",
    "address": "北京市朝阳区望京SOHO",
    "area": "朝阳区"
  }
}
```

### 数据变化
```sql
-- 插入客户表
INSERT INTO customers (name, mobile, address, status, sales_id, created_at)
VALUES ('张三', '13800138000', '北京市朝阳区望京SOHO', 'lead', 1001, NOW());
```

### 数据库状态
| 表 | 记录 | 状态 |
|----|------|------|
| **customers** | 1 条（张三） | `status='lead'` |
| **orders** | 0 条 | - |
| **projects** | 0 条 | - |

---

## 阶段 2️⃣：电话跟进

### 业务场景
小王多次电话联系张三，了解需求。

### 操作步骤
```javascript
// 调用：POST /api/code/run/customer_follow
{
  "params": {
    "customerId": 1,
    "type": "call",
    "content": "客户需要三居室装修，预算30万，希望下周量房",
    "nextFollowAt": "2025-11-06 10:00:00"
  }
}
```

### 数据变化
```sql
-- 插入跟进记录表
INSERT INTO customer_follows (customer_id, user_id, type, content, next_follow_at)
VALUES (1, 1001, 'call', '客户需要三居室装修...', '2025-11-06 10:00:00');
```

### 数据库状态
| 表 | 记录 | 状态 |
|----|------|------|
| **customers** | 1 条（张三） | `status='lead'`（未变） |
| **customer_follows** | 1 条 | 跟进记录 |
| **orders** | 0 条 | - |

---

## 阶段 3️⃣：上门量房

### 业务场景
小王带设计师小李上门量房，测量尺寸。

### 操作步骤
```javascript
// 调用：POST /api/code/run/customer_measure
{
  "params": {
    "customerId": 1,
    "content": "测量完成，建筑面积120平，实际使用面积100平，客户倾向现代简约风格",
    "designerId": 2001  // 分配设计师
  }
}
```

### 业务逻辑（在 erp-code 中实现）
```javascript
// 1. 记录量房跟进
await customerFollowRepository.save({
  customerId: params.customerId,
  userId: user.id,
  type: 'measure',
  content: params.content
});

// 2. 更新客户状态
await customerRepository.update(params.customerId, {
  status: 'measured',       // 状态变更！
  designerId: params.designerId
});
```

### 数据变化
```sql
-- 更新客户表
UPDATE customers 
SET status='measured', designer_id=2001 
WHERE id=1;

-- 插入跟进记录
INSERT INTO customer_follows (customer_id, type, content)
VALUES (1, 'measure', '测量完成...');
```

### 数据库状态
| 表 | 记录 | 状态 |
|----|------|------|
| **customers** | 1 条（张三） | `status='measured'` ✅ |
| **customer_follows** | 2 条 | 电话 + 量房 |
| **orders** | 0 条 | - |

---

## 阶段 4️⃣：方案设计与报价

### 业务场景
设计师小李根据量房数据，制作设计方案和报价单。

### 操作步骤
```javascript
// 调用：POST /api/code/run/order_create_draft
{
  "params": {
    "customerId": 1,
    "materials": [
      { "materialName": "客厅地砖", "category": "main", "quantity": 100, "unit": "square_meter", "price": 150 },
      { "materialName": "卧室地板", "category": "main", "quantity": 60, "unit": "square_meter", "price": 200 },
      { "materialName": "水电改造", "category": "labor", "quantity": 1, "unit": "项", "price": 15000 },
      { "materialName": "泥工人工", "category": "labor", "quantity": 20, "unit": "天", "price": 400 }
    ],
    "remark": "现代简约风格，120平三居室"
  }
}
```

### 业务逻辑
```javascript
// 1. 生成订单编号
const orderNo = 'ORD' + dayjs().format('YYYYMMDD') + '0001';

// 2. 计算订单总金额
const totalAmount = params.materials.reduce((sum, item) => {
  return sum + (item.quantity * item.price);
}, 0);
// 15000 + 12000 + 15000 + 8000 = 50000

// 3. 创建订单草稿
const order = await orderRepository.save({
  orderNo,
  customerId: params.customerId,
  totalAmount,
  status: 'draft',
  salesId: customer.salesId,
  designerId: customer.designerId
});

// 4. 创建订单明细
for (const material of params.materials) {
  await orderMaterialRepository.save({
    orderId: order.id,
    materialName: material.materialName,
    category: material.category,
    quantity: material.quantity,
    unit: material.unit,
    price: material.price,
    amount: material.quantity * material.price
  });
}

// 5. 更新客户状态
await customerRepository.update(params.customerId, {
  status: 'quoted'
});
```

### 数据变化
```sql
-- 插入订单表
INSERT INTO orders (order_no, customer_id, total_amount, status, sales_id, designer_id)
VALUES ('ORD202510300001', 1, 50000.00, 'draft', 1001, 2001);

-- 插入订单明细表（4条）
INSERT INTO order_materials (order_id, material_name, category, quantity, unit, price, amount)
VALUES 
  (1, '客厅地砖', 'main', 100, 'square_meter', 150, 15000),
  (1, '卧室地板', 'main', 60, 'square_meter', 200, 12000),
  (1, '水电改造', 'labor', 1, '项', 15000, 15000),
  (1, '泥工人工', 'labor', 20, '天', 400, 8000);

-- 更新客户表
UPDATE customers SET status='quoted' WHERE id=1;
```

### 数据库状态
| 表 | 记录 | 状态 |
|----|------|------|
| **customers** | 1 条（张三） | `status='quoted'` ✅ |
| **orders** | 1 条（ORD...0001） | `status='draft'`, `totalAmount=50000` ✅ |
| **order_materials** | 4 条 | 订单明细 ✅ |
| **projects** | 0 条 | - |

### 🔗 关联关系已建立
```
Customer(id=1) ←─── Order(id=1, customerId=1)
                        ↓
                  OrderMaterial(4条, orderId=1)
```

---

## 阶段 5️⃣：合同签约

### 业务场景
张三满意报价，决定签约，支付定金 5 万元。

### 操作步骤
```javascript
// 调用：POST /api/code/run/order_sign
{
  "params": {
    "orderId": 1,
    "depositAmount": 50000,
    "paymentMethod": "bank_transfer"
  }
}
```

### 业务逻辑
```javascript
// 1. 更新订单状态
await orderRepository.update(params.orderId, {
  status: 'signed',
  signedAt: new Date()
});

// 2. 创建定金收款记录
const paymentNo = 'PAY' + dayjs().format('YYYYMMDD') + '0001';
await paymentRepository.save({
  paymentNo,
  orderId: params.orderId,
  type: 'deposit',
  amount: params.depositAmount,
  method: params.paymentMethod,
  status: 'pending',  // 待财务确认
  createdBy: user.id
});

// 3. 更新客户状态
await customerRepository.update(order.customerId, {
  status: 'signed'
});
```

### 数据变化
```sql
-- 更新订单表
UPDATE orders 
SET status='signed', signed_at=NOW() 
WHERE id=1;

-- 插入收款记录表
INSERT INTO payments (payment_no, order_id, type, amount, method, status, created_by)
VALUES ('PAY202510300001', 1, 'deposit', 50000.00, 'bank_transfer', 'pending', 1001);

-- 更新客户表
UPDATE customers SET status='signed' WHERE id=1;
```

### 数据库状态
| 表 | 记录 | 状态 |
|----|------|------|
| **customers** | 1 条（张三） | `status='signed'` ✅ |
| **orders** | 1 条 | `status='signed'`, `signedAt=NOW()` ✅ |
| **payments** | 1 条（定金） | `status='pending'` ✅ |
| **projects** | 0 条 | - |

---

## 阶段 6️⃣：财务确认收款

### 业务场景
财务小周确认收到张三的定金 5 万元。

### 操作步骤
```javascript
// 调用：POST /api/code/run/payment_confirm
{
  "params": {
    "paymentId": 1,
    "paidAt": "2025-10-30 15:30:00"
  }
}
```

### 业务逻辑
```javascript
// 1. 更新收款状态
await paymentRepository.update(params.paymentId, {
  status: 'confirmed',
  paidAt: params.paidAt
});

// 2. 更新订单已收金额
const payment = await paymentRepository.findOne(params.paymentId);
const order = await orderRepository.findOne(payment.orderId);

await orderRepository.update(payment.orderId, {
  paidAmount: order.paidAmount + payment.amount
});
```

### 数据变化
```sql
-- 更新收款表
UPDATE payments 
SET status='confirmed', paid_at='2025-10-30 15:30:00' 
WHERE id=1;

-- 更新订单已收金额
UPDATE orders 
SET paid_amount = paid_amount + 50000.00 
WHERE id=1;
```

### 数据库状态
| 表 | 记录 | 状态 |
|----|------|------|
| **orders** | 1 条 | `paidAmount=50000` ✅ |
| **payments** | 1 条 | `status='confirmed'` ✅ |

---

## 阶段 7️⃣：创建施工项目

### 业务场景
定金到账后，销售创建施工项目，准备开工。

### 操作步骤
```javascript
// 调用：POST /api/code/run/project_create
{
  "params": {
    "orderId": 1,
    "name": "望京SOHO三居室装修项目",
    "address": "北京市朝阳区望京SOHO 2号楼1201",
    "foremanId": 3001  // 分配工长
  }
}
```

### 业务逻辑
```javascript
// 1. 生成项目编号
const projectNo = 'PRJ' + dayjs().format('YYYYMMDD') + '0001';

// 2. 获取订单信息
const order = await orderRepository.findOne(params.orderId);

// 3. 创建项目
await projectRepository.save({
  projectNo,
  orderId: params.orderId,
  customerId: order.customerId,  // 从订单关联客户
  name: params.name,
  address: params.address,
  foremanId: params.foremanId,
  status: 'planning'
});

// 4. 更新订单的工长
await orderRepository.update(params.orderId, {
  foremanId: params.foremanId
});
```

### 数据变化
```sql
-- 插入项目表
INSERT INTO projects (project_no, order_id, customer_id, name, address, foreman_id, status)
VALUES ('PRJ202510300001', 1, 1, '望京SOHO三居室装修项目', '北京市朝阳区望京SOHO 2号楼1201', 3001, 'planning');

-- 更新订单表
UPDATE orders SET foreman_id=3001 WHERE id=1;
```

### 数据库状态
| 表 | 记录 | 状态 |
|----|------|------|
| **customers** | 1 条（张三） | `status='signed'` |
| **orders** | 1 条 | `status='signed'`, `foremanId=3001` |
| **projects** | 1 条（PRJ...0001） | `status='planning'` ✅ |

### 🔗 三者关联完成
```
Customer(id=1) ←─── Order(id=1) ←─── Project(id=1)
     ↑                                      │
     └──────────────────────────────────────┘
                (project.customerId=1)
```

---

## 阶段 8️⃣：项目开工

### 业务场景
工长老张确认材料到位，通知开工。

### 操作步骤
```javascript
// 调用：POST /api/code/run/project_start
{
  "params": {
    "projectId": 1
  }
}
```

### 业务逻辑
```javascript
// 1. 更新项目状态
await projectRepository.update(params.projectId, {
  status: 'in_progress'
});

// 2. 更新订单状态
const project = await projectRepository.findOne(params.projectId);
await orderRepository.update(project.orderId, {
  status: 'in_progress',
  startedAt: new Date()
});
```

### 数据变化
```sql
-- 更新项目表
UPDATE projects SET status='in_progress' WHERE id=1;

-- 更新订单表
UPDATE orders SET status='in_progress', started_at=NOW() WHERE id=1;
```

### 数据库状态
| 表 | 记录 | 状态 |
|----|------|------|
| **orders** | 1 条 | `status='in_progress'`, `startedAt=NOW()` ✅ |
| **projects** | 1 条 | `status='in_progress'` ✅ |

---

## 阶段 9️⃣：项目完工

### 业务场景
经过 2 个月施工，工长确认项目完工。

### 操作步骤
```javascript
// 调用：POST /api/code/run/project_complete
{
  "params": {
    "projectId": 1
  }
}
```

### 业务逻辑
```javascript
// 1. 更新项目状态
await projectRepository.update(params.projectId, {
  status: 'completed'
});

// 2. 检查订单下所有项目是否都完工
const project = await projectRepository.findOne(params.projectId);
const allProjects = await projectRepository.find({ 
  where: { orderId: project.orderId } 
});
const allCompleted = allProjects.every(p => p.status === 'completed');

// 3. 如果所有项目都完工，更新订单状态
if (allCompleted) {
  await orderRepository.update(project.orderId, {
    status: 'completed',
    completedAt: new Date()
  });
  
  // 4. 更新客户状态
  const order = await orderRepository.findOne(project.orderId);
  await customerRepository.update(order.customerId, {
    status: 'completed'
  });
}
```

### 数据变化
```sql
-- 更新项目表
UPDATE projects SET status='completed' WHERE id=1;

-- 更新订单表
UPDATE orders SET status='completed', completed_at=NOW() WHERE id=1;

-- 更新客户表
UPDATE customers SET status='completed' WHERE id=1;
```

### 数据库状态（最终）
| 表 | 记录 | 状态 |
|----|------|------|
| **customers** | 1 条（张三） | `status='completed'` ✅ |
| **orders** | 1 条 | `status='completed'`, `completedAt=NOW()` ✅ |
| **projects** | 1 条 | `status='completed'` ✅ |
| **payments** | 1 条 | `status='confirmed'`, `amount=50000` |

---

## 📈 完整流转图

```
时间线                客户状态              订单状态              项目状态              收款记录
────────────────────────────────────────────────────────────────────────────────────────────

Day 1   录入线索      lead                  -                    -                    -
Day 2   电话跟进      lead                  -                    -                    -
Day 5   上门量房      measured              -                    -                    -
Day 8   设计报价      quoted                draft                -                    -
Day 10  合同签约      signed                signed               -                    deposit(pending)
Day 10  财务确认      signed                signed               -                    deposit(confirmed)
                                           paidAmount=50000
Day 11  创建项目      signed                signed               planning              -
Day 12  项目开工      signed                in_progress          in_progress           -
Day 70  项目完工      completed             completed            completed             -
```

---

## 🔑 关键流转规则

### 1. 状态联动规则

```javascript
// 客户状态驱动订单创建
customer.status === 'quoted' → 可以创建订单草稿

// 订单状态驱动项目创建
order.status === 'signed' && order.paidAmount > 0 → 可以创建项目

// 项目状态驱动订单状态
所有 project.status === 'completed' → order.status = 'completed'

// 订单状态驱动客户状态
order.status === 'completed' → customer.status = 'completed'
```

### 2. 数据一致性规则

```javascript
// 订单总金额 = 订单明细之和
order.totalAmount = sum(order_materials.amount)

// 订单已收金额 = 已确认收款之和
order.paidAmount = sum(payments.amount WHERE status='confirmed')

// 订单明细金额 = 数量 × 单价
order_material.amount = quantity × price
```

### 3. 业务约束规则

```javascript
// 创建订单前，客户必须已量房
if (customer.status !== 'measured' && customer.status !== 'quoted') {
  throw new Error('客户尚未量房，无法创建订单');
}

// 创建项目前，订单必须已签约且有收款
if (order.status !== 'signed' || order.paidAmount === 0) {
  throw new Error('订单未签约或未收款，无法创建项目');
}

// 项目开工前，必须有工长
if (!project.foremanId) {
  throw new Error('未分配工长，无法开工');
}
```

---

## 🚀 推进机制

### 自动推进（系统触发）

| 触发条件 | 自动操作 |
|---------|---------|
| 创建订单草稿 | 自动更新客户状态为 `quoted` |
| 订单签约 | 自动更新客户状态为 `signed` |
| 收款确认 | 自动更新订单 `paidAmount` |
| 所有项目完工 | 自动更新订单为 `completed` |
| 订单完工 | 自动更新客户为 `completed` |

### 手动推进（人工操作）

| 操作 | 负责人 | 触发条件 |
|------|--------|---------|
| 客户跟进 | 销售 | 随时 |
| 上门量房 | 销售/设计师 | 客户同意 |
| 创建报价 | 设计师 | 量房完成 |
| 订单签约 | 销售 | 客户确认 |
| 创建项目 | 销售/管理员 | 订单签约 + 定金到账 |
| 项目开工 | 工长 | 材料到位 |
| 项目完工 | 工长 | 施工完成 + 验收通过 |

---

## 📊 数据查询示例

### 查询客户的所有订单
```sql
SELECT o.* 
FROM orders o
WHERE o.customer_id = 1
ORDER BY o.created_at DESC;
```

### 查询订单的所有项目
```sql
SELECT p.* 
FROM projects p
WHERE p.order_id = 1;
```

### 查询客户的完整业务数据
```sql
-- 客户基本信息
SELECT * FROM customers WHERE id = 1;

-- 客户的订单
SELECT * FROM orders WHERE customer_id = 1;

-- 客户的项目
SELECT * FROM projects WHERE customer_id = 1;

-- 客户的收款记录
SELECT p.* 
FROM payments p
JOIN orders o ON p.order_id = o.id
WHERE o.customer_id = 1;
```

---

## 💡 特殊场景处理

### 场景 1：一个订单拆分多个项目

```javascript
// 张三的房子分两期施工
// 第一期：客厅+餐厅
await projectRepository.save({
  projectNo: 'PRJ202510300001',
  orderId: 1,
  customerId: 1,
  name: '一期：客厅餐厅装修',
  status: 'planning'
});

// 第二期：卧室+书房
await projectRepository.save({
  projectNo: 'PRJ202510300002',
  orderId: 1,
  customerId: 1,
  name: '二期：卧室书房装修',
  status: 'planning'
});

// 只有所有项目都完工，订单才算完工
```

### 场景 2：订单增项

```javascript
// 施工中，张三要求增加吊顶
await orderMaterialRepository.save({
  orderId: 1,
  materialName: '客厅吊顶',
  category: 'addition',  // 增项
  quantity: 30,
  unit: 'square_meter',
  price: 200,
  amount: 6000
});

// 更新订单总金额
await orderRepository.update(1, {
  totalAmount: 50000 + 6000  // 56000
});

// 创建增项收款
await paymentRepository.save({
  paymentNo: 'PAY202511150002',
  orderId: 1,
  type: 'addition',
  amount: 6000,
  status: 'pending'
});
```

### 场景 3：项目暂停

```javascript
// 材料缺货，项目暂停
await projectRepository.update(1, {
  status: 'paused'
});

// 订单状态不变，仍然是 in_progress
// 材料到货后，工长恢复项目
await projectRepository.update(1, {
  status: 'in_progress'
});
```

---

## 📝 总结

### 流转核心要点

1. **客户是起点**：所有业务从客户开始
2. **订单是中枢**：连接客户和项目，管理金额
3. **项目是执行**：实际施工的载体
4. **收款是保障**：财务流与业务流同步

### 数据关联特点

- **双向关联**：Project 既关联 Order，也关联 Customer
- **级联更新**：下游状态变化会触发上游状态更新
- **强约束**：必须按顺序推进，不能跳跃

### 推进机制

- **自动推进**：系统根据业务规则自动更新状态
- **手动推进**：关键节点需要人工确认和操作
- **并行处理**：一个订单可以有多个项目同时施工

---

**这就是客户-订单-项目的完整流转过程！** 🎉

