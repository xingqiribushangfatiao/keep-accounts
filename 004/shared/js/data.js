/**
 * Petal Ledger (004) - Mock Data
 * --------------------------------------------------------------------------
 * 演示用模拟数据，所有数据相对"今天"动态生成。
 * 数据覆盖：分类、用户、本月记录、统计数据。
 * 数值与 home-screen / list-screen / stats-screen 完全一致：
 *   本月支出 3,280.50 / 本月收入 8,500.00 / 本月结余 5,219.50
 *   今日支出 46.50 (餐饮 28.50 + 交通 18.00)
 *   分类占比：餐饮 35% / 购物 20% / 交通 15% / 住房 12% / 娱乐 8% / 其他 10%
 */

const MockData = (() => {
    const expenseCategories = [
        { id: 'food',      name: '餐饮', emoji: '🍜', color: '#FF6B9D' },
        { id: 'transport', name: '交通', emoji: '🚗', color: '#4ECDC4' },
        { id: 'shopping',  name: '购物', emoji: '🛒', color: '#FECA57' },
        { id: 'housing',   name: '住房', emoji: '🏠', color: '#FFB1C5' },
        { id: 'fun',       name: '娱乐', emoji: '🎮', color: '#E83E8C' },
        { id: 'health',    name: '医疗', emoji: '💊', color: '#FF4D4F' },
        { id: 'pets',      name: '宠物', emoji: '🐱', color: '#FF9FF3' },
        { id: 'social',    name: '社交', emoji: '☕', color: '#48DBFB' },
        { id: 'other_exp', name: '其他', emoji: '📦', color: '#8395A7' },
    ];

    const incomeCategories = [
        { id: 'salary',    name: '工资', emoji: '💰', color: '#10AC84' },
        { id: 'bonus',     name: '奖金', emoji: '🧧', color: '#FF6B9D' },
        { id: 'invest',    name: '投资', emoji: '📈', color: '#1DD1A1' },
        { id: 'parttime',  name: '兼职', emoji: '🕒', color: '#FECA57' },
        { id: 'gift_in',   name: '礼金', emoji: '🎁', color: '#FF9FF3' },
        { id: 'other_inc', name: '其他', emoji: '🪙', color: '#C8D6E5' },
    ];

    const allCategories = () => [...expenseCategories, ...incomeCategories];

    const currentUser = {
        id: 'demo-user-001',
        username: 'petal_love',
        nickname: 'Petal User',
        avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=petal&backgroundColor=ffd1dc',
    };

    /* ========== 模拟记录（金额与设计图一致）========== */
    const today = new Date();
    const fmt = (d) => d.toISOString().slice(0, 10);
    const daysAgo = (n) => {
        const d = new Date(today);
        d.setDate(d.getDate() - n);
        return fmt(d);
    };

    const transactions = [
        // 今日 8/16
        { id: 't01', type: 'expense', amount: 28.50,  categoryId: 'food',      date: daysAgo(0), note: '午餐麻辣烫',       createdAt: Date.now() - 3600000 },
        { id: 't02', type: 'expense', amount: 18.00,  categoryId: 'transport', date: daysAgo(0), note: '打车去公司',       createdAt: Date.now() - 7200000 },

        // 昨日 8/15
        { id: 't03', type: 'income',  amount: 8500.00, categoryId: 'salary',   date: daysAgo(1), note: '8月基本工资',     createdAt: Date.now() - 86400000 },

        // 8/14 购物
        { id: 't04', type: 'expense', amount: 39.50,  categoryId: 'shopping',  date: daysAgo(2), note: '买水和纸巾',       createdAt: Date.now() - 172800000 },

        // 8/13 餐饮
        { id: 't05', type: 'expense', amount: 86.00,  categoryId: 'food',      date: daysAgo(3), note: '朋友聚餐',         createdAt: Date.now() - 259200000 },

        // 8/12 购物 大额
        { id: 't06', type: 'expense', amount: 656.10, categoryId: 'shopping',  date: daysAgo(4), note: '夏装换季',         createdAt: Date.now() - 345600000 },

        // 8/10 交通
        { id: 't07', type: 'expense', amount: 156.00, categoryId: 'transport', date: daysAgo(6), note: '高铁出差',         createdAt: Date.now() - 518400000 },

        // 8/8 娱乐
        { id: 't08', type: 'expense', amount: 262.44, categoryId: 'fun',       date: daysAgo(8), note: '电影+游戏充值',   createdAt: Date.now() - 691200000 },

        // 8/5 餐饮
        { id: 't09', type: 'expense', amount: 420.00, categoryId: 'food',      date: daysAgo(11), note: '请客吃饭',         createdAt: Date.now() - 950400000 },

        // 8/3 住房
        { id: 't10', type: 'expense', amount: 393.66, categoryId: 'housing',   date: daysAgo(13), note: '房租分摊',         createdAt: Date.now() - 1123200000 },

        // 8/1 餐饮
        { id: 't11', type: 'expense', amount: 613.67, categoryId: 'food',      date: daysAgo(15), note: '周末聚餐+外卖',   createdAt: Date.now() - 1296000000 },

        // 上月 7/30 餐饮
        { id: 't12', type: 'expense', amount: 178.00, categoryId: 'food',      date: daysAgo(17), note: '外卖',             createdAt: Date.now() - 1468800000 },

        // 7/28 交通
        { id: 't13', type: 'expense', amount: 318.08, categoryId: 'transport', date: daysAgo(19), note: '加油+停车',         createdAt: Date.now() - 1641600000 },

        // 7/25 住房
        { id: 't14', type: 'expense', amount: 1200.00, categoryId: 'housing',  date: daysAgo(22), note: '7月房租',          createdAt: Date.now() - 1900800000 },

        // 7/15 工资
        { id: 't15', type: 'income',  amount: 8500.00, categoryId: 'salary',   date: daysAgo(32), note: '7月工资',          createdAt: Date.now() - 2764800000 },
    ];

    /* ========== 汇总统计（与设计图一致）========== */
    const summary = {
        monthExpense: 3280.50,
        todayExpense: 46.50,
        monthIncome: 8500.00,
        monthBalance: 5219.50,
        budgetRemain: 1719.50,    // 预算结余 5000 - 3280.50
    };

    /* ========== 分类统计（与设计图一致：35/15/20/12/8/10）==========
       顺序按设计图环形图顺时针顺序：餐饮 → 交通 → 购物 → 住房 → 娱乐 → 其他 */
    const categoryStats = [
        { categoryId: 'food',      amount: 1148.17, percent: 35 },
        { categoryId: 'transport', amount: 492.08,  percent: 15 },
        { categoryId: 'shopping',  amount: 656.10,  percent: 20 },
        { categoryId: 'housing',   amount: 393.66,  percent: 12 },
        { categoryId: 'fun',       amount: 262.44,  percent: 8  },
        { categoryId: 'other_exp', amount: 328.05,  percent: 10 },
    ];

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
