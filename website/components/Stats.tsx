const stats = [
  { num: '4', label: 'TV Platforms' },
  { num: '1', label: 'Unified TUI' },
  { num: '0', label: 'Config Files Needed' },
  { num: 'MIT', label: 'Open Source' },
]

export default function Stats() {
  return (
    <div
      className="px-6 md:px-16 py-10"
      style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--card)' }}
    >
      <div className="max-w-4xl mx-auto flex justify-around flex-wrap gap-8">
        {stats.map(({ num, label }) => (
          <div key={label} className="text-center">
            <div
              className="text-4xl font-extrabold tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #818cf8, #6366f1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {num}
            </div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
