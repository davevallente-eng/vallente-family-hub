import { useCallback, useMemo } from 'react'
import { useSupabaseTable } from './useSupabaseTable'

// DB: share_with, claimed_by — JS: shareWith, claimedBy.
const mapRow = (r) => ({
  ...r,
  shareWith: r.share_with ?? [],
  claimedBy: r.claimed_by ?? null,
})

const mapInsert = (r) => {
  const out = { ...r }
  if ('shareWith' in r) { out.share_with = r.shareWith; delete out.shareWith }
  if ('claimedBy' in r) { out.claimed_by = r.claimedBy; delete out.claimedBy }
  return out
}

// All wishlist items live in one bucket. Filtering by `currentName` gives us:
//   - myList: items the current member owns (no claim status surfaced)
//   - sharedWithMe: grouped lists from other members, with claim status
export function useWishlist(currentName) {
  const { rows: items, insert, update, remove } = useSupabaseTable('wishlist_items', {
    mapRow,
    mapInsert,
  })

  const add = useCallback((item) => insert({ claimedBy: null, ...item }), [insert])

  const claim = useCallback((id, claimer) => update(id, { claimedBy: claimer }), [update])

  const myList = useMemo(
    () => items.filter(i => i.owner === currentName),
    [items, currentName]
  )

  const sharedWithMe = useMemo(() => {
    const visible = items.filter(
      i => i.owner !== currentName && (i.shareWith ?? []).includes(currentName)
    )
    const byOwner = {}
    for (const i of visible) {
      byOwner[i.owner] = byOwner[i.owner] ?? []
      byOwner[i.owner].push(i)
    }
    return byOwner
  }, [items, currentName])

  return { myList, sharedWithMe, add, update, remove, claim }
}
