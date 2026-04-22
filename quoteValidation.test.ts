import { describe, expect, it } from 'vitest'
import {
  MAX_ADDRESS_LENGTH,
  MAX_MESSAGE_LENGTH,
  MAX_NAME_LENGTH,
  MIN_SUBMISSION_INTERVAL_MS,
  isSubmissionRateLimited,
  parseQuoteSubmission,
  sanitizeEmailError,
} from './quoteValidation'

describe('parseQuoteSubmission', () => {
  it('trims valid input and returns normalized values', () => {
    const result = parseQuoteSubmission({
      name: ' Trey Torres ',
      address: ' 123 Main St ',
      service: 'Basic Cut ($35 First Cut!)',
      message: ' Weekly service please. ',
      fingerprint: ' client-fingerprint ',
      honeypot: '',
    })

    expect(result).toEqual({
      name: 'Trey Torres',
      address: '123 Main St',
      service: 'Basic Cut ($35 First Cut!)',
      message: 'Weekly service please.',
      fingerprint: 'client-fingerprint',
      honeypot: '',
    })
  })

  it('rejects invalid services', () => {
    expect(() =>
      parseQuoteSubmission({
        name: 'Trey',
        address: '123 Main St',
        service: 'Invalid service',
        message: 'Help',
        fingerprint: 'client-fingerprint',
        honeypot: '',
      }),
    ).toThrow()
  })

  it('rejects honeypot values', () => {
    expect(() =>
      parseQuoteSubmission({
        name: 'Trey',
        address: '123 Main St',
        service: 'Basic Cut ($35 First Cut!)',
        message: 'Help',
        fingerprint: 'client-fingerprint',
        honeypot: 'spam',
      }),
    ).toThrow()
  })

  it('enforces max lengths', () => {
    expect(() =>
      parseQuoteSubmission({
        name: 'x'.repeat(MAX_NAME_LENGTH + 1),
        address: 'y'.repeat(MAX_ADDRESS_LENGTH + 1),
        service: 'Basic Cut ($35 First Cut!)',
        message: 'z'.repeat(MAX_MESSAGE_LENGTH + 1),
        fingerprint: 'client-fingerprint',
        honeypot: '',
      }),
    ).toThrow()
  })
})

describe('isSubmissionRateLimited', () => {
  it('returns false when there is no previous timestamp', () => {
    expect(isSubmissionRateLimited(null, Date.now())).toBe(false)
  })

  it('returns true inside the cooldown window', () => {
    const now = Date.now()
    expect(isSubmissionRateLimited(now - 5000, now)).toBe(true)
  })

  it('returns false after the cooldown window', () => {
    const now = Date.now()
    expect(isSubmissionRateLimited(now - MIN_SUBMISSION_INTERVAL_MS, now)).toBe(
      false,
    )
  })
})

describe('sanitizeEmailError', () => {
  it('converts errors into short strings', () => {
    expect(sanitizeEmailError(new Error('delivery failed'))).toBe(
      'delivery failed',
    )
  })
})
