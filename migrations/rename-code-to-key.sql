-- ============================================
-- 将 code_flows 表的 code 字段改为 key
-- 执行时间：2025-10-30
-- ============================================

-- 1. 重命名列
ALTER TABLE `code_flows` 
CHANGE COLUMN `code` `key` VARCHAR(100) NOT NULL COMMENT '流程唯一标识key';

-- 2. 确保唯一索引依然存在
-- (如果之前有唯一索引，重命名列后会自动保留)

-- 3. 验证修改
SELECT 
  COLUMN_NAME,
  COLUMN_TYPE,
  COLUMN_COMMENT
FROM 
  INFORMATION_SCHEMA.COLUMNS
WHERE 
  TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'code_flows'
  AND COLUMN_NAME = 'key';

