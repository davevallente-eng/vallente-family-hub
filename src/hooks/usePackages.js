import { useCallback } from 'react'
import { useSupabaseTable } from './useSupabaseTable'

// Maps carrier → tracking-URL builder. Each one takes the tracking number and
// returns the canonical web tracker for that carrier so a single click jumps
// to the live status.
const TRACKING_URL = {
  USPS:   n => `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${encodeURIComponent(n)}`,
  UPS:    n => `https://www.ups.com/track?tracknum=${encodeURIComponent(n)}`,
  FedEx:  n => `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(n)}`,
  DHL:    n => `https://www.dhl.com/en/express/tracking.html?AWB=${encodeURIComponent(n)}`,
  Amazon: n => `https://www.amazon.com/progress-tracker/package/?orderId=${encodeURIComponent(n)}`,
  Other:  () => null,
}

export function trackingUrl(carrier, number) {
  const fn = TRACKING_URL[carrier] ?? TRACKING_URL.Other
  return fn(number)
}

// DB columns are snake_case (tracking_number, expected_date). Map both
// directions so consumer components keep their existing camelCase shape.
const mapRow = (r) => ({
  ...r,
  trackingNumber: r.tracking_number,
  expectedDate: r.expected_date,
})

const mapInsert = (r) => {
  const out = { ...r }
  if ('trackingNumber' in r) { out.tracking_number = r.trackingNumber; delete out.trackingNumber }
  if ('expectedDate' in r) { out.expected_date = r.expectedDate; delete out.expectedDate }
  return out
}

export function usePackages() {
  const { rows: packages, insert, update, remove } = useSupabaseTable('packages', {
    orderBy: 'created_at',
    ascending: false,
    mapRow,
    mapInsert,
  })

  const add = useCallback((pkg) => insert({ status: 'in_transit', ...pkg }), [insert])

  const setStatus = useCallback((id, status) => update(id, { status }), [update])

  return { packages, add, remove, setStatus }
}
