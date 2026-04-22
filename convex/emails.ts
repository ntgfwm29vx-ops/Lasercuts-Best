import { Resend } from 'resend'
import { v } from 'convex/values'
import { quoteServiceValues } from '../quoteOptions'
import { action } from './_generated/server'

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export const sendQuoteEmail = action({
  args: {
    name: v.string(),
    address: v.string(),
    service: v.union(...quoteServiceValues.map((service) => v.literal(service))),
    message: v.string(),
  },
  returns: v.null(),
  handler: async (_, args) => {
    const resendApiKey = process.env.RESEND_API_KEY

    if (!resendApiKey) {
      console.error('Missing RESEND_API_KEY environment variable.')
      return null
    }

    const resend = new Resend(resendApiKey)

    try {
      const safeName = escapeHtml(args.name)
      const safeAddress = escapeHtml(args.address)
      const safeService = escapeHtml(args.service)
      const safeMessage = escapeHtml(args.message).replaceAll('\n', '<br />')

      await resend.emails.send({
        from: 'Laser Cuts <onboarding@resend.dev>',
        to: 'trey.lazercuts@gmail.com',
        subject: `New Quote Request from ${args.name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h1 style="color: #15803d; border-bottom: 2px solid #15803d; padding-bottom: 10px;">New Quote Request</h1>
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Address:</strong> ${safeAddress}</p>
            <p><strong>Service:</strong> ${safeService}</p>
            <p style="background: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #15803d;">
              <strong>Message:</strong><br/>
              ${safeMessage}
            </p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">This request was sent from the Laser Cuts website.</p>
          </div>
        `,
      })
      console.log('Email sent successfully to trey.lazercuts@gmail.com')
    } catch (error) {
      console.error('Failed to send email:', error)
    }
    return null
  },
})
