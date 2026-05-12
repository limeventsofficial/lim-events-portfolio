export type StatPair = { num: string; label: string }

export type ContactInfo = {
  address: string
  phone: string
  email: string
}

export type SiteSettingsDTO = {
  heroCoverUrl: string
  heroCoverPublicId?: string
  heroStats: StatPair[]
  aboutStats: StatPair[]
  contact: ContactInfo
  siteYear: number
}

export type WorkPhoto = { url: string; publicId?: string }

export type WorkDTO = {
  _id: string
  title: string
  date: string
  venue: string
  photos: WorkPhoto[]
  story: string
  featured: boolean
  order: number
}

export type ServiceDTO = {
  _id: string
  order: number
  icon: string
  title: string
  desc: string
  color: string
}

export type HeroCardCopy = {
  title: string
  subtitle: string
}

export type PublicSiteData = {
  site: SiteSettingsDTO
  heroCard: HeroCardCopy
  services: ServiceDTO[]
  works: WorkDTO[]
}
