/**
 * Tailwind v3 配置
 *   - 颜色全部从 tokens.css 的 CSS 变量取,Tailwind 只做命名/引用
 *   - 字体:Be Vietnam Pro(body)/ Plus Jakarta Sans(display)
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary:                 'var(--primary)',
        'on-primary':             'var(--on-primary)',
        'primary-container':      'var(--primary-container)',
        'on-primary-container':   'var(--on-primary-container)',
        'bg-soft-pink':           'var(--bg-soft-pink)',
        surface:                  'var(--surface)',
        'surface-white':          'var(--surface-white)',
        'surface-container-low':  'var(--surface-container-low)',
        'surface-container':      'var(--surface-container)',
        'surface-container-high': 'var(--surface-container-high)',
        'on-surface':             'var(--on-surface)',
        'on-surface-variant':     'var(--on-surface-variant)',
        'text-muted':             'var(--text-muted)',
        'text-disabled':          'var(--text-disabled)',
        'border-blush':           'var(--border-blush)',
        'expense-red':            'var(--expense-red)',
        'income-teal':            'var(--income-teal)',
        error:                    'var(--error)',
        'on-error':               'var(--on-error)',
      },
      fontFamily: {
        body:    ['"Be Vietnam Pro"',     'sans-serif'],
        display: ['"Plus Jakarta Sans"',  'sans-serif'],
      },
      backgroundImage: {
        'primary-gradient':         'linear-gradient(135deg, #FF6B9D 0%, #FFB1C5 100%)',
        'primary-gradient-strong':  'linear-gradient(135deg, #FF6B9D 0%, #FF8FA8 100%)',
      },
      boxShadow: {
        'card':         '0 4px 16px rgba(255, 107, 157, 0.08)',
        'soft':         '0 2px 8px rgba(255, 107, 157, 0.05)',
        'bottom-nav':   '0 -4px 16px rgba(255, 107, 157, 0.08)',
        'level-2':      '0 6px 18px rgba(255, 107, 157, 0.25)',
      },
    },
  },
  plugins: [],
};
