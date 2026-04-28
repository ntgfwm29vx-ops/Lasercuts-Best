'use node'

import { Resend } from 'resend'
import { v } from 'convex/values'
import { BUSINESS_EMAIL, BUSINESS_NAME, BUSINESS_PHONE } from '../businessConfig'
import {
  EMAIL_RETRY_DELAYS_MS,
  MAX_EMAIL_ATTEMPTS,
  sanitizeEmailError,
} from '../quoteValidation'
import { internal } from './_generated/api'
import { internalAction } from './_generated/server'

const ATT_SMS_GATEWAY_DOMAIN = 'txt.att.net'

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function toSmsEmailAddress(phone: string) {
  const digits = phone.replace(/\D/g, '')

  if (digits.length !== 10) {
    return null
  }

  return `${digits}@${ATT_SMS_GATEWAY_DOMAIN}`
}

async function sendTelegramMessage(message: string) {
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN
  const telegramChatId = process.env.TELEGRAM_CHAT_ID

  if (!telegramBotToken || !telegramChatId) {
    return
  }

  const response = await fetch(
    `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: message,
      }),
    },
  )

  if (!response.ok) {
    const body = await response.text()

    throw new Error(
      `Telegram send failed with ${response.status}: ${body.slice(0, 500)}`,
    )
  }
}

export const deliverQuoteEmail = internalAction({
  args: {
    quoteId: v.id('quotes'),
    attemptNumber: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const quote = await ctx.runQuery(internal.quotes.getForEmail, {
      quoteId: args.quoteId,
    })

    if (!quote) {
      console.error('Quote email skipped because quote was not found.', {
        quoteId: args.quoteId,
      })
      return null
    }

    if (quote.emailStatus === 'sent') {
      console.info('Quote email already sent. Skipping duplicate delivery.', {
        quoteId: args.quoteId,
      })
      return null
    }

    const resendApiKey = process.env.RESEND_API_KEY
    const resendFromEmail =
      process.env.RESEND_FROM_EMAIL ?? `${BUSINESS_NAME} <onboarding@resend.dev>`
    const resendTextTo =
      process.env.RESEND_TEXT_TO ?? toSmsEmailAddress(BUSINESS_PHONE)
    const attemptTimestamp = Date.now()

    await ctx.runMutation(internal.quotes.updateEmailTracking, {
      quoteId: args.quoteId,
      emailStatus: 'sending',
      emailAttempts: args.attemptNumber,
      lastEmailAttemptAt: attemptTimestamp,
      lastEmailError: undefined,
    })

    if (!resendApiKey) {
      const errorMessage = 'Missing RESEND_API_KEY environment variable.'
      console.error(errorMessage, { quoteId: args.quoteId })

      await ctx.runMutation(internal.quotes.updateEmailTracking, {
        quoteId: args.quoteId,
        emailStatus: 'failed',
        emailAttempts: args.attemptNumber,
        lastEmailAttemptAt: attemptTimestamp,
        lastEmailError: errorMessage,
      })

      return null
    }

    if (resendFromEmail.includes('onboarding@resend.dev')) {
      console.warn(
        'Using the Resend onboarding sender. Configure RESEND_FROM_EMAIL with a verified domain for production deliverability.',
      )
    }

    const resend = new Resend(resendApiKey)

    try {
      const safeName = escapeHtml(quote.name)
      const safeEmail = escapeHtml(quote.email)
      const safePhone = escapeHtml(quote.phone)
      const safeAddress = escapeHtml(quote.address)
      const safeService = escapeHtml(quote.service)
      const safeMessage = escapeHtml(quote.message).replaceAll('\n', '<br />')

      await resend.emails.send({
        from: resendFromEmail,
        to: BUSINESS_EMAIL,
        subject: `New Quote Request from ${quote.name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h1 style="color: #15803d; border-bottom: 2px solid #15803d; padding-bottom: 10px;">New Quote Request</h1>
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <p><strong>Phone:</strong> ${safePhone}</p>
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

      const telegramMessage = [
        'New Laser Cuts quote',
        `Name: ${quote.name}`,
        `Phone: ${quote.phone}`,
        `Email: ${quote.email}`,
        `Service: ${quote.service}`,
        `Address: ${quote.address}`,
        `Message: ${quote.message}`,
      ].join('\n')

      try {
        await sendTelegramMessage(telegramMessage)
      } catch (error) {
        console.error('Quote Telegram alert failed.', {
          quoteId: args.quoteId,
          error: sanitizeEmailError(error),
        })
      }

      if (resendTextTo) {
        const smsMessage = [
          'New Laser Cuts quote',
          `${quote.name} • ${quote.phone}`,
          quote.service,
          quote.address,
        ].join('\n')

        try {
          await resend.emails.send({
            from: resendFromEmail,
            to: resendTextTo,
            subject: 'New quote',
            text: smsMessage,
          })
        } catch (error) {
          console.error('Quote text alert failed.', {
            quoteId: args.quoteId,
            error: sanitizeEmailError(error),
          })
        }
      } else {
        console.warn('Skipping quote text alert because no SMS destination is configured.', {
          quoteId: args.quoteId,
        })
      }

      await ctx.runMutation(internal.quotes.updateEmailTracking, {
        quoteId: args.quoteId,
        emailStatus: 'sent',
        emailAttempts: args.attemptNumber,
        lastEmailAttemptAt: attemptTimestamp,
        lastEmailError: undefined,
      })

      console.info('Quote email sent successfully.', {
        quoteId: args.quoteId,
        attempts: args.attemptNumber,
      })
    } catch (error) {
      const errorMessage = sanitizeEmailError(error)

      console.error('Quote email delivery failed.', {
        quoteId: args.quoteId,
        attempts: args.attemptNumber,
        error: errorMessage,
      })

      await ctx.runMutation(internal.quotes.updateEmailTracking, {
        quoteId: args.quoteId,
        emailStatus: 'failed',
        emailAttempts: args.attemptNumber,
        lastEmailAttemptAt: attemptTimestamp,
        lastEmailError: errorMessage,
      })

      if (args.attemptNumber < MAX_EMAIL_ATTEMPTS) {
        const retryDelay =
          EMAIL_RETRY_DELAYS_MS[args.attemptNumber - 1] ??
          EMAIL_RETRY_DELAYS_MS[EMAIL_RETRY_DELAYS_MS.length - 1]

        await ctx.scheduler.runAfter(retryDelay, internal.emails.deliverQuoteEmail, {
          quoteId: args.quoteId,
          attemptNumber: args.attemptNumber + 1,
        })

        console.info('Scheduled quote email retry.', {
          quoteId: args.quoteId,
          nextAttempt: args.attemptNumber + 1,
          retryDelay,
        })
      }
    }

    return null
  },
})
