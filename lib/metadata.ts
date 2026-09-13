import { Metadata } from 'next'

const SITE_NAME = 'The Fur Finder'
const SITE_URL = process.env.SITE_URL || 'https://thefurfinder.com'
const SITE_DESCRIPTION = 'Reunite lost pets with their families using AI-powered matching'
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`

export function generateMetadata(override?: Partial<Metadata>): Metadata {
  return {
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    metadataBase: new URL(SITE_URL),
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: SITE_URL,
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      images: [DEFAULT_OG_IMAGE],
    },
    alternates: {
      canonical: SITE_URL,
    },
    ...override,
  }
}

export function generatePageMetadata(
  title: string,
  description: string,
  path: string,
  ogImage?: string
): Metadata {
  const url = `${SITE_URL}${path}`
  const image = ogImage || DEFAULT_OG_IMAGE

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url,
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  }
}

export function generateArticleMetadata(
  title: string,
  description: string,
  path: string,
  author: string,
  publishedAt: Date,
  ogImage?: string
): Metadata {
  const url = `${SITE_URL}${path}`
  const image = ogImage || DEFAULT_OG_IMAGE

  return {
    title,
    description,
    openGraph: {
      type: 'article',
      locale: 'en_US',
      url,
      siteName: SITE_NAME,
      title,
      description,
      authors: [author],
      publishedTime: publishedAt.toISOString(),
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  }
}

export function getStructuredData(type: string, data: any) {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type,
  }

  switch (type) {
    case 'Organization':
      return {
        ...baseData,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        description: SITE_DESCRIPTION,
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Customer Support',
          url: `${SITE_URL}/contact`,
        },
      }

    case 'Article':
      return {
        ...baseData,
        headline: data.title,
        description: data.description,
        image: data.image || DEFAULT_OG_IMAGE,
        author: {
          '@type': 'Person',
          name: data.author,
        },
        datePublished: data.publishedAt?.toISOString(),
        dateModified: data.updatedAt?.toISOString(),
      }

    case 'BreadcrumbList':
      return {
        ...baseData,
        itemListElement: data.items.map((item: any, index: number) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: `${SITE_URL}${item.url}`,
        })),
      }

    default:
      return baseData
  }
}
