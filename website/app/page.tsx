import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import Stats from '@/components/Stats'
import InstallHero from '@/components/InstallHero'
import PlatformTabs from '@/components/PlatformTabs'
import Features from '@/components/Features'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Nav />
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
