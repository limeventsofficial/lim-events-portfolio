import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Services from '@/components/Services'
import WorkShowcase from '@/components/WorkShowcase'
import About from '@/components/About'
import Contact from '@/components/Contact'
import { loadPublicSiteData } from '@/lib/site-data'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const data = await loadPublicSiteData()
  console.log(data, 'publicsite data')
  return (
    <main>
      <Navbar />
      <Hero
        heroCoverUrl={data.site.heroCoverUrl}
        heroStats={data.site.heroStats}
        heroCard={data.heroCard}
      />
      <Services services={data.services} />
      <About aboutStats={data.site.aboutStats} />
      <Contact contact={data.site.contact} siteYear={data.site.siteYear} />
    </main>
  )
}
