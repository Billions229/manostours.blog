'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface Author {
  slug: string
  name: string
  avatar?: string
  occupation?: string
  company?: string
  email?: string
  twitter?: string
  linkedin?: string
  github?: string
  postCount: number
  featuredCount: number
  lastPost: string
  totalWords: number
  averageWordsPerPost: number
  uniqueTagsCount: number
}

interface AuthorsListProps {
  locale: 'en' | 'fr'
  maxAuthors?: number
  onAuthorSelect?: (author: string) => void
  selectedAuthor?: string
  className?: string
  showStats?: boolean
  layout?: 'grid' | 'list'
}

const AuthorsList: React.FC<AuthorsListProps> = ({
  locale,
  maxAuthors = 10,
  onAuthorSelect,
  selectedAuthor,
  className = '',
  showStats = true,
  layout = 'grid',
}) => {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const AUTHORS_API_URL = 'https://west-africa-tours.vercel.app/api/authors'

  const translations = {
    en: {
      title: 'Our Contributors',
      loading: 'Loading authors...',
      error: 'Unable to load authors',
      noAuthors: 'No authors available',
      posts: 'posts',
      words: 'words',
      lastPost: 'Last post',
      featured: 'featured',
      topics: 'topics',
    },
    fr: {
      title: 'Nos Contributeurs',
      loading: 'Chargement des auteurs...',
      error: 'Impossible de charger les auteurs',
      noAuthors: 'Aucun auteur disponible',
      posts: 'articles',
      words: 'mots',
      lastPost: 'Dernier article',
      featured: 'en vedette',
      topics: 'sujets',
    },
  }

  const t = translations[locale]

  useEffect(() => {
    const fetchAuthors = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          locale,
          limit: maxAuthors.toString(),
          includeStats: showStats.toString(),
          sortBy: 'posts',
        })

        const response = await fetch(`${AUTHORS_API_URL}?${params}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.authors && Array.isArray(data.authors)) {
          setAuthors(data.authors)
        } else {
          throw new Error('Invalid data format received')
        }
      } catch (err) {
        console.error('Error fetching authors:', err)
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchAuthors()
  }, [locale, maxAuthors, showStats])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <h3 className="mb-4 text-xl font-semibold">{t.title}</h3>
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">{t.loading}</span>
        </div>
      </div>
    )
  }

  if (error || !authors.length) {
    return (
      <div className={`p-6 ${className}`}>
        <h3 className="mb-4 text-xl font-semibold">{t.title}</h3>
        <p className="text-gray-500">{error ? t.error : t.noAuthors}</p>
      </div>
    )
  }

  return (
    <div className={`p-6 ${className}`}>
      <h3 className="mb-6 text-xl font-semibold">{t.title}</h3>

      <div
        className={` ${
          layout === 'grid' ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'
        } `}
      >
        {authors.map((author, index) => (
          <motion.div
            key={author.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md ${selectedAuthor === author.slug ? 'ring-2 ring-blue-500' : ''} ${layout === 'list' ? 'flex items-center' : ''} `}
            onClick={() => onAuthorSelect?.(author.slug)}
          >
            {/* Avatar et info de base */}
            <div className={`${layout === 'list' ? 'flex items-center p-4' : 'p-6'}`}>
              <div className={`${layout === 'list' ? 'flex items-center' : 'text-center'}`}>
                {author.avatar ? (
                  <div
                    className={`relative ${layout === 'list' ? 'mr-4 h-12 w-12' : 'mx-auto mb-4 h-16 w-16'} overflow-hidden rounded-full`}
                  >
                    <Image src={author.avatar} alt={author.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div
                    className={` ${layout === 'list' ? 'mr-4 h-12 w-12' : 'mx-auto mb-4 h-16 w-16'} flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xl font-bold text-white`}
                  >
                    {author.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className={layout === 'list' ? 'flex-1' : ''}>
                  <h4 className="mb-1 font-semibold text-gray-900">{author.name}</h4>
                  {author.occupation && (
                    <p className="mb-2 text-sm text-gray-600">
                      {author.occupation}
                      {author.company && ` @ ${author.company}`}
                    </p>
                  )}

                  {/* Statistiques principales */}
                  <div
                    className={`flex ${layout === 'list' ? 'gap-4' : 'justify-center gap-2'} text-xs text-gray-500`}
                  >
                    <span className="flex items-center">
                      📝 {author.postCount} {t.posts}
                    </span>
                    {author.featuredCount > 0 && (
                      <span className="flex items-center">
                        ⭐ {author.featuredCount} {t.featured}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques détaillées (uniquement en mode grid) */}
            {layout === 'grid' && showStats && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="text-lg font-semibold text-blue-600">
                      {author.averageWordsPerPost.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">{t.words}/post</div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="text-lg font-semibold text-green-600">
                      {author.uniqueTagsCount}
                    </div>
                    <div className="text-xs text-gray-600">{t.topics}</div>
                  </div>
                </div>

                <div className="mt-4 text-center text-xs text-gray-500">
                  {t.lastPost}: {formatDate(author.lastPost)}
                </div>
              </div>
            )}

            {/* Liens sociaux */}
            {(author.twitter || author.linkedin || author.github) && (
              <div
                className={`${layout === 'list' ? 'px-4 py-2' : 'px-6 pb-4'} border-t border-gray-100`}
              >
                <div className="flex justify-center gap-3">
                  {author.twitter && (
                    <a
                      href={author.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 transition-colors hover:text-blue-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                    </a>
                  )}
                  {author.linkedin && (
                    <a
                      href={author.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 transition-colors hover:text-blue-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                  )}
                  {author.github && (
                    <a
                      href={author.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 transition-colors hover:text-gray-900"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default AuthorsList
