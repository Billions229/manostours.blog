'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface BlogStatsData {
  posts: {
    totalPosts: number
    featuredCount: number
    averageReadingTime: number
    totalWords: number
    uniqueTags: number
    uniqueAuthors: number
  }
  tags: {
    totalTags: number
    totalTaggedPosts: number
    averageTagsPerPost: number
    mostPopularTag: {
      tag: string
      count: number
    } | null
  }
  authors: {
    totalAuthors: number
    totalPostsWithAuthors: number
    averagePostsPerAuthor: number
    mostProductiveAuthor: {
      slug: string
      name: string
      postCount: number
    } | null
  }
}

interface BlogStatsProps {
  locale: 'en' | 'fr'
  className?: string
  showDetailed?: boolean
}

const BlogStats: React.FC<BlogStatsProps> = ({ locale, className = '', showDetailed = false }) => {
  const [stats, setStats] = useState<BlogStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const BASE_API_URL = 'https://west-africa-tours.vercel.app/api'

  const translations = {
    en: {
      title: 'Blog Statistics',
      loading: 'Loading statistics...',
      error: 'Unable to load statistics',
      posts: {
        title: 'Articles',
        total: 'Total Articles',
        featured: 'Featured',
        avgReadTime: 'Avg. Read Time',
        totalWords: 'Total Words',
        uniqueTags: 'Unique Tags',
        uniqueAuthors: 'Authors',
      },
      tags: {
        title: 'Tags',
        total: 'Total Tags',
        tagged: 'Tagged Posts',
        avgPerPost: 'Avg. per Post',
        mostPopular: 'Most Popular',
      },
      authors: {
        title: 'Authors',
        total: 'Total Authors',
        withPosts: 'With Posts',
        avgPosts: 'Avg. Posts',
        mostProductive: 'Most Productive',
      },
      minutes: 'min',
      words: 'words',
    },
    fr: {
      title: 'Statistiques du Blog',
      loading: 'Chargement des statistiques...',
      error: 'Impossible de charger les statistiques',
      posts: {
        title: 'Articles',
        total: 'Articles Total',
        featured: 'En Vedette',
        avgReadTime: 'Temps Moyen',
        totalWords: 'Mots Total',
        uniqueTags: 'Tags Uniques',
        uniqueAuthors: 'Auteurs',
      },
      tags: {
        title: 'Tags',
        total: 'Tags Total',
        tagged: 'Articles Taggés',
        avgPerPost: 'Moy. par Article',
        mostPopular: 'Plus Populaire',
      },
      authors: {
        title: 'Auteurs',
        total: 'Auteurs Total',
        withPosts: 'Avec Articles',
        avgPosts: 'Moy. Articles',
        mostProductive: 'Plus Productif',
      },
      minutes: 'min',
      words: 'mots',
    },
  }

  const t = translations[locale]

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      setError(null)

      try {
        // Récupérer les statistiques de toutes les APIs
        const [postsResponse, tagsResponse, authorsResponse] = await Promise.all([
          fetch(`${BASE_API_URL}/posts?locale=${locale}&limit=1000`),
          fetch(`${BASE_API_URL}/tags?locale=${locale}&limit=1000`),
          fetch(`${BASE_API_URL}/authors?locale=${locale}&limit=1000`),
        ])

        if (!postsResponse.ok || !tagsResponse.ok || !authorsResponse.ok) {
          throw new Error('Failed to fetch statistics')
        }

        const [postsData, tagsData, authorsData] = await Promise.all([
          postsResponse.json(),
          tagsResponse.json(),
          authorsResponse.json(),
        ])

        setStats({
          posts: postsData.stats,
          tags: tagsData.stats,
          authors: authorsData.stats,
        })
      } catch (err) {
        console.error('Error fetching blog statistics:', err)
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [locale])

  if (loading) {
    return (
      <div className={`rounded-lg bg-white p-6 shadow-sm ${className}`}>
        <h3 className="mb-4 text-xl font-semibold">{t.title}</h3>
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">{t.loading}</span>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className={`rounded-lg bg-white p-6 shadow-sm ${className}`}>
        <h3 className="mb-4 text-xl font-semibold">{t.title}</h3>
        <p className="text-gray-500">{t.error}</p>
      </div>
    )
  }

  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    color = 'blue',
    delay = 0,
  }: {
    title: string
    value: string | number
    subtitle?: string
    icon: string
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
    delay?: number
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      red: 'bg-red-50 text-red-600 border-red-200',
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className={`rounded-lg border p-4 ${colorClasses[color]}`}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">{title}</span>
          <span className="text-lg">{icon}</span>
        </div>
        <div className="mb-1 text-2xl font-bold">{value}</div>
        {subtitle && <div className="text-xs opacity-75">{subtitle}</div>}
      </motion.div>
    )
  }

  return (
    <div className={`rounded-lg bg-white p-6 shadow-sm ${className}`}>
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6 text-xl font-semibold"
      >
        {t.title}
      </motion.h3>

      {/* Statistiques principales */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard
          title={t.posts.total}
          value={stats.posts.totalPosts}
          icon="📝"
          color="blue"
          delay={0.1}
        />
        <StatCard
          title={t.posts.featured}
          value={stats.posts.featuredCount}
          icon="⭐"
          color="orange"
          delay={0.2}
        />
        <StatCard
          title={t.posts.avgReadTime}
          value={`${stats.posts.averageReadingTime}${t.minutes}`}
          icon="⏱️"
          color="green"
          delay={0.3}
        />
        <StatCard
          title={t.posts.totalWords}
          value={stats.posts.totalWords.toLocaleString()}
          icon="📖"
          color="purple"
          delay={0.4}
        />
        <StatCard
          title={t.posts.uniqueTags}
          value={stats.posts.uniqueTags}
          icon="🏷️"
          color="blue"
          delay={0.5}
        />
        <StatCard
          title={t.posts.uniqueAuthors}
          value={stats.posts.uniqueAuthors}
          icon="👥"
          color="green"
          delay={0.6}
        />
      </div>

      {/* Statistiques détaillées */}
      {showDetailed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {/* Tags */}
          <div className="rounded-lg bg-gray-50 p-4">
            <h4 className="mb-3 flex items-center font-semibold text-gray-900">
              🏷️ {t.tags.title}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t.tags.total}:</span>
                <span className="font-medium">{stats.tags.totalTags}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t.tags.tagged}:</span>
                <span className="font-medium">{stats.tags.totalTaggedPosts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t.tags.avgPerPost}:</span>
                <span className="font-medium">{stats.tags.averageTagsPerPost}</span>
              </div>
              {stats.tags.mostPopularTag && (
                <div className="border-t border-gray-200 pt-2">
                  <div className="mb-1 text-xs text-gray-600">{t.tags.mostPopular}:</div>
                  <div className="font-medium text-blue-600">
                    #{stats.tags.mostPopularTag.tag} ({stats.tags.mostPopularTag.count})
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Auteurs */}
          <div className="rounded-lg bg-gray-50 p-4">
            <h4 className="mb-3 flex items-center font-semibold text-gray-900">
              👥 {t.authors.title}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t.authors.total}:</span>
                <span className="font-medium">{stats.authors.totalAuthors}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t.authors.withPosts}:</span>
                <span className="font-medium">{stats.authors.totalPostsWithAuthors}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t.authors.avgPosts}:</span>
                <span className="font-medium">{stats.authors.averagePostsPerAuthor}</span>
              </div>
              {stats.authors.mostProductiveAuthor && (
                <div className="border-t border-gray-200 pt-2">
                  <div className="mb-1 text-xs text-gray-600">{t.authors.mostProductive}:</div>
                  <div className="font-medium text-green-600">
                    {stats.authors.mostProductiveAuthor.name} (
                    {stats.authors.mostProductiveAuthor.postCount})
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Métriques de contenu */}
          <div className="rounded-lg bg-gray-50 p-4">
            <h4 className="mb-3 flex items-center font-semibold text-gray-900">
              📊 {locale === 'en' ? 'Content Metrics' : 'Métriques de Contenu'}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {locale === 'en' ? 'Words per post:' : 'Mots par article:'}
                </span>
                <span className="font-medium">
                  {Math.round(stats.posts.totalWords / stats.posts.totalPosts)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {locale === 'en' ? 'Featured ratio:' : 'Ratio vedette:'}
                </span>
                <span className="font-medium">
                  {Math.round((stats.posts.featuredCount / stats.posts.totalPosts) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {locale === 'en' ? 'Tags per post:' : 'Tags par article:'}
                </span>
                <span className="font-medium">{stats.tags.averageTagsPerPost}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default BlogStats
