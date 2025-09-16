import { NextRequest, NextResponse } from 'next/server'
import { allBlogs, allAuthors } from 'contentlayer/generated'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'
    const limit = parseInt(searchParams.get('limit') || '10')
    const includeStats = searchParams.get('includeStats') === 'true'
    const sortBy = searchParams.get('sortBy') || 'posts' // posts, name, recent

    console.log(`API Authors Call: locale=${locale}, limit=${limit}, sortBy=${sortBy}`)

    // Filtrer les articles par langue
    const localePosts = allBlogs.filter((post) => post.language === locale && post.draft !== true)

    // Compter les articles par auteur avec métadonnées
    const authorData: Record<
      string,
      {
        count: number
        posts: Array<{
          slug: string
          title: string
          date: string
          featured: boolean
          tags: string[]
        }>
        lastPost: string
        featuredCount: number
        totalWords: number
        uniqueTags: Set<string>
      }
    > = {}

    localePosts.forEach((post) => {
      if (post.authors) {
        post.authors.forEach((authorSlug) => {
          if (!authorData[authorSlug]) {
            authorData[authorSlug] = {
              count: 0,
              posts: [],
              lastPost: post.date,
              featuredCount: 0,
              totalWords: 0,
              uniqueTags: new Set(),
            }
          }

          authorData[authorSlug].count++
          authorData[authorSlug].posts.push({
            slug: post.slug,
            title: post.title,
            date: post.date,
            featured: post.featured || false,
            tags: post.tags || [],
          })

          if (post.featured) {
            authorData[authorSlug].featuredCount++
          }

          // Ajouter les mots et tags
          authorData[authorSlug].totalWords += post.readingTime?.words || 0
          post.tags?.forEach((tag) => authorData[authorSlug].uniqueTags.add(tag))

          // Mettre à jour la date du dernier post
          if (new Date(post.date) > new Date(authorData[authorSlug].lastPost)) {
            authorData[authorSlug].lastPost = post.date
          }
        })
      }
    })

    // Fonction de tri
    const sortAuthors = (authors: Array<[string, (typeof authorData)[string]]>) => {
      return authors.sort(([slugA, dataA], [slugB, dataB]) => {
        switch (sortBy) {
          case 'name': {
            const authorA = allAuthors.find((a) => a.slug === slugA)
            const authorB = allAuthors.find((a) => a.slug === slugB)
            return (authorA?.name || slugA).localeCompare(authorB?.name || slugB)
          }
          case 'recent':
            return new Date(dataB.lastPost).getTime() - new Date(dataA.lastPost).getTime()
          case 'posts':
          default:
            return dataB.count - dataA.count
        }
      })
    }

    // Trier et limiter
    const sortedAuthors = sortAuthors(Object.entries(authorData)).slice(0, limit)

    // Mapper les données pour l'API
    const authors = sortedAuthors.map(([authorSlug, data]) => {
      const authorInfo = allAuthors.find((a) => a.slug === authorSlug)

      return {
        slug: authorSlug,
        name: authorInfo?.name || authorSlug,
        avatar: authorInfo?.avatar || null,
        occupation: authorInfo?.occupation || null,
        company: authorInfo?.company || null,
        email: authorInfo?.email || null,
        twitter: authorInfo?.twitter || null,
        linkedin: authorInfo?.linkedin || null,
        github: authorInfo?.github || null,
        layout: authorInfo?.layout || null,
        // Statistiques
        postCount: data.count,
        featuredCount: data.featuredCount,
        lastPost: data.lastPost,
        totalWords: data.totalWords,
        averageWordsPerPost: Math.round(data.totalWords / data.count),
        uniqueTagsCount: data.uniqueTags.size,
        ...(includeStats && {
          recentPosts: data.posts
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 3),
          topTags: Array.from(data.uniqueTags).slice(0, 5),
          productivity: {
            postsPerMonth:
              Math.round(
                (data.count /
                  Math.max(
                    1,
                    (new Date().getTime() -
                      new Date(data.posts[data.posts.length - 1]?.date || new Date()).getTime()) /
                      (1000 * 60 * 60 * 24 * 30)
                  )) *
                  100
              ) / 100,
          },
        }),
      }
    })

    // Statistiques globales
    const globalStats = {
      totalAuthors: Object.keys(authorData).length,
      totalPostsWithAuthors: localePosts.filter((p) => p.authors && p.authors.length > 0).length,
      averagePostsPerAuthor:
        Math.round(
          (Object.values(authorData).reduce((acc, data) => acc + data.count, 0) /
            Object.keys(authorData).length) *
            100
        ) / 100,
      mostProductiveAuthor: sortedAuthors[0]
        ? {
            slug: sortedAuthors[0][0],
            name:
              allAuthors.find((a) => a.slug === sortedAuthors[0][0])?.name || sortedAuthors[0][0],
            postCount: sortedAuthors[0][1].count,
          }
        : null,
      collaborationStats: {
        singleAuthor: localePosts.filter((p) => p.authors?.length === 1).length,
        multipleAuthors: localePosts.filter((p) => (p.authors?.length || 0) > 1).length,
        noAuthor: localePosts.filter((p) => !p.authors || p.authors.length === 0).length,
      },
    }

    return NextResponse.json({
      authors,
      stats: globalStats,
      filters: {
        locale,
        sortBy,
        includeStats,
      },
      pagination: {
        total: Object.keys(authorData).length,
        limit,
        returned: authors.length,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Erreur API authors:', error)
    return NextResponse.json(
      {
        error: 'Erreur lors de la récupération des auteurs',
        authors: [],
        stats: null,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
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
