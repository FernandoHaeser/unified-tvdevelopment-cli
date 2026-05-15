'use client'

import { useState } from 'react'

type OS = 'unix' | 'windows'

const CURL_CMD = 'curl -fsSL https://raw.githubusercontent.com/tvdev-cli/tvdev-cli/main/install.sh | bash'
const CURL_BETA = 'curl -fsSL https://raw.githubusercontent.com/tvdev-cli/tvdev-cli/main/install.sh | bash -s -- --beta'
const IWR_CMD = 'iwr -useb https://raw.githubusercontent.com/tvdev-cli/tvdev-cli/main/install.ps1 | iex'
const NPM_CMD = 'npm install -g unified-tvdevelopment-cli'

const checks = [
  'Installs Node.js automatically if missing',
  'Installs tvdev globally via npm',
  'Configures PATH — no manual setup',
  'Idempotent — run again to update',
]

export default function InstallHero() {
  const [os, setOs] = useState<OS>('unix')
  const [beta, setBeta] = useState(false)

  const primaryCmd = os === 'unix'
    ? (beta ? CURL_BETA : CURL_CMD)
    : IWR_CMD

  return (
    <section className="relative flex flex-col items-center px-6 md:px-16 pt-28 pb-20 overflow-hidden">
      {/* Background gradients */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.22) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 20% 70%, rgba(79,70,229,0.1) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 80% 80%, rgba(99,102,241,0.08) 0%, transparent 60%)
          `,
        }}
      />

      <div className="max-w-3xl w-full mx-auto relative flex flex-col items-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-1.5 text-xs font-mono tracking-widest uppercase px-3.5 py-1.5 rounded-full border mb-7"
          style={{
            color: 'var(--indigo-light)',
            background: 'var(--indigo-dim)',
            borderColor: 'var(--border-strong)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-[pulseDot_2s_ease-in-out_infinite]" />
          Installation
        </div>

        {/* Headline */}
        <h1
          className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.06] mb-4 text-center"
          style={{ letterSpacing: '-0.03em', maxWidth: '22ch' }}
        >
          Get started{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 40%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            in seconds
          </span>
        </h1>

        <p className="text-lg text-center mb-10 leading-relaxed" style={{ color: 'var(--text-muted)', maxWidth: '46ch' }}>
          One command installs everything. No manual configuration required.
        </p>

        {/* OS tabs */}
        <div className="flex gap-2 justify-center mb-6 w-full">
          {([['unix', 'macOS / Linux'], ['windows', 'Windows']] as [OS, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setOs(id)}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium border transition-all duration-150 cursor-pointer font-sans"
              style={{
                background: os === id ? 'var(--indigo-dim)' : 'transparent',
                borderColor: os === id ? 'var(--indigo)' : 'var(--border)',
                color: os === id ? 'var(--indigo-light)' : 'var(--text-muted)',
                fontWeight: os === id ? 600 : 500,
              }}
            >
              {id === 'unix' ? <UnixIcon /> : <WindowsIcon />}
              {label}
            </button>
          ))}
        </div>

        {/* Primary command terminal */}
        <div
          className="rounded-2xl overflow-hidden mb-4 w-full"
          style={{ border: '1px solid var(--border-strong)' }}
        >
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ background: '#161b22', borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <span className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>
              {os === 'unix' ? 'bash' : 'PowerShell'}
            </span>
            <CopyButton text={primaryCmd} />
          </div>
          <div className="px-5 py-4 font-mono text-sm overflow-x-auto" style={{ background: '#0d1117' }}>
            <span style={{ color: 'var(--indigo)' }}>{os === 'unix' ? '$' : 'PS>'}</span>
            {' '}
            <span style={{ color: '#c9d1d9' }}>{primaryCmd}</span>
          </div>
        </div>

        {/* Beta toggle (unix only) */}
        {os === 'unix' && (
          <div className="flex items-center justify-between w-full mb-6">
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
              {beta && (
                <>
                  Beta installs latest tagged release from{' '}
                  <a
                    href="https://github.com/tvdev-cli/tvdev-cli/releases"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-indigo-400"
                    style={{ color: 'var(--indigo-light)' }}
                  >
                    GitHub releases
                  </a>
                </>
              )}
            </p>
            <button
              onClick={() => setBeta(b => !b)}
              className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border transition-all duration-150 cursor-pointer font-sans flex-shrink-0"
              style={{
                borderColor: beta ? 'var(--indigo)' : 'var(--border)',
                color: beta ? 'var(--indigo-light)' : 'var(--text-dim)',
                background: beta ? 'var(--indigo-dim)' : 'transparent',
              }}
            >
              <span
                className="w-2 h-2 rounded-full transition-colors"
                style={{ background: beta ? 'var(--indigo-light)' : 'var(--text-dim)' }}
              />
              {beta ? 'beta channel' : 'stable channel'}
            </button>
          </div>
        )}

        {/* Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8 w-full">
          {checks.map(c => (
            <div key={c} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--text-muted)' }}>
              <span className="mt-0.5 flex-shrink-0 text-[var(--green)]">✓</span>
              {c}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-5 w-full">
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          <span className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>or install via npm</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>

        {/* npm fallback */}
        <div
          className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl font-mono text-sm w-full"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <span style={{ color: 'var(--indigo)' }}>$</span>
          <span className="flex-1" style={{ color: 'var(--text-muted)' }}>{NPM_CMD}</span>
          <CopyButton text={NPM_CMD} compact />
        </div>

        <p className="text-center text-xs mt-3" style={{ color: 'var(--text-dim)' }}>
          Requires Node.js ≥18 ·{' '}
          <a
            href="https://nodejs.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-indigo-400"
            style={{ color: 'var(--text-dim)' }}
          >
            nodejs.org
          </a>
        </p>

        {/* CTA buttons */}
        <div className="flex gap-3 flex-wrap justify-center mt-10">
          <a
            href="https://github.com/tvdev-cli/tvdev-cli"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-fill no-underline"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            View on GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/unified-tvdevelopment-cli"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost no-underline"
          >
            Docs &amp; npm →
          </a>
        </div>
      </div>
    </section>
  )
}

function CopyButton({ text, compact }: { text: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={copy}
      className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border transition-all duration-150 cursor-pointer bg-transparent font-sans flex-shrink-0 ${compact ? '' : ''}`}
      style={{
        color: copied ? 'var(--green)' : 'var(--text-muted)',
        borderColor: copied ? 'var(--green)' : 'var(--border)',
      }}
    >
      {copied ? <CheckIcon /> : <ClipboardIcon />}
      {copied ? 'copied!' : 'copy'}
    </button>
  )
}

function UnixIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <polyline points="8,21 12,17 16,21" />
    </svg>
  )
}

function WindowsIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
    </svg>
  )
}

function ClipboardIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="2" width="6" height="4" rx="1" />
      <path d="M9 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-3" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  )
}
