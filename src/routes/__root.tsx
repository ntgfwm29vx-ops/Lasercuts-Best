import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import * as React from 'react'
import { Analytics } from '@vercel/analytics/react'
import {
  DEFAULT_SITE_URL,
  SITE_PATHS,
} from '../../businessConfig'
import type { QueryClient } from '@tanstack/react-query'
import appCss from '~/styles/app.css?url'

const siteUrl = import.meta.env.VITE_SITE_URL ?? DEFAULT_SITE_URL

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Laser Cuts Lawn Care',
      },
      {
        name: 'description',
        content:
          'Affordable lawn mowing, edging, weed control, and cleanup services in Fort Wayne and surrounding areas.',
      },
      {
        name: 'theme-color',
        content: '#16a34a',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'alternate', type: 'application/xml', href: SITE_PATHS.sitemap },
    ],
  }),
  notFoundComponent: () => <div>Route not found</div>,
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <meta property="og:site_name" content="Laser Cuts" />
        <meta name="application-name" content="Laser Cuts" />
        <meta name="apple-mobile-web-app-title" content="Laser Cuts" />
        <meta name="robots" content="index,follow" />
        <meta name="format-detection" content="telephone=yes" />
        <link rel="preconnect" href={siteUrl} />
      </head>
      <body>
        {children}
        <Scripts />
        <Analytics />
      </body>
    </html>
  )
}
