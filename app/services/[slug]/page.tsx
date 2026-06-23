export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import WorkCard from '@/components/WorkCard'
import styles from './page.module.css'

// ── Helpers ──────────────────────────────────────────────────────────────────


function slugify(title: string) {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

async function getSiteData(serviceId?: string) {
  const { loadPublicSiteData } = await import('@/lib/site-data')
  return loadPublicSiteData({ includeWorks: true, serviceId })
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const data = await getSiteData()
  const service = data.services.find((s) => slugify(s.title) === params.slug)
  if (!service) return {}
  return {
    title: `${service.title} | Our Services`,
    description: service.desc,
  }
}

// ── Static params ─────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const data = await getSiteData()
  return data.services.map((s) => ({ slug: slugify(s.title) }))
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ServicePage({
  params,
}: {
  params: { slug: string }
}) {
  const data = await getSiteData()
  const service = data.services.find((s) => slugify(s.title) === params.slug)
  if (!service) notFound()

  const serviceData = await getSiteData(service._id)
  const relatedWorks = serviceData.works

  const rawPhone = data.site.contact.phone.replace(/\D/g, '')
  const whatsappNumber = rawPhone.startsWith('91') ? rawPhone : `91${rawPhone}`

  return (
    <main className={styles.page}>

      {/* ── Slim header — back nav only ── */}
      <header className={styles.header}>
        <Link href="/#services" className={styles.back}>
          ← Services
        </Link>
      </header>

      {/* ── Title + count row ── */}
      <div className={styles.titleRow}>
        <h1 className={styles.pageTitle}>{service.title}</h1>
        {relatedWorks.length > 0 && (
          <span className={styles.countChip}>
            {relatedWorks.length} {relatedWorks.length === 1 ? 'work' : 'works'}
          </span>
        )}
      </div>

      <div className={styles.divider}>
        <hr />
      </div>

      {/* ── Works section ── */}
      <section className={styles.worksSection}>
        <div className={styles.inner}>
          {relatedWorks.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>📭</span>
              <p className={styles.emptyText}>
                Nothing here yet — check back soon or reach out to enquire.
              </p>
            </div>
          ) : (
            <div className={styles.grid}>
              {relatedWorks.map((work) => (
                <WorkCard
                  key={work._id}
                  work={work}
                  serviceTitle={service.title}
                  whatsappNumber={whatsappNumber}
                  serviceId={service._id}
                />
              ))}
            </div>
          )}
        </div>
      </section>

    </main>
  )
}