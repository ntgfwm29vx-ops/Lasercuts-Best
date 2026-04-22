export const quoteServiceValues = [
  'Basic Cut ($35 First Cut!)',
  'Premium Cut ($50+)',
  'Professional Mowing',
  'String Trimming / Weed Whacking',
  'Sidewalk & Driveway Edging',
  'Weed Removal & Pulling',
  'Weed Spraying',
  'Mulch Installation',
  'Rock Installation',
  'Planting (Flowers, Shrubs, etc.)',
  'Shrub & Bush Trimming',
  'Hedge Shaping / Removal',
  'Leaf Cleanup & Removal',
  'Small Shrub Removal',
  'Other / Full Cleanup',
] as const

export const quoteStatusValues = ['pending', 'contacted', 'completed'] as const
export const quoteEmailStatusValues = [
  'queued',
  'sending',
  'sent',
  'failed',
] as const

export type QuoteService = (typeof quoteServiceValues)[number]
export type QuoteStatus = (typeof quoteStatusValues)[number]
export type QuoteEmailStatus = (typeof quoteEmailStatusValues)[number]

export function isQuoteService(value: string): value is QuoteService {
  return quoteServiceValues.includes(value as QuoteService)
}
