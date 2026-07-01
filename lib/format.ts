/** Prices from the API are in centimes XOF → divide by 100 to get FCFA. */
export function formatPrice(amount: number | null | undefined): string {
  const value = Math.round(amount ?? 0)
  return `${value.toLocaleString('fr-FR').replace(/\u00a0/g, ' ')} FCFA`
}

/** Distance formatting: < 1km → "800 m", >= 1km → "3.2 km" */
export function formatDistance(km: number | null | undefined): string {
  if (km == null) return ''
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}

export function formatMinutes(minutes: number | null | undefined): string {
  if (!minutes) return '—'
  return `${Math.round(minutes)} min`
}

export const CI_CITIES = [
  'Abidjan',
  'Bouaké',
  'Yamoussoukro',
  'Daloa',
  'San-Pédro',
  'Korhogo',
  'Man',
  'Gagnoa',
]

export const CATEGORIES = [
  { key: 'all', label: 'Tous' },
  { key: 'fast_food', label: 'Fast Food' },
  { key: 'restaurant', label: 'Restaurant' },
  { key: 'pizza', label: 'Pizza' },
  { key: 'poulet', label: 'Poulet' },
  { key: 'grillades', label: 'Grillades' },
]

/** Default fallback location: Abidjan centre */
export const ABIDJAN = { lat: 5.3542, lng: -3.9827 }
