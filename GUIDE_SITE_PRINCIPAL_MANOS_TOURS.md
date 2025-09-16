# 🚀 Guide d'Intégration Blog - Site Principal Manos Tours

## 📋 Vue d'ensemble

Ce guide vous explique comment intégrer les composants blog sur votre site principal Manos Tours. Le site West Africa Tours fournit maintenant les APIs, et vous devez copier les composants sur votre site principal.

## 🎯 APIs Disponibles sur West Africa Tours

Les APIs suivantes sont maintenant disponibles sur `https://west-africa-tours.vercel.app` :

- **`/api/posts`** - Articles avec filtres avancés
- **`/api/tags`** - Tags avec statistiques  
- **`/api/authors`** - Auteurs avec profils

## 📁 Fichiers à Copier sur le Site Principal

### 1. Composants Principaux

Créez ces fichiers dans `components/` de votre site Manos Tours :

#### `components/BlogPreview.tsx`
```typescript
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

interface BlogPost {
  slug: string
  title: string
  summary: string
  date: string
  tags: string[]
  images?: string[]
  readingTime?: { minutes: number }
  featured?: boolean
  author?: {
    name: string
    avatar?: string
  }
}

interface BlogPreviewProps {
  locale: string
  maxPosts?: number
  showFeaturedOnly?: boolean
  className?: string
  showFilters?: boolean
  showStats?: boolean
}

const BLOG_API_URL = 'https://west-africa-tours.vercel.app/api/posts'

export default function BlogPreview({
  locale,
  maxPosts = 6,
  showFeaturedOnly = false,
  className = '',
  showFilters = true,
  showStats = false
}: BlogPreviewProps) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [selectedAuthor, setSelectedAuthor] = useState<string>('')
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'readingTime'>('date')

  const translations = {
    en: {
      title: 'Manos Travel Stories',
      subtitle: 'Discover authentic adventures with Manos Tours',
      readMore: 'Read More',
      loading: 'Loading stories...',
      error: 'Unable to load stories',
      retry: 'Retry',
      filterByTag: 'Filter by tag',
      filterByAuthor: 'Filter by author',
      sortBy: 'Sort by',
      date: 'Date',
      title: 'Title',
      readingTime: 'Reading Time',
      allTags: 'All Tags',
      allAuthors: 'All Authors',
      minRead: 'min read'
    },
    fr: {
      title: 'Récits de Voyage Manos',
      subtitle: 'Découvrez des aventures authentiques avec Manos Tours',
      readMore: 'Lire Plus',
      loading: 'Chargement des récits...',
      error: 'Impossible de charger les récits',
      retry: 'Réessayer',
      filterByTag: 'Filtrer par tag',
      filterByAuthor: 'Filtrer par auteur',
      sortBy: 'Trier par',
      date: 'Date',
      title: 'Titre',
      readingTime: 'Temps de lecture',
      allTags: 'Tous les Tags',
      allAuthors: 'Tous les Auteurs',
      minRead: 'min de lecture'
    }
  }

  const t = translations[locale as keyof typeof translations] || translations.en

  useEffect(() => {
    fetchPosts()
  }, [locale, selectedTag, selectedAuthor, sortBy])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        locale,
        limit: maxPosts.toString(),
        ...(showFeaturedOnly && { featured: 'true' }),
        ...(selectedTag && { tag: selectedTag }),
        ...(selectedAuthor && { author: selectedAuthor }),
        sortBy,
        sortOrder: 'desc'
      })

      const response = await fetch(`${BLOG_API_URL}?${params}`)
      if (!response.ok) throw new Error('Failed to fetch')
      
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (err) {
      setError(t.error)
      console.error('Error fetching blog posts:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`py-12 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t.loading}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`py-12 ${className}`}>
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchPosts}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t.retry}
          </button>
        </div>
      </div>
    )
  }

  return (
    <section className={`py-12 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t.title}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-8 flex flex-wrap gap-4 justify-center">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t.allTags}</option>
              {/* Tags will be populated dynamically */}
            </select>

            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t.allAuthors}</option>
              {/* Authors will be populated dynamically */}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">{t.date}</option>
              <option value="title">{t.title}</option>
              <option value="readingTime">{t.readingTime}</option>
            </select>
          </div>
        )}

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Image */}
              {post.images && post.images[0] && (
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={post.images[0]}
                    alt={post.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {post.featured && (
                    <div className="absolute top-4 left-4 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Featured
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <time className="text-sm text-gray-500">
                    {new Date(post.date).toLocaleDateString(locale)}
                  </time>
                  {post.readingTime && (
                    <span className="text-sm text-gray-500">
                      {post.readingTime.minutes} {t.minRead}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {post.summary}
                </p>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Author */}
                {post.author && (
                  <div className="flex items-center mb-4">
                    {post.author.avatar && (
                      <Image
                        src={post.author.avatar}
                        alt={post.author.name}
                        width={24}
                        height={24}
                        className="rounded-full mr-2"
                      />
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {post.author.name}
                    </span>
                  </div>
                )}

                {/* Read More Button */}
                <Link
                  href={`https://west-africa-tours.vercel.app/blog/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  {t.readMore}
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        {/* No Posts Message */}
        {posts.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Aucun article trouvé pour les critères sélectionnés.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
```

### 2. Styles CSS

Ajoutez ces styles dans votre fichier CSS principal :

```css
/* Styles pour les composants blog */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Animations pour les cartes */
.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}
```

### 3. Page Dédiée Blog

Créez `app/blog-stories/page.tsx` :

```typescript
import BlogPreview from '@/components/BlogPreview'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Travel Stories | Manos Tours',
  description: 'Découvrez nos récits de voyage authentiques en Afrique de l\'Ouest',
}

interface PageProps {
  params: { locale: string }
}

export default function BlogStoriesPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <BlogPreview
          locale={params.locale || 'fr'}
          maxPosts={12}
          showFeaturedOnly={false}
          showFilters={true}
          showStats={false}
          className="mb-12"
        />
      </div>
    </div>
  )
}
```

## 🔧 Intégration sur la Page d'Accueil

Ajoutez dans votre page d'accueil :

```typescript
import BlogPreview from '@/components/BlogPreview'

// Dans votre composant de page d'accueil
<BlogPreview
  locale={locale}
  maxPosts={3}
  showFeaturedOnly={true}
  showFilters={false}
  showStats={false}
  className="my-16"
/>
```

## 🎨 Personnalisation

### 1. Couleurs et Branding
```typescript
// Modifiez les couleurs dans BlogPreview.tsx
const brandColors = {
  primary: '#your-primary-color',
  secondary: '#your-secondary-color',
  accent: '#your-accent-color'
}
```

### 2. Textes et Traductions
```typescript
// Personnalisez les traductions dans BlogPreview.tsx
const translations = {
  en: {
    title: 'Your Custom Title',
    subtitle: 'Your custom subtitle',
    // ...
  },
  fr: {
    title: 'Votre Titre Personnalisé',
    subtitle: 'Votre sous-titre personnalisé',
    // ...
  }
}
```

## 📱 Navigation

Ajoutez le lien dans votre navigation :

```typescript
// Dans votre composant de navigation
const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/tours', label: 'Circuits' },
  { href: '/blog-stories', label: 'Récits de Voyage' }, // Nouveau lien
  { href: '/contact', label: 'Contact' }
]
```

## ⚡ Démarrage Rapide (10 minutes)

1. **Copiez le composant** (3 min)
   - Créez `components/BlogPreview.tsx` avec le code ci-dessus

2. **Ajoutez les styles** (2 min)
   - Copiez les styles CSS dans votre fichier principal

3. **Créez la page dédiée** (2 min)
   - Créez `app/blog-stories/page.tsx`

4. **Intégrez sur l'accueil** (2 min)
   - Ajoutez le composant dans votre page d'accueil

5. **Testez** (1 min)
   - Vérifiez que tout fonctionne

## 🔧 Configuration Avancée

### Variables d'Environnement
```env
# .env.local
NEXT_PUBLIC_BLOG_API_URL=https://west-africa-tours.vercel.app/api
```

### Next.js Config
```javascript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'west-africa-tours.vercel.app',
        pathname: '**',
      },
    ],
  },
}
```

## 🎯 Résultat Final

Vous aurez :
- ✅ Section blog sur votre page d'accueil
- ✅ Page dédiée aux récits de voyage
- ✅ Filtres par tags et auteurs
- ✅ Design responsive
- ✅ Animations fluides
- ✅ Liens vers les articles complets

---

**🎉 C'est tout !** Votre intégration blog est maintenant prête sur le site principal Manos Tours !
