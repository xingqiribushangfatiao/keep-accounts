import { useNavigate } from 'react-router-dom';

/**
 * 顶部栏
 *   - title: 主标题
 *   - back : 是否显示左箭头
 *   - right: 右侧节点(可选)
 */
export default function TopBar({ title, back = false, right = null }) {
  const navigate = useNavigate();
  return (
    <header
      className="sticky top-0 z-20 bg-bg-soft-pink/95 backdrop-blur border-b border-border-blush pt-safe"
      style={{ minHeight: 'calc(56px + var(--safe-area-top, 0px))' }}
    >
      <div className="h-14 flex items-center px-2">
        {back ? (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full active:bg-surface-container-high"
            aria-label="返回"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>arrow_back</span>
          </button>
        ) : (
          <span className="w-10" />
        )}
        <h1 className="flex-1 text-center font-display font-bold text-base text-on-surface truncate">
          {title}
        </h1>
        <div className="w-10 flex items-center justify-center">{right}</div>
      </div>
    </header>
  );
}
