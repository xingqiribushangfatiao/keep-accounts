/**
 * Petal Ledger (004) - DataStore
 * --------------------------------------------------------------------------
 * 真后端数据层(替换旧的 MockData)
 *   - 旧 MockData 静态演示数据,本文件改成"先 fetch,再同步读"的双形态
 *   - 老页面仍以 `MockData.transactions / .expenseCategories / .summary / ...`
 *     同步读,前提是先 await `MockData.init()`
 *   - 新增 DataStore 提供完整 CRUD + 缓存失效
 *
 * 调用模式:
 *   if (!Auth.requireAuth()) {} else { init(); }
 *   async function init() {
 *     await MockData.init();        // 一次拉齐
 *     const txs = MockData.transactions;  // 同步读
 *     ...
 *   }
 */
'use strict';

const MockData = (() => {
    /* ========== 内部缓存 ==========
     * 由 init() 拉取 / 写操作后回填
     */
    let _transactions      = [];
    let _expenseCategories = [];
    let _incomeCategories  = [];
    let _allCategories     = [];
    let _categoryMap       = {};      // id -> { id, name, emoji, color, type }
    let _summary           = null;    // { monthExpense, monthIncome, monthBalance, todayExpense, todayCount, budgetRemain }
    let _categoryStats     = [];      // [{ categoryId, amount, percent }]
    let _currentBookId     = null;    // 来自 /api/books/current
    let _loaded            = false;

    /* ========== emoji 兜底 ==========
     * 后端 categories.icon 字段存的是 emoji(与 schema seed 一致)
     * 旧 MockData 用 emoji,前端也用 emoji,所以 1:1
     * 没有的 code 用浅色兜底
     */
    const COLOR_OVERRIDE = {
        food:      '#FF6B9D',
        transport: '#4ECDC4',
        shopping:  '#FECA57',
        housing:   '#FFB1C5',
        fun:       '#E83E5C',
        health:    '#FF4D4F',
        pets:      '#FF9FF3',
        social:    '#48DBFB',
        other_exp: '#8395A7',
        salary:    '#10AC84',
        bonus:     '#FF6B9D',
        invest:    '#1DD1A1',
        parttime:  '#FECA57',
        gift_in:   '#FF9FF3',
        other_inc: '#C8D6E5',
    };

    /* ===========================================================
     * HTTP 工具:走 Auth.apiFetch(自动带 token + 401 拦截)
     * =========================================================== */
    const _get  = (path)      => Auth.apiFetch(path, { method: 'GET' });
    const _post = (path,body) => Auth.apiFetch(path, { method: 'POST',   body: JSON.stringify(body) });
    const _put  = (path,body) => Auth.apiFetch(path, { method: 'PUT',    body: JSON.stringify(body) });
    const _del  = (path)      => Auth.apiFetch(path, { method: 'DELETE' });

    /* ===========================================================
     * 当前账本(从 /api/books/current 拉,一次会话缓存)
     * =========================================================== */
    async function ensureBook() {
        if (_currentBookId) return _currentBookId;
        try {
            const data = await _get('/books/current');
            // 后端返回 { data: { book: { id, ... } } }
            _currentBookId = (data && data.data && data.data.book && data.data.book.id) || null;
        } catch (err) {
            console.warn('[MockData] 拉取当前账本失败:', err.message);
            _currentBookId = null;
        }
        return _currentBookId;
    }

    /* ===========================================================
     * 分类:预设 + 自定义 全部拉回
     * =========================================================== */
    async function loadCategories() {
        const [exp, inc] = await Promise.all([
            _get('/categories?type=expense'),
            _get('/categories?type=income'),
        ]);
        _expenseCategories = (exp && exp.data) || [];
        _incomeCategories  = (inc && inc.data) || [];
        _allCategories     = [..._expenseCategories, ..._incomeCategories];
        _categoryMap       = {};
        _allCategories.forEach((c) => {
            _categoryMap[c.id] = {
                id:     c.id,
                name:   c.name,
                emoji:  c.icon || '📦',
                color:  COLOR_OVERRIDE[c.code] || '#FF6B9D',
                type:   c.type,
            };
        });
    }

    /* ===========================================================
     * 交易:本月(后端默认 sort by date desc limit 500)
     * =========================================================== */
    async function loadTransactions() {
        const list = await _get('/transactions');
        const txs  = (list && list.data) || [];
        _transactions = txs.map((t) => ({
            id:         t.id,
            type:       t.type,
            amount:     Number(t.amount),
            categoryId: t.categoryId,
            date:       t.transactionDate,
            note:       t.note || '',
            createdAt:  t.createdAt ? new Date(t.createdAt).getTime() : Date.now(),
        }));
    }

    /* ===========================================================
     * 交易(分页版):给 list 页无限滚动用
     *   - type / createdMonth / categoryId 都是可选筛选项
     *   - limit 默认 20,offset 默认 0
     *   - 后端返回 {items, total, limit, offset, hasMore}
     * =========================================================== */
    async function listTransactions({ type, createdMonth, categoryId, limit = 20, offset = 0 } = {}) {
        const qs = new URLSearchParams();
        if (type)         qs.set('type', type);
        if (createdMonth) qs.set('createdMonth', createdMonth);
        if (categoryId)   qs.set('categoryId', String(categoryId));
        qs.set('limit',  String(limit));
        qs.set('offset', String(offset));
        const data = await _get(`/transactions?${qs.toString()}`);
        return (data && data.data) || { items: [], total: 0, limit, offset, hasMore: false };
    }

    /* ===========================================================
     * 有数据的 created_at 月份(YYYY-MM 倒序)
     * list 页"月份选择器"用
     * =========================================================== */
    async function getAvailableMonths() {
        const data = await _get('/transactions/available-months');
        return (data && data.data) || [];
    }

    /* ===========================================================
     * 汇总:本月 + 今日
     * =========================================================== */
    async function loadSummary() {
        const data = await _get('/stats/summary?range=month');
        const s    = (data && data.data) || {};
        const totalExpense = Number(s.totalExpense || 0);
        const totalIncome  = Number(s.totalIncome  || 0);

        // 今日支出 / 笔数:本地从 transactions 算
        // 用本地时区组装 YYYY-MM-DD,避免 UTC 日期在凌晨少一天
        const todayStr = Utils.today();
        const todayTxs = _transactions.filter((t) => t.date === todayStr);
        const todayExpense = todayTxs
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        // 预算结余:本轮预算字段未实装,沿用旧 demo 值(预算 5000 - 本月支出)
        // 真实场景应取后端预算接口
        const BUDGET_DEFAULT = 5000;
        _summary = {
            monthExpense: totalExpense,
            monthIncome:  totalIncome,
            monthBalance: totalIncome - totalExpense,
            todayExpense,
            todayCount:   todayTxs.length,
            budgetRemain: Math.max(0, BUDGET_DEFAULT - totalExpense),
        };

        // 分类排行 → 旧 MockData.categoryStats
        const rows = Array.isArray(s.byCategory) ? s.byCategory : [];
        const sumExp = rows.reduce((acc, r) => acc + Number(r.amount || 0), 0);
        _categoryStats = rows.map((r) => ({
            categoryId: r.categoryId,
            amount:     Number(r.amount),
            percent:    sumExp > 0
                ? Math.round((Number(r.amount) / sumExp) * 1000) / 10
                : 0,
        }));
    }

    /* ===========================================================
     * 初始化:三件事并发拉
     * =========================================================== */
    async function init({ force = false } = {}) {
        if (_loaded && !force) return;
        try {
            await ensureBook();
            await Promise.all([loadCategories(), loadTransactions()]);
            await loadSummary();
            _loaded = true;
        } catch (err) {
            console.error('[MockData] init 失败:', err);
            _loaded = !!(_allCategories.length || _transactions.length);
            throw err;
        }
    }

    /* ===========================================================
     * 写操作 + 自动回填缓存
     * =========================================================== */
    async function addTransaction({ type, amount, categoryId, date, note }) {
        const bookId = await ensureBook();
        const data = await _post('/transactions', {
            bookId, categoryId, type, amount,
            transactionDate: date,
            note: note || null,
        });
        await Promise.all([loadTransactions(), loadSummary()]);
        return (data && data.data) || null;
    }

    async function deleteTransaction(id) {
        await _del(`/transactions/${id}`);
        await Promise.all([loadTransactions(), loadSummary()]);
        return true;
    }

    /**
     * 清空当前用户(默认账本)的所有交易记录
     * 给"设置 → 清空记录"用
     * @returns {{ removed: number }} 被删除的条数
     */
    async function clearAllTransactions() {
        const data = await _del('/transactions');
        await Promise.all([loadTransactions(), loadSummary()]);
        return (data && data.data) || { removed: 0 };
    }

    async function refresh() {
        _loaded = false;
        return init({ force: true });
    }

    /* ===========================================================
     * 兼容旧页面的同步只读 API
     * =========================================================== */
    return {
        /* async API */
        init, refresh,
        addTransaction, deleteTransaction, clearAllTransactions,
        ensureBook, loadTransactions, loadCategories, loadSummary,
        listTransactions, getAvailableMonths,

        /* 同步只读(依赖 init 已完成) */
        get transactions()      { return _transactions; },
        get expenseCategories() { return _expenseCategories; },
        get incomeCategories()  { return _incomeCategories; },
        get allCategories()     { return _allCategories; },
        get summary()           {
            return _summary || {
                monthExpense: 0, monthIncome: 0, monthBalance: 0,
                todayExpense: 0, todayCount: 0, budgetRemain: 0,
            };
        },
        get categoryStats()     { return _categoryStats; },
        getCategoryById: (id) => _categoryMap[id] || null,
        get currentBookId()     { return _currentBookId; },
    };
})();

if (typeof window !== 'undefined') {
    window.MockData = MockData;
}
