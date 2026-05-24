import { MAX_WORK_PHOTOS } from '@/lib/work-constants'
import type { ServiceDraft, WorkDoc, WorkDraft } from './types'

export { MAX_WORK_PHOTOS }

export function isServiceDraftValid(draft: ServiceDraft): boolean {
  return Boolean(draft.title.trim() && draft.desc.trim())
}

export function isWorkDraftValid(draft: Pick<WorkDraft, 'serviceId' | 'story' | 'photos'>): boolean {
  return Boolean(
    draft.serviceId.trim() &&
      draft.story.trim() &&
      draft.photos.length >= 1 &&
      draft.photos.length <= MAX_WORK_PHOTOS
  )
}

export function isWorkDocValid(work: WorkDoc): boolean {
  return isWorkDraftValid({
    serviceId: work.serviceId,
    story: work.story,
    photos: work.photos,
  })
}

export function workPhotoCountLabel(count: number, max = MAX_WORK_PHOTOS): string {
  return `${count} / ${max} uploaded`
}
