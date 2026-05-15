import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import Stats from '@/components/Stats'
import InstallHero from '@/components/InstallHero'
import PlatformTabs from '@/components/PlatformTabs'
import Features from '@/components/Features'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'

async function getLatestVersion(): Promise<string> {
  try {
    const res = await fetch(
      'https://api.github.com/repos/tvdev-cli/tvdev-cli/releases/latest',
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        cache: 'force-cache',
      }
    )
    if (!res.ok) return ''
    const data = await res.json()
    return (data.tag_name as string) ?? ''
  } catch {
    return ''
  }
}

export default async function Home() {
  const version = await getLatestVersion()

  return (
    <main>
      <Nav version={version} />
      <InstallHero />
      <Stats />
      <Hero />
      <PlatformTabs />
      <Features />
      <CTA />
      <Footer />
    </main>
  )
}
