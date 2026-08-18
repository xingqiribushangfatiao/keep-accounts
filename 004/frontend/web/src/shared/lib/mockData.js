/**
 * 客户端 Mock 数据集
 * --------------------------------------------------------------------------
 * 后端尚未补齐 /api/categories /api/transactions /api/stats 之前,
 * 前端在以下场景用本模块兜底:
 *   - 列出分类
 *   - 列出/创建/更新/删除交易
 *   - 月度统计
 *
 * 数据形态与后端响应保持一致,后端补齐后只需把调用从 mockData 切换到
 * 真实 API 即可,组件无需改动。
 *
 * 9 个支出 + 6 个收入分类(与 schema.sql 第 8 节一致)
 */

export const MOCK_CATEGORIES = [
  { id: 1,  code: 'food',      name: '餐饮', icon: '🍜', color: '#FF6B9D', type: 'expense', isPreset: true,  sortOrder: 10 },
  { id: 2,  code: 'transport', name: '交通', icon: '🚗', color: '#4ECDC4', type: 'expense', isPreset: true,  sortOrder: 20 },
  { id: 3,  code: 'shopping',  name: '购物', icon: '🛒', color: '#FECA57', type: 'expense', isPreset: true,  sortOrder: 30 },
  { id: 4,  code: 'housing',   name: '住房', icon: '🏠', color: '#FFB1C5', type: 'expense', isPreset: true,  sortOrder: 40 },
  { id: 5,  code: 'fun',       name: '娱乐', icon: '🎮', color: '#E83E8C', type: 'expense', isPreset: true,  sortOrder: 50 },
  { id: 6,  code: 'health',    name: '医疗', icon: '💊', color: '#FF4D4F', type: 'expense', isPreset: true,  sortOrder: 60 },
  { id: 7,  code: 'pets',      name: '宠物', icon: '🐱', color: '#FF9FF3', type: 'expense', isPreset: true,  sortOrder: 70 },
  { id: 8,  code: 'social',    name: '社交', icon: '☕', color: '#48DBFB', type: 'expense', isPreset: true,  sortOrder: 80 },
  { id: 9,  code: 'other_exp', name: '其他', icon: '📦', color: '#8395A7', type: 'expense', isPreset: true,  sortOrder: 99 },

  { id: 11, code: 'salary',    name: '工资', icon: '💰', color: '#10AC84', type: 'income',  isPreset: true,  sortOrder: 10 },
  { id: 12, code: 'bonus',     name: '奖金', icon: '🧧', color: '#FF6B9D', type: 'income',  isPreset: true,  sortOrder: 20 },
  { id: 13, code: 'invest',    name: '投资', icon: '📈', color: '#1DD1A1', type: 'income',  isPreset: true,  sortOrder: 30 },
  { id: 14, code: 'parttime',  name: '兼职', icon: '🕒', color: '#FECA57', type: 'income',  isPreset: true,  sortOrder: 40 },
  { id: 15, code: 'gift_in',   name: '礼金', icon: '🎁', color: '#FF9FF3', type: 'income',  isPreset: true,  sortOrder: 50 },
  { id: 16, code: 'other_inc', name: '其他', icon: '🪙', color: '#C8D6E5', type: 'income',  isPreset: true,  sortOrder: 99 },
];

/** 初始交易(15 条,跨 3 个月,用于演示列表/统计) */
export const MOCK_TRANSACTIONS = [
  // 本月(2026-08)
  { uuid: 't-001', type: 'expense', amount: '28.50',  categoryId: 1,  transactionDate: '2026-08-17', note: '午餐' },
  { uuid: 't-002', type: 'expense', amount: '15.00',  categoryId: 8,  transactionDate: '2026-08-16', note: '咖啡' },
  { uuid: 't-003', type: 'expense', amount: '120.00', categoryId: 2,  transactionDate: '2026-08-15', note: '加油' },
  { uuid: 't-004', type: 'expense', amount: '320.00', categoryId: 3,  transactionDate: '2026-08-14', note: '超市采购' },
  { uuid: 't-005', type: 'income',  amount: '8500.00',categoryId: 11, transactionDate: '2026-08-12', note: '8 月工资' },
  { uuid: 't-006', type: 'expense', amount: '48.00',  categoryId: 1,  transactionDate: '2026-08-10', note: '晚餐' },
  { uuid: 't-007', type: 'expense', amount: '12.00',  categoryId: 2,  transactionDate: '2026-08-08', note: '地铁' },
  { uuid: 't-008', type: 'expense', amount: '88.00',  categoryId: 5,  transactionDate: '2026-08-05', note: '电影' },

  // 上月(2026-07)
  { uuid: 't-009', type: 'expense', amount: '2500.00', categoryId: 4, transactionDate: '2026-07-28', note: '房租' },
  { uuid: 't-010', type: 'expense', amount: '180.00', categoryId: 6, transactionDate: '2026-07-22', note: '挂号' },
  { uuid: 't-011', type: 'expense', amount: '66.00',  categoryId: 1, transactionDate: '2026-07-18', note: '外卖' },
  { uuid: 't-012', type: 'income',  amount: '8500.00',categoryId: 11, transactionDate: '2026-07-12', note: '7 月工资' },

  // 6 月
  { uuid: 't-013', type: 'expense', amount: '200.00', categoryId: 7, transactionDate: '2026-06-20', note: '猫粮' },
  { uuid: 't-014', type: 'expense', amount: '1500.00',categoryId: 4, transactionDate: '2026-06-10', note: '水电' },
  { uuid: 't-015', type: 'income',  amount: '500.00', categoryId: 14, transactionDate: '2026-06-05', note: '兼职' },
];

/** 给交易 attach 分类详情,避免组件再查 */
export function hydrateTransaction(tx, categories) {
  const cat = categories.find((c) => c.id === tx.categoryId);
  return {
    ...tx,
    category: cat || null,
    amount: Number(tx.amount),
  };
}
