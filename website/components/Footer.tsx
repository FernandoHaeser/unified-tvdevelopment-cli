import { TvIcon } from './icons'

const links = [
  { label: 'GitHub', href: 'https://github.com/tvdev-cli/tvdev-cli' },
  { label: 'npm', href: 'https://www.npmjs.com/package/unified-tvdevelopment-cli' },
  { label: 'Issues', href: 'https://github.com/tvdev-cli/tvdev-cli/issues' },
  { label: 'Changelog', href: 'https://github.com/tvdev-cli/tvdev-cli/releases' },
]

export default function Footer() {
  return (
    <footer
      className="px-6 md:px-16 py-10"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-2 font-bold text-base no-underline" style={{ color: 'var(--text)' }}>
            <TvIcon size={22} />
            tvdev
          </a>
          <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
            MIT License · © 2025 Fernando Haeser
          </span>
        </div>
        <div className="flex gap-5">
          {links.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link text-sm no-underline transition-colors duration-150"
              style={{ color: 'var(--text-dim)' }}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
