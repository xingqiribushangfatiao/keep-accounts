import { useRef, useState } from 'react';

/**
 * 左滑出现删除按钮(移动端 touch + 桌面端拖动)
 *   - onDelete(): 点击删除按钮触发
 *   - children : 主内容
 */
export default function SwipeRow({ onDelete, children }) {
  const [offset, setOffset] = useState(0);
  const startX  = useRef(0);
  const moved   = useRef(false);

  const onStart = (clientX) => {
    startX.current  = clientX;
    moved.current   = false;
  };
  const onMove = (clientX) => {
    const dx = clientX - startX.current;
    if (Math.abs(dx) > 4) moved.current = true;
    const next = Math.min(0, Math.max(-80, offset + dx));
    setOffset(next);
    startX.current = clientX;
  };
  const onEnd = () => {
    // 阈值 -40,过半则完全展开
    if (offset < -40) setOffset(-72);
    else              setOffset(0);
  };

  const touch = {
    onTouchStart: (e) => onStart(e.touches[0].clientX),
    onTouchMove:  (e) => onMove(e.touches[0].clientX),
    onTouchEnd:   onEnd,
  };
  const mouse = {
    onMouseDown: (e) => { onStart(e.clientX); },
    onMouseMove:  (e) => { if (e.buttons === 1) onMove(e.clientX); },
    onMouseUp:    onEnd,
    onMouseLeave: onEnd,
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div
        className="bg-surface-white"
        style={{ transform: `translateX(${offset}px)`, transition: moved.current ? 'none' : 'transform 0.2s' }}
        {...touch}
        {...mouse}
      >
        {children}
      </div>
      {/* 删除按钮(始终占位,靠 offset 让出) */}
      <button
        type="button"
        onClick={onDelete}
        className="absolute right-0 top-0 bottom-0 w-20 bg-error text-on-error font-semibold text-sm flex items-center justify-center"
        style={{ transform: `translateX(${offset + 80}px)`, transition: 'transform 0.2s' }}
      >
        删除
      </button>
      {/* 桌面端备用:不滑动也能直接点右下角小红点(测试用) */}
      <button
        type="button"
        onClick={onDelete}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-error text-on-error text-xs hidden md:flex items-center justify-center"
        title="删除(桌面端)"
      >
        ×
      </button>
    </div>
  );
}
