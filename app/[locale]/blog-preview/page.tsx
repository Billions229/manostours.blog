import { Metadata } from 'next'
import { LocaleTypes } from '../i18n/settings'
import { createTranslation } from '../i18n/server'
import BlogIntegration from '@/components/blog/BlogIntegration'
import SectionContainer from '@/components/SectionContainer'

interface BlogPreviewPageProps {
  params: Promise<{
    locale: LocaleTypes
  }>
}

export async function generateMetadata({ params }: BlogPreviewPageProps): Promise<Metadata> {
  const { locale } = await params
  const { t } = await createTranslation(locale, 'common')

  const titles = {
    en: 'West Africa Travel Blog - Latest Stories & Insights',
    fr: "Blog Voyage Afrique de l'Ouest - Dernières Histoires et Conseils",
  }

  const descriptions = {
    en: 'Discover authentic West Africa through our travel blog. Expert guides, local insights, and inspiring stories from Benin, Togo, and Ghana.',
    fr: "Découvrez l'Afrique de l'Ouest authentique à travers notre blog de voyage. Guides experts, aperçus locaux et histoires inspirantes du Bénin, Togo et Ghana.",
  }

  return {
    title: titles[locale],
    description: descriptions[locale],
    openGraph: {
      title: titles[locale],
      description: descriptions[locale],
      type: 'website',
      locale: locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale],
      description: descriptions[locale],
    },
  }
}

export default async function BlogPreviewPage({ params }: BlogPreviewPageProps) {
  const { locale } = await params
  const { t } = await createTranslation(locale, 'common')

  const pageContent = {
    en: {
      title: 'West Africa Travel Blog',
      subtitle:
        'Discover authentic stories, expert guides, and local insights from our West Africa adventures',
      description:
        'Explore our comprehensive collection of travel articles, guides, and stories from Benin, Togo, and Ghana. Get inspired for your next West African adventure with insider tips from local experts.',
    },
    fr: {
      title: "Blog Voyage Afrique de l'Ouest",
      subtitle:
        "Découvrez des histoires authentiques, des guides experts et des aperçus locaux de nos aventures en Afrique de l'Ouest",
      description:
        "Explorez notre collection complète d'articles de voyage, guides et histoires du Bénin, Togo et Ghana. Inspirez-vous pour votre prochaine aventure ouest-africaine avec des conseils d'initiés d'experts locaux.",
    },
  }

  const content = pageContent[locale]

  return (
    <SectionContainer>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50">
        {/* Hero Section */}
        <div className="relative px-4 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-6xl">
              {content.title}
            </h1>
            <p className="mb-8 text-xl leading-relaxed text-gray-600 md:text-2xl">
              {content.subtitle}
            </p>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-500">
              {content.description}
            </p>
          </div>

          {/* Decorative elements */}
          <div className="absolute left-10 top-10 h-20 w-20 animate-pulse rounded-full bg-blue-200 opacity-20"></div>
          <div className="absolute bottom-10 right-10 h-32 w-32 animate-pulse rounded-full bg-green-200 opacity-20 delay-1000"></div>
          <div className="absolute left-1/4 top-1/2 h-16 w-16 animate-pulse rounded-full bg-yellow-200 opacity-20 delay-500"></div>
        </div>

        {/* Blog Integration Component */}
        <BlogIntegration
          locale={locale}
          variant="full"
          showFilters={true}
          showStats={true}
          showTagCloud={true}
          showAuthors={true}
          maxPosts={12}
          layout="grid"
          className="py-8"
        />

        {/* Call to Action Section */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 py-16">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
              {locale === 'en'
                ? 'Ready to Explore West Africa?'
                : "Prêt à Explorer l'Afrique de l'Ouest ?"}
            </h2>
            <p className="mb-8 text-xl text-blue-100">
              {locale === 'en'
                ? 'Join thousands of travelers who have discovered the magic of West Africa with our expert guides.'
                : "Rejoignez des milliers de voyageurs qui ont découvert la magie de l'Afrique de l'Ouest avec nos guides experts."}
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href={`https://west-africa-tours.vercel.app/${locale}/blog`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 font-semibold text-blue-600 shadow-lg transition-all duration-200 hover:bg-gray-50 hover:shadow-xl"
              >
                {locale === 'en' ? 'Read Full Blog' : 'Lire le Blog Complet'}
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </a>
              <a
                href={locale === 'en' ? '/contact' : '/fr/contact'}
                className="inline-flex items-center justify-center rounded-xl border-2 border-white bg-transparent px-8 py-4 font-semibold text-white transition-all duration-200 hover:bg-white hover:text-blue-600"
              >
                {locale === 'en' ? 'Plan Your Trip' : 'Planifier Votre Voyage'}
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
              {locale === 'en'
                ? 'Why Choose Our West Africa Guides?'
                : "Pourquoi Choisir Nos Guides d'Afrique de l'Ouest ?"}
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-2xl">🌍</span>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  {locale === 'en' ? 'Local Expertise' : 'Expertise Locale'}
                </h3>
                <p className="text-gray-600">
                  {locale === 'en'
                    ? 'Native guides with deep knowledge of local culture, history, and hidden gems.'
                    : "Guides natifs avec une connaissance approfondie de la culture locale, de l'histoire et des joyaux cachés."}
                </p>
              </div>
              <div className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  {locale === 'en' ? 'Safe & Authentic' : 'Sûr et Authentique'}
                </h3>
                <p className="text-gray-600">
                  {locale === 'en'
                    ? 'Carefully curated experiences that prioritize your safety while maintaining authenticity.'
                    : "Expériences soigneusement sélectionnées qui privilégient votre sécurité tout en maintenant l'authenticité."}
                </p>
              </div>
              <div className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                  <span className="text-2xl">⭐</span>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  {locale === 'en' ? 'Proven Excellence' : 'Excellence Prouvée'}
                </h3>
                <p className="text-gray-600">
                  {locale === 'en'
                    ? 'Hundreds of satisfied travelers and consistently high ratings across all platforms.'
                    : 'Des centaines de voyageurs satisfaits et des notes constamment élevées sur toutes les plateformes.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  )
}
