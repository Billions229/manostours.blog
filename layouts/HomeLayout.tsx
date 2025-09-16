import Link from '@/components/mdxcomponents/Link'
import siteMetadata from '@/data/siteMetadata'
import NewsletterForm from '@/components/newletter/NewsletterForm'
import { createTranslation } from '../app/[locale]/i18n/server'
import { LocaleTypes } from '../app/[locale]/i18n/settings'
import PostList from './home/PostList'
import LayoutHeader from './home/LayoutHeader'
import BlogPreview from '@/components/BlogPreview'

interface Post {
  slug: string
  date: string
  title: string
  summary?: string | undefined
  tags: string[]
  language: string
  draft?: boolean
}

interface HomeProps {
  posts: Post[]
  params: { locale: LocaleTypes }
}

const MAX_DISPLAY = 5

export default async function HomeLayout({ posts, params: { locale } }: HomeProps) {
  const { t } = await createTranslation(locale, 'home')
  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <LayoutHeader title={t('greeting')} description={t('description')} />
        <PostList posts={posts} locale={locale} t={t} maxDisplay={MAX_DISPLAY} />
      </div>
      {posts.length > MAX_DISPLAY && (
        <div className="flex justify-end text-base font-medium leading-6">
          <Link
            href={`/${locale}/blog`}
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label={t('all')}
          >
            {t('all')} &rarr;
          </Link>
        </div>
      )}

      {/* Section Blog West Africa Tours */}
      <div className="py-8">
        <BlogPreview
          locale={locale}
          maxPosts={3}
          showFeaturedOnly={true}
          className="mb-8"
          showFilters={false}
          showStats={false}
        />
      </div>

      {siteMetadata.newsletter?.provider && (
        <div className="flex items-center justify-center pt-4">
          <NewsletterForm />
        </div>
      )}
    </>
  )
}
