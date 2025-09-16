# 🚀 Solution Complète : Intégration Dynamique du Blog West Africa Tours

## 🎯 ÉTAPE 1 : Créer les API Routes dans le Blog West Africa Tours

### 1. Créer l'API pour récupérer les articles

**Créez ce fichier :** `app/api/posts/route.ts` dans votre blog

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { allBlogs } from 'contentlayer/generated'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'
    const limit = parseInt(searchParams.get('limit') || '6')
    const featured = searchParams.get('featured') === 'true'

    console.log(`API Call: locale=${locale}, limit=${limit}, featured=${featured}`)

    // Filtrer les articles par langue et statut
    let filteredPosts = allBlogs.filter((post) => {
      const matchesLanguage = post.language === locale
      const isNotDraft = post.draft !== true
      const matchesFeatured = featured ? post.featured === true : true
      
      return matchesLanguage && isNotDraft && matchesFeatured
    })

    // Trier par date (plus récent en premier)
    const sortedPosts = filteredPosts
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit)

    // Mapper les données pour l'API
    const posts = sortedPosts.map((post) => ({
      slug: post.slug,
      title: post.title,
      summary: post.summary,
      date: post.date,
      images: post.images || [],
      tags: post.tags || [],
      authors: post.authors || [],
      featured: post.featured || false,
      language: post.language,
      readingTime: post.readingTime || null,
      // Construire l'URL complète de l'article
      url: `https://west-africa-tours.vercel.app/${locale}/blog/${post.slug}`
    }))

    return NextResponse.json({ 
      posts,
      total: filteredPosts.length,
      locale,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur API posts:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des articles', posts: [] }, 
      { status: 500 }
    )
  }
}

// Permettre les requêtes OPTIONS pour CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
```

### 2. Créer l'API pour les tags populaires

**Créez ce fichier :** `app/api/tags/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { allBlogs } from 'contentlayer/generated'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'
    const limit = parseInt(searchParams.get('limit') || '10')

    // Compter les tags par langue
    const tagCount: Record<string, number> = {}
    
    allBlogs
      .filter((post) => post.language === locale && post.draft !== true)
      .forEach((post) => {
        if (post.tags) {
          post.tags.forEach((tag) => {
            tagCount[tag] = (tagCount[tag] || 0) + 1
          })
        }
      })

    // Trier les tags par popularité
    const popularTags = Object.entries(tagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }))

    return NextResponse.json({ 
      tags: popularTags,
      locale,
      total: Object.keys(tagCount).length
    })

  } catch (error) {
    console.error('Erreur API tags:', error)
    return NextResponse.json({ error: 'Erreur tags', tags: [] }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
```

### 3. Configurer CORS dans le middleware

**Modifiez votre :** `middleware.ts`

```typescript
import { NextResponse, NextRequest } from 'next/server'
import { locales } from 'app/[locale]/i18n/settings'
import { fallbackLng } from 'app/[locale]/i18n/locales'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const response = NextResponse.next()

  // Configuration CORS pour les API routes
  if (pathname.startsWith('/api/')) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // En production, limitez aux domaines autorisés
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    }

    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: corsHeaders })
    }

    return response
  }

  // Votre logique i18n existante
  if (pathname.startsWith(`/${fallbackLng}/`) || pathname === `/${fallbackLng}`) {
    return NextResponse.redirect(
      new URL(
        pathname.replace(`/${fallbackLng}`, pathname === `/${fallbackLng}` ? '/' : ''),
        request.url
      )
    )
  }

  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  if (pathnameIsMissingLocale) {
    return NextResponse.rewrite(new URL(`/${fallbackLng}${pathname}`, request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!static|data|css|scripts|.*\\..*|_next).*|sitemap.xml)',
    '/api/:path*' // Inclure les routes API
  ],
}
```

---

## 🎯 ÉTAPE 2 : Composant BlogPreview pour le site Manos Tours

**Créez ce fichier :** `components/BlogPreview.tsx` dans votre site principal

```typescript
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

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
}

interface BlogApiResponse {
  posts: BlogPost[]
  total: number
  locale: string
  timestamp: string
}

interface BlogPreviewProps {
  locale: 'en' | 'fr'
  maxPosts?: number
  showFeaturedOnly?: boolean
  className?: string
}

const BlogPreview: React.FC<BlogPreviewProps> = ({ 
  locale, 
  maxPosts = 6, 
  showFeaturedOnly = false,
  className = ""
}) => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      featured: 'Featured Story'
    },
    fr: {
      title: showFeaturedOnly ? 'Récits de Voyage en Vedette' : 'Derniers Conseils de Voyage',
      subtitle: showFeaturedOnly 
        ? 'Histoires sélectionnées de nos aventures en Afrique de l\'Ouest'
        : 'Découvrez l\'Afrique de l\'Ouest avec nos guides experts et aperçus locaux',
      readMore: 'Lire l\'Article Complet',
      viewAll: 'Explorer Tous les Articles',
      loading: 'Chargement des récits de voyage...',
      error: 'Impossible de charger les articles pour le moment',
      retry: 'Réessayer',
      readTime: 'min de lecture',
      publishedOn: 'Publié le',
      featured: 'Article en Vedette'
    }
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
          ...(showFeaturedOnly && { featured: 'true' })
        })

        const response = await fetch(`${BLOG_API_URL}?${params}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: BlogApiResponse = await response.json()
        console.log('Blog data loaded:', data)
        
        if (data.posts && Array.isArray(data.posts)) {
          setPosts(data.posts)
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
  }, [locale, maxPosts, showFeaturedOnly])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className={`py-16 bg-gradient-to-b from-blue-50 to-white ${className}`}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">{t.loading}</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`py-16 bg-gradient-to-b from-red-50 to-white ${className}`}>
        <div className="container mx-auto px-4 text-center">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Oops!</h3>
            <p className="text-gray-600 mb-4">{t.error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              {t.retry}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!posts.length) {
    return (
      <div className={`py-16 ${className}`}>
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500">{locale === 'en' ? 'No articles available' : 'Aucun article disponible'}</p>
        </div>
      </div>
    )
  }

  return (
    <section className={`py-16 bg-gradient-to-b from-blue-50 via-white to-green-50 ${className}`}>
      <div className="container mx-auto px-4">
        {/* En-tête de section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Grille d'articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {posts.map((post, index) => (
            <article
              key={`${post.slug}-${index}`}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
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
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      ⭐ {t.featured}
                    </div>
                  )}
                </div>
              )}

              <div className="p-6">
                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={`${tag}-${tagIndex}`}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Titre */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>

                {/* Résumé */}
                <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                  {post.summary}
                </p>

                {/* Métadonnées et bouton */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    <time dateTime={post.date}>
                      {formatDate(post.date)}
                    </time>
                    {post.readingTime && (
                      <span className="ml-2">
                        • {post.readingTime.minutes} {t.readTime}
                      </span>
                    )}
                  </div>
                  
                  <Link
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    {t.readMore}
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bouton voir tous */}
        <div className="text-center">
          <Link
            href={`https://west-africa-tours.vercel.app/${locale}/blog`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            {t.viewAll}
            <svg className="ml-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default BlogPreview
```

---

## 🎯 ÉTAPE 3 : Utilisation dans le site principal

### 1. Dans votre page d'accueil

```typescript
import BlogPreview from '@/components/BlogPreview'

interface HomePageProps {
  params: {
    locale: 'en' | 'fr'
  }
}

export default function HomePage({ params: { locale } }: HomePageProps) {
  return (
    <div>
      {/* Vos autres sections */}
      
      {/* Section Articles en vedette */}
      <BlogPreview 
        locale={locale} 
        maxPosts={3} 
        showFeaturedOnly={true}
        className="mb-8"
      />
      
      {/* Section Derniers articles */}
      <BlogPreview 
        locale={locale} 
        maxPosts={6} 
        showFeaturedOnly={false}
      />
      
      {/* Vos autres sections */}
    </div>
  )
}
```

### 2. Ou créer une page blog dédiée

```typescript
// app/[locale]/blog-preview/page.tsx
import BlogPreview from '@/components/BlogPreview'

interface BlogPreviewPageProps {
  params: {
    locale: 'en' | 'fr'
  }
}

export default function BlogPreviewPage({ params: { locale } }: BlogPreviewPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <BlogPreview locale={locale} maxPosts={12} />
      </div>
    </div>
  )
}
```

---

## 🎨 Styles CSS (Tailwind)

Ajoutez ces classes dans votre `globals.css` :

```css
/* Limitation des lignes pour les textes */
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
```

---

## 🚀 Déploiement et Test

### 1. Tester les APIs en local

```bash
# Dans le blog West Africa Tours
npm run dev

# Tester l'API :
# http://localhost:3000/api/posts?locale=en&limit=3
# http://localhost:3000/api/posts?locale=fr&limit=5&featured=true
# http://localhost:3000/api/tags?locale=en&limit=10
```

### 2. Déployer le blog avec les APIs

```bash
git add .
git commit -m "Add blog API routes for integration"
git push origin main
```

### 3. Tester l'intégration

Une fois déployé, testez :
- `https://west-africa-tours.vercel.app/api/posts?locale=en&limit=3`
- `https://west-africa-tours.vercel.app/api/posts?locale=fr&limit=5`

---

## ✅ Checklist Final

- [ ] API Routes créées dans le blog (`/api/posts`, `/api/tags`)
- [ ] Middleware CORS configuré
- [ ] Composant `BlogPreview` créé dans le site principal
- [ ] Test des APIs en production
- [ ] Intégration dans les pages du site principal
- [ ] Test du support multilingue (en/fr)
- [ ] Vérification responsive (mobile/desktop)
- [ ] Test des liens vers les articles complets

---

## 🎯 Résultat Final

Avec cette solution, vous aurez :
- ✅ **APIs fonctionnelles** dans le blog pour exposer les données
- ✅ **Intégration dynamique** des articles sur le site principal
- ✅ **Support multilingue** automatique (en/fr)
- ✅ **Design responsive** et moderne
- ✅ **Gestion d'erreurs** robuste
- ✅ **Performance optimisée** avec loading states
- ✅ **Liens directs** vers les articles complets
- ✅ **CORS configuré** pour les requêtes cross-origin

## 🔧 Avantages de cette solution

1. **Pas de base de données nécessaire** - utilise Contentlayer existant
2. **Entièrement frontend** - compatible avec votre architecture
3. **Temps réel** - les nouveaux articles apparaissent automatiquement
4. **SEO friendly** - les liens pointent vers le blog complet
5. **Performant** - requêtes API rapides et cache navigateur

Cette solution est **parfaite pour votre cas d'usage** et respecte votre architecture existante ! 🌟