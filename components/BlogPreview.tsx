'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface BlogPost {
  slug: string
  title: string
  summary: string
  date: string
  images: string[]
  tags: string[]
  authors: string[]
  featured: boolean
  language: string
  url: string
  readingTime?: {
    text: string
    minutes: number
    time: number
    words: number
  }
  wordCount: number
  lastModified: string
  series?: string
}

interface BlogApiResponse {
  posts: BlogPost[]
  stats: {
    totalPosts: number
    featuredCount: number
    averageReadingTime: number
    totalWords: number
    uniqueTags: number
    uniqueAuthors: number
  }
  filters: {
    locale: string
    tag?: string
    author?: string
    featured: boolean
    sortBy: string
    sortOrder: string
  }
  pagination: {
    total: number
    limit: number
    returned: number
    hasMore: boolean
  }
  timestamp: string
}

interface BlogPreviewProps {
  locale: 'en' | 'fr'
  maxPosts?: number
  showFeaturedOnly?: boolean
  className?: string
  showFilters?: boolean
  showStats?: boolean
  layout?: 'grid' | 'list' | 'masonry'
  selectedTag?: string
  selectedAuthor?: string
}

const BlogPreview: React.FC<BlogPreviewProps> = ({
  locale,
  maxPosts = 6,
  showFeaturedOnly = false,
  className = '',
  showFilters = false,
  showStats = false,
  layout = 'grid',
  selectedTag,
  selectedAuthor,
}) => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<BlogApiResponse['stats'] | null>(null)
  const [currentTag, setCurrentTag] = useState<string | undefined>(selectedTag)
  const [currentAuthor, setCurrentAuthor] = useState<string | undefined>(selectedAuthor)
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'readingTime'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const BLOG_API_URL = 'https://west-africa-tours.vercel.app/api/posts'

  const translations = {
    en: {
      title: showFeaturedOnly ? 'Featured Travel Stories' : 'Latest Travel Insights',
      subtitle: showFeaturedOnly
        ? 'Handpicked stories from our West Africa adventures'
        : 'Discover West Africa through our expert guides and local insights',
      readMore: 'Read Full Article',
      viewAll: 'Explore All Articles',
      loading: 'Loading travel stories...',
      error: 'Unable to load articles at the moment',
      retry: 'Try Again',
      readTime: 'min read',
      publishedOn: 'Published on',
      featured: 'Featured Story',
      filterByTag: 'Filter by tag',
      filterByAuthor: 'Filter by author',
      sortBy: 'Sort by',
      clearFilters: 'Clear filters',
      showingResults: 'Showing {count} of {total} articles',
      noResults: 'No articles found with current filters',
      stats: {
        totalPosts: 'Total Articles',
        avgReadTime: 'Avg. Read Time',
        totalWords: 'Total Words',
        uniqueTags: 'Unique Tags',
      },
    },
    fr: {
      title: showFeaturedOnly ? 'Récits de Voyage en Vedette' : 'Derniers Conseils de Voyage',
      subtitle: showFeaturedOnly
        ? "Histoires sélectionnées de nos aventures en Afrique de l'Ouest"
        : "Découvrez l'Afrique de l'Ouest avec nos guides experts et aperçus locaux",
      readMore: "Lire l'Article Complet",
      viewAll: 'Explorer Tous les Articles',
      loading: 'Chargement des récits de voyage...',
      error: 'Impossible de charger les articles pour le moment',
      retry: 'Réessayer',
      readTime: 'min de lecture',
      publishedOn: 'Publié le',
      featured: 'Article en Vedette',
      filterByTag: 'Filtrer par tag',
      filterByAuthor: 'Filtrer par auteur',
      sortBy: 'Trier par',
      clearFilters: 'Effacer les filtres',
      showingResults: 'Affichage de {count} sur {total} articles',
      noResults: 'Aucun article trouvé avec les filtres actuels',
      stats: {
        totalPosts: 'Articles Total',
        avgReadTime: 'Temps Moyen',
        totalWords: 'Mots Total',
        uniqueTags: 'Tags Uniques',
      },
    },
  }

  const t = translations[locale]

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          locale,
          limit: maxPosts.toString(),
          sortBy,
          sortOrder,
          ...(showFeaturedOnly && { featured: 'true' }),
          ...(currentTag && { tag: currentTag }),
          ...(currentAuthor && { author: currentAuthor }),
        })

        const response = await fetch(`${BLOG_API_URL}?${params}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: BlogApiResponse = await response.json()
        console.log('Blog data loaded:', data)

        if (data.posts && Array.isArray(data.posts)) {
          setPosts(data.posts)
          setStats(data.stats)
        } else {
          throw new Error('Invalid data format received')
        }
      } catch (err) {
        console.error('Error fetching blog posts:', err)
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [locale, maxPosts, showFeaturedOnly, currentTag, currentAuthor, sortBy, sortOrder])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const clearFilters = () => {
    setCurrentTag(undefined)
    setCurrentAuthor(undefined)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  if (loading) {
    return (
      <div className={`bg-gradient-to-b from-blue-50 to-white py-16 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-lg text-gray-600">{t.loading}</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-gradient-to-b from-red-50 to-white py-16 ${className}`}>
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-md rounded-lg bg-white p-8 shadow-md">
            <div className="mb-4 text-5xl text-red-500">⚠️</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Oops!</h3>
            <p className="mb-4 text-gray-600">{t.error}</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
            >
              {t.retry}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className={`bg-gradient-to-b from-blue-50 via-white to-green-50 py-16 ${className}`}>
      <div className="container mx-auto px-4">
        {/* En-tête de section */}
        <div className="mb-12 text-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl"
          >
            {t.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600"
          >
            {t.subtitle}
          </motion.p>
        </div>

        {/* Statistiques */}
        {showStats && stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4"
          >
            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{stats.totalPosts}</div>
              <div className="text-sm text-gray-600">{t.stats.totalPosts}</div>
            </div>
            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-green-600">{stats.averageReadingTime}min</div>
              <div className="text-sm text-gray-600">{t.stats.avgReadTime}</div>
            </div>
            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-purple-600">
                {stats.totalWords.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">{t.stats.totalWords}</div>
            </div>
            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-orange-600">{stats.uniqueTags}</div>
              <div className="text-sm text-gray-600">{t.stats.uniqueTags}</div>
            </div>
          </motion.div>
        )}

        {/* Filtres et tri */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 rounded-lg bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'readingTime')}
                  className="rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">{locale === 'en' ? 'Date' : 'Date'}</option>
                  <option value="title">{locale === 'en' ? 'Title' : 'Titre'}</option>
                  <option value="readingTime">
                    {locale === 'en' ? 'Reading Time' : 'Temps de lecture'}
                  </option>
                </select>

                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  <option value="desc">{locale === 'en' ? 'Descending' : 'Décroissant'}</option>
                  <option value="asc">{locale === 'en' ? 'Ascending' : 'Croissant'}</option>
                </select>
              </div>

              {(currentTag || currentAuthor) && (
                <button
                  onClick={clearFilters}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
                >
                  {t.clearFilters}
                </button>
              )}
            </div>

            {(currentTag || currentAuthor) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {currentTag && (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                    Tag: {currentTag}
                    <button
                      onClick={() => setCurrentTag(undefined)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {currentAuthor && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                    Author: {currentAuthor}
                    <button
                      onClick={() => setCurrentAuthor(undefined)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}
          </motion.div>
        )}

        {!posts.length ? (
          <div className="py-12 text-center">
            <div className="mb-4 text-6xl text-gray-400">📝</div>
            <p className="text-lg text-gray-500">{t.noResults}</p>
          </div>
        ) : (
          <>
            {/* Résultats */}
            {showFilters && (
              <div className="mb-6 text-sm text-gray-600">
                {t.showingResults
                  .replace('{count}', posts.length.toString())
                  .replace('{total}', stats?.totalPosts.toString() || '0')}
              </div>
            )}

            {/* Grille d'articles */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={`mb-12 grid gap-8 ${
                layout === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  : layout === 'list'
                    ? 'grid-cols-1'
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' // masonry fallback to grid
              }`}
            >
              <AnimatePresence>
                {posts.map((post, index) => (
                  <motion.article
                    key={`${post.slug}-${index}`}
                    variants={itemVariants}
                    layout
                    className="overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* Image de l'article */}
                    {post.images && post.images[0] && (
                      <div className="relative h-48 w-full overflow-hidden">
                        <Image
                          src={post.images[0]}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-300 hover:scale-105"
                        />
                        {post.featured && (
                          <div className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 text-sm font-semibold text-white shadow-lg">
                            ⭐ {t.featured}
                          </div>
                        )}
                        {post.series && (
                          <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-sm font-semibold text-white shadow-lg">
                            📚 Series
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-6">
                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2">
                          {post.tags.slice(0, 3).map((tag, tagIndex) => (
                            <button
                              key={`${tag}-${tagIndex}`}
                              onClick={() => setCurrentTag(tag)}
                              className="cursor-pointer rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-200"
                            >
                              #{tag}
                            </button>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="text-sm text-gray-500">
                              +{post.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Titre */}
                      <h3 className="mb-3 line-clamp-2 text-xl font-bold text-gray-900 transition-colors hover:text-blue-600">
                        {post.title}
                      </h3>

                      {/* Résumé */}
                      <p className="mb-4 line-clamp-3 leading-relaxed text-gray-600">
                        {post.summary}
                      </p>

                      {/* Auteurs */}
                      {post.authors && post.authors.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2">
                          {post.authors.map((author, authorIndex) => (
                            <button
                              key={`${author}-${authorIndex}`}
                              onClick={() => setCurrentAuthor(author)}
                              className="cursor-pointer text-sm text-gray-500 transition-colors hover:text-blue-600"
                            >
                              👤 {author}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Métadonnées et bouton */}
                      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                        <div className="text-sm text-gray-500">
                          <time dateTime={post.date}>{formatDate(post.date)}</time>
                          {post.readingTime && (
                            <span className="ml-2">
                              • {post.readingTime.minutes} {t.readTime}
                            </span>
                          )}
                          {post.wordCount > 0 && (
                            <span className="ml-2">• {post.wordCount.toLocaleString()} words</span>
                          )}
                        </div>

                        <Link
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-600 to-green-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-blue-700 hover:to-green-700 hover:shadow-lg"
                        >
                          {t.readMore}
                          <svg
                            className="ml-2 h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}

        {/* Bouton voir tous */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Link
            href={`https://west-africa-tours.vercel.app/${locale}/blog`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-green-600 to-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:from-green-700 hover:to-blue-700 hover:shadow-xl"
          >
            {t.viewAll}
            <svg className="ml-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default BlogPreview
