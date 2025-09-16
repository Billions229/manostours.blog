import { NextRequest, NextResponse } from 'next/server'
import { allBlogs } from 'contentlayer/generated'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'
    const limit = parseInt(searchParams.get('limit') || '6')
    const featured = searchParams.get('featured') === 'true'
    const tag = searchParams.get('tag')
    const author = searchParams.get('author')
    const sortBy = searchParams.get('sortBy') || 'date' // date, title, readingTime
    const sortOrder = searchParams.get('sortOrder') || 'desc' // asc, desc

    console.log(
      `API Call: locale=${locale}, limit=${limit}, featured=${featured}, tag=${tag}, author=${author}`
    )

    // Filtrer les articles par langue et statut
    const filteredPosts = allBlogs.filter((post) => {
      const matchesLanguage = post.language === locale
      const isNotDraft = post.draft !== true
      const matchesFeatured = featured ? post.featured === true : true

      // Filtrage par tag
      const matchesTag = tag ? post.tags && post.tags.includes(tag) : true

      // Filtrage par auteur
      const matchesAuthor = author ? post.authors && post.authors.includes(author) : true

      return matchesLanguage && isNotDraft && matchesFeatured && matchesTag && matchesAuthor
    })

    // Fonction de tri personnalisée
    const sortPosts = (posts: typeof filteredPosts) => {
      return posts.sort((a, b) => {
        let comparison = 0

        switch (sortBy) {
          case 'title':
            comparison = a.title.localeCompare(b.title)
            break
          case 'readingTime': {
            const aTime = a.readingTime?.minutes || 0
            const bTime = b.readingTime?.minutes || 0
            comparison = aTime - bTime
            break
          }
          case 'date':
          default:
            comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
            break
        }

        return sortOrder === 'desc' ? -comparison : comparison
      })
    }

    // Trier les articles
    const sortedPosts = sortPosts(filteredPosts).slice(0, limit)

    // Mapper les données pour l'API avec informations enrichies
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
      url: `https://west-africa-tours.vercel.app/${locale}/blog/${post.slug}`,
      // Métadonnées supplémentaires
      wordCount: post.readingTime?.words || 0,
      lastModified: post.lastmod || post.date,
      series: post.series || null,
      draft: post.draft || false,
    }))

    // Statistiques enrichies
    const stats = {
      totalPosts: filteredPosts.length,
      featuredCount: filteredPosts.filter((p) => p.featured).length,
      averageReadingTime: Math.round(
        filteredPosts.reduce((acc, p) => acc + (p.readingTime?.minutes || 0), 0) /
          filteredPosts.length
      ),
      totalWords: filteredPosts.reduce((acc, p) => acc + (p.readingTime?.words || 0), 0),
      uniqueTags: [...new Set(filteredPosts.flatMap((p) => p.tags || []))].length,
      uniqueAuthors: [...new Set(filteredPosts.flatMap((p) => p.authors || []))].length,
    }

    return NextResponse.json({
      posts,
      stats,
      filters: {
        locale,
        tag,
        author,
        featured,
        sortBy,
        sortOrder,
      },
      pagination: {
        total: filteredPosts.length,
        limit,
        returned: posts.length,
        hasMore: filteredPosts.length > limit,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Erreur API posts:', error)
    return NextResponse.json(
      {
        error: 'Erreur lors de la récupération des articles',
        posts: [],
        stats: null,
        timestamp: new Date().toISOString(),
      },
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
