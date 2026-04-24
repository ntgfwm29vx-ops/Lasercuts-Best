import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  quoteEmailStatusValues,
  quoteServiceValues,
  quoteStatusValues,
} from '../quoteOptions'

export default defineSchema({
  quotes: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.string(),
    service: v.union(...quoteServiceValues.map((service) => v.literal(service))),
    message: v.string(),
    status: v.union(...quoteStatusValues.map((status) => v.literal(status))),
    emailStatus: v.union(
      ...quoteEmailStatusValues.map((status) => v.literal(status)),
    ),
    emailAttempts: v.number(),
    submittedAt: v.number(),
    requestFingerprint: v.string(),
    lastEmailAttemptAt: v.optional(v.number()),
    lastEmailError: v.optional(v.string()),
  }).index('by_request_fingerprint', ['requestFingerprint']),
  quoteRateLimits: defineTable({
    fingerprint: v.string(),
    lastSubmissionAt: v.number(),
    submissionCount: v.number(),
  }).index('by_fingerprint', ['fingerprint']),
})
