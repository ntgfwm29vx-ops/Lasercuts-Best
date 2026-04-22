import { v } from 'convex/values'
import { isQuoteService, quoteServiceValues } from '../quoteOptions'
import { api } from './_generated/api'
import { mutation } from './_generated/server'

export const submit = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    service: v.union(...quoteServiceValues.map((service) => v.literal(service))),
    message: v.string(),
  },
  returns: v.id('quotes'),
  handler: async (ctx, args) => {
    const name = args.name.trim()
    const address = args.address.trim()
    const service = args.service.trim()
    const message = args.message.trim()

    if (!name || !address || !message || !isQuoteService(service)) {
      throw new Error('Invalid quote request.')
    }

    const quote = {
      name: name.slice(0, 100),
      address: address.slice(0, 200),
      service,
      message: message.slice(0, 2000),
      status: 'pending' as const,
    }

    const quoteId = await ctx.db.insert('quotes', quote)

    await ctx.scheduler.runAfter(0, api.emails.sendQuoteEmail, quote)

    return quoteId
  },
})
