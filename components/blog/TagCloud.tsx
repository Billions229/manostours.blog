'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Tag {
  tag: string
  count: number
  featuredCount: number
  lastUsed: string
}

interface TagCloudProps {
  locale: 'en' | 'fr'
  maxTags?: number
  onTagSelect?: (tag: string) => void
  selectedTag?: string
  className?: string
  showCount?: boolean
  sortBy?: 'count' | 'name' | 'recent'
}

const TagCloud: React.FC<TagCloudProps> = ({
  locale,
  maxTags = 20,
  onTagSelect,
  selectedTag,
  className = '',
  showCount = true,
  sortBy = 'count',
}) => {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const TAGS_API_URL = 'https://west-africa-tours.vercel.app/api/tags'

  const translations = {
    en: {
      title: 'Popular Topics',
      loading: 'Loading tags...',
      error: 'Unable to load tags',
      noTags: 'No tags available',
    },
    fr: {
      title: 'Sujets Populaires',
      loading: 'Chargement des tags...',
      error: 'Impossible de charger les tags',
      noTags: 'Aucun tag disponible',
    },
  }

  const t = translations[locale]

  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          locale,
          limit: maxTags.toString(),
          sortBy,
          includeStats: 'true',
        })

        const response = await fetch(`${TAGS_API_URL}?${params}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.tags && Array.isArray(data.tags)) {
          setTags(data.tags)
        } else {
          throw new Error('Invalid data format received')
        }
      } catch (err) {
        console.error('Error fetching tags:', err)
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchTags()
  }, [locale, maxTags, sortBy])

  const getTagSize = (count: number, maxCount: number) => {
    const ratio = count / maxCount
    if (ratio > 0.8) return 'text-2xl'
    if (ratio > 0.6) return 'text-xl'
    if (ratio > 0.4) return 'text-lg'
    if (ratio > 0.2) return 'text-base'
    return 'text-sm'
  }

  const getTagColor = (count: number, maxCount: number) => {
    const ratio = count / maxCount
    if (ratio > 0.8) return 'bg-blue-600 text-white'
    if (ratio > 0.6) return 'bg-blue-500 text-white'
    if (ratio > 0.4) return 'bg-blue-400 text-white'
    if (ratio > 0.2) return 'bg-blue-300 text-blue-900'
    return 'bg-blue-100 text-blue-700'
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

  if (error || !tags.length) {
    return (
      <div className={`p-6 ${className}`}>
        <h3 className="mb-4 text-xl font-semibold">{t.title}</h3>
        <p className="text-gray-500">{error ? t.error : t.noTags}</p>
      </div>
    )
  }

  const maxCount = Math.max(...tags.map((tag) => tag.count))

  return (
    <div className={`p-6 ${className}`}>
      <h3 className="mb-6 text-xl font-semibold">{t.title}</h3>

      <div className="flex flex-wrap gap-3">
        {tags.map((tag, index) => (
          <motion.button
            key={tag.tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTagSelect?.(tag.tag)}
            className={`rounded-full px-4 py-2 font-medium transition-all duration-200 ${
              selectedTag === tag.tag
                ? 'bg-blue-600 text-white shadow-lg'
                : `${getTagColor(tag.count, maxCount)} hover:shadow-md`
            } ${getTagSize(tag.count, maxCount)} `}
          >
            #{tag.tag}
            {showCount && <span className="ml-2 text-xs opacity-75">({tag.count})</span>}
            {tag.featuredCount > 0 && <span className="ml-1 text-xs">⭐</span>}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default TagCloud
