# 🔗 Guide d'Intégration du Blog dans le Site Principal Manos Tours

## 📋 Vue d'Ensemble

Ce guide vous explique comment intégrer facilement des aperçus du blog **West Africa Tourism** dans votre site principal **https://manos-tours.vercel.app/** avec des boutons "Lire l'article" qui redirigent vers le blog complet.

---

## 🎯 Objectif

Créer une section **"Blog & Actualités"** sur le site principal qui affiche :
- Les derniers articles du blog
- Un aperçu (titre, résumé, image)
- Un bouton "Lire l'article" qui redirige vers l'article complet
- Support multilingue (français/anglais)

---

## 🛠️ Méthodes d'Intégration

### **Méthode 1 : API Route avec Fetch (Recommandée)**

#### 1. Créer une API Route dans le Blog

**Fichier :** `app/api/posts/route.ts` (dans le blog)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { allBlogs } from 'contentlayer/generated'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const locale = searchParams.get('locale') || 'en'
  const limit = parseInt(searchParams.get('limit') || '6')

  // Filtrer les articles par langue
  const posts = allBlogs
    .filter((post) => post.language === locale)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      summary: post.summary,
      date: post.date,
      images: post.images,
      tags: post.tags,
      authors: post.authors,
      featured: post.featured
    }))

  return NextResponse.json({ posts })
}
```

#### 2. Composant Blog Preview pour le Site Principal

**Fichier :** `components/BlogPreview.tsx` (dans le site principal)

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
  images?: string[]
  tags: string[]
  featured?: boolean
}

interface BlogPreviewProps {
  locale: 'en' | 'fr'
  maxPosts?: number
}

const BlogPreview: React.FC<BlogPreviewProps> = ({ locale, maxPosts = 6 }) => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  const blogUrl = 'https://your-blog-domain.vercel.app' // URL de votre blog

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          `${blogUrl}/api/posts?locale=${locale}&limit=${maxPosts}`
        )
        const data = await response.json()
        setPosts(data.posts)
      } catch (error) {
        console.error('Erreur lors du chargement des articles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [locale, maxPosts, blogUrl])

  const t = {
    en: {
      title: 'Latest Travel Insights',
      subtitle: 'Discover West Africa through our expert guides',
      readMore: 'Read Article',
      viewAll: 'View All Articles',
      loading: 'Loading articles...'
    },
    fr: {
      title: 'Derniers Conseils de Voyage',
      subtitle: 'Découvrez l\'Afrique de l\'Ouest avec nos guides experts',
      readMore: 'Lire l\'Article',
      viewAll: 'Voir Tous les Articles',
      loading: 'Chargement des articles...'
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">{t[locale].loading}</p>
      </div>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* En-tête de section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t[locale].title}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t[locale].subtitle}
          </p>
        </div>

        {/* Grille d'articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* Image de l'article */}
              {post.images && post.images[0] && (
                <div className="relative h-48 w-full">
                  <Image
                    src={post.images[0]}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                  {post.featured && (
                    <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </div>
                  )}
                </div>
              )}

              <div className="p-6">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Titre */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                  {post.title}
                </h3>

                {/* Résumé */}
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.summary}
                </p>

                {/* Date et bouton */}
                <div className="flex justify-between items-center">
                  <time className="text-sm text-gray-500">
                    {new Date(post.date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US')}
                  </time>
                  
                  <Link
                    href={`${blogUrl}/${locale}/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    {t[locale].readMore}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bouton voir tous */}
        <div className="text-center">
          <Link
            href={`${blogUrl}/${locale}/blog`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors duration-200"
          >
            {t[locale].viewAll}
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

#### 3. Utilisation dans le Site Principal

**Dans votre page principale :**

```typescript
import BlogPreview from '@/components/BlogPreview'

export default function HomePage({ params: { locale } }) {
  return (
    <div>
      {/* Vos autres sections */}
      
      {/* Section Blog */}
      <BlogPreview locale={locale} maxPosts={6} />
      
      {/* Vos autres sections */}
    </div>
  )
}
```

---

### **Méthode 2 : RSS Feed (Alternative)**

Si vous préférez utiliser un flux RSS :

#### 1. Créer un endpoint RSS dans le blog

**Fichier :** `app/api/rss/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { allBlogs } from 'contentlayer/generated'
import RSS from 'rss'

export async function GET() {
  const feed = new RSS({
    title: 'West Africa Tourism Blog',
    description: 'Expert guides for West Africa travel',
    site_url: 'https://your-blog-domain.vercel.app',
    feed_url: 'https://your-blog-domain.vercel.app/api/rss',
    language: 'en',
  })

  allBlogs
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20)
    .forEach((post) => {
      feed.item({
        title: post.title,
        description: post.summary,
        url: `https://your-blog-domain.vercel.app/${post.language}/blog/${post.slug}`,
        date: post.date,
        categories: post.tags,
      })
    })

  return new NextResponse(feed.xml(), {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
```

#### 2. Consommer le RSS dans le site principal

```typescript
import Parser from 'rss-parser'

const parser = new Parser()

export async function getBlogPosts(limit = 6) {
  try {
    const feed = await parser.parseURL('https://your-blog-domain.vercel.app/api/rss')
    return feed.items.slice(0, limit)
  } catch (error) {
    console.error('Erreur RSS:', error)
    return []
  }
}
```

---

## 🎨 Styles CSS Additionnels

Ajoutez ces classes CSS pour un meilleur rendu :

```css
/* Limitation du nombre de lignes */
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

/* Animation de hover pour les cartes */
.blog-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.blog-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}
```

---

## 🔧 Configuration et Déploiement

### 1. Variables d'Environnement

**Dans le site principal :**

```env
NEXT_PUBLIC_BLOG_URL=https://your-blog-domain.vercel.app
```

### 2. CORS Configuration

**Dans le blog, ajoutez :**

```typescript
// middleware.ts
import { NextResponse } from 'next/server'

export function middleware(request: Request) {
  const response = NextResponse.next()
  
  // Autoriser les requêtes depuis le site principal
  response.headers.set('Access-Control-Allow-Origin', 'https://manos-tours.vercel.app')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  
  return response
}

export const config = {
  matcher: '/api/:path*',
}
```

---

## 📱 Responsive Design

Le composant est déjà responsive avec :
- **Mobile :** 1 colonne
- **Tablet :** 2 colonnes  
- **Desktop :** 3 colonnes

---

## 🚀 Optimisations Avancées

### 1. Cache et Performance

```typescript
// Ajouter du cache
const fetchPosts = async () => {
  const cacheKey = `blog-posts-${locale}-${maxPosts}`
  const cached = localStorage.getItem(cacheKey)
  
  if (cached) {
    const { data, timestamp } = JSON.parse(cached)
    // Cache valide pendant 10 minutes
    if (Date.now() - timestamp < 10 * 60 * 1000) {
      setPosts(data.posts)
      setLoading(false)
      return
    }
  }
  
  // Fetch et mise en cache...
}
```

### 2. Lazy Loading

```typescript
import { lazy, Suspense } from 'react'

const BlogPreview = lazy(() => import('@/components/BlogPreview'))

// Dans votre page
<Suspense fallback={<div>Chargement du blog...</div>}>
  <BlogPreview locale={locale} />
</Suspense>
```

---

## ✅ Checklist de Déploiement

- [ ] API Route créée dans le blog
- [ ] Composant BlogPreview intégré dans le site principal
- [ ] Variables d'environnement configurées
- [ ] CORS configuré
- [ ] Tests sur mobile et desktop
- [ ] Cache implémenté
- [ ] Déployé sur Vercel

---

## 🎯 Résultat Final

Avec cette intégration, vous aurez :
- ✅ Section "Blog & Actualités" attractive sur le site principal
- ✅ Aperçus des derniers articles avec images
- ✅ Boutons "Lire l'article" qui ouvrent le blog complet
- ✅ Support multilingue automatique
- ✅ Design responsive et moderne
- ✅ Performance optimisée avec cache

Le tout s'intègre parfaitement avec votre site existant et maintient une expérience utilisateur fluide ! 🌟
