'use client'

import { TvIcon } from './icons'

export default function Nav() {
  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-16 h-16"
      style={{
        background: 'rgba(6,6,15,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <a href="#" className="flex items-center gap-2.5 text-[var(--text)] font-bold text-lg no-underline tracking-tight">
        <TvIcon />
        tvdev
        <span
          className="text-[0.65rem] font-mono tracking-widest px-2 py-0.5 rounded-full border"
          style={{
            background: 'var(--indigo-dim)',
            color: 'var(--indigo-light)',
            borderColor: 'var(--border-strong)',
          }}
        >
          beta
        </span>
      </a>

      <div className="flex items-center gap-2">
        <a
          href="https://github.com/tvdev-cli/tvdev-cli"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-150 no-underline"
          style={{ color: 'var(--text-muted)', border: '1px solid transparent' }}
          onMouseEnter={e => {
            const el = e.currentTarget
            el.style.color = 'var(--text)'
            el.style.background = 'var(--indigo-dim)'
            el.style.borderColor = 'var(--border)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget
            el.style.color = 'var(--text-muted)'
            el.style.background = 'transparent'
            el.style.borderColor = 'transparent'
          }}
        >
          <GitHubIcon />
          GitHub
        </a>
        <a
          href="https://www.npmjs.com/package/unified-tvdevelopment-cli"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-fill no-underline"
        >
          npm install
        </a>
      </div>
    </nav>
  )
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}
