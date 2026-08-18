import { useCallback } from 'react';

/**
 * 数字键盘(4 列 × 4 行)
 *   - value: string,受控值
 *   - onChange: (next) => void
 *   - 起始 '0',小数点不重复,2 位小数上限
 */
const ROWS = [
  ['1', '2', '3', { label: '⌫', action: 'del' }],
  ['4', '5', '6', { label: '今天', action: 'today' }],
  ['7', '8', '9', { label: '改日', action: 'date' }],
  ['.', '0', '00', { label: '完成', action: 'ok' }],
];

export default function NumberPad({ value, onChange }) {
  const update = useCallback(
    (next) => {
      // 限制:最大 9999999.99
      if (next.length > 10) return;
      onChange?.(next);
    },
    [onChange]
  );

  const handlePress = (key) => {
    if (key === '.') {
      if (value.includes('.')) return;
      update(value === '' ? '0.' : value + '.');
      return;
    }
    if (key === '00') {
      if (value === '0' || value === '') return;
      // 整数部分末尾补两个 0
      update(value + '00');
      return;
    }
    if (key === '0') {
      if (value === '0' || value === '') {
        update('0');
        return;
      }
      update(value + '0');
      return;
    }
    // 数字 1-9
    if (value === '0') {
      update(key);
      return;
    }
    // 小数部分限制 2 位
    const dotIdx = value.indexOf('.');
    if (dotIdx !== -1 && value.length - dotIdx - 1 >= 2) return;
    update(value + key);
  };

  const handleAction = (action) => {
    if (action === 'del') {
      if (value.length <= 1) update('0');
      else update(value.slice(0, -1));
      return;
    }
    // today / date / ok:目前 NumberPad 不处理,交给上层(RecordPage)接管
    // 通过 window 事件冒泡出去(简单)
    window.dispatchEvent(new CustomEvent('numberpad:action', { detail: { action } }));
  };

  return (
    <div className="grid grid-cols-4 gap-2 p-3 bg-surface-white rounded-2xl">
      {ROWS.flat().map((cell, i) => {
        if (typeof cell === 'string') {
          return (
            <button
              key={i}
              type="button"
              onClick={() => handlePress(cell)}
              className="h-14 rounded-xl bg-surface-container-low text-xl font-display font-semibold text-on-surface active:bg-surface-container"
            >
              {cell}
            </button>
          );
        }
        // 操作键
        const { label, action } = cell;
        const isOk = action === 'ok';
        return (
          <button
            key={i}
            type="button"
            onClick={() => handleAction(action)}
            className={[
              'h-14 rounded-xl text-sm font-semibold',
              isOk
                ? 'bg-primary-gradient text-on-primary shadow-soft'
                : 'bg-surface-container text-on-surface-variant',
            ].join(' ')}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
