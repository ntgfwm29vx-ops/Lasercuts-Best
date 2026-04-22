import { v } from 'convex/values'
import {
  isSubmissionRateLimited,
  parseQuoteSubmission,
} from '../quoteValidation'
import { internal } from './_generated/api'
import {
  internalMutation,
  internalQuery,
  mutation,
} from './_generated/server'

export const submit = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    service: v.string(),
    message: v.string(),
    fingerprint: v.string(),
    honeypot: v.string(),
  },
  returns: v.id('quotes'),
  handler: async (ctx, args) => {
    const submission = parseQuoteSubmission(args)
    const now = Date.now()

    const rateLimitEntry = await ctx.db
      .query('quoteRateLimits')
      .withIndex('by_fingerprint', (query) =>
        query.eq('fingerprint', submission.fingerprint),
      )
      .unique()

    if (isSubmissionRateLimited(rateLimitEntry?.lastSubmissionAt ?? null, now)) {
      throw new Error('Please wait a minute before sending another request.')
    }

    if (rateLimitEntry) {
      await ctx.db.patch('quoteRateLimits', rateLimitEntry._id, {
        lastSubmissionAt: now,
        submissionCount: rateLimitEntry.submissionCount + 1,
      })
    } else {
      await ctx.db.insert('quoteRateLimits', {
        fingerprint: submission.fingerprint,
        lastSubmissionAt: now,
        submissionCount: 1,
      })
    }

    const quoteId = await ctx.db.insert('quotes', {
      name: submission.name,
      address: submission.address,
      service: submission.service,
      message: submission.message,
      status: 'pending',
      emailStatus: 'queued',
      emailAttempts: 0,
      submittedAt: now,
      requestFingerprint: submission.fingerprint,
    })

    console.info('Quote created', {
      quoteId,
      service: submission.service,
      submittedAt: now,
    })

    await ctx.scheduler.runAfter(0, internal.emails.deliverQuoteEmail, {
      quoteId,
      attemptNumber: 1,
    })

    return quoteId
  },
})

export const getForEmail = internalQuery({
  args: {
    quoteId: v.id('quotes'),
  },
  returns: v.union(
    v.null(),
    v.object({
      name: v.string(),
      address: v.string(),
      service: v.string(),
      message: v.string(),
      emailStatus: v.string(),
      emailAttempts: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const quote = await ctx.db.get('quotes', args.quoteId)

    if (!quote) {
      return null
    }

    return {
      name: quote.name,
      address: quote.address,
      service: quote.service,
      message: quote.message,
      emailStatus: quote.emailStatus,
      emailAttempts: quote.emailAttempts,
    }
  },
})

export const updateEmailTracking = internalMutation({
  args: {
    quoteId: v.id('quotes'),
    emailStatus: v.union(
      v.literal('queued'),
      v.literal('sending'),
      v.literal('sent'),
      v.literal('failed'),
    ),
    emailAttempts: v.number(),
    lastEmailAttemptAt: v.optional(v.number()),
    lastEmailError: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const quote = await ctx.db.get('quotes', args.quoteId)

    if (!quote) {
      return null
    }

    await ctx.db.patch('quotes', args.quoteId, {
      emailStatus: args.emailStatus,
      emailAttempts: args.emailAttempts,
      lastEmailAttemptAt: args.lastEmailAttemptAt,
      lastEmailError: args.lastEmailError,
    })

    return null
  },
})
