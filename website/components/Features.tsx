const features = [
  {
    icon: '⌨️',
    title: 'Interactive TUI',
    body: 'Full-screen terminal interface built with Ink + React. Navigate with keyboard, switch platforms with p, stream logs in real-time.',
  },
  {
    icon: '📦',
    title: 'One-command deploy',
    body: 'Press d to package and deploy. tvdev picks the right tool — ares-package, sdb, adb — based on the active platform.',
  },
  {
    icon: '🔄',
    title: 'Platform switching',
    body: 'Hit p to cycle between webOS, Tizen, Fire TV, and Android TV without leaving the TUI.',
  },
  {
    icon: '🔌',
    title: 'SDK management',
    body: 'Auto-detects installed SDKs. Missing one? Press i for guided installation instructions per platform.',
  },
  {
    icon: '📡',
    title: 'Live log streaming',
    body: 'Tail device logs from within the TUI. Works across all platforms using the native log tool — no manual adb logcat juggling.',
  },
  {
    icon: '🛡️',
    title: 'Zero config required',
    body: 'No config files to write. tvdev discovers your devices and SDKs automatically. Just run tvdev.',
  },
]

export default function Features() {
  return (
    <section className="px-6 md:px-16 py-20 max-w-5xl mx-auto">
      <p className="section-label">Why tvdev</p>
      <h2
        className="text-4xl md:text-5xl font-bold tracking-tight text-center mb-3"
        style={{ letterSpacing: '-0.03em' }}
      >
        Everything you need, nothing you don&apos;t
      </h2>
      <p className="text-center text-base mb-12" style={{ color: 'var(--text-muted)', maxWidth: '52ch', margin: '0 auto 3rem' }}>
        Replace ares-cli, sdb, adb, and tizen-studio&apos;s CLI with a single interactive TUI that speaks all four languages.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
        {features.map(({ icon, title, body }) => (
          <div
            key={title}
            className="feature-card rounded-2xl p-7 transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div
              className="w-11 h-11 flex items-center justify-center rounded-xl text-xl mb-4"
              style={{ background: 'var(--indigo-dim)', border: '1px solid var(--border-strong)' }}
            >
              {icon}
            </div>
            <h3 className="font-bold text-base mb-2" style={{ letterSpacing: '-0.02em' }}>{title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
