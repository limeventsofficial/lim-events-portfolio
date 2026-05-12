import type { SiteSettingsDTO } from '@/types/site'

export const DEFAULT_HERO_COVER = '/images/657621754_18309220528279470_1857005626033641820_n.webp'

export const defaultSiteSettings: SiteSettingsDTO = {
  heroCoverUrl: DEFAULT_HERO_COVER,
  heroCoverPublicId: undefined,
  heroStats: [
    { num: '10K+', label: 'Event organizers' },
    { num: '98%', label: 'Satisfaction rate' },
    { num: '50+', label: 'Event types' },
  ],
  aboutStats: [
    { num: '10K+', label: 'Events Planned' },
    { num: '98%', label: 'Client Satisfaction' },
    { num: '15+', label: 'Years Experience' },
    { num: '50+', label: 'Expert Partners' },
  ],
  contact: {
    address: '123 Blossom Lane, Event City',
    phone: '+1 (800) LIM-EVNT',
    email: 'hello@limevents.com',
  },
  siteYear: 2026,
}

export const defaultHeroCard = {
  title: 'Summer Garden Wedding',
  subtitle: 'June 14, 2025 · Rosewood Estate, Kochi',
}

export const defaultServicesSeed = [
  {
    order: 0,
    icon: '💍',
    title: 'Wedding Planning',
    desc: 'From intimate ceremonies to grand celebrations — we orchestrate every detail of your perfect day.',
    color: '#fde8d8',
  },
  {
    order: 1,
    icon: '🏢',
    title: 'Corporate Events',
    desc: 'Conferences, product launches, and team retreats designed to impress and inspire.',
    color: '#e8f0e8',
  },
  {
    order: 2,
    icon: '🎂',
    title: 'Private Parties',
    desc: 'Birthdays, anniversaries, and milestones — we turn every occasion into a cherished memory.',
    color: '#fdf0d8',
  },
  {
    order: 3,
    icon: '📸',
    title: 'Photography & Film',
    desc: 'Professional photography and videography to capture every beautiful, fleeting moment.',
    color: '#ede8f5',
  },
  {
    order: 4,
    icon: '🌸',
    title: 'Floral & Décor',
    desc: 'Bespoke floral arrangements and décor that set the scene and stir the soul.',
    color: '#fde8e8',
  },
  {
    order: 5,
    icon: '🍽️',
    title: 'Catering & Cuisine',
    desc: 'Curated menus and exceptional catering partners who make every bite memorable.',
    color: '#e8f5f0',
  },
]
