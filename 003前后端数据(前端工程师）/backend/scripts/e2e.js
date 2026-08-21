/**
 * 端到端联调测试 - 直接打真实后端
 * 用法:node scripts/e2e.js
 */
'use strict';

const http = require('http');
const BASE = '127.0.0.1';
const PORT = 3000;

function req(method, path, body, token) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = 'Bearer ' + token;
        if (data)  headers['Content-Length'] = Buffer.byteLength(data);
        const r = http.request({ host: BASE, port: PORT, method, path, headers }, (res) => {
            let buf = '';
            res.on('data', (c) => (buf += c));
            res.on('end', () => {
                let json = null;
                try { json = JSON.parse(buf); } catch { /* ignore */ }
                resolve({ status: res.statusCode, json });
            });
        });
        r.on('error', reject);
        if (data) r.write(data);
        r.end();
    });
}

(async () => {
    let pass = 0, fail = 0;
    const check = (label, ok, info) => {
        const tag = ok ? '[OK]' : '[FAIL]';
        const tail = info !== undefined ? '  - ' + (typeof info === 'object' ? JSON.stringify(info) : info) : '';
        console.log('  ' + tag + ' ' + label + tail);
        ok ? pass++ : fail++;
    };

    console.log('\n=== 1. /api/health ===');
    const h = await req('GET', '/api/health');
    check('health 200', h.status === 200, 'code=' + (h.json && h.json.code));
    check('db connected', h.json && h.json.data && h.json.data.db === 'connected');

    console.log('\n=== 2. POST /api/auth/login ===');
    const login = await req('POST', '/api/auth/login', { username: 'petal_love', password: 'password123' });
    check('login 200', login.status === 200, 'code=' + (login.json && login.json.code));
    const token = login.json && login.json.data && login.json.data.session && login.json.data.session.token;
    check('has token', !!token);

    console.log('\n=== 3. GET /api/books/current ===');
    const book = await req('GET', '/api/books/current', null, token);
    check('book 200', book.status === 200);
    // 后端返回 { data: { book: { id, ... } } }
    const bookId = book.json && book.json.data && book.json.data.book && book.json.data.book.id;
    check('bookId present', !!bookId, 'id=' + bookId);

    console.log('\n=== 4. GET /api/categories?type=expense ===');
    const exp = await req('GET', '/api/categories?type=expense', null, token);
    check('categories 200', exp.status === 200);
    const expList = (exp.json && exp.json.data) || [];
    check('expense categories >= 5', expList.length >= 5, 'count=' + expList.length);
    const food = expList.find((c) => c.code === 'food');
    check('food category exists', !!food, food ? 'id=' + food.id + ' icon=' + food.icon : 'not found');

    console.log('\n=== 5. GET /api/categories?type=income ===');
    const inc = await req('GET', '/api/categories?type=income', null, token);
    const incList = (inc.json && inc.json.data) || [];
    check('income categories >= 5', incList.length >= 5, 'count=' + incList.length);
    const salary = incList.find((c) => c.code === 'salary');
    check('salary category exists', !!salary, salary ? 'id=' + salary.id : 'not found');

    console.log('\n=== 6. POST /api/transactions (expense 28.50) ===');
    const tx1 = await req('POST', '/api/transactions', {
        bookId, categoryId: food.id, type: 'expense',
        amount: 28.50, transactionDate: '2026-08-19', note: 'E2E 测试午餐',
    }, token);
    check('create 201', tx1.status === 201, 'code=' + (tx1.json && tx1.json.code));
    const tx1id = tx1.json && tx1.json.data && tx1.json.data.id;
    check('txId returned', !!tx1id, 'id=' + tx1id);
    const tx1str = JSON.stringify(tx1.json);
    check('UTF-8 round-trip (no mojibake)',
        /测试午餐/.test(tx1str),
        tx1.json && tx1.json.data && tx1.json.data.note);

    console.log('\n=== 7. POST /api/transactions (income 8500) ===');
    const tx2 = await req('POST', '/api/transactions', {
        bookId, categoryId: salary.id, type: 'income',
        amount: 8500.00, transactionDate: '2026-08-19', note: 'E2E 测试工资',
    }, token);
    check('create 201', tx2.status === 201);
    const tx2id = tx2.json && tx2.json.data && tx2.json.data.id;

    console.log('\n=== 8. GET /api/transactions ===');
    const list = await req('GET', '/api/transactions', null, token);
    check('list 200', list.status === 200);
    const txs = (list.json && list.json.data) || [];
    check('list has >= 2', txs.length >= 2, 'count=' + txs.length);

    console.log('\n=== 9. GET /api/stats/summary?range=month ===');
    const sum = await req('GET', '/api/stats/summary?range=month', null, token);
    check('summary 200', sum.status === 200);
    const s = sum.json && sum.json.data;
    check('totalExpense == 28.5', s && s.totalExpense === 28.5, 'got ' + (s && s.totalExpense));
    check('totalIncome == 8500',  s && s.totalIncome  === 8500,  'got ' + (s && s.totalIncome));
    check('balance == 8471.5',    s && s.balance      === 8471.5, 'got ' + (s && s.balance));
    const foodRow = s && s.byCategory && s.byCategory.find((c) => c.categoryId === food.id);
    check('byCategory has food', !!foodRow, foodRow);

    console.log('\n=== 10. GET /api/stats/summary?range=week ===');
    const week = await req('GET', '/api/stats/summary?range=week', null, token);
    check('week 200', week.status === 200);
    check('week totalExpense == 28.5', week.json && week.json.data && week.json.data.totalExpense === 28.5);

    console.log('\n=== 11. GET /api/stats/summary?range=year ===');
    const year = await req('GET', '/api/stats/summary?range=year', null, token);
    check('year 200', year.status === 200);

    console.log('\n=== 12. DELETE /api/transactions/:id (tx1) ===');
    const del = await req('DELETE', '/api/transactions/' + tx1id, null, token);
    check('delete 200', del.status === 200);

    console.log('\n=== 13. Summary after delete ===');
    const sum2 = await req('GET', '/api/stats/summary?range=month', null, token);
    const s2 = sum2.json && sum2.json.data;
    check('expense back to 0', s2 && s2.totalExpense === 0, 'got ' + (s2 && s2.totalExpense));
    check('income still 8500', s2 && s2.totalIncome  === 8500, 'got ' + (s2 && s2.totalIncome));

    console.log('\n=== 14. POST /api/categories (custom) ===');
    const newCat = await req('POST', '/api/categories', {
        code: 'pet_test', name: '宠物测试', icon: '🐱', color: '#FF9FF3', type: 'expense',
    }, token);
    check('create cat 201', newCat.status === 201);
    const newCatId = newCat.json && newCat.json.data && newCat.json.data.id;
    check('new cat id present', !!newCatId);

    console.log('\n=== 15. DELETE /api/categories/:id (own custom) ===');
    const delCat = await req('DELETE', '/api/categories/' + newCatId, null, token);
    check('delete custom cat 200', delCat.status === 200);

    console.log('\n=== 16. DELETE preset category (should 404) ===');
    const delPreset = await req('DELETE', '/api/categories/' + food.id, null, token);
    check('preset cat 404', delPreset.status === 404, 'got ' + delPreset.status);

    console.log('\n=== 17. Auth required ===');
    const noauth = await req('GET', '/api/transactions');
    check('401 without token', noauth.status === 401);

    console.log('\n=== 18. PUT /api/transactions/:id ===');
    const tx3 = await req('POST', '/api/transactions', {
        bookId, categoryId: food.id, type: 'expense',
        amount: 50, transactionDate: '2026-08-19', note: 'before update',
    }, token);
    const tx3id = tx3.json && tx3.json.data && tx3.json.data.id;
    const upd = await req('PUT', '/api/transactions/' + tx3id, { amount: 99, note: 'after update' }, token);
    check('update 200', upd.status === 200);
    check('amount changed to 99', upd.json && upd.json.data && upd.json.data.amount === 99);
    check('note changed', upd.json && upd.json.data && upd.json.data.note === 'after update');

    // cleanup
    await req('DELETE', '/api/transactions/' + tx3id, null, token);
    await req('DELETE', '/api/transactions/' + tx2id, null, token);

    console.log('\n=== 19. Bad input validation ===');
    const badType = await req('POST', '/api/transactions', {
        bookId, categoryId: food.id, type: 'gift', amount: 10, transactionDate: '2026-08-19',
    }, token);
    check('reject bad type', badType.status === 400);
    const badDate = await req('POST', '/api/transactions', {
        bookId, categoryId: food.id, type: 'expense', amount: 10, transactionDate: 'not-a-date',
    }, token);
    check('reject bad date', badDate.status === 400);
    const badAmt = await req('POST', '/api/transactions', {
        bookId, categoryId: food.id, type: 'expense', amount: -5, transactionDate: '2026-08-19',
    }, token);
    check('reject negative amount', badAmt.status === 400);

    console.log('\n=== result: ' + pass + ' pass / ' + fail + ' fail ===');
    process.exit(fail > 0 ? 1 : 0);
})().catch((e) => { console.error('SCRIPT FAIL:', e); process.exit(1); });
