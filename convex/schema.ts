import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { quoteServiceValues, quoteStatusValues } from '../quoteOptions'

export default defineSchema({
  quotes: defineTable({
    name: v.string(),
    address: v.string(),
    service: v.union(...quoteServiceValues.map((service) => v.literal(service))),
    message: v.string(),
    status: v.union(...quoteStatusValues.map((status) => v.literal(status))),
  }),
})
