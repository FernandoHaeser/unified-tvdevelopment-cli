import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'tvdev — Universal Smart TV Development CLI',
  description:
    'One CLI to rule all Smart TV platforms. Build, deploy, and debug webOS, Tizen, Fire TV, and Android TV apps from your terminal.',
  openGraph: {
    title: 'tvdev — Universal Smart TV Development CLI',
    description:
      'One CLI to rule all Smart TV platforms. Build, deploy, and debug webOS, Tizen, Fire TV, and Android TV apps from your terminal.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
