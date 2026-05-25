import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import WorkCard from '@/components/WorkCard'
import styles from './page.module.css'

// ── Helpers ──────────────────────────────────────────────────────────────────

function slugify(title: string) {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

// Replace with however you fetch your site data (e.g. from Sanity / API)
async function getSiteData() {
    const { loadPublicSiteData } = await import('@/lib/site-data')
    const data = await loadPublicSiteData()
    return loadPublicSiteData()
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

  // Filter works that belong to this service by matching title keyword
  // Adjust this logic to match your actual data relationship
  const relatedWorks = data.works.filter((w) =>
    w.title.toLowerCase().includes(service.title.toLowerCase()) ||
    // fallback: show all works if no keyword match (remove if you have a serviceId field)
    data.works.length > 0
  )

  // WhatsApp number from site settings (strip non-digits, add country code if needed)
  const rawPhone = data.site.contact.phone.replace(/\D/g, '')
  // If your number already has country code (e.g. 91...) use as-is, else prefix 91 for India
  const whatsappNumber = rawPhone.startsWith('91') ? rawPhone : `91${rawPhone}`

  return (
    <main className={styles.page}>
      {/* ── Back nav ── */}
      <div className={styles.nav}>
        <Link href="/#services" className={styles.back}>
          ← Back to Services
        </Link>
      </div>

      {/* ── Service hero ── */}
      <section className={styles.hero}>
        <div
          className={styles.iconWrap}
          style={{ background: service.color }}
        >
          <span className={styles.icon}>{service.icon}</span>
        </div>
        <span className={styles.tag}>✦ Our Work ✦</span>
        <h1 className={styles.title}>{service.title}</h1>
        <p className={styles.desc}>{service.desc}</p>
      </section>

      {/* ── Works grid ── */}
      <section className={styles.worksSection}>
        <div className={styles.inner}>
          {relatedWorks.length === 0 ? (
            <p className={styles.empty}>
              No works yet for this service — check back soon!
            </p>
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