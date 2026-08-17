/* ==========================================================================
   Petal Ledger - Tailwind Configuration (Shared)
   --------------------------------------------------------------------------
   统一所有页面的 Tailwind 配置，避免重复。
   使用方式：<script src="../shared/css/tailwind.config.js"></script>
            <script src="https://cdn.tailwindcss.com"></script>
   ========================================================================== */

tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Surface
                surface: 'var(--surface)',
                'surface-dim': 'var(--surface-dim)',
                'surface-bright': 'var(--surface-bright)',
                'surface-container-lowest': 'var(--surface-container-lowest)',
                'surface-container-low': 'var(--surface-container-low)',
                'surface-container': 'var(--surface-container)',
                'surface-container-high': 'var(--surface-container-high)',
                'surface-container-highest': 'var(--surface-container-highest)',
                'surface-variant': 'var(--surface-variant)',
                'surface-white': 'var(--surface-white)',
                'bg-soft-pink': 'var(--bg-soft-pink)',
                background: 'var(--background)',

                // Text
                'on-surface': 'var(--on-surface)',
                'on-surface-variant': 'var(--on-surface-variant)',
                'inverse-surface': 'var(--inverse-surface)',
                'inverse-on-surface': 'var(--inverse-on-surface)',
                'text-muted': 'var(--text-muted)',
                'text-disabled': 'var(--text-disabled)',
                'border-blush': 'var(--border-blush)',

                // Primary
                primary: 'var(--primary)',
                'on-primary': 'var(--on-primary)',
                'primary-container': 'var(--primary-container)',
                'on-primary-container': 'var(--on-primary-container)',
                'primary-fixed': 'var(--primary-fixed)',
                'primary-fixed-dim': 'var(--primary-fixed-dim)',
                'on-primary-fixed': 'var(--on-primary-fixed)',
                'on-primary-fixed-variant': 'var(--on-primary-fixed-variant)',
                'surface-tint': 'var(--surface-tint)',
                'inverse-primary': 'var(--inverse-primary)',
                'expense-red': 'var(--expense-red)',

                // Secondary
                secondary: 'var(--secondary)',
                'on-secondary': 'var(--on-secondary)',
                'secondary-container': 'var(--secondary-container)',
                'on-secondary-container': 'var(--on-secondary-container)',
                'secondary-fixed': 'var(--secondary-fixed)',
                'secondary-fixed-dim': 'var(--secondary-fixed-dim)',
                'on-secondary-fixed': 'var(--on-secondary-fixed)',
                'on-secondary-fixed-variant': 'var(--on-secondary-fixed-variant)',
                'income-teal': 'var(--income-teal)',

                // Tertiary
                tertiary: 'var(--tertiary)',
                'on-tertiary': 'var(--on-tertiary)',
                'tertiary-container': 'var(--tertiary-container)',
                'on-tertiary-container': 'var(--on-tertiary-container)',
                'tertiary-fixed': 'var(--tertiary-fixed)',
                'tertiary-fixed-dim': 'var(--tertiary-fixed-dim)',
                'on-tertiary-fixed': 'var(--on-tertiary-fixed)',
                'on-tertiary-fixed-variant': 'var(--on-tertiary-fixed-variant)',

                // Error
                error: 'var(--error)',
                'on-error': 'var(--on-error)',
                'error-container': 'var(--error-container)',
                'on-error-container': 'var(--on-error-container)',

                // Outline
                outline: 'var(--outline)',
                'outline-variant': 'var(--outline-variant)',
            },
            borderRadius: {
                DEFAULT: 'var(--radius-sm)',
                sm: 'var(--radius-sm)',
                lg: 'var(--radius-default)',
                xl: 'var(--radius-lg)',
                '2xl': 'var(--radius-xl)',
                '3xl': 'var(--radius-2xl)',
                full: 'var(--radius-full)',
            },
            spacing: {
                base: 'var(--spacing-base)',
                'container-padding': 'var(--spacing-container-padding)',
                'card-gap': 'var(--spacing-card-gap)',
                'section-margin': 'var(--spacing-section-margin)',
                'grid-gutter': 'var(--spacing-grid-gutter)',
                safe: 'var(--safe-area-bottom)',
            },
            fontFamily: {
                'display-amount': ['Plus Jakarta Sans', 'sans-serif'],
                'headline-lg': ['Plus Jakarta Sans', 'sans-serif'],
                'headline-md': ['Plus Jakarta Sans', 'sans-serif'],
                'body-lg': ['Be Vietnam Pro', 'sans-serif'],
                'body-sm': ['Be Vietnam Pro', 'sans-serif'],
                'label-caps': ['Be Vietnam Pro', 'sans-serif'],
                'error-text': ['Be Vietnam Pro', 'sans-serif'],
            },
            fontSize: {
                'display-amount': ['40px', { lineHeight: '48px', letterSpacing: '-0.02em', fontWeight: '700' }],
                'headline-lg': ['24px', { lineHeight: '32px', fontWeight: '700' }],
                'headline-md': ['20px', { lineHeight: '28px', fontWeight: '600' }],
                'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
                'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
                'label-caps': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '600' }],
                'error-text': ['12px', { lineHeight: '16px', fontWeight: '400' }],
            },
            backgroundImage: {
                'primary-gradient': 'linear-gradient(135deg, #FF6B9D 0%, #ffb1c5 100%)',
            },
        },
    },
};
