'use client'

import { useState } from 'react'

type Platform = 'webos' | 'tizen' | 'firetv' | 'androidtv'

interface Tab {
  id: Platform
  label: string
  platformLabel: string
  platformColor: string
  device: string
  tool: string
  buildLine: string
  successLines: string[]
}

const tabs: Tab[] = [
  {
    id: 'webos',
    label: 'LG webOS',
    platformLabel: 'webOS',
    platformColor: '#22c55e',
    device: 'Living Room TV (192.168.1.42)',
    tool: 'ares-package',
    buildLine: '» Packaging app with ares-package...',
    successLines: [
      '✔ com.myapp.tv_1.0.0_all.ipk built in 2.1s',
      '✔ Deployed to Living Room TV',
    ],
  },
  {
    id: 'tizen',
    label: 'Samsung Tizen',
    platformLabel: 'Tizen',
    platformColor: '#f59e0b',
    device: 'Samsung QN85B (10.0.0.5)',
    tool: 'tizen-studio CLI',
    buildLine: '» Building Tizen widget with tizen-studio CLI...',
    successLines: [
      '» Signing package with developer cert...',
      '✔ MyApp.wgt signed and deployed via SDB',
    ],
  },
  {
    id: 'firetv',
    label: 'Amazon Fire TV',
    platformLabel: 'Fire TV',
    platformColor: '#818cf8',
    device: 'Fire TV Stick 4K (adb:5555)',
    tool: 'adb',
    buildLine: '» adb install -r app-release.apk',
    successLines: [
      '✔ 1 package installed (com.myapp.firetv)',
      '✔ Activity launched: .MainActivity',
    ],
  },
  {
    id: 'androidtv',
    label: 'Android TV',
    platformLabel: 'Android TV',
    platformColor: '#22c55e',
    device: 'NVIDIA SHIELD (192.168.1.77:5555)',
    tool: 'adb',
    buildLine: '» Connecting to NVIDIA SHIELD via ADB over TCP...',
    successLines: [
      '✔ connected to 192.168.1.77:5555',
      '✔ com.myapp.androidtv installed & launched',
    ],
  },
]

export default function PlatformTabs() {
  const [active, setActive] = useState<Platform>('webos')
  const tab = tabs.find(t => t.id === active)!

  return (
    <section className="px-6 md:px-16 py-20 max-w-5xl mx-auto">
      <p className="section-label">Platform support</p>
      <h2
        className="text-4xl md:text-5xl font-bold tracking-tight text-center mb-3"
        style={{ letterSpacing: '-0.03em' }}
      >
        Works with every major platform
      </h2>
      <p className="text-center text-base mb-10" style={{ color: 'var(--text-muted)' }}>
        Switch between platforms with the{' '}
        <kbd
          className="font-mono text-xs px-1.5 py-0.5 rounded"
          style={{ background: 'var(--elevated)', border: '1px solid var(--border)' }}
        >
          p
        </kbd>{' '}
        key. Same commands, same workflow, every TV.
      </p>

      <div className="flex gap-2 justify-center flex-wrap mb-8">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 cursor-pointer font-sans"
            style={{
              background: active === t.id ? 'var(--indigo-dim)' : 'transparent',
              borderColor: active === t.id ? 'var(--indigo)' : 'var(--border)',
              color: active === t.id ? 'var(--indigo-light)' : 'var(--text-muted)',
              fontWeight: active === t.id ? 600 : 500,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="animate-[fadeIn_0.2s_ease] terminal-window">
        <div
          className="flex items-center gap-1.5 px-4 py-3"
          style={{ background: '#161b22', borderBottom: '1px solid var(--border)' }}
        >
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          <span className="ml-2 text-xs font-mono" style={{ color: 'var(--text-dim)' }}>
            tvdev — {tab.label}
          </span>
        </div>

        <div className="p-6 space-y-0.5">
          <Line prompt="$" cmd="tvdev" />
          <Blank />
          <Line hi="  tvdev" comment=" — Universal Smart TV CLI" />
          <div className="flex gap-2">
            <span style={{ color: 'var(--text-dim)' }}>  Platform: </span>
            <span style={{ color: tab.platformColor }}>{tab.platformLabel}</span>
            <span style={{ color: 'var(--text-dim)' }}> · Device: {tab.device}</span>
          </div>
          <Blank />
          <Output text="  [D] Deploy app         [P] Switch platform" />
          <Output text="  [L] View logs          [I] Install SDK" />
          <Output text="  [S] Shell into device  [Q] Quit" />
          <Blank />
          <Comment text={`  ${tab.buildLine}`} />
          {tab.successLines.map((line, i) => (
            <Success key={i} text={`  ${line}`} />
          ))}
          <Blank />
          <div className="flex gap-2">
            <span style={{ color: 'var(--indigo)' }}>›</span>
            <span
              className="inline-block w-2 h-[1em] rounded-sm align-text-bottom"
              style={{
                background: 'var(--indigo)',
                animation: 'blink 1.2s step-end infinite',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function Line({ prompt, cmd, hi, comment }: { prompt?: string; cmd?: string; hi?: string; comment?: string }) {
  return (
    <div className="flex gap-2">
      {prompt && <span style={{ color: 'var(--indigo)' }}>{prompt}</span>}
      {cmd && <span style={{ color: '#c9d1d9' }}>{cmd}</span>}
      {hi && <span style={{ color: 'var(--indigo-light)' }}>{hi}</span>}
      {comment && <span style={{ color: 'var(--text-dim)' }}>{comment}</span>}
    </div>
  )
}
function Output({ text }: { text: string }) {
  return <div style={{ color: 'var(--text-muted)', paddingLeft: '1.1rem' }}>{text}</div>
}
function Comment({ text }: { text: string }) {
  return <div style={{ color: 'var(--text-dim)' }}>{text}</div>
}
function Success({ text }: { text: string }) {
  return <div style={{ color: '#22c55e' }}>{text}</div>
}
function Blank() {
  return <div className="h-2.5" />
}
