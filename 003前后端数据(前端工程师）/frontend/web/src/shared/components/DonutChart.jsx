import { useMemo } from 'react';

/**
 * 简易环形图(SVG,无外部依赖)
 *   - segments: [{ value, color }]   value 任意可比较的数字
 *   - centerLabel / centerValue: 中间显示
 */
export default function DonutChart({ segments = [], centerLabel, centerValue }) {
  const { total, paths } = useMemo(() => {
    const t = segments.reduce((s, x) => s + (Number(x.value) || 0), 0) || 1;
    const r = 40;
    const c = 2 * Math.PI * r;
    let acc = 0;
    const ps = segments.map((seg) => {
      const v = (Number(seg.value) || 0) / t;
      const len = v * c;
      const path = {
        dasharray: `${len} ${c - len}`,
        dashoffset: -acc * c,
        color:     seg.color,
      };
      acc += v;
      return path;
    });
    return { total: t, paths: ps };
  }, [segments]);

  return (
    <div className="relative inline-block" style={{ width: 200, height: 200 }}>
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--surface-container-high)" strokeWidth="16" />
        {paths.map((p, i) => (
          <circle
            key={i}
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={p.color}
            strokeWidth="16"
            strokeDasharray={p.dasharray}
            strokeDashoffset={p.dashoffset}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {centerLabel && <div className="text-xs text-text-muted">{centerLabel}</div>}
        {centerValue != null && (
          <div className="text-lg font-display font-bold text-on-surface">{centerValue}</div>
        )}
      </div>
    </div>
  );
}
