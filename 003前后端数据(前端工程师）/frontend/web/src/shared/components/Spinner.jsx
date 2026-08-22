/**
 * 加载指示器(纯 Tailwind 圆环,无需额外依赖)
 *   - size: 像素直径
 *   - className: 外部容器自定义
 */
export default function Spinner({ size = 24, className = '' }) {
  return (
    <div
      role="status"
      aria-label="loading"
      className={`inline-block ${className}`}
      style={{ width: size, height: size }}
    >
      <span
        className="block w-full h-full rounded-full border-2 border-border-blush border-t-primary animate-spin"
        style={{ width: size, height: size }}
      />
    </div>
  );
}
