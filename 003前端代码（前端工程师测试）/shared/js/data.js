/**
 * Petal Ledger - Mock Data
 * --------------------------------------------------------------------------
 * 模拟数据层，演示用。生产环境应替换为 localForage / Pinia store。
 * 包含：分类、用户、记账记录、统计数据。
 */

const MockData = (() => {
    /* ========== 分类 ========== */
    const expenseCategories = [
        { id: 'food',      name: '餐饮美食', emoji: '🍔', color: '#FF9F43' },
        { id: 'shopping',  name: '购物',     emoji: '🛍️', color: '#FF6B9D' },
        { id: 'transport', name: '交通出行', emoji: '🚗', color: '#54A0FF' },
        { id: 'housing',   name: '居住',     emoji: '🏠', color: '#10AC84' },
        { id: 'utilities', name: '水电',     emoji: '💡', color: '#FECA57' },
        { id: 'fun',       name: '娱乐',     emoji: '🎮', color: '#5F27CD' },
        { id: 'health',    name: '医疗',     emoji: '💊', color: '#FF4D4F' },
        { id: 'pets',      name: '宠物',     emoji: '🐱', color: '#FF9FF3' },
        { id: 'social',    name: '社交',     emoji: '☕', color: '#48DBFB' },
        { id: 'edu',       name: '学习',     emoji: '📚', color: '#222F3E' },
        { id: 'travel',    name: '旅行',     emoji: '✈️', color: '#00D2D3' },
        { id: 'other_exp', name: '其他',     emoji: '📦', color: '#8395A7' },
    ];

    const incomeCategories = [
        { id: 'salary',    name: '工资', emoji: '💰', color: '#7EDDD3' },
        { id: 'bonus',     name: '奖金', emoji: '🧧', color: '#FF6B9D' },
        { id: 'invest',    name: '投资', emoji: '📈', color: '#1DD1A1' },
        { id: 'parttime',  name: '兼职', emoji: '🕒', color: '#FECA57' },
        { id: 'gift_in',   name: '礼金', emoji: '🎁', color: '#FF9FF3' },
        { id: 'other_inc', name: '其他', emoji: '🪙', color: '#C8D6E5' },
    ];

    const allCategories = () => [...expenseCategories, ...incomeCategories];

    /* ========== 模拟用户 ========== */
    const currentUser = {
        id: 'demo-user-001',
        username: 'petal_love',
        nickname: 'Petal User',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWrE7vcZqqzgeM7rk7vHnOPf-XlbEZM90OZDSo3nZhilmW86psshccwIHQj-BEeC9IUiwxPKCFkQHRXw6rqA2A8imW6kJih5iroYa07iNpMI0Lv0Z2i-3ISWnTyEysTxKwjPGuXY9qJ3cG8rKAbs7o8Ax7dFdRLembPmIiXY80jNLaFzjBJjXTZ3AIOieABdq3oq9deePHYxyIOdNjRZWI8UqblDk80jOsZ9kPQji9Bpnm2flo0pSZyg',
    };

    /* ========== 模拟记录 ========== */
    const today = new Date();
    const fmt = (d) => d.toISOString().slice(0, 10);
    const daysAgo = (n) => {
        const d = new Date(today);
        d.setDate(d.getDate() - n);
        return fmt(d);
    };

    const transactions = [
        // ===== 本周（0-6 天前）=====
        { id: 't1',  type: 'expense', amount: 45.00,   categoryId: 'food',      date: daysAgo(0), note: '午餐 外卖',        createdAt: Date.now() - 3600000 },
        { id: 't2',  type: 'expense', amount: 80.50,   categoryId: 'transport', date: daysAgo(0), note: '打车回家',         createdAt: Date.now() - 7200000 },
        { id: 't3',  type: 'expense', amount: 320.00,  categoryId: 'shopping',  date: daysAgo(1), note: '生活用品',         createdAt: Date.now() - 86400000 },
        { id: 't4',  type: 'expense', amount: 128.00,  categoryId: 'food',      date: daysAgo(1), note: '晚餐 餐厅',        createdAt: Date.now() - 90000000 },
        { id: 't5',  type: 'income',  amount: 8500.00, categoryId: 'salary',    date: daysAgo(2), note: '8月工资',          createdAt: Date.now() - 172800000 },
        { id: 't6',  type: 'expense', amount: 56.00,   categoryId: 'food',      date: daysAgo(3), note: '早餐 + 咖啡',      createdAt: Date.now() - 259200000 },
        { id: 't7',  type: 'expense', amount: 199.00,  categoryId: 'fun',       date: daysAgo(4), note: '电影 + 爆米花',    createdAt: Date.now() - 345600000 },
        { id: 't8',  type: 'expense', amount: 88.50,   categoryId: 'transport', date: daysAgo(5), note: '地铁 + 共享单车',  createdAt: Date.now() - 432000000 },

        // ===== 上周（7-13 天前）=====
        { id: 't9',  type: 'expense', amount: 2500.00, categoryId: 'housing',   date: daysAgo(7),  note: '房租 8月',        createdAt: Date.now() - 518400000 },
        { id: 't10', type: 'expense', amount: 198.00,  categoryId: 'utilities', date: daysAgo(8),  note: '水电费 8月',      createdAt: Date.now() - 604800000 },
        { id: 't11', type: 'income',  amount: 500.00,  categoryId: 'parttime',  date: daysAgo(9),  note: '兼职翻译',        createdAt: Date.now() - 691200000 },
        { id: 't12', type: 'expense', amount: 35.00,   categoryId: 'social',    date: daysAgo(10), note: '下午茶',          createdAt: Date.now() - 777600000 },
        { id: 't13', type: 'expense', amount: 156.00,  categoryId: 'food',      date: daysAgo(11), note: '朋友聚餐',        createdAt: Date.now() - 864000000 },
        { id: 't14', type: 'expense', amount: 268.00,  categoryId: 'shopping',  date: daysAgo(12), note: '夏装',            createdAt: Date.now() - 950400000 },
        { id: 't15', type: 'expense', amount: 89.00,   categoryId: 'fun',       date: daysAgo(13), note: '游戏充值',        createdAt: Date.now() - 1036800000 },

        // ===== 本月早些时候（14-30 天前）=====
        { id: 't16', type: 'expense', amount: 320.00,  categoryId: 'health',    date: daysAgo(15), note: '感冒药',          createdAt: Date.now() - 1209600000 },
        { id: 't17', type: 'expense', amount: 178.00,  categoryId: 'food',      date: daysAgo(18), note: '超市采购',        createdAt: Date.now() - 1468800000 },
        { id: 't18', type: 'expense', amount: 256.00,  categoryId: 'shopping',  date: daysAgo(22), note: '家居用品',        createdAt: Date.now() - 1814400000 },

        // ===== 上月（30-60 天前，7月）=====
        { id: 't19', type: 'income',  amount: 8500.00, categoryId: 'salary',    date: daysAgo(32), note: '7月工资',         createdAt: Date.now() - 2678400000 },
        { id: 't20', type: 'expense', amount: 2500.00, categoryId: 'housing',   date: daysAgo(33), note: '房租 7月',        createdAt: Date.now() - 2764800000 },
        { id: 't21', type: 'expense', amount: 200.00,  categoryId: 'utilities', date: daysAgo(35), note: '水电 7月',        createdAt: Date.now() - 2937600000 },
        { id: 't22', type: 'income',  amount: 300.00,  categoryId: 'parttime',  date: daysAgo(38), note: '设计稿',          createdAt: Date.now() - 3196800000 },
        { id: 't23', type: 'expense', amount: 580.00,  categoryId: 'food',      date: daysAgo(42), note: '请客吃饭',        createdAt: Date.now() - 3542400000 },
        { id: 't24', type: 'expense', amount: 320.00,  categoryId: 'shopping',  date: daysAgo(45), note: '鞋子',            createdAt: Date.now() - 3801600000 },
        { id: 't25', type: 'expense', amount: 156.00,  categoryId: 'fun',       date: daysAgo(48), note: '演唱会门票',      createdAt: Date.now() - 4060800000 },
        { id: 't26', type: 'expense', amount: 220.00,  categoryId: 'health',    date: daysAgo(52), note: '买药',            createdAt: Date.now() - 4406400000 },
        { id: 't27', type: 'expense', amount: 89.00,   categoryId: 'transport', date: daysAgo(55), note: '加油',            createdAt: Date.now() - 4665600000 },

        // ===== 2 个月前（60-90 天前，6月）=====
        { id: 't28', type: 'income',  amount: 8500.00, categoryId: 'salary',    date: daysAgo(62), note: '6月工资',         createdAt: Date.now() - 5270400000 },
        { id: 't29', type: 'expense', amount: 2500.00, categoryId: 'housing',   date: daysAgo(63), note: '房租 6月',        createdAt: Date.now() - 5356800000 },
        { id: 't30', type: 'expense', amount: 180.00,  categoryId: 'utilities', date: daysAgo(65), note: '水电 6月',        createdAt: Date.now() - 5529600000 },
        { id: 't31', type: 'income',  amount: 500.00,  categoryId: 'bonus',     date: daysAgo(70), note: '项目奖金',        createdAt: Date.now() - 5958000000 },
        { id: 't32', type: 'expense', amount: 460.00,  categoryId: 'food',      date: daysAgo(72), note: '聚餐',            createdAt: Date.now() - 6134400000 },
        { id: 't33', type: 'expense', amount: 280.00,  categoryId: 'shopping',  date: daysAgo(76), note: '日用品',          createdAt: Date.now() - 6480000000 },
        { id: 't34', type: 'expense', amount: 420.00,  categoryId: 'fun',       date: daysAgo(80), note: '密室逃脱',        createdAt: Date.now() - 6825600000 },
        { id: 't35', type: 'expense', amount: 65.00,   categoryId: 'transport', date: daysAgo(85), note: '地铁',            createdAt: Date.now() - 7257600000 },
    ];

    /* ========== 汇总统计（与本月 transactions 保持一致）========== */
    const summary = {
        monthExpense: 4917.00,
        todayExpense: 125.50,
        monthIncome: 9000.00,
        monthBalance: 4083.00,
    };

    /* ========== 分类统计（用于统计页，按本月支出占比排序）========== */
    const categoryStats = [
        { categoryId: 'housing',   amount: 2500.00, percent: 51 },
        { categoryId: 'shopping',  amount: 844.00,  percent: 17 },
        { categoryId: 'food',      amount: 563.00,  percent: 11 },
        { categoryId: 'health',    amount: 320.00,  percent: 7  },
        { categoryId: 'fun',       amount: 288.00,  percent: 6  },
        { categoryId: 'utilities', amount: 198.00,  percent: 4  },
        { categoryId: 'transport', amount: 169.00,  percent: 3  },
        { categoryId: 'social',    amount: 35.00,   percent: 1  },
    ];

    /* ========== API ========== */
    return {
        currentUser,
        expenseCategories,
        incomeCategories,
        allCategories,
        transactions,
        summary,
        categoryStats,
        getCategoryById: (id) => allCategories().find((c) => c.id === id),
    };
})();

if (typeof window !== 'undefined') {
    window.MockData = MockData;
}
