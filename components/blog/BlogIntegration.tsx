'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BlogPreview from '../BlogPreview'
import TagCloud from './TagCloud'
import AuthorsList from './AuthorsList'
import BlogStats from './BlogStats'

interface BlogIntegrationProps {
  locale: 'en' | 'fr'
  className?: string
  showFilters?: boolean
  showStats?: boolean
  showTagCloud?: boolean
  showAuthors?: boolean
  maxPosts?: number
  layout?: 'grid' | 'list' | 'masonry'
  variant?: 'full' | 'compact' | 'minimal'
}

const BlogIntegration: React.FC<BlogIntegrationProps> = ({
  locale,
  className = '',
  showFilters = true,
  showStats = true,
  showTagCloud = true,
  showAuthors = true,
  maxPosts = 6,
  layout = 'grid',
  variant = 'full',
}) => {
  const [selectedTag, setSelectedTag] = useState<string | undefined>()
  const [selectedAuthor, setSelectedAuthor] = useState<string | undefined>()
  const [activeTab, setActiveTab] = useState<'posts' | 'stats' | 'tags' | 'authors'>('posts')

  const translations = {
    en: {
      tabs: {
        posts: 'Articles',
        stats: 'Statistics',
        tags: 'Tags',
        authors: 'Authors',
      },
      filters: {
        clearAll: 'Clear All Filters',
        activeFilters: 'Active Filters',
      },
    },
    fr: {
      tabs: {
        posts: 'Articles',
        stats: 'Statistiques',
        tags: 'Tags',
        authors: 'Auteurs',
      },
      filters: {
        clearAll: 'Effacer Tous les Filtres',
        activeFilters: 'Filtres Actifs',
      },
    },
  }

  const t = translations[locale]

  const clearAllFilters = () => {
    setSelectedTag(undefined)
    setSelectedAuthor(undefined)
  }

  const hasActiveFilters = selectedTag || selectedAuthor

  // Configuration selon la variante
  const getVariantConfig = () => {
    switch (variant) {
      case 'compact':
        return {
          showStats: false,
          showTagCloud: true,
          showAuthors: false,
          maxPosts: 4,
          showTabs: false,
        }
      case 'minimal':
        return {
          showStats: false,
          showTagCloud: false,
          showAuthors: false,
          maxPosts: 3,
          showTabs: false,
        }
      case 'full':
      default:
        return {
          showStats,
          showTagCloud,
          showAuthors,
          maxPosts,
          showTabs: true,
        }
    }
  }

  const config = getVariantConfig()

  const TabButton = ({
    tab,
    label,
    isActive,
    onClick,
  }: {
    tab: string
    label: string
    isActive: boolean
    onClick: () => void
  }) => (
    <button
      onClick={onClick}
      className={`rounded-lg px-6 py-3 font-medium transition-all duration-200 ${
        isActive
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      } `}
    >
      {label}
    </button>
  )

  return (
    <div className={`bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4 py-8">
        {/* En-tête avec filtres actifs */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-800">
                  {t.filters.activeFilters}:
                </span>
                <div className="flex gap-2">
                  {selectedTag && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                      Tag: {selectedTag}
                      <button
                        onClick={() => setSelectedTag(undefined)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {selectedAuthor && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                      Author: {selectedAuthor}
                      <button
                        onClick={() => setSelectedAuthor(undefined)}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={clearAllFilters}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
              >
                {t.filters.clearAll}
              </button>
            </div>
          </motion.div>
        )}

        {/* Navigation par onglets (uniquement en mode full) */}
        {config.showTabs && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-wrap gap-2 rounded-lg bg-white p-2 shadow-sm"
          >
            <TabButton
              tab="posts"
              label={t.tabs.posts}
              isActive={activeTab === 'posts'}
              onClick={() => setActiveTab('posts')}
            />
            {config.showStats && (
              <TabButton
                tab="stats"
                label={t.tabs.stats}
                isActive={activeTab === 'stats'}
                onClick={() => setActiveTab('stats')}
              />
            )}
            {config.showTagCloud && (
              <TabButton
                tab="tags"
                label={t.tabs.tags}
                isActive={activeTab === 'tags'}
                onClick={() => setActiveTab('tags')}
              />
            )}
            {config.showAuthors && (
              <TabButton
                tab="authors"
                label={t.tabs.authors}
                isActive={activeTab === 'authors'}
                onClick={() => setActiveTab('authors')}
              />
            )}
          </motion.div>
        )}

        {/* Contenu des onglets */}
        <AnimatePresence mode="wait">
          {(activeTab === 'posts' || !config.showTabs) && (
            <motion.div
              key="posts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Sidebar avec filtres (uniquement en mode full avec filtres) */}
              {variant === 'full' && showFilters && (config.showTagCloud || config.showAuthors) && (
                <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
                  <div className="space-y-6 lg:col-span-1">
                    {config.showTagCloud && (
                      <div className="rounded-lg bg-white shadow-sm">
                        <TagCloud
                          locale={locale}
                          maxTags={15}
                          onTagSelect={setSelectedTag}
                          selectedTag={selectedTag}
                          showCount={true}
                        />
                      </div>
                    )}
                    {config.showAuthors && (
                      <div className="rounded-lg bg-white shadow-sm">
                        <AuthorsList
                          locale={locale}
                          maxAuthors={5}
                          onAuthorSelect={setSelectedAuthor}
                          selectedAuthor={selectedAuthor}
                          showStats={false}
                          layout="list"
                        />
                      </div>
                    )}
                  </div>
                  <div className="lg:col-span-3">
                    <BlogPreview
                      locale={locale}
                      maxPosts={config.maxPosts}
                      showFeaturedOnly={false}
                      showFilters={false}
                      showStats={false}
                      layout={layout}
                      selectedTag={selectedTag}
                      selectedAuthor={selectedAuthor}
                    />
                  </div>
                </div>
              )}

              {/* Mode compact/minimal ou sans filtres */}
              {(variant !== 'full' ||
                !showFilters ||
                (!config.showTagCloud && !config.showAuthors)) && (
                <>
                  {/* Tag cloud compact en haut */}
                  {config.showTagCloud && variant === 'compact' && (
                    <div className="mb-8 rounded-lg bg-white shadow-sm">
                      <TagCloud
                        locale={locale}
                        maxTags={10}
                        onTagSelect={setSelectedTag}
                        selectedTag={selectedTag}
                        showCount={false}
                      />
                    </div>
                  )}

                  <BlogPreview
                    locale={locale}
                    maxPosts={config.maxPosts}
                    showFeaturedOnly={false}
                    showFilters={variant === 'full' && showFilters}
                    showStats={variant === 'full' && config.showStats}
                    layout={layout}
                    selectedTag={selectedTag}
                    selectedAuthor={selectedAuthor}
                  />
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'stats' && config.showStats && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <BlogStats locale={locale} showDetailed={true} />
            </motion.div>
          )}

          {activeTab === 'tags' && config.showTagCloud && (
            <motion.div
              key="tags"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="rounded-lg bg-white shadow-sm">
                <TagCloud
                  locale={locale}
                  maxTags={50}
                  onTagSelect={setSelectedTag}
                  selectedTag={selectedTag}
                  showCount={true}
                  sortBy="count"
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'authors' && config.showAuthors && (
            <motion.div
              key="authors"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="rounded-lg bg-white shadow-sm">
                <AuthorsList
                  locale={locale}
                  maxAuthors={20}
                  onAuthorSelect={setSelectedAuthor}
                  selectedAuthor={selectedAuthor}
                  showStats={true}
                  layout="grid"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default BlogIntegration
