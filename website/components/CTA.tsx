'use client'

import { useState } from 'react'

export default function CTA() {
  return (
    <section className="relative px-6 md:px-16 py-24 text-center overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 60% at 50% 100%, rgba(99,102,241,0.14) 0%, transparent 70%)',
        }}
      />
      <h2
        className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4"
        style={{ letterSpacing: '-0.04em' }}
      >
        Start shipping to every TV
      </h2>
      <p className="mb-10" style={{ color: 'var(--text-muted)', maxWidth: '46ch', margin: '0 auto 2.5rem' }}>
        One install. Four platforms. No context switching.
      </p>

      <div className="flex flex-col items-center gap-3 max-w-lg mx-auto mb-6">
        <InstallCmd text="npm install -g unified-tvdevelopment-cli" />
        <InstallCmd text="tvdev" />
      </div>

      <div className="flex gap-3 justify-center flex-wrap mt-4">
        <a
          href="https://github.com/tvdev-cli/tvdev-cli"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-fill no-underline"
        >
          View on GitHub
        </a>
        <a
          href="https://www.npmjs.com/package/unified-tvdevelopment-cli"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost no-underline"
        >
          npm package
        </a>
      </div>
    </section>
  )
}

function InstallCmd({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      className="flex items-center justify-between gap-4 w-full px-4 py-3 rounded-xl font-mono text-sm"
      style={{ background: 'var(--card)', border: '1px solid var(--border-strong)' }}
    >
      <span style={{ color: 'var(--indigo)' }}>$</span>
      <span className="flex-1 text-left">{text}</span>
      <button
        onClick={copy}
        className="text-xs px-2 py-1 rounded-md border transition-all duration-150 cursor-pointer bg-transparent font-sans"
        style={{
          color: copied ? 'var(--green)' : 'var(--text-muted)',
          borderColor: copied ? 'var(--green)' : 'var(--border)',
        }}
      >
        {copied ? 'copied!' : 'copy'}
      </button>
    </div>
  )
}
