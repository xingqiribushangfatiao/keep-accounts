import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopBar from '@shared/components/TopBar.jsx';
import CategoryBadge from '@shared/components/CategoryBadge.jsx';
import NumberPad from '@shared/components/NumberPad.jsx';
import { useCategories } from '@shared/hooks/useCategories';
import { useTransactions } from '@shared/hooks/useTransactions';
import { useCurrentBook } from '@shared/hooks/useBooks';
import { useToast } from '@shared/components/Toast.jsx';
import { today } from '@shared/lib/formatDate';

/**
 * 记一笔页(支持新建 + 编辑)
 *  - 路径:/record(新建)| /record/:uuid(编辑)
 *  - 顶部 X 关闭 → 回 /
 *  - 支出/收入 tab 切换分类集
 *  - NumberPad 完成 → 保存
 *  - 提交:有 currentBook → 用其 id;否则占位 bookId=1
 */
export default function RecordPage() {
  const navigate = useNavigate();
  const { uuid } = useParams();
  const { showToast } = useToast();
  const isEdit   = Boolean(uuid);

  const { data: book }  = useCurrentBook(true);
  const { items, addTx, updateTx, removeTx } = useTransactions();

  const [type, setType]   = useState('expense');
  const [amount, setAmount] = useState('0');
  const [date, setDate]     = useState(today());
  const [note, setNote]     = useState('');
  const [catId, setCatId]   = useState(null);

  const categories = useCategories(type);

  // 编辑模式:预填
  useEffect(() => {
    if (!isEdit) return;
    const tx = items.find((t) => t.uuid === uuid);
    if (!tx) return;
    setType(tx.type);
    setAmount(String(tx.amount));
    setDate(tx.transactionDate);
    setNote(tx.note || '');
    setCatId(tx.categoryId);
  }, [isEdit, uuid, items]);

  // 默认选第一个分类
  useEffect(() => {
    if (!catId && categories.length) setCatId(categories[0].id);
    if (catId && !categories.find((c) => c.id === catId)) {
      setCatId(categories[0]?.id || null);
    }
  }, [categories, catId]);

  // 监听 NumberPad 的"今天/改日/完成"
  useEffect(() => {
    const onAction = (e) => {
      const action = e.detail?.action;
      if (action === 'today') setDate(today());
      if (action === 'date') {
        const next = window.prompt('输入日期(YYYY-MM-DD)', date);
        if (next && /^\d{4}-\d{2}-\d{2}$/.test(next)) setDate(next);
      }
      if (action === 'ok') handleSave();
    };
    window.addEventListener('numberpad:action', onAction);
    return () => window.removeEventListener('numberpad:action', onAction);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, catId, type, date, note, isEdit, uuid, book]);

  const handleSave = () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      showToast({ type: 'error', message: '请输入有效金额' });
      return;
    }
    if (!catId) {
      showToast({ type: 'error', message: '请选择分类' });
      return;
    }
    const bookId = book?.id || 1; // 兜底
    const payload = { type, amount: amt, categoryId: catId, transactionDate: date, note: note.trim() };
    if (isEdit) {
      updateTx(uuid, payload);
      showToast({ type: 'success', message: '已更新' });
    } else {
      addTx({ ...payload, bookId });
      showToast({ type: 'success', message: '已记一笔' });
    }
    navigate('/');
  };

  const handleDelete = () => {
    if (!isEdit) return;
    if (!window.confirm('确定删除该记录吗?')) return;
    removeTx(uuid);
    showToast({ type: 'success', message: '已删除' });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-bg-soft-pink pb-6">
      <TopBar
        title={isEdit ? '编辑记录' : '记一笔'}
        right={
          isEdit ? (
            <button
              type="button"
              onClick={handleDelete}
              className="w-9 h-9 rounded-full bg-error text-on-error flex items-center justify-center"
              aria-label="删除"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
            </button>
          ) : null
        }
      />

      {/* 关闭按钮(覆盖 TopBar 的 back) */}
      <button
        type="button"
        onClick={() => navigate('/')}
        className="fixed top-3 left-3 w-10 h-10 rounded-full bg-surface-white border border-border-blush flex items-center justify-center shadow-soft z-30"
        aria-label="关闭"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 22 }}>close</span>
      </button>

      {/* 金额显示 */}
      <div className="px-6 pt-6 pb-3 text-center">
        <div className="text-xs text-text-muted">{date}</div>
        <div className="mt-1 font-display font-bold text-on-surface" style={{ fontSize: 48, lineHeight: 1.1 }}>
          {type === 'expense' ? '-' : '+'}¥{amount}
        </div>
        {book ? (
          <div className="text-xs text-text-muted mt-1">📒 {book.name}</div>
        ) : (
          <div className="text-xs text-text-muted mt-1">未关联账本(将使用默认)</div>
        )}
      </div>

      {/* 支出/收入 切换 */}
      <div className="px-6 mt-2">
        <div className="flex bg-surface-white rounded-full p-1 border border-border-blush">
          {[
            { v: 'expense', l: '支出' },
            { v: 'income',  l: '收入' },
          ].map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setType(opt.v)}
              className={[
                'flex-1 h-9 rounded-full text-sm transition',
                type === opt.v ? 'bg-primary text-on-primary font-semibold' : 'text-text-muted',
              ].join(' ')}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      {/* 分类网格 */}
      <div className="px-6 mt-4">
        <div className="grid grid-cols-5 gap-y-3 gap-x-2">
          {categories.map((c) => (
            <div key={c.id} className="flex justify-center">
              <CategoryBadge
                category={c}
                selected={c.id === catId}
                onClick={() => setCatId(c.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 备注 */}
      <div className="px-6 mt-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" style={{ fontSize: 18 }}>edit</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="备注(选填,最多 50 字)"
            maxLength={50}
            className="input-field"
          />
        </div>
      </div>

      {/* 数字键盘 */}
      <div className="px-3 mt-4">
        <NumberPad value={amount} onChange={setAmount} />
      </div>

      {/* 保存按钮 */}
      <div className="px-6 mt-4">
        <button
          type="button"
          onClick={handleSave}
          className="w-full h-12 rounded-full bg-primary-gradient text-on-primary font-semibold shadow-level-2 active:scale-[0.98]"
        >
          {isEdit ? '保 存' : '记 一 笔'}
        </button>
      </div>
    </div>
  );
}
