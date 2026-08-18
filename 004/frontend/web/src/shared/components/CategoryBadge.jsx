/**
 * 分类徽标(圆形 emoji)
 *   - category: { id, name, icon, color }
 *   - selected: 是否高亮(主色描边 + 内层浅底)
 *   - size    : 'sm' | 'md'
 */
export default function CategoryBadge({ category, selected = false, onClick, size = 'md' }) {
  const dim = size === 'sm' ? 48 : 64;
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex flex-col items-center gap-1 outline-none',
        'active:scale-95 transition',
      ].join(' ')}
      style={{ width: dim + 8 }}
    >
      <span
        className={[
          'rounded-full flex items-center justify-center',
          'border-2 transition',
          selected ? 'border-primary shadow-soft' : 'border-transparent',
        ].join(' ')}
        style={{
          width: dim,
          height: dim,
          backgroundColor: selected ? 'var(--surface-container)' : 'var(--surface-white)',
        }}
      >
        <span style={{ fontSize: dim * 0.46 }}>{category.icon}</span>
      </span>
      <span
        className={[
          'text-xs truncate',
          selected ? 'text-on-surface font-semibold' : 'text-text-muted',
        ].join(' ')}
        style={{ maxWidth: dim + 8 }}
      >
        {category.name}
      </span>
    </button>
  );
}
