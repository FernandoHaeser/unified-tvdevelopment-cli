export default function Hero() {
  return (
    <section
      className="relative flex flex-col items-center text-center px-6 md:px-16 pt-20 pb-20 overflow-hidden"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      <div
        className="inline-flex items-center gap-1.5 text-xs font-mono tracking-widest uppercase px-3.5 py-1.5 rounded-full border mb-7"
        style={{
          color: 'var(--indigo-light)',
          background: 'var(--indigo-dim)',
          borderColor: 'var(--border-strong)',
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-[pulseDot_2s_ease-in-out_infinite]" />
        Open Source &nbsp;·&nbsp; MIT License
      </div>

      <h2
        className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.06] mb-5"
        style={{ maxWidth: '18ch', letterSpacing: '-0.03em' }}
      >
        One CLI for{' '}
        <span
          style={{
            background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 40%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          all Smart TV
        </span>{' '}
        platforms
      </h2>

      <p
        className="text-lg md:text-xl leading-relaxed"
        style={{ color: 'var(--text-muted)', maxWidth: '52ch' }}
      >
        Build, deploy, package, and debug webOS, Tizen, Fire TV, and Android TV apps from a single
        terminal interface — no more switching between four different toolchains.
      </p>
    </section>
  )
}
