import { z } from 'zod'
import { quoteServiceValues } from './quoteOptions'

export const MAX_NAME_LENGTH = 100
export const MAX_ADDRESS_LENGTH = 200
export const MAX_MESSAGE_LENGTH = 2000
export const MAX_EMAIL_ERROR_LENGTH = 500
export const MIN_SUBMISSION_INTERVAL_MS = 60_000
export const MAX_EMAIL_ATTEMPTS = 3
export const EMAIL_RETRY_DELAYS_MS = [60_000, 5 * 60_000] as const

const quoteServiceSchema = z.enum(quoteServiceValues)

export const quoteSubmissionSchema = z.object({
  name: z.string().trim().min(1).max(MAX_NAME_LENGTH),
  address: z.string().trim().min(1).max(MAX_ADDRESS_LENGTH),
  service: quoteServiceSchema,
  message: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
  fingerprint: z.string().trim().min(8).max(128),
  honeypot: z.string().trim().max(0),
})

export type QuoteSubmission = z.infer<typeof quoteSubmissionSchema>

export function normalizeQuoteSubmission(input: QuoteSubmission) {
  return {
    name: input.name.trim(),
    address: input.address.trim(),
    service: input.service,
    message: input.message.trim(),
    fingerprint: input.fingerprint.trim(),
    honeypot: '',
  } satisfies QuoteSubmission
}

export function parseQuoteSubmission(input: unknown) {
  return normalizeQuoteSubmission(quoteSubmissionSchema.parse(input))
}

export function isSubmissionRateLimited(
  lastSubmissionAt: number | null,
  now: number,
) {
  if (lastSubmissionAt === null) {
    return false
  }

  return now - lastSubmissionAt < MIN_SUBMISSION_INTERVAL_MS
}

export function sanitizeEmailError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return message.slice(0, MAX_EMAIL_ERROR_LENGTH)
}
